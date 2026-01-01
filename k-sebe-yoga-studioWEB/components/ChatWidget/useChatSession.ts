import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  analyzeYogaVideo,
  generateMeditationScript,
  generateMeditationVideo,
  generatePersonalProgram,
  generateSpeech,
  generateYogaImage,
  getGeminiChatResponse,
  transcribeDiaryEntry,
} from '../../services/geminiService';
import type { ChatMessage, ChatMode } from '../../types';
import { createPcmBlob, decodeAudioData, decodeBase64 } from './liveAudio';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  text: 'Намасте! Я Катя. Выберите режим работы в меню или просто напишите мне.',
};

export const useChatSession = () => {
  const allowClientFallback = import.meta.env.DEV;
  const [mode, setMode] = useState<ChatMode>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveSpeaking, setIsLiveSpeaking] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<unknown> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {}
      );
    }
    setMessages([INITIAL_MESSAGE]);
  }, []);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || isLoading) return;

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
        setLoadingText('Создаю видео-атмосферу (Veo)...');
        const videoUrl = await generateMeditationVideo(textToSend);

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
        const response = await getGeminiChatResponse(textToSend);
        setMessages((prev) => [...prev, { role: 'model', text: response.text }]);
      } else if (mode === 'program') {
        setLoadingText('Анализирую (Thinking Mode)...');
        const program = await generatePersonalProgram(textToSend);
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: program, isThinking: true, type: 'program' },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: 'Произошла ошибка.' }]);
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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
        const blob = new Blob(chunks, { type: 'audio/wav' });
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
    } catch {
      alert('Нет доступа к микрофону');
    }
  };

  const stopRecordingDiary = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const startLiveSession = async () => {
    setIsLiveMode(true);
    setPermissionError(false);
    if (!allowClientFallback) {
      setPermissionError(true);
      return;
    }
    if (!process.env.API_KEY) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
                s.sendRealtimeInput({ media: createPcmBlob(e.inputBuffer.getChannelData(0)) })
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
              const b = await decodeAudioData(decodeBase64(d), outputCtx, 24000, 1);
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
    } catch {
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

  return {
    mode,
    setMode,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isLoading,
    loadingText,
    isRecording,
    handleSend,
    handleFileUpload,
    startRecordingDiary,
    stopRecordingDiary,
    isLiveMode,
    isLiveConnected,
    isLiveSpeaking,
    permissionError,
    setIsLiveMode,
    startLiveSession,
    stopLiveSession,
  };
};
