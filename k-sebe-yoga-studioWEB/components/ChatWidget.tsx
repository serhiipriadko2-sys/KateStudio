import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Volume2,
  Mic,
  Phone,
  ExternalLink,
  Loader2,
  StopCircle,
  MicOff,
  Trash2,
  Headphones,
  Play,
  Pause,
  Waves,
  Video,
  Image as ImageIcon,
  Brain,
  Activity,
  Grid,
  ArrowLeft,
  Paperclip,
  FileVideo,
} from 'lucide-react';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  getGeminiChatResponse,
  generateSpeech,
  generateMeditationScript,
  generateMeditationVideo,
  generateYogaImage,
  analyzeYogaVideo,
  generatePersonalProgram,
  transcribeDiaryEntry,
} from '../services/geminiService';
import { ChatMessage, ChatMode } from '../types';

// --- Live API Utils (retained) ---
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
  return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' } as any;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 bg-brand-green rounded-full transition-all duration-150 ease-in-out ${isActive ? 'animate-waveform' : 'h-2 opacity-50'}`}
          style={{ animationDelay: `${i * 0.1}s`, height: isActive ? '100%' : '8px' }}
        ></div>
      ))}
    </div>
  );
};

// --- Constants ---
const TOOLS = [
  {
    id: 'chat',
    label: 'Чат',
    icon: <MessageCircle className="w-5 h-5" />,
    desc: 'Общение с Катей',
  },
  {
    id: 'meditation',
    label: 'Медитация',
    icon: <Headphones className="w-5 h-5" />,
    desc: 'Голос + Видео (Veo)',
  },
  {
    id: 'art',
    label: 'Арт-терапия',
    icon: <ImageIcon className="w-5 h-5" />,
    desc: 'Создание образов (Imagen)',
  },
  {
    id: 'coach',
    label: 'AI Тренер',
    icon: <Video className="w-5 h-5" />,
    desc: 'Анализ вашей техники',
  },
  {
    id: 'program',
    label: 'Программа',
    icon: <Brain className="w-5 h-5" />,
    desc: 'Глубокий анализ (Thinking)',
  },
  {
    id: 'diary',
    label: 'Дневник',
    icon: <Activity className="w-5 h-5" />,
    desc: 'Голосовые заметки',
  },
];

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Tools menu
  const [isLiveMode, setIsLiveMode] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );

  // Media Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Live API Refs
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveSpeaking, setIsLiveSpeaking] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Init
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
    setMessages([
      {
        role: 'model',
        text: `Намасте! Я Катя. Выберите режим работы в меню или просто напишите мне.`,
      },
    ]);
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useLayoutEffect(() => {
    if (!isLiveMode && isOpen) scrollToBottom();
  }, [messages, isOpen, isLiveMode, isLoading, mode]);

  // --- Handlers ---

  const handleSend = async (textOverride?: string, attachmentBase64?: string) => {
    const textToSend = textOverride || inputValue;
    if ((!textToSend.trim() && !attachmentBase64) || isLoading) return;

    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text: textToSend, type: mode }]);
    setIsLoading(true);

    try {
      if (mode === 'chat') {
        const response = await getGeminiChatResponse(textToSend, userLocation);
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: response.text, sources: response.sources },
        ]);
      } else if (mode === 'meditation') {
        // Veo + TTS
        setLoadingText('Создаю видео-атмосферу (Veo)...');
        const videoUrl = await generateMeditationVideo(textToSend); // Takes time

        setLoadingText('Пишу скрипт...');
        const script = await generateMeditationScript(textToSend, 'short');

        setLoadingText('Озвучиваю...');
        const audioBase64 = await generateSpeech(script);

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: script,
            type: 'meditation',
            generatedVideoUrl: videoUrl || undefined,
            audioBase64: audioBase64 || undefined,
          },
        ]);
      } else if (mode === 'art') {
        setLoadingText('Рисую образ (Imagen 3)...');
        const imageUrl = await generateYogaImage(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: imageUrl ? 'Вот образ вашего состояния.' : 'Не удалось создать изображение.',
            generatedImageUrl: imageUrl || undefined,
            type: 'art',
          },
        ]);
      } else if (mode === 'coach') {
        // Handled via handleFileUpload mostly, but if text only
        const response = await getGeminiChatResponse(textToSend); // Fallback
        setMessages((prev) => [...prev, { role: 'model', text: response.text }]);
      } else if (mode === 'program') {
        setLoadingText('Анализирую (Thinking Mode)...');
        const program = await generatePersonalProgram(textToSend);
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: program, isThinking: true, type: 'program' },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'model', text: 'Произошла ошибка.' }]);
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'coach' && file.type.startsWith('video/')) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Видео слишком большое (лимит 20МБ для демо)');
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'user', text: `Видео: ${file.name}`, type: 'coach' },
      ]);
      setIsLoading(true);
      setLoadingText('Смотрю видео (Video Understanding)...');

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const analysis = await analyzeYogaVideo(base64);
        setMessages((prev) => [...prev, { role: 'model', text: analysis, type: 'coach' }]);
        setIsLoading(false);
        setLoadingText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecordingDiary = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' }); // Gemini supports wav/mp3/aac/flac etc
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsLoading(true);
          setLoadingText('Транскрибирую...');
          const result = await transcribeDiaryEntry(base64);
          setMessages((prev) => [
            ...prev,
            {
              role: 'user',
              text: 'Аудиозапись дневника',
              type: 'diary',
              diarySummary: result.summary,
            },
            {
              role: 'model',
              text: result.text ? `Транскрипция:\n${result.text}` : 'Не удалось распознать.',
            },
          ]);
          setIsLoading(false);
          setLoadingText('');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      alert('Нет доступа к микрофону');
    }
  };

  const stopRecordingDiary = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // --- Audio Player ---
  const toggleAudio = (index: number) => {
    const msg = messages[index];
    if (playingMessageId === index) {
      audioRef.current?.pause();
      setPlayingMessageId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (msg.audioBase64) {
      const audio = new Audio('data:audio/mp3;base64,' + msg.audioBase64);
      audioRef.current = audio;
      setPlayingMessageId(index);
      audio.play();
      audio.onended = () => setPlayingMessageId(null);
    }
  };

  // --- Live API (Retained functionality) ---
  const startLiveSession = async () => {
    setIsLiveMode(true);
    setPermissionError(false);
    if (!process.env.API_KEY) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
        throw new Error('PERMISSION_DENIED');
      });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      const inputSource = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      const outputNode = outputCtx.createGain();
      const muteNode = inputCtx.createGain();
      muteNode.gain.value = 0;
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        },
        callbacks: {
          onopen: () => {
            setIsLiveConnected(true);
            scriptProcessor.onaudioprocess = (e) => {
              sessionPromise.then((s) =>
                s.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) })
              );
            };
            inputSource.connect(scriptProcessor);
            scriptProcessor.connect(muteNode);
            muteNode.connect(inputCtx.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            const d = m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (d) {
              setIsLiveSpeaking(true);
              const b = await decodeAudioData(decode(d), outputCtx, 24000, 1);
              const s = outputCtx.createBufferSource();
              s.buffer = b;
              s.connect(outputNode);
              outputNode.connect(outputCtx.destination);
              s.addEventListener('ended', () => {
                sourcesRef.current.delete(s);
                if (sourcesRef.current.size === 0) setIsLiveSpeaking(false);
              });
              s.start(nextStartTimeRef.current);
              nextStartTimeRef.current =
                Math.max(nextStartTimeRef.current, outputCtx.currentTime) + b.duration;
              sourcesRef.current.add(s);
            }
          },
          onclose: () => stopLiveSession(),
          onerror: () => stopLiveSession(),
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (e) {
      setPermissionError(true);
    }
  };
  const stopLiveSession = async () => {
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    sourcesRef.current.forEach((s) => s.stop());
    sessionPromiseRef.current?.then((s) => (s as any).close?.());
    setIsLiveConnected(false);
    setIsLiveMode(false);
    setIsLiveSpeaking(false);
  };

  // --- Render ---
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200 h-[80vh] sm:h-[650px]">
          {/* Header */}
          <div className="bg-brand-green p-3 text-white shadow-md z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isMenuOpen ? (
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-white/10 p-1 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <Sparkles className="w-5 h-5 text-brand-accent" />
                )}
                <span className="font-medium">
                  {isMenuOpen
                    ? 'Меню режимов'
                    : TOOLS.find((t) => t.id === mode)?.label || 'Ассистент'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!isLiveMode && !isMenuOpen && (
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                )}
                {!isLiveMode && !isMenuOpen && (
                  <button
                    onClick={() => setMessages([])}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {!isLiveMode && !isMenuOpen && (
                  <button onClick={startLiveSession} className="p-2 hover:bg-white/10 rounded-full">
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="hover:text-brand-accent p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen ? (
            <div className="flex-1 bg-stone-50 p-4 grid grid-cols-2 gap-3 overflow-y-auto">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setMode(tool.id as ChatMode);
                    setIsMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${mode === tool.id ? 'bg-brand-green text-white border-brand-green shadow-lg' : 'bg-white text-stone-600 border-stone-200 hover:border-brand-green hover:shadow-md'}`}
                >
                  <div
                    className={`mb-2 p-3 rounded-full ${mode === tool.id ? 'bg-white/20' : 'bg-stone-100 text-brand-green'}`}
                  >
                    {tool.icon}
                  </div>
                  <span className="font-medium text-sm">{tool.label}</span>
                  <span
                    className={`text-[10px] mt-1 ${mode === tool.id ? 'text-white/80' : 'text-stone-400'}`}
                  >
                    {tool.desc}
                  </span>
                </button>
              ))}
            </div>
          ) : isLiveMode ? (
            /* Live Mode UI */
            <div className="flex-1 bg-gradient-to-br from-brand-mint/50 to-white flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
              {permissionError ? (
                <div className="z-20 flex flex-col items-center">
                  <MicOff className="w-8 h-8 text-rose-500 mb-4" />
                  <h3>Нет доступа к микрофону</h3>
                  <button
                    onClick={() => setIsLiveMode(false)}
                    className="mt-4 bg-stone-200 px-4 py-2 rounded-full text-sm"
                  >
                    Вернуться
                  </button>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div
                      className={`w-64 h-64 bg-brand-green rounded-full blur-[80px] transition-opacity duration-1000 ${isLiveConnected ? 'opacity-40' : 'opacity-0'}`}
                    ></div>
                  </div>
                  <div className="relative z-10 bg-white p-8 rounded-full shadow-xl mb-6 flex items-center justify-center w-32 h-32">
                    {isLiveSpeaking ? (
                      <AudioVisualizer isActive={true} />
                    ) : (
                      <Mic
                        className={`w-10 h-10 ${isLiveConnected ? 'text-brand-green' : 'text-stone-300'}`}
                      />
                    )}
                  </div>
                  <button
                    onClick={stopLiveSession}
                    className="bg-rose-500 text-white px-8 py-3 rounded-full hover:bg-rose-600 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <StopCircle className="w-4 h-4" /> Завершить
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 scroll-smooth">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`flex flex-col gap-2 max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {/* Rich Content Bubbles */}
                      {msg.generatedVideoUrl && (
                        <div className="w-full max-w-[240px] rounded-2xl overflow-hidden shadow-lg border border-brand-green/20 mb-1">
                          <video
                            src={msg.generatedVideoUrl}
                            controls
                            autoPlay
                            loop
                            muted
                            className="w-full bg-black"
                          />
                          <div className="bg-black/50 text-white text-[10px] px-2 py-1 absolute top-2 right-2 rounded">
                            Veo AI
                          </div>
                        </div>
                      )}
                      {msg.generatedImageUrl && (
                        <div className="w-full max-w-[240px] rounded-2xl overflow-hidden shadow-lg border border-brand-green/20 mb-1">
                          <img src={msg.generatedImageUrl} alt="AI Art" className="w-full" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl p-3 text-sm shadow-sm relative overflow-hidden ${msg.role === 'user' ? 'bg-brand-green text-white rounded-br-none' : 'bg-white text-stone-800 border border-stone-100 rounded-bl-none'}`}
                      >
                        {msg.isThinking && (
                          <div className="text-[10px] text-brand-green/70 font-bold uppercase mb-1 flex items-center gap-1">
                            <Brain className="w-3 h-3" /> Thinking Mode
                          </div>
                        )}
                        {msg.diarySummary && (
                          <div className="bg-brand-mint/20 p-2 rounded mb-2 text-xs border-l-2 border-brand-green">
                            <strong>Инсайты:</strong> {msg.diarySummary}
                          </div>
                        )}
                        <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                      </div>

                      {msg.audioBase64 && (
                        <button
                          onClick={() => toggleAudio(idx)}
                          className="p-2 bg-white rounded-full shadow-sm border border-stone-100 hover:text-brand-green"
                        >
                          {playingMessageId === idx ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-stone-400 p-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> {loadingText || 'Печатает...'}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Controls */}
              <div className="p-3 bg-white border-t border-stone-100">
                {mode === 'coach' && (
                  <div className="mb-2">
                    <input
                      type="file"
                      accept="video/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-medium hover:bg-stone-200 flex items-center justify-center gap-2"
                    >
                      <FileVideo className="w-4 h-4" /> Загрузить видео для анализа
                    </button>
                  </div>
                )}
                {mode === 'diary' && (
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={isRecording ? stopRecordingDiary : startRecordingDiary}
                      className={`p-4 rounded-full transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-stone-100 text-stone-600 hover:bg-brand-green hover:text-white'}`}
                    >
                      {isRecording ? (
                        <StopCircle className="w-6 h-6" />
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={
                      mode === 'art'
                        ? 'Опишите образ...'
                        : mode === 'meditation'
                          ? 'Тема медитации...'
                          : 'Сообщение...'
                    }
                    className="flex-1 px-4 py-2 bg-stone-50 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-green text-sm border border-stone-100"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading}
                    className="p-2.5 bg-brand-green text-white rounded-full hover:bg-brand-green/90 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 bg-brand-green text-brand-accent hover:bg-brand-green/90 p-4 rounded-full shadow-2xl transition-all hover:scale-105"
      >
        <span className={`${isOpen ? 'hidden' : 'hidden sm:block'} font-medium pr-1`}>
          AI Тренер
        </span>
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
