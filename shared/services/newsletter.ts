export type SubscribeNewsletterInput = {
  email: string;
  name?: string;
};

export type SubscribeNewsletterResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: string };

const getFunctionUrl = (functionName: string): string | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${functionName}`;
};

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload?.error) return payload.error;
  } catch {
    // Ignore json parse errors and fallback to status text.
  }
  return response.statusText || `http_${response.status}`;
};

export const subscribeNewsletter = async (
  input: SubscribeNewsletterInput
): Promise<SubscribeNewsletterResult> => {
  const url = getFunctionUrl('subscribe-newsletter');
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    return { ok: false, error: 'not_configured' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: anonKey,
      },
      body: JSON.stringify({ email: input.email, name: input.name }),
    });

    if (response.ok) {
      return { ok: true, alreadySubscribed: false };
    }

    if (response.status === 409) {
      return { ok: true, alreadySubscribed: true };
    }

    return { ok: false, error: await readErrorMessage(response) };
  } catch {
    return { ok: false, error: 'network_error' };
  }
};
