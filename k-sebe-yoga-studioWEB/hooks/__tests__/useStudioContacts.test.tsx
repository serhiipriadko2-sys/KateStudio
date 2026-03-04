import { supabase } from '@ksebe/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStudioContacts } from '../useStudioContacts';

// Mock Supabase
vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default contacts on error', async () => {
    // Mock Supabase error response
    (supabase!.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Error' } }),
        }),
      }),
    }));

    const { result } = renderHook(() => useStudioContacts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    // Verify default value (partial match)
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

    (supabase!.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { value: mockContacts }, error: null }),
        }),
      }),
    }));

    const { result } = renderHook(() => useStudioContacts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockContacts);
  });
});
