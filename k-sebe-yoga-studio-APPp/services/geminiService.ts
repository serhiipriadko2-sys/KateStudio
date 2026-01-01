import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from '@google/genai';
import { Source } from '../types';
import { supabase } from './supabaseClient';

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
  try {
    const response = await callGeminiProxy<{ text: string }>({
      op: 'thinking',
      message: userMessage,
    });
    return response.text;
  } catch (error) {
    if (!allowClientFallback) {
      console.error('Gemini proxy error:', error);
      return 'Сервис временно недоступен. Попробуйте позже.';
    }
  }

  if (!allowClientFallback) return 'Сервис временно недоступен. Попробуйте позже.';
  if (!process.env.API_KEY) return 'API Key missing';
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Thinking is available on 2.5 Flash
      contents: userMessage,
      config: {
        systemInstruction:
          SYSTEM_INSTRUCTION +
          '\n\nCRITICAL: Use your thinking capabilities to provide a deeply reasoned, step-by-step analysis or plan. Think before answering.',
        thinkingConfig: { thinkingBudget: 1024 }, // Enable Thinking Mode
      },
    });
    return response.text || 'Не удалось сгенерировать глубокий ответ.';
  } catch (e) {
    console.error('Thinking Error:', e);
    return 'Произошла ошибка при глубоком анализе. Попробуйте обычный режим.';
  }
};

export const getGeminiChatResponse = async (
  userMessage: string,
  location?: { lat: number; lng: number }
): Promise<{ text: string; sources: Source[] }> => {
  try {
    return await callGeminiProxy<{ text: string; sources: Source[] }>({
      op: 'chat',
      message: userMessage,
      location,
    });
  } catch (error) {
    if (!allowClientFallback) {
      console.error('Gemini proxy error:', error);
      return { text: 'Сервис временно недоступен. Попробуйте позже.', sources: [] };
    }
  }

  if (!allowClientFallback)
    return { text: 'Сервис временно недоступен. Попробуйте позже.', sources: [] };
  if (!process.env.API_KEY) return { text: 'API Key missing', sources: [] };

  try {
    const session = ensureSession();
    const response: GenerateContentResponse = await session.sendMessage({ message: userMessage });

    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return {
      text: response.text || '...',
      sources,
    };
  } catch (error) {
    console.error('Gemini Error:', error);
    chatSession = null;
    return { text: 'Ошибка соединения.', sources: [] };
  }
};

export async function* getGeminiChatStream(userMessage: string) {
  try {
    const response = await callGeminiProxy<{ text: string; sources: Source[] }>({
      op: 'chat',
      message: userMessage,
    });
    yield response.text || '...';
    return;
  } catch (error) {
    if (!allowClientFallback) {
      console.error('Gemini proxy error:', error);
      yield 'Сервис временно недоступен. Попробуйте позже.';
      return;
    }
  }

  if (!allowClientFallback) {
    yield 'Сервис временно недоступен. Попробуйте позже.';
    return;
  }
  if (!process.env.API_KEY) {
    yield 'Пожалуйста, настройте API ключ.';
    return;
  }

  try {
    const session = ensureSession();
    const result = await session.sendMessageStream({ message: userMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Stream Error', error);
    chatSession = null;
    yield '\n[Ошибка соединения. Пожалуйста, попробуйте еще раз]';
  }
}

// --- MEDITATION GENERATION ---
export const createMeditation = async (
  topic: string,
  duration: string
): Promise<MeditationResult | null> => {
  try {
    const response = await callGeminiProxy<{ result: MeditationResult | null }>({
      op: 'createMeditation',
      topic,
      duration,
    });
    return response.result;
  } catch (error) {
    if (!allowClientFallback) {
      console.error('Gemini proxy error:', error);
      return null;
    }
  }

  if (!allowClientFallback) return null;
  if (!process.env.API_KEY) return null;
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Create a yoga meditation script. Topic: "${topic}". Target duration: ${duration}. Language: Russian. Keep it soothing, metaphorical, and focused on breath.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            script: {
              type: Type.STRING,
              description: 'The full text to be read aloud, include pauses like [пауза]',
            },
            durationMin: { type: Type.NUMBER },
          },
          required: ['title', 'script', 'durationMin'],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MeditationResult;
    }
    return null;
  } catch (e) {
    console.error('Meditation Gen Error', e);
    return null;
  }
};

// --- TTS ---
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await callGeminiProxy<{ audioBase64: string | null }>({
      op: 'generateSpeech',
      text,
    });
    return response.audioBase64;
  } catch (error) {
    if (!allowClientFallback) {
      console.error('Gemini proxy error:', error);
      return null;
    }
  }

  if (!allowClientFallback) return null;
  if (!process.env.API_KEY) return null;
  try {
    const ai = getAI();
    // Clean text from instructions for TTS
    const cleanText = text.replace(/\[.*?\]/g, '... ');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) {
    return null;
  }
};

// --- IMAGE GEN ---
export const generateYogaImage = async (
  prompt: string,
  aspectRatio: string
): Promise<string | null> => {
  try {
    const response = await callGeminiProxy<{ dataUrl: string | null }>({
      op: 'generateYogaImage',
      prompt,
      aspectRatio,
    });
    return response.dataUrl;
  } catch (e) {
    const friendly = getFriendlyProxyError(e);
    if (friendly) return null;
    if (!allowClientFallback) {
      console.error('Gemini proxy error:', e);
      return null;
    }
  }

  // Production safety: image generation is expensive → require authenticated session.
  const session = await supabase.auth.getSession();
  if (!session.data.session?.access_token) return null;

  if (!allowClientFallback) return null;
  if (!process.env.API_KEY) return null;

  const ai = getAI();
  let safeRatio = aspectRatio;
  if (['2:3', '21:9', '3:2'].includes(aspectRatio)) {
    if (aspectRatio === '2:3') safeRatio = '3:4';
    if (aspectRatio === '3:2') safeRatio = '4:3';
    if (aspectRatio === '21:9') safeRatio = '16:9';
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `High quality, yoga atmosphere, soft lighting: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: safeRatio, imageSize: '1K' } },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

// --- IMAGE EDITING (Magic Edit) ---
export const editYogaImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  // Production safety: image editing is expensive → require authenticated session.
  const session = await supabase.auth.getSession();
  if (!session.data.session?.access_token) return null;

  if (!allowClientFallback) return null;
  if (!process.env.API_KEY) return null;
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Capable of editing
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: `Edit this image: ${prompt}. Maintain high quality and yoga atmosphere.` },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    console.error('Edit Image Error', e);
    throw e;
  }
};

// --- VIDEO GENERATION (Veo) ---
export const generateVeoVideo = async (prompt: string): Promise<string | null> => {
  // Production safety: video generation is expensive → require authenticated session.
  const session = await supabase.auth.getSession();
  if (!session.data.session?.access_token) return null;

  if (!allowClientFallback) return null;
  // Check for paid key selection (Required for Veo)
  if ((window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // We assume success or they closed it. If they selected, env var is injected.
    }
  }

  // Create fresh instance to pick up new key if just selected
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic, atmospheric yoga video: ${prompt}, slow motion, 4k, peaceful`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      },
    });

    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      return `${videoUri}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (e) {
    console.error('Veo Error', e);
    throw e;
  }
};

// --- VISION ANALYSIS (Images & Video) ---
export const analyzeMedia = async (
  fileBase64: string,
  mimeType: string,
  userPrompt: string
): Promise<VisionAnalysisResult | string> => {
  try {
    const response = await callGeminiProxy<{ result: VisionAnalysisResult | string }>({
      op: 'analyzeMedia',
      fileBase64,
      mimeType,
      userPrompt,
    });
    return response.result;
  } catch (e) {
    const friendly = getFriendlyProxyError(e);
    if (friendly) return friendly;
    if (!allowClientFallback) {
      console.error('Gemini proxy error:', e);
      return 'Сервис временно недоступен. Попробуйте позже.';
    }
  }

  // Production safety: media analysis is expensive → require authenticated session.
  const session = await supabase.auth.getSession();
  if (!session.data.session?.access_token) {
    return 'Для анализа фото/видео нужно войти в аккаунт (подтвердить телефон).';
  }

  if (!allowClientFallback) return 'Сервис временно недоступен. Попробуйте позже.';
  if (!process.env.API_KEY) return 'API Key not found';

  try {
    const ai = getAI();
    const isVideo = mimeType.startsWith('video/');

    // Dynamic Prompt based on Media Type
    const contextPrompt = isVideo
      ? `Analyze this yoga video clip. Focus on the movement flow, transitions between poses, stability, and rhythm (Inside Flow context). User question: ${userPrompt}`
      : `Analyze this yoga pose photo. Focus on static alignment, geometry, and safety. User question: ${userPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ inlineData: { mimeType: mimeType, data: fileBase64 } }, { text: contextPrompt }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poseName: { type: Type.STRING, description: 'Name of the pose or flow sequence' },
            sanskritName: { type: Type.STRING, description: 'Sanskrit name(s)' },
            muscleGroups: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key muscles worked',
            },
            energyEffect: {
              type: Type.STRING,
              description: 'Calming (Langhana) or Energizing (Brahmana)',
            },
            alignmentScore: {
              type: Type.NUMBER,
              description: 'Score from 1 to 10 based on form/flow',
            },
            safetyStatus: { type: Type.STRING, enum: ['Safe', 'Caution', 'Danger'] },
            positivePoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of what is done correctly',
            },
            corrections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific corrections needed',
            },
            expertAdvice: {
              type: Type.STRING,
              description: 'Detailed warm advice from Katya Gabran',
            },
          },
          required: [
            'poseName',
            'sanskritName',
            'muscleGroups',
            'alignmentScore',
            'safetyStatus',
            'positivePoints',
            'corrections',
            'expertAdvice',
          ],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as VisionAnalysisResult;
    }
    return 'Не удалось проанализировать медиа.';
  } catch (error) {
    console.error('Analysis Error:', error);
    return 'Произошла ошибка при анализе файла.';
  }
};
