import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatWidget } from '../ChatWidget';

const chatWidgetShellMock = vi.fn(({ hidden = false }: { hidden?: boolean }) => (
  <div data-testid={hidden ? 'app-chat-shell-hidden' : 'app-chat-shell-visible'} />
));

vi.mock('../ChatWidget/ChatWidgetShell', () => ({
  ChatWidgetShell: (props: { hidden?: boolean }) => chatWidgetShellMock(props),
}));

describe('APP ChatWidget entrypoint', () => {
  beforeEach(() => {
    chatWidgetShellMock.mockClear();
  });

  it('delegates to ChatWidgetShell with visible mode by default', () => {
    render(<ChatWidget />);

    expect(chatWidgetShellMock).toHaveBeenCalledTimes(1);
    expect(chatWidgetShellMock.mock.calls[0][0]).toMatchObject({ hidden: false });
    expect(screen.getByTestId('app-chat-shell-visible')).toBeInTheDocument();
  });

  it('forwards hidden=true to ChatWidgetShell', () => {
    render(<ChatWidget hidden />);

    expect(chatWidgetShellMock).toHaveBeenCalledTimes(1);
    expect(chatWidgetShellMock.mock.calls[0][0]).toMatchObject({ hidden: true });
    expect(screen.getByTestId('app-chat-shell-hidden')).toBeInTheDocument();
  });
});
