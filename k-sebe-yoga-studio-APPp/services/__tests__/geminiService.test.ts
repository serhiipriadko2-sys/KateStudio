import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../supabaseClient';
import {
  getThinkingResponse,
  getGeminiChatResponse,
  createMeditation,
  generateSpeech,
  analyzeMedia
} from '../geminiService';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock shared
vi.mock('@ksebe/shared', () => ({
  getKnowledgeBaseResponse: vi.fn().mockReturnValue({ text: 'Default fallback', sources: [] }),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getThinkingResponse calls thinking action', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { text: 'Thoughtful response' },
      error: null
    });

    const result = await getThinkingResponse('Why yoga?');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-proxy', {
      body: { action: 'thinking', message: 'Why yoga?' }
    });
    expect(result).toBe('Thoughtful response');
  });

  it('getGeminiChatResponse falls back to proxy if KB response is short', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { text: 'AI Chat response' },
      error: null
    });

    const result = await getGeminiChatResponse('Hi');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-proxy', {
      body: { action: 'chat', message: 'Hi', stream: false }
    });
    expect(result.text).toBe('AI Chat response');
  });

  it('createMeditation calls proxy with correct params', async () => {
    const mockResult = { title: 'Calm', script: 'Breathe...', durationMin: 5 };
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { result: mockResult },
      error: null
    });

    const result = await createMeditation('Stress', '5 min');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-proxy', {
      body: { action: 'createMeditation', topic: 'Stress', duration: '5 min' }
    });
    expect(result).toEqual(mockResult);
  });

  it('generateSpeech calls proxy', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { audioBase64: 'base64audio' },
      error: null
    });

    const result = await generateSpeech('Hello');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-proxy', {
      body: { action: 'generateSpeech', text: 'Hello' }
    });
    expect(result).toBe('base64audio');
  });

  it('analyzeMedia strips base64 prefix', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { result: 'Analysis result' },
      error: null
    });

    const base64WithPrefix = 'data:image/jpeg;base64,rawdata';
    const result = await analyzeMedia(base64WithPrefix, 'image/jpeg', 'Check pose');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('gemini-proxy', {
      body: {
        action: 'analyzeMedia',
        fileBase64: 'rawdata',
        mimeType: 'image/jpeg',
        userPrompt: 'Check pose'
      }
    });
    expect(result).toBe('Analysis result');
  });
});
