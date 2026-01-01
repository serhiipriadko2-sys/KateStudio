import React from 'react';
import { ChatWidgetHistory } from './ChatWidgetHistory';
import { ChatWidgetInputs } from './ChatWidgetInputs';
import { ChatWidgetLogic } from './ChatWidgetLogic';
import { ChatWidgetShell } from './ChatWidgetShell';
import { LiveModePanel } from './LiveModePanel';
import { ToolMenu } from './ToolMenu';
import { TOOLS } from './tools';

export const ChatWidget: React.FC = () => {
  return (
    <ChatWidgetLogic>
      {({
        isOpen,
        setIsOpen,
        mode,
        setMode,
        isMenuOpen,
        setIsMenuOpen,
        isLiveMode,
        setIsLiveMode,
        messages,
        inputValue,
        setInputValue,
        isLoading,
        loadingText,
        playingMessageId,
        toggleAudio,
        handleSend,
        handleFileUpload,
        isRecording,
        toggleRecording,
        isLiveConnected,
        isLiveSpeaking,
        permissionError,
        startLiveSession,
        stopLiveSession,
        clearMessages,
      }) => {
        const headerLabel = isMenuOpen
          ? 'Меню режимов'
          : TOOLS.find((t) => t.id === mode)?.label || 'Ассистент';

        return (
          <ChatWidgetShell
            isOpen={isOpen}
            isMenuOpen={isMenuOpen}
            isLiveMode={isLiveMode}
            headerLabel={headerLabel}
            onClose={() => setIsOpen(false)}
            onToggleOpen={() => setIsOpen(!isOpen)}
            onOpenMenu={() => setIsMenuOpen(true)}
            onCloseMenu={() => setIsMenuOpen(false)}
            onClearMessages={clearMessages}
            onStartLive={() => void startLiveSession()}
          >
            {isMenuOpen ? (
              <ToolMenu
                tools={TOOLS}
                activeMode={mode}
                onSelect={(m) => {
                  setMode(m);
                  setIsMenuOpen(false);
                }}
              />
            ) : isLiveMode ? (
              <LiveModePanel
                permissionError={permissionError}
                isLiveConnected={isLiveConnected}
                isLiveSpeaking={isLiveSpeaking}
                onStop={() => void stopLiveSession()}
                onBack={() => setIsLiveMode(false)}
              />
            ) : (
              <>
                <ChatWidgetHistory
                  messages={messages}
                  isLoading={isLoading}
                  loadingText={loadingText}
                  playingMessageId={playingMessageId}
                  onToggleAudio={toggleAudio}
                  isLiveMode={isLiveMode}
                  isOpen={isOpen}
                  mode={mode}
                />

                <ChatWidgetInputs
                  mode={mode}
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  onSend={() => void handleSend()}
                  isLoading={isLoading}
                  onFileUpload={handleFileUpload}
                  isRecording={isRecording}
                  onToggleRecording={toggleRecording}
                />
              </>
            )}
          </ChatWidgetShell>
        );
      }}
    </ChatWidgetLogic>
  );
};
