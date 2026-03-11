import { describe, expect, it, vi } from 'vitest';

vi.mock('@ksebe/shared', () => ({
  getKnowledgeBaseResponse: vi.fn().mockReturnValue({
    text: 'Поза воина — базовая поза.',
    sources: [{ title: 'KB', url: '#' }],
  }),
}));

import {
  analyzeMedia,
  createMeditation,
  editYogaImage,
  generateSpeech,
  generateVeoVideo,
  generateYogaImage,
  getGeminiChatResponse,
  getGeminiChatStream,
  getThinkingResponse,
} from '../geminiService';

describe('geminiService (MVP stubs)', () => {
  it('getThinkingResponse returns disabled message', async () => {
    const result = await getThinkingResponse('Что такое прана?');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('getGeminiChatResponse returns text and sources from knowledge base', async () => {
    const result = await getGeminiChatResponse('Воин 1');
    expect(result.text).toBe('Поза воина — базовая поза.');
    expect(result.sources).toHaveLength(1);
  });

  it('getGeminiChatStream yields text', async () => {
    const chunks: string[] = [];
    for await (const chunk of getGeminiChatStream('Воин 2')) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toBe('Поза воина — базовая поза.');
  });

  it('createMeditation returns null (AI disabled)', async () => {
    const result = await createMeditation('расслабление', '10');
    expect(result).toBeNull();
  });

  it('generateSpeech returns null (AI disabled)', async () => {
    const result = await generateSpeech('Добро пожаловать');
    expect(result).toBeNull();
  });

  it('generateYogaImage returns null (AI disabled)', async () => {
    const result = await generateYogaImage('warrior pose', '1:1');
    expect(result).toBeNull();
  });

  it('editYogaImage returns null (AI disabled)', async () => {
    const result = await editYogaImage('base64data', 'image/jpeg', 'add sun');
    expect(result).toBeNull();
  });

  it('generateVeoVideo returns null (AI disabled)', async () => {
    const result = await generateVeoVideo('yoga flow');
    expect(result).toBeNull();
  });

  it('analyzeMedia returns disabled message string', async () => {
    const result = await analyzeMedia('base64', 'image/jpeg', 'What pose?');
    expect(typeof result).toBe('string');
    expect((result as string).length).toBeGreaterThan(0);
  });
});
