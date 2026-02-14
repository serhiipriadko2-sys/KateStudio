import { getKnowledgeBaseResponse } from '@ksebe/shared';
import { Source } from '../types';

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

// --- THINKING MODE (New) ---
export const getThinkingResponse = async (_userMessage: string): Promise<string> => {
  // AI DISABLED FOR MVP
  return 'Режим глубокого мышления пока недоступен.';
};

export const getGeminiChatResponse = async (
  userMessage: string,
  _location?: { lat: number; lng: number }
): Promise<{ text: string; sources: Source[] }> => {
  // RULE-BASED OVERRIDE FOR MVP
  const response = getKnowledgeBaseResponse(userMessage);
  return { text: response.text, sources: response.sources ?? [] };
};

export async function* getGeminiChatStream(userMessage: string) {
  // RULE-BASED OVERRIDE FOR MVP
  const response = getKnowledgeBaseResponse(userMessage);
  yield response.text;
  return;
}

// --- MEDITATION GENERATION ---
export const createMeditation = async (
  _topic: string,
  _duration: string
): Promise<MeditationResult | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- TTS ---
export const generateSpeech = async (_text: string): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- IMAGE GEN ---
export const generateYogaImage = async (
  _prompt: string,
  _aspectRatio: string
): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- IMAGE EDITING (Magic Edit) ---
export const editYogaImage = async (
  _base64Image: string,
  _mimeType: string,
  _prompt: string
): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- VIDEO GENERATION (Veo) ---
export const generateVeoVideo = async (_prompt: string): Promise<string | null> => {
  // AI DISABLED FOR MVP
  return null;
};

// --- VISION ANALYSIS (Images & Video) ---
export const analyzeMedia = async (
  _fileBase64: string,
  _mimeType: string,
  _userPrompt: string
): Promise<VisionAnalysisResult | string> => {
  // AI DISABLED FOR MVP
  return 'Функция анализа медиа временно недоступна.';
};
