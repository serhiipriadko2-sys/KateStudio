import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useChatSession } from '../k-sebe-yoga-studioWEB/components/ChatWidget/useChatSession';

// Mock assistant service
vi.mock('../k-sebe-yoga-studioWEB/services/assistantService', () => ({
  getAssistantResponse: vi.fn((text) => ({ text: `Echo: ${text}` })),
}));

describe('useChatSession', () => {
  it('sends message and receives response', async () => {
    const { result } = renderHook(() => useChatSession());

    expect(result.current.messages).toHaveLength(1); // Initial greeting

    await act(async () => {
      result.current.setInputValue('Hello');
      await result.current.handleSend();
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(3); // Greeting + User + Model
      expect(result.current.messages[2].text).toBe('Echo: Hello');
    });
  });
});
