import React from 'react';
import type { ConsentKey } from '../../utils/consent';
import { ChatWidgetHistory } from './ChatWidgetHistory';
import { ChatWidgetInputs } from './ChatWidgetInputs';
import { ChatWidgetLogic } from './ChatWidgetLogic';
import { ChatWidgetShell } from './ChatWidgetShell';
import { ConsentModal } from './ConsentModal';
import { ConsentSettingsModal } from './ConsentSettingsModal';
import { LiveModePanel } from './LiveModePanel';

interface ChatWidgetProps {
  hidden?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ hidden = false }) => {
  if (hidden) return null;

  return (
    <ChatWidgetLogic>
      {({
        isOpen,
        setIsOpen,
        isLiveMode,
        isLiveConnected,
        liveError,
        messages,
        inputValue,
        setInputValue,
        inputRef,
        isLoading,
        handleSend,
        handleKeyPress,
        handlePlayTts,
        handleClearHistory,
        handleStartLiveSession,
        stopLiveSession,
        consents,
        consentRequest,
        settingsOpen,
        setSettingsOpen,
        confirmConsent,
        requestConsent,
        updateConsent,
        resetConsents,
        clearGeolocation,
        consentMeta,
      }) => (
        <>
          <ChatWidgetShell
            isOpen={isOpen}
            isLiveMode={isLiveMode}
            onClose={() => {
              setIsOpen(false);
              if (isLiveMode) void stopLiveSession();
            }}
            onToggleOpen={() => setIsOpen(!isOpen)}
            onClearHistory={handleClearHistory}
            onOpenSettings={() => setSettingsOpen(true)}
            onStartLive={() => void handleStartLiveSession()}
          >
            {isLiveMode ? (
              <LiveModePanel
                isLiveConnected={isLiveConnected}
                liveError={liveError}
                onStop={() => void stopLiveSession()}
              />
            ) : (
              <>
                <ChatWidgetHistory
                  messages={messages}
                  isLoading={isLoading}
                  onPlayTts={handlePlayTts}
                  isLiveMode={isLiveMode}
                  isOpen={isOpen}
                />
                <ChatWidgetInputs
                  inputRef={inputRef}
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={() => void handleSend()}
                  onKeyDown={handleKeyPress}
                  isLoading={isLoading}
                />
              </>
            )}
          </ChatWidgetShell>

          {consentRequest && (
            <ConsentModal
              consentKey={consentRequest}
              meta={consentMeta[consentRequest]}
              onApprove={() => void confirmConsent(true)}
              onDeny={() => void confirmConsent(false)}
            />
          )}

          {settingsOpen && (
            <ConsentSettingsModal
              consents={consents}
              consentMeta={consentMeta}
              onClose={() => setSettingsOpen(false)}
              onReset={resetConsents}
              onRequest={(key) => requestConsent(key as ConsentKey, () => null, true)}
              onDeny={(key) => {
                updateConsent(key as ConsentKey, 'denied');
                if (key === 'microphone') void stopLiveSession();
                if (key === 'geolocation') clearGeolocation();
              }}
            />
          )}
        </>
      )}
    </ChatWidgetLogic>
  );
};
