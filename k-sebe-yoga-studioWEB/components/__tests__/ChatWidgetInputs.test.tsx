import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChatWidgetInputs } from '../ChatWidget/ChatWidgetInputs';

describe('ChatWidgetInputs', () => {
  it('renders coach upload button', () => {
    render(
      <ChatWidgetInputs
        mode="coach"
        inputValue=""
        onInputChange={() => {}}
        onSend={() => {}}
        isLoading={false}
        onFileUpload={() => {}}
        isRecording={false}
        onToggleRecording={() => {}}
      />
    );

    expect(screen.getByText(/Загрузить видео для анализа/i)).toBeInTheDocument();
  });

  it('triggers diary recording toggle', async () => {
    const user = userEvent.setup();
    const onToggleRecording = vi.fn();

    render(
      <ChatWidgetInputs
        mode="diary"
        inputValue=""
        onInputChange={() => {}}
        onSend={() => {}}
        isLoading={false}
        onFileUpload={() => {}}
        isRecording={false}
        onToggleRecording={onToggleRecording}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(onToggleRecording).toHaveBeenCalled();
  });
});
