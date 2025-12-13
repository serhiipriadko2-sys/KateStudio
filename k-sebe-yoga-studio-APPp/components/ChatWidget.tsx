
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiChatResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage, Source } from '../types';
import { MessageCircle, X, Send, Sparkles, Volume2, Mic, Phone, ExternalLink, Loader2, StopCircle, AlertCircle, Trash2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, type Blob as GenAIBlob } from '@google/genai';
import { useToast } from '../context/ToastContext';

function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
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
  numChannels: number,
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

const DEFAULT_WELCOME_MSG: ChatMessage = { role: 'model', text: 'Здравствуйте! Я ваш помощник по студии "К себе". Подсказать расписание или стоимость?' };

interface ChatWidgetProps {
  hidden?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ hidden = false }) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  // Load initial state from session storage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
      try {
          const saved = sessionStorage.getItem('ksebe_chat_history');
          return saved ? JSON.parse(saved) : [DEFAULT_WELCOME_MSG];
      } catch {
          return [DEFAULT_WELCOME_MSG];
      }
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live API Refs
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  
  // Refs for cleanup
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Listen for custom open event
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        setIsOpen(true);
        if (detail && detail.message) {
            setInputValue(detail.message);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    window.addEventListener('ksebe-open-chat', handleOpenChat);
    return () => window.removeEventListener('ksebe-open-chat', handleOpenChat);
  }, []);

  // Init Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => console.log('Location access denied')
      );
    }
  }, []);

  // Persist messages
  useEffect(() => {
      sessionStorage.setItem('ksebe_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLiveMode) scrollToBottom();
  }, [messages, isOpen, isLiveMode]);

  const handleClearHistory = () => {
    setMessages([DEFAULT_WELCOME_MSG]);
    sessionStorage.removeItem('ksebe_chat_history');
    showToast('История переписки очищена', 'info');
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getGeminiChatResponse(userMsg, userLocation);
    
    setMessages(prev => [...prev, { role: 'model', text: response.text, sources: response.sources }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const playTTS = async (index: number, text: string) => {
    const msg = messages[index];
    if (msg.audioBase64) {
      const audio = new Audio("data:audio/mp3;base64," + msg.audioBase64);
      audio.play();
      return;
    }

    setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioLoading: true } : m));
    const audioBase64 = await generateSpeech(text);
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioLoading: false, audioBase64: audioBase64 || undefined } : m));

    if (audioBase64) {
      const audio = new Audio("data:audio/mp3;base64," + audioBase64);
      audio.play();
    }
  };

  // --- Live API Logic ---
  const startLiveSession = async () => {
    await stopLiveSession();

    setIsLiveMode(true);
    setLiveError(null);
    if (!process.env.API_KEY) {
        setLiveError("API ключ не найден");
        return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputSource = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      const outputNode = outputCtx.createGain();
      const muteNode = inputCtx.createGain();
      muteNode.gain.value = 0; 

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a friendly yoga studio assistant named Katya. Keep responses concise and warm. Speak Russian.',
        },
        callbacks: {
          onopen: () => {
            setIsLiveConnected(true);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            inputSource.connect(scriptProcessor);
            scriptProcessor.connect(muteNode);
            muteNode.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 ctx,
                 24000,
                 1
               );
               
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               outputNode.connect(ctx.destination);
               
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
               });
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }
          },
          onclose: () => {
            setIsLiveConnected(false);
          },
          onerror: (err) => {
            setLiveError("Ошибка соединения");
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to start live session", e);
      setLiveError("Нет доступа к микрофону");
    }
  };

  const stopLiveSession = async () => {
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current) {
        try { await inputAudioContextRef.current.close(); } catch {}
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        try { await outputAudioContextRef.current.close(); } catch {}
        outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => {
        try { s.stop(); } catch {}
    });
    sourcesRef.current.clear();
    
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        if (typeof (session as any).close === 'function') {
           try { (session as any).close(); } catch {}
        }
      });
      sessionPromiseRef.current = null;
    }

    setIsLiveConnected(false);
    setIsLiveMode(false);
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {isOpen && (
            <div className="mb-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right h-[500px] ring-1 ring-black/5">
            {/* Header */}
            <div className="bg-brand-green/95 backdrop-blur-md p-4 flex items-center justify-between text-white shadow-sm z-10">
                <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                    <Sparkles className="w-4 h-4 text-brand-yellow" />
                </div>
                <span className="font-medium text-sm">Ассистент К себе</span>
                </div>
                <div className="flex items-center gap-1">
                {!isLiveMode && (
                    <>
                    <button 
                        onClick={handleClearHistory}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="Очистить историю"
                    >
                        <Trash2 className="w-4 h-4 opacity-80" />
                    </button>
                    <button 
                        onClick={startLiveSession}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors group relative"
                        title="Голосовой режим"
                    >
                        <Phone className="w-4 h-4 opacity-80" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-brand-yellow rounded-full animate-pulse border border-brand-green"></span>
                    </button>
                    </>
                )}
                <button 
                    onClick={() => { setIsOpen(false); if(isLiveMode) stopLiveSession(); }} 
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 opacity-80" />
                </button>
                </div>
            </div>

            {/* Content Area */}
            {isLiveMode ? (
                <div className="flex-1 bg-gradient-to-b from-stone-50 to-white flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                {/* Pulse Animation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-40 h-40 bg-brand-green/10 rounded-full blur-xl transition-all duration-1000 ${isLiveConnected ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}></div>
                    {isLiveConnected && <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-mint/20 via-transparent to-transparent animate-pulse"></div>}
                </div>

                <div className="relative z-10 bg-white p-6 rounded-full shadow-lg shadow-brand-green/10 mb-8 transition-transform duration-300 border border-stone-50">
                    <Mic className={`w-10 h-10 transition-colors duration-500 ${isLiveConnected ? 'text-brand-green animate-pulse' : 'text-stone-300'}`} />
                </div>
                
                <h3 className="text-xl font-serif text-brand-text mb-2">
                    {liveError ? "Ошибка доступа" : (isLiveConnected ? "Слушаю вас..." : "Соединение...")}
                </h3>
                <p className="text-stone-400 text-xs mb-12 flex items-center gap-2 justify-center h-5">
                    {liveError ? <AlertCircle className="w-3 h-3 text-rose-500" /> : null}
                    {liveError || "Говорите свободно, я понимаю по-русски"}
                </p>

                <button 
                    onClick={stopLiveSession}
                    className="bg-rose-500/10 text-rose-600 px-6 py-3 rounded-full hover:bg-rose-500 hover:text-white transition-all font-medium text-sm flex items-center gap-2 relative z-20 border border-rose-200 hover:border-transparent"
                >
                    <StopCircle className="w-4 h-4" />
                    Завершить
                </button>
                </div>
            ) : (
                <>
                {/* Text Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9] scrollbar-thin scrollbar-thumb-stone-200">
                    {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`flex items-end gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'model' && (
                                <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3 h-3 text-brand-green" />
                                </div>
                            )}
                            <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm border ${
                            msg.role === 'user' 
                                ? 'bg-brand-green text-white rounded-br-none border-transparent' 
                                : 'bg-white text-stone-700 rounded-bl-none border-stone-100'
                            }`}>
                            {msg.text}
                            </div>
                            
                            {msg.role === 'model' && (
                            <button 
                                onClick={() => playTTS(idx, msg.text)}
                                disabled={msg.isAudioLoading}
                                className="p-1.5 bg-white rounded-full text-stone-400 hover:text-brand-green shadow-sm hover:scale-110 transition-all border border-stone-100 flex-shrink-0"
                            >
                                {msg.isAudioLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                            </button>
                            )}
                        </div>
                        
                        {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 ml-9 max-w-[85%]">
                            {msg.sources.map((src, i) => (
                                <a 
                                    key={i} 
                                    href={src.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[9px] bg-white border border-stone-200 px-2 py-1 rounded-full text-stone-500 hover:text-brand-green hover:border-brand-green/30 transition-colors"
                                >
                                    <ExternalLink className="w-2 h-2" />
                                    <span className="truncate max-w-[100px]">{src.title}</span>
                                </a>
                            ))}
                        </div>
                        )}
                    </div>
                    ))}
                    
                    {isLoading && (
                    <div className="flex justify-start ml-8">
                        <div className="bg-white rounded-2xl px-4 py-3 border border-stone-100 rounded-bl-none shadow-sm flex gap-1.5 items-center">
                            <span className="text-xs text-stone-400 mr-1">Печатает</span>
                            <div className="w-1 h-1 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center">
                    <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Задайте вопрос..."
                    className="flex-1 px-4 py-2.5 bg-stone-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green text-sm border border-stone-100 transition-all placeholder:text-stone-400"
                    />
                    <button 
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    className="p-2.5 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 disabled:opacity-50 disabled:hover:bg-brand-green transition-all shadow-md active:scale-95"
                    >
                    <Send className="w-4 h-4" />
                    </button>
                </div>
                </>
            )}
            </div>
        )}

        {/* Floating Action Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
                group flex items-center gap-3 pl-5 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgba(87,167,115,0.25)] transition-all hover:scale-105 active:scale-95
                ${isOpen ? 'bg-stone-100 text-stone-500' : isLiveMode ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-green text-white'}
            `}
        >
            <span className={`${isOpen ? 'hidden' : 'hidden sm:block'} font-medium text-sm pr-2`}>
            {isLiveMode ? "Микрофон активен" : "Ассистент"}
            </span>
            <div className={`p-2 rounded-full ${isOpen ? 'bg-white' : 'bg-white/20'}`}>
               {isOpen ? <X className="w-5 h-5 text-stone-500" /> : isLiveMode ? <Mic className="w-5 h-5 animate-bounce" /> : <MessageCircle className="w-5 h-5" />}
            </div>
            {!isOpen && !isLiveMode && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow"></span>
                </span>
            )}
        </button>
      </div>
    </div>
  );
};
