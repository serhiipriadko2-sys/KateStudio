type ContactPayload = {
  name: string;
  phone: string;
  message?: string;
  recaptchaToken: string;
};

const getFunctionUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) {
    throw new Error('Онлайн-форма недоступна: сервис не настроен.');
  }
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/contact-submit`;
};

const getAnonKey = (): string => {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!anonKey) {
    throw new Error('Онлайн-форма недоступна: нет ключа доступа.');
  }
  return anonKey;
};

export const submitContactRequest = async (payload: ContactPayload): Promise<void> => {
  const res = await fetch(getFunctionUrl(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: getAnonKey(),
      authorization: `Bearer ${getAnonKey()}`,
    },
    body: JSON.stringify({
      name: payload.name,
      phone: payload.phone,
      message: payload.message ?? '',
      recaptchaToken: payload.recaptchaToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Ошибка сервера. Попробуйте позже.');
  }
};
