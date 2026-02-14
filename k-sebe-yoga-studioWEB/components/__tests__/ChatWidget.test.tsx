import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { ChatWidget } from '../ChatWidget';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ChatWidget', () => {
  it('opens and sends a chat message', async () => {
    const user = userEvent.setup();

    render(<ChatWidget />);

    await user.click(screen.getByRole('button', { name: /ассистент/i }));

    expect(await screen.findByText(/Намасте!/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Сообщение...');
    await user.type(input, 'Где вы находитесь?{enter}');

    await waitFor(() => expect(screen.getByText(/Станционная ул\., 5Б/i)).toBeInTheDocument());
  });
});
