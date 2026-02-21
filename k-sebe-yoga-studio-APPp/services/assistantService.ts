import { getAssistantResponse as getSharedAssistantResponse } from '@ksebe/shared';
import type { Source } from '../types';

export const getAssistantResponse = async (
  userMessage: string,
  _location?: { lat: number; lng: number }
): Promise<{ text: string; sources: Source[] }> => {
  const response = getSharedAssistantResponse(userMessage);
  return { text: response.text, sources: response.sources ?? [] };
};
