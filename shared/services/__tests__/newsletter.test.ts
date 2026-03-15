import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { subscribeNewsletter } from '../newsletter';

describe('subscribeNewsletter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns ok on successful subscribe', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    const result = await subscribeNewsletter({ email: 'test@example.com' });

    expect(result).toEqual({ ok: true, alreadySubscribed: false });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/subscribe-newsletter'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('returns alreadySubscribed on 409', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
    });

    const result = await subscribeNewsletter({ email: 'existing@example.com' });

    expect(result).toEqual({ ok: true, alreadySubscribed: true });
  });

  it('returns parsed error from response body', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: vi.fn().mockResolvedValue({ error: 'invalid_email' }),
    });

    const result = await subscribeNewsletter({ email: 'bad-email' });

    expect(result).toEqual({ ok: false, error: 'invalid_email' });
  });

  it('returns network_error when fetch throws', async () => {
    (fetch as Mock).mockRejectedValue(new Error('network'));

    const result = await subscribeNewsletter({ email: 'test@example.com' });

    expect(result).toEqual({ ok: false, error: 'network_error' });
  });
});
