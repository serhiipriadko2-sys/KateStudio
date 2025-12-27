import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatWidget } from '../ChatWidget';

const geminiMocks = vi.hoisted(() => ({
  getGeminiChatResponse: vi.fn().mockResolvedValue({ text: 'Ответ', sources: [] }),
  generateSpeech: vi.fn(),
  generateMeditationScript: vi.fn(),
  generateMeditationVideo: vi.fn(),
  generateYogaImage: vi.fn(),
  analyzeYogaVideo: vi.fn(),
  generatePersonalProgram: vi.fn(),
  transcribeDiaryEntry: vi.fn(),
}));

vi.mock('../../services/geminiService', () => geminiMocks);

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
  Modality: { AUDIO: 'AUDIO' },
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(
          (success: (pos: { coords: { latitude: number; longitude: number } }) => void) =>
            success({ coords: { latitude: 55.75, longitude: 37.61 } })
        ),
      },
    });
  });

  it('opens and sends a chat message', async () => {
    const user = userEvent.setup();

    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: /ai тренер/i }));

    expect(await screen.findByText(/Намасте!/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Сообщение...');
    await user.type(input, 'Привет{enter}');

    await waitFor(() =>
      expect(geminiMocks.getGeminiChatResponse).toHaveBeenCalledWith('Привет', {
        lat: 55.75,
        lng: 37.61,
      })
    );

    expect(await screen.findByText('Ответ')).toBeInTheDocument();
  });
});
