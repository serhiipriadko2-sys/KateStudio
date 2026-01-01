import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChatWidgetInputs } from '../ChatWidget/ChatWidgetInputs';

describe('ChatWidgetInputs (app)', () => {
  it('calls send handler', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(
      <ChatWidgetInputs
        inputRef={createRef()}
        value="Привет"
        onChange={() => {}}
        onSend={onSend}
        onKeyDown={() => {}}
        isLoading={false}
      />
    );

    await user.click(screen.getByRole('button'));
    expect(onSend).toHaveBeenCalled();
  });
});
