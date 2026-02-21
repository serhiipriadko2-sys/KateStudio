import { getKnowledgeBaseResponse } from '../constants/kb';
import type { AssistantResponse } from '../constants/kb';

export const getAssistantResponse = (message: string): AssistantResponse => {
  return getKnowledgeBaseResponse(message);
};
