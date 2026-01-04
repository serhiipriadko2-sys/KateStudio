import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Blog } from '../Blog';

vi.mock('../Image', () => ({
  Image: ({ alt, src }: { alt?: string; src?: string }) => <img alt={alt} src={src} />,
}));

describe('Blog', () => {
  it('opens and closes the article modal', async () => {
    const user = userEvent.setup();
    render(<Blog />);

    expect(screen.getByText('Полезное')).toBeInTheDocument();

    await user.click(screen.getByText('Как начать медитировать: 5 простых шагов'));
    expect(screen.getByText('Катя Габран')).toBeInTheDocument();

    const overlay = document.querySelector('div.fixed');
    expect(overlay).not.toBeNull();
    await user.click(overlay as HTMLElement);

    expect(screen.queryByText('Катя Габран')).not.toBeInTheDocument();
  });

  it('supports keyboard interaction for opening and closing', async () => {
    const user = userEvent.setup();
    render(<Blog />);

    const articleCard = screen.getByRole('button', {
      name: /Как начать медитировать/i,
    });

    articleCard.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
