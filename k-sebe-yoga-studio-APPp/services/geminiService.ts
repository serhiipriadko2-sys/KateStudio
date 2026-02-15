import { getKnowledgeBaseResponse } from '@ksebe/shared';
import { Source } from '../types';
import { supabase } from './supabaseClient';

export interface VisionAnalysisResult {
  poseName: string;
  sanskritName: string;
  muscleGroups: string[];
  energyEffect: string;
  alignmentScore: number;
  safetyStatus: 'Safe' | 'Caution' | 'Danger';
  positivePoints: string[];
  corrections: string[];
  expertAdvice: string;
}

export interface MeditationResult {
  title: string;
  script: string;
  durationMin: number;
}

const invokeGemini = async <T>(action: string, body: object): Promise<T | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action, ...body },
    });

    if (error) {
      console.error(`Gemini Proxy Error (${action}):`, error);
      return null;
    }
    return data as T;
  } catch (err) {
    console.error(`Gemini Invoke Error (${action}):`, err);
    return null;
  }
};

// --- THINKING MODE ---
export const getThinkingResponse = async (userMessage: string): Promise<string> => {
  const data = await invokeGemini<{ text: string }>('thinking', { message: userMessage });
  return data?.text || 'Не удалось получить ответ от модели мышления.';
};

export const getGeminiChatResponse = async (
  userMessage: string,
  _location?: { lat: number; lng: number }
): Promise<{ text: string; sources: Source[] }> => {
  // Use knowledge base first for instant answers
  const kbResponse = getKnowledgeBaseResponse(userMessage);

  // If KB has a high-confidence answer, use it (mock logic: if text is long enough)
  if (kbResponse.text.length > 50) {
    return { text: kbResponse.text, sources: kbResponse.sources ?? [] };
  }

  // Fallback to Gemini Chat
  const data = await invokeGemini<{ text: string; sources?: Source[] }>('chat', {
    message: userMessage,
    stream: false,
  });

  return {
    text: data?.text || kbResponse.text,
    sources: data?.sources || kbResponse.sources || []
  };
};

export async function* getGeminiChatStream(userMessage: string) {
  // For now, stream is simulated via single request because Edge Function streaming is complex to consume in simple client
  const response = await getGeminiChatResponse(userMessage);

  // Simulate typing effect
  const chunkSize = 10;
  for (let i = 0; i < response.text.length; i += chunkSize) {
    yield response.text.slice(0, i + chunkSize);
    await new Promise((r) => setTimeout(r, 20));
  }
  return;
}

// --- MEDITATION GENERATION ---
export const createMeditation = async (
  topic: string,
  duration: string
): Promise<MeditationResult | null> => {
  const response = await invokeGemini<{ result: MeditationResult }>('createMeditation', {
    topic,
    duration,
  });
  return response?.result || null;
};

// --- TTS ---
export const generateSpeech = async (text: string): Promise<string | null> => {
  const response = await invokeGemini<{ audioBase64: string }>('generateSpeech', { text });
  return response?.audioBase64 || null;
};

// --- IMAGE GEN ---
export const generateYogaImage = async (
  prompt: string,
  aspectRatio: string
): Promise<string | null> => {
  const response = await invokeGemini<{ dataUrl: string }>('generateYogaImage', {
    prompt,
    aspectRatio,
  });
  return response?.dataUrl || null;
};

// --- IMAGE EDITING (Magic Edit) ---
export const editYogaImage = async (
  _base64Image: string,
  _mimeType: string,
  _prompt: string
): Promise<string | null> => {
  // Placeholder: Magic Edit not yet implemented in proxy
  return null;
};

// --- VIDEO GENERATION (Veo) ---
export const generateVeoVideo = async (_prompt: string): Promise<string | null> => {
  // Placeholder: Veo not yet implemented in proxy
  return null;
};

// --- VISION ANALYSIS (Images & Video) ---
export const analyzeMedia = async (
  fileBase64: string,
  mimeType: string,
  userPrompt: string
): Promise<VisionAnalysisResult | string> => {
  // Strip prefix if present
  const cleanBase64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;

  const response = await invokeGemini<{ result: VisionAnalysisResult | string }>('analyzeMedia', {
    fileBase64: cleanBase64,
    mimeType,
    userPrompt,
  });

  return response?.result || 'Не удалось проанализировать медиа.';
};
