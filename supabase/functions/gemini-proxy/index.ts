// Supabase Edge Function: gemini-proxy
//
// Purpose:
// - Keep GEMINI_API_KEY on the server (Deno env)
// - Provide a narrow, auditable set of AI operations for WEB/APP clients
//
// Notes:
// - This function intentionally supports only selected operations.
// - For production-scale rate limiting, use a persistent store (KV/Redis) instead of in-memory maps.

import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Modality,
  Type,
} from 'npm:@google/genai@1.33.0';
import { createClient } from 'npm:@supabase/supabase-js@2.47.10';

type Source = { title: string; uri: string };

type ProxyRequest =
  | { op: 'chat'; message: string; location?: { lat: number; lng: number } }
  | { op: 'thinking'; message: string }
  | { op: 'generateSpeech'; text: string }
  | { op: 'generateMeditationScript'; topic: string; duration?: 'short' | 'medium' }
  | { op: 'createMeditation'; topic: string; duration: string }
  | { op: 'generateYogaImage'; prompt: string; aspectRatio?: string }
  | { op: 'generatePersonalProgram'; request: string }
  | { op: 'transcribeDiaryEntry'; audioBase64: string }
  | { op: 'analyzeYogaVideo'; base64Video: string }
  | { op: 'analyzeMedia'; fileBase64: string; mimeType: string; userPrompt: string }
  | { op: 'analyzeImageContent'; base64Image: string };

const corsHeaders: HeadersInit = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

type AuthInfo = { kind: 'user'; userId: string } | { kind: 'anon'; key: string };

function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

async function getAuthInfo(req: Request): Promise<AuthInfo> {
  const token = getBearerToken(req);
  if (!token) return { kind: 'anon', key: `ip:${getIp(req)}` };

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    // If env is missing, fall back to IP-based limiting rather than failing hard.
    return { kind: 'anon', key: `ip:${getIp(req)}` };
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data } = await supabase.auth.getUser(token);
    if (data.user?.id) return { kind: 'user', userId: data.user.id };
  } catch {
    // ignore and fall back
  }

  return { kind: 'anon', key: `ip:${getIp(req)}` };
}

function getOpCost(op: ProxyRequest['op']): 'cheap' | 'medium' | 'expensive' {
  switch (op) {
    case 'chat':
      return 'cheap';
    case 'thinking':
    case 'generateSpeech':
    case 'generateMeditationScript':
    case 'createMeditation':
      return 'medium';
    case 'generateYogaImage':
    case 'generatePersonalProgram':
    case 'transcribeDiaryEntry':
    case 'analyzeYogaVideo':
    case 'analyzeMedia':
    case 'analyzeImageContent':
      return 'expensive';
    default:
      return 'expensive';
  }
}

function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();

  const existing = rateBuckets.get(key);
  if (!existing || now >= existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, String(v)));
  return new Response(JSON.stringify(data), { ...init, headers });
}

const SYSTEM_INSTRUCTION = `
You are Katya Gabran (Катя Габран), the founder of "K Sebe" (К себе) Yoga Studio.
You are a warm, empathetic, and highly knowledgeable yoga teacher.

Tone: Deep, soothing, professional yet spiritual.
Language: Russian (always).
Safety:
- Always warn about contraindications (knees, neck, lower back).
- Stop if there is sharp pain.
`.trim();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return json({ error: 'Server is missing GEMINI_API_KEY' }, { status: 500 });
  }

  let body: ProxyRequest;
  try {
    body = (await req.json()) as ProxyRequest;
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const authInfo = await getAuthInfo(req);
  const cost = getOpCost(body.op);

  // Rate limit tuning (per edge instance):
  // - anon is stricter than authenticated user
  // - "expensive" ops are stricter than chat
  const windowMs = 60_000;
  const limit =
    authInfo.kind === 'user'
      ? cost === 'cheap'
        ? 120
        : cost === 'medium'
          ? 60
          : 20
      : cost === 'cheap'
        ? 30
        : cost === 'medium'
          ? 12
          : 4;

  const rlKey =
    authInfo.kind === 'user' ? `user:${authInfo.userId}:${cost}` : `${authInfo.key}:${cost}`;
  const rl = rateLimit(rlKey, { limit, windowMs });
  if (!rl.ok) {
    return json(
      { error: 'Rate limit exceeded', retryAfterSeconds: rl.retryAfterSeconds },
      { status: 429, headers: { 'retry-after': String(rl.retryAfterSeconds) } }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (body.op) {
      case 'chat': {
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
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

        const toolConfig = body.location
          ? {
              toolConfig: {
                retrievalConfig: {
                  latLng: { latitude: body.location.lat, longitude: body.location.lng },
                },
              },
            }
          : {};

        const response = await chat.sendMessage({ message: body.message, ...toolConfig });

        const sources: Source[] = [];
        response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title)
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        });

        return json({ text: response.text || '...', sources });
      }

      case 'thinking': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: body.message,
          config: {
            systemInstruction:
              SYSTEM_INSTRUCTION +
              '\n\nCRITICAL: Use your thinking capabilities to provide a deeply reasoned, step-by-step analysis or plan. Think before answering.',
            thinkingConfig: { thinkingBudget: 1024 },
          },
        });
        return json({ text: response.text || '...' });
      }

      case 'generateSpeech': {
        const cleanText = body.text.replace(/\[.*?\]/g, '... ');
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [{ parts: [{ text: cleanText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          },
        });
        const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        return json({ audioBase64 });
      }

      case 'generateMeditationScript': {
        const duration = body.duration ?? 'short';
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Напиши текст медитации от лица Кати Габран: "${body.topic}". ${
            duration === 'medium' ? 'Средней длины.' : 'Коротко.'
          } Атмосферно, мягко, с фокусом на дыхании.`,
        });
        return json({ text: response.text || 'Дышите...' });
      }

      case 'createMeditation': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              {
                text: `Create a yoga meditation script. Topic: "${body.topic}". Target duration: ${body.duration}. Language: Russian. Keep it soothing, metaphorical, and focused on breath.`,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                script: { type: Type.STRING },
                durationMin: { type: Type.NUMBER },
              },
              required: ['title', 'script', 'durationMin'],
            },
          },
        });
        if (response.text) {
          try {
            return json({ result: JSON.parse(response.text) });
          } catch {
            return json({ result: null });
          }
        }
        return json({ result: null });
      }

      case 'generateYogaImage': {
        const aspectRatio = body.aspectRatio ?? '1:1';
        const safeRatio = ['2:3', '21:9', '3:2'].includes(aspectRatio)
          ? aspectRatio === '2:3'
            ? '3:4'
            : aspectRatio === '3:2'
              ? '4:3'
              : '16:9'
          : aspectRatio;

        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: {
            parts: [{ text: `High quality, yoga atmosphere, soft lighting: ${body.prompt}` }],
          },
          config: { imageConfig: { aspectRatio: safeRatio, imageSize: '1K' } },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data)
            return json({ dataUrl: `data:image/png;base64,${part.inlineData.data}` });
        }
        return json({ dataUrl: null });
      }

      case 'generatePersonalProgram': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Составь персональную программу йога-терапии для запроса: "${body.request}". 
Учти противопоказания, аюрведический тип (если указан) и образ жизни. 
Распиши план по неделям.`,
          config: {
            thinkingConfig: { thinkingBudget: 2048 },
          },
        });
        return json({ text: response.text || 'Не удалось составить программу.' });
      }

      case 'transcribeDiaryEntry': {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { mimeType: 'audio/wav', data: body.audioBase64 } },
              {
                text: 'Транскрибируй эту аудиозапись дневника йога-практики. Затем сделай краткое резюме (инсайты) в формате JSON: { "transcription": "...", "summary": "..." }',
              },
            ],
          },
          config: { responseMimeType: 'application/json' },
        });

        try {
          const parsed = JSON.parse(response.text || '{}') as {
            transcription?: string;
            summary?: string;
          };
          return json({ text: parsed.transcription || '', summary: parsed.summary || '' });
        } catch {
          return json({ text: '', summary: '' });
        }
      }

      case 'analyzeYogaVideo': {
        const cleanBase64 = body.base64Video.includes(',')
          ? body.base64Video.split(',')[1] || ''
          : body.base64Video;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { mimeType: 'video/mp4', data: cleanBase64 } },
              {
                text: 'Посмотри это видео с йогой. Проанализируй технику выполнения. Укажи на ошибки (если есть) и дай советы по безопасности. Будь мягким и поддерживающим, как тренер Катя.',
              },
            ],
          },
        });
        return json({ text: response.text || 'Не удалось проанализировать видео.' });
      }

      case 'analyzeMedia': {
        const isVideo = body.mimeType.startsWith('video/');
        const contextPrompt = isVideo
          ? `Analyze this yoga video clip. Focus on movement flow, transitions, stability, rhythm (Inside Flow context). User question: ${body.userPrompt}`
          : `Analyze this yoga pose photo. Focus on static alignment, geometry, and safety. User question: ${body.userPrompt}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { mimeType: body.mimeType, data: body.fileBase64 } },
              { text: contextPrompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                poseName: { type: Type.STRING },
                sanskritName: { type: Type.STRING },
                muscleGroups: { type: Type.ARRAY, items: { type: Type.STRING } },
                energyEffect: { type: Type.STRING },
                alignmentScore: { type: Type.NUMBER },
                safetyStatus: { type: Type.STRING, enum: ['Safe', 'Caution', 'Danger'] },
                positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                corrections: { type: Type.ARRAY, items: { type: Type.STRING } },
                expertAdvice: { type: Type.STRING },
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
          try {
            return json({ result: JSON.parse(response.text) });
          } catch {
            return json({ result: response.text });
          }
        }
        return json({ result: 'Не удалось проанализировать медиа.' });
      }

      case 'analyzeImageContent': {
        const cleanBase64 = body.base64Image.includes(',')
          ? body.base64Image.split(',')[1] || ''
          : body.base64Image;
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

        if (response.text) {
          try {
            return json({ result: JSON.parse(response.text) });
          } catch {
            return json({ result: response.text });
          }
        }
        return json({ result: 'Не удалось распознать образ.' });
      }

      default: {
        return json({ error: 'Unsupported op' }, { status: 400 });
      }
    }
  } catch (e) {
    console.error('gemini-proxy error', e);
    return json({ error: 'Internal error' }, { status: 500 });
  }
});
