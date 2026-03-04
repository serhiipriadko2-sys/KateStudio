import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { server } from '../../../shared/__tests__/mocks/server';
import { useStudioContacts } from '../useStudioContacts';

// MSW intercepts the real Supabase HTTP requests — no vi.mock needed.

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useStudioContacts', () => {
  it('should return default contacts on error', async () => {
    // Override the default handler to simulate a server error
    server.use(
      http.get('https://placeholder.supabase.co/rest/v1/app_settings', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useStudioContacts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    // On error the hook must fall back to the default contacts
    expect(result.current.data?.phone).toBe('+7 (916) 123-45-67');
  });

  it('should return dynamic contacts if available', async () => {
    const mockContacts = {
      phone: '+7 (000) 000-00-00',
      email: 'test@test.com',
      address: 'Test Address',
      map_url: 'http://maps.google.com',
      social_vk: 'http://vk.com',
      social_telegram: 'http://t.me',
      social_whatsapp: 'http://wa.me',
      social_instagram: 'http://instagram.com',
    };

    // Override the default handler to return specific contacts.
    // Using a single JSON object (not an array) because the Supabase .single() method
    // sets Accept: application/vnd.pgrst.object+json, and PostgREST responds with
    // a single object in that case.
    server.use(
      http.get('https://placeholder.supabase.co/rest/v1/app_settings', () => {
        return HttpResponse.json({ key: 'studio_contacts', value: mockContacts });
      })
    );

    const { result } = renderHook(() => useStudioContacts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockContacts);
  });
});

