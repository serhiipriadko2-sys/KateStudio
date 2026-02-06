import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { getAssistantResponse } from '../../services/assistantService';
import type { ChatMessage, ChatMode } from '../../types';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  text: 'Намасте! Я Катя. Помогу с расписанием, ценами, адресом и записью.',
};

export const useChatSession = () => {
  const [mode] = useState<ChatMode>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setMessages([INITIAL_MESSAGE]);
  }, []);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || isLoading) return;

    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text: textToSend, type: mode }]);
    setIsLoading(true);

    try {
      const response = getAssistantResponse(textToSend);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: response.text, sources: response.sources },
      ]);
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
    setMessages((prev) => [
      ...prev,
      {
        role: 'model',
        text: 'Видео‑разборы пока недоступны. Могу помочь с расписанием и записью.',
      },
    ]);
  };

  const startRecordingDiary = async () => {
    setIsRecording(false);
    setMessages((prev) => [...prev, { role: 'model', text: 'Голосовой дневник пока недоступен.' }]);
  };

  const stopRecordingDiary = () => {
    setIsRecording(false);
  };

  const startLiveSession = async () => {
    setMessages((prev) => [
      ...prev,
      { role: 'model', text: 'Звонки с ассистентом пока недоступны.' },
    ]);
  };

  const stopLiveSession = async () => {};

  return {
    mode,
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
    startLiveSession,
    stopLiveSession,
  };
};
