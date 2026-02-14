import { getKnowledgeBaseResponse, AssistantResponse } from '@ksebe/shared';

export const getAssistantResponse = (message: string): AssistantResponse => {
  return getKnowledgeBaseResponse(message);
};
