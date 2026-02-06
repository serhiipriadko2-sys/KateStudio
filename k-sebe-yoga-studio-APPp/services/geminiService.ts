import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from '@google/genai';
import { Source } from '../types';
import { supabase } from './supabaseClient';
import { getKnowledgeBaseResponse } from '@ksebe/shared';

let chatSession: Chat | null = null;
const allowClientFallback = import.meta.env.DEV;

const getGeminiProxyUrl = (): string | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/gemini-proxy`;
};

async function callGeminiProxy<T>(payload: unknown): Promise<T> {
  const url = getGeminiProxyUrl();
  if (!url) throw new Error('Gemini proxy not configured (missing VITE_SUPABASE_URL)');

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  // Prefer user JWT; fallback to anon key (chat-only in proxy; expensive ops will require auth).
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

const getFriendlyProxyError = (err: unknown): string | null => {
  if (!(err instanceof Error)) return null;
  if (err.message === 'AUTH_REQUIRED') {
    return 'Для этой AI-функции нужно войти в аккаунт (подтвердить телефон).';
  }
  if (err.message === 'RATE_LIMIT') {
    return 'Слишком много запросов. Пожалуйста, подождите минуту и попробуйте снова.';
  }
  return null;
};

const SYSTEM_INSTRUCTION = `
You are Katya Gabran (Катя Габран), the founder of "K Sebe" (К себе) Yoga Studio.
You are a warm, empathetic, and highly knowledgeable yoga teacher.

**Tone:** Deep, soothing, professional yet spiritual.
**Philosophy:** Yoga is a dialogue between body and soul.
**Language:** Russian (always).

**Key Capabilities:**
1. **Pose Analysis:** You look at alignment, safety, and energy flow.
2. **Meditation Guide:** You create atmospheric visualization scripts.
3. **Philosophy:** You explain concepts through metaphors of nature and fluid movement.

**Safety First:**
- Always warn about contraindications (knees, neck, lower back).
- Stop if there is sharp pain.
`;

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

// Helper to init AI
// Note: For Veo, we re-instantiate this in the function to capture the latest key if selected via dialog
const getAI = () => {
  if (!allowClientFallback) throw new Error('Client Gemini key disabled in production');
  if (!process.env.API_KEY) throw new Error('API Key missing');
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- CHAT (Standard & Streaming) ---

const ensureSession = () => {
  if (!chatSession) {
    const ai = getAI();
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });
  }
  return chatSession;
};

// --- THINKING MODE (New) ---
export const getThinkingResponse = async (userMessage: string): Promise<string> => {
  // AI DISABLED FOR MVP
  return 'Режим глубокого мышления пока недоступен.';
};

export const getGeminiChatResponse = async (
  userMessage: string,
  location?: { lat: number; lng: number }
): Promise<{ text: string; sources: Source[] }> => {
  // RULE-BASED OVERRIDE FOR MVP
  return getKnowledgeBaseResponse(userMessage);
};

export async function* getGeminiChatStream(userMessage: string) {
  // RULE-BASED OVERRIDE FOR MVP
  const response = getKnowledgeBaseResponse(userMessage);
  yield response.text;
  return;
}

// --- MEDITATION GENERATION ---
export const createMeditation = async (
  topic: string,
  duration: string
): Promise<MeditationResult | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- TTS ---
export const generateSpeech = async (text: string): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- IMAGE GEN ---
export const generateYogaImage = async (
  prompt: string,
  aspectRatio: string
): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- IMAGE EDITING (Magic Edit) ---
export const editYogaImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- VIDEO GENERATION (Veo) ---
export const generateVeoVideo = async (prompt: string): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- VISION ANALYSIS (Images & Video) ---
export const analyzeMedia = async (
  fileBase64: string,
  mimeType: string,
  userPrompt: string
): Promise<VisionAnalysisResult | string> => {
  // AI DISABLED FOR MVP
  return 'Функция анализа медиа временно недоступна.';
};
