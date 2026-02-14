import { supabase } from './supabaseClient';
import { getKnowledgeBaseResponse, type Source } from '@ksebe/shared';

// --- CONFIG ---
const PROXY_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-proxy`
  : '';

// Helper to call Edge Function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function callGeminiProxy<T>(payload: any): Promise<T> {
  if (!PROXY_URL) throw new Error('Proxy URL not configured (VITE_SUPABASE_URL)');

  const url = new URL(PROXY_URL);

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  const bearer = accessToken ? `Bearer ${accessToken}` : anonKey ? `Bearer ${anonKey}` : undefined;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(bearer ? { authorization: bearer } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 401) throw new Error('AUTH_REQUIRED');
    if (res.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(`Gemini proxy error (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

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

// --- CHAT (Standard & Streaming) ---

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getThinkingResponse = async (_userMessage: string): Promise<string> => {
  return 'Режим глубокого мышления пока недоступен.';
};

export const getGeminiChatResponse = async (
  userMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _location?: { lat: number; lng: number }
): Promise<{ text: string; sources: Source[] }> => {
  const res = getKnowledgeBaseResponse(userMessage);
  return {
    ...res,
    sources: res.sources || [],
  };
};

export async function* getGeminiChatStream(userMessage: string) {
  const response = getKnowledgeBaseResponse(userMessage);
  yield response.text;
  return;
}

// --- MEDITATION GENERATION ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createMeditation = async (
  _topic: string,
  _duration: string
): Promise<MeditationResult | null> => {
  return null;
};

// --- TTS ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateSpeech = async (_text: string): Promise<string | null> => {
  return null;
};

// --- IMAGE GEN ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateYogaImage = async (
  _prompt: string,
  _aspectRatio: string
): Promise<string | null> => {
  return null;
};

// --- IMAGE EDITING (Magic Edit) ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const editYogaImage = async (
  _base64Image: string,
  _mimeType: string,
  _prompt: string
): Promise<string | null> => {
  return null;
};

// --- VIDEO GENERATION (Veo) ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateVeoVideo = async (_prompt: string): Promise<string | null> => {
  return null;
};

// --- VISION ANALYSIS (Images & Video) ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const analyzeMedia = async (
  _fileBase64: string,
  _mimeType: string,
  _userPrompt: string
): Promise<VisionAnalysisResult | string> => {
  return 'Функция анализа медиа временно недоступна.';
};
