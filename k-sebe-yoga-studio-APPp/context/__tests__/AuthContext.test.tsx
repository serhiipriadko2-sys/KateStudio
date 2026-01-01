import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

const registerUserMock = vi.fn().mockResolvedValue({
  id: 'demo-id',
  name: 'Гость',
  phone: '+7 000 000-00-00',
});

vi.mock('../../services/dataService', () => ({
  dataService: {
    getUser: vi.fn().mockResolvedValue(null),
    registerUser: registerUserMock,
    logout: vi.fn(),
  },
}));

vi.mock('../../services/retentionService', () => ({
  retentionService: {
    bootstrapForUser: vi.fn(),
  },
}));

vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

const AuthStatusView = () => {
  const { authStatus, demoLogin } = useAuth();
  return (
    <div>
      <span>status:{authStatus}</span>
      <button onClick={() => demoLogin('Гость')}>demo</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('supports demo login flow', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthStatusView />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: 'demo' }));

    expect(registerUserMock).toHaveBeenCalled();
    expect(await screen.findByText(/status:authenticated/i)).toBeInTheDocument();
  });
});
