export interface ChatCapabilities {
  liveModeEnabled: boolean;
  liveModeDisabledReason: string;
}

export const chatCapabilities: ChatCapabilities = {
  liveModeEnabled: false,
  liveModeDisabledReason: 'Live-сессия временно недоступна в non-AI режиме.',
};
