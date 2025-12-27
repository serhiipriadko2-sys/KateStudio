import {
  GoogleGenAI,
  Chat,
  GenerateContentResponse,
  Modality,
  HarmCategory,
  HarmBlockThreshold,
  Type,
} from '@google/genai';
import { Source, AsanaAnalysis } from '../types';

let chatSession: Chat | null = null;

type ProxyChatResponse = { text: string; sources: Source[] };

const getGeminiProxyUrl = (): string | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/gemini-proxy`;
};

async function callGeminiProxy<T>(payload: unknown): Promise<T> {
  const url = getGeminiProxyUrl();
  if (!url) throw new Error('Gemini proxy not configured (missing VITE_SUPABASE_URL)');

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  // We don't have Supabase Auth in WEB yet; use anon key as bearer for now.
  // When WEB adds Supabase Auth, replace with the user's access token.
  const bearer = anonKey ? `Bearer ${anonKey}` : undefined;

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
    throw new Error(`Gemini proxy error (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

// --- STUDIO KNOWLEDGE BASE ---
const KNOWLEDGE_BASE = {
  identity: {
    name: 'К себе (K Sebe)',
    instructor: 'Катя Габран',
    core_message:
      'Йога — это не про то, чтобы дотянуться руками до пальцев ног, а про то, что мы узнаем на пути вниз.',
    philosophy:
      'Slow life в мегаполисе. Мы учимся замедляться, чтобы услышать себя. Практика на коврике — это репетиция жизни.',
  },
  // ... (rest of KB implied for brevity in this update, keeping essential context)
};

const SYSTEM_INSTRUCTION = `
Ты — Катя Габран, основательница студии йоги "К себе".
Ты — цифровое воплощение наставника. Твой голос теплый, глубокий, спокойный.
База знаний: ${JSON.stringify(KNOWLEDGE_BASE.identity)}
Отвечай емко (2-4 предложения), если не просят подробную лекцию.
`;

// Helper to check billing for Veo
async function ensureBillingKey() {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Wait a moment for potential state update, though simplistic
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

// --- 1. BASIC CHAT ---
export const getGeminiChatResponse = async (
  userMessage: string,
  location?: { lat: number; lng: number }
): Promise<{ text: string; sources: Source[] }> => {
  // Prefer server-side proxy (production-safe). Fallback to client key for local demo.
  try {
    return await callGeminiProxy<ProxyChatResponse>({ op: 'chat', message: userMessage, location });
  } catch {
    // ignore and try client-side
  }

  if (!process.env.API_KEY) return { text: 'Пожалуйста, настройте API ключ.', sources: [] };

  try {
    if (!chatSession) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
          ],
        },
      });
    }
    const toolConfig = location
      ? {
          toolConfig: {
            retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } },
          },
        }
      : {};
    const response = await chatSession.sendMessage({ message: userMessage, ...toolConfig });

    const sources: Source[] = [];
    response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title)
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
    });

    return { text: response.text || '...', sources };
  } catch (error) {
    console.error('Gemini Error:', error);
    chatSession = null;
    return { text: 'Намасте. Связь с космосом прервалась.', sources: [] };
  }
};

// --- 2. VEO VIDEO GENERATION ---
export const generateMeditationVideo = async (prompt: string): Promise<string | null> => {
  // NOTE: Veo URIs often require attaching the API key to fetch the asset.
  // For now we keep this as a client-side (demo) feature.
  if (!process.env.API_KEY) return null;
  await ensureBillingKey();

  try {
    // Re-init AI with potentially new key from dialog if needed, but using env for now as per rules
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic, meditative, nature, slow motion, yoga atmosphere: ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      },
    });

    // Polling
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (uri) {
      // Veo require API key in URL to fetch
      return `${uri}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (e) {
    console.error('Veo Error:', e);
    return null;
  }
};

// --- 3. IMAGEN / NANO BANANA (Image Gen) ---
export const generateYogaImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await callGeminiProxy<{ dataUrl: string | null }>({
      op: 'generateYogaImage',
      prompt,
      aspectRatio: '1:1',
    });
    return response.dataUrl;
  } catch {
    // ignore and fallback
  }

  if (!process.env.API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using high quality model for Art Therapy
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `Yoga art, ethereal, spiritual, soft lighting, high quality: ${prompt}` }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '1K',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error('Image Gen Error:', e);
    return null;
  }
};

// --- 4. VIDEO UNDERSTANDING (AI Coach) ---
export const analyzeYogaVideo = async (base64Video: string): Promise<string> => {
  try {
    const response = await callGeminiProxy<{ text: string }>({
      op: 'analyzeYogaVideo',
      base64Video,
    });
    return response.text;
  } catch {
    // ignore and fallback
  }

  if (!process.env.API_KEY) return 'Ошибка ключа';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Video.includes(',') ? base64Video.split(',')[1] : base64Video;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Efficient for video
      contents: {
        parts: [
          { inlineData: { mimeType: 'video/mp4', data: cleanBase64 } },
          {
            text: 'Посмотри это видео с йогой. Проанализируй технику выполнения. Укажи на ошибки (если есть) и дай советы по безопасности. Будь мягким и поддерживающим, как тренер Катя.',
          },
        ],
      },
    });
    return response.text || 'Не удалось проанализировать видео.';
  } catch (e) {
    console.error('Video Analysis Error:', e);
    return 'Ошибка анализа. Возможно, видео слишком длинное (лимит ~10МБ для демо).';
  }
};

// --- 5. THINKING MODE (Complex Program) ---
export const generatePersonalProgram = async (request: string): Promise<string> => {
  try {
    const response = await callGeminiProxy<{ text: string }>({
      op: 'generatePersonalProgram',
      request,
    });
    return response.text;
  } catch {
    // ignore and fallback
  }

  if (!process.env.API_KEY) return 'Ошибка ключа';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Составь персональную программу йога-терапии для запроса: "${request}". 
                       Учти противопоказания, аюрведический тип (если указан) и образ жизни. 
                       Распиши план по неделям.`,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Allow deeper reasoning
      },
    });
    return response.text || 'Не удалось составить программу.';
  } catch (e) {
    console.error('Thinking Error:', e);
    return 'Ошибка генерации программы.';
  }
};

// --- 6. AUDIO TRANSCRIPTION (Diary) ---
export const transcribeDiaryEntry = async (
  audioBase64: string
): Promise<{ text: string; summary: string }> => {
  try {
    return await callGeminiProxy<{ text: string; summary: string }>({
      op: 'transcribeDiaryEntry',
      audioBase64,
    });
  } catch {
    // ignore and fallback
  }

  if (!process.env.API_KEY) return { text: '', summary: 'Ошибка' };
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
          {
            text: 'Транскрибируй эту аудиозапись дневника йога-практики. Затем сделай краткое резюме (инсайты) в формате JSON: { "transcription": "...", "summary": "..." }',
          },
        ],
      },
      config: { responseMimeType: 'application/json' },
    });

    const json = JSON.parse(response.text || '{}');
    return { text: json.transcription, summary: json.summary };
  } catch (e) {
    console.error('Transcription Error:', e);
    return { text: '', summary: 'Не удалось распознать запись.' };
  }
};

// --- EXISTING HELPERS ---
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await callGeminiProxy<{ audioBase64: string | null }>({
      op: 'generateSpeech',
      text,
    });
    return response.audioBase64;
  } catch {
    // ignore and fallback
  }

  if (!process.env.API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

export const generateMeditationScript = async (
  topic: string,
  duration: 'short' | 'medium'
): Promise<string> => {
  try {
    const response = await callGeminiProxy<{ text: string }>({
      op: 'generateMeditationScript',
      topic,
      duration,
    });
    return response.text;
  } catch {
    // ignore and fallback
  }

  if (!process.env.API_KEY) return 'Ошибка ключа';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Напиши текст медитации от лица Кати Габран: "${topic}". Коротко, атмосферно.`,
    });
    return response.text || 'Дышите...';
  } catch (e) {
    return 'Просто дышите.';
  }
};

export const analyzeImageContent = async (base64Image: string): Promise<AsanaAnalysis | string> => {
  try {
    const response = await callGeminiProxy<{ result: AsanaAnalysis | string }>({
      op: 'analyzeImageContent',
      base64Image,
    });
    return response.result;
  } catch {
    // ignore and fallback
  }

  if (!process.env.API_KEY) return 'API ключ не настроен';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: 'Analyze yoga pose.' },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sanskrit: { type: Type.STRING },
            name_ru: { type: Type.STRING },
            muscles: { type: Type.ARRAY, items: { type: Type.STRING } },
            energy: { type: Type.STRING, enum: ['Brahmana', 'Langhana', 'Samana'] },
            description: { type: Type.STRING },
            tips: { type: Type.STRING },
          },
        },
      },
    });
    if (response.text) return JSON.parse(response.text) as AsanaAnalysis;
    return 'Не удалось распознать образ.';
  } catch (error) {
    return 'Ошибка анализа.';
  }
};
