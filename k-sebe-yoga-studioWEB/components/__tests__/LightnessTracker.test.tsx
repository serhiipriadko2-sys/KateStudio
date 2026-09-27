import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRewardTier, LightnessTracker } from '../LightnessTracker';

vi.mock('../SEO', () => ({
  SEO: () => null,
}));

describe('LightnessTracker', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('marks a day complete, adds 10 points and persists progress', async () => {
    const user = userEvent.setup();

    render(<LightnessTracker />);

    const firstDay = screen.getByRole('button', { name: 'День 1, не отмечен' });
    expect(screen.getByText('0 / 300 баллов')).toBeInTheDocument();

    await user.click(firstDay);

    expect(screen.getByText('10 / 300 баллов')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'День 1, выполнен' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    const stored = JSON.parse(localStorage.getItem('ksebe-30-days-lightness-v1') ?? '{}') as {
      completedDays?: number[];
    };
    expect(stored.completedDays).toEqual([1]);
  });

  it('restores saved progress from localStorage', () => {
    localStorage.setItem(
      'ksebe-30-days-lightness-v1',
      JSON.stringify({
        releaseHabit: 'Телефон перед сном',
        refillRitual: 'Чай в тишине',
        completedDays: [1, 2, 3],
      })
    );

    render(<LightnessTracker />);

    expect(screen.getByText('3 / 30')).toBeInTheDocument();
    expect(screen.getByText('30 / 300 баллов')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Телефон перед сном')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'День 3, выполнен' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('returns the highest unlocked reward tier', () => {
    expect(getRewardTier(149)).toBeNull();
    expect(getRewardTier(150)?.threshold).toBe(150);
    expect(getRewardTier(225)?.threshold).toBe(220);
    expect(getRewardTier(300)?.threshold).toBe(270);
  });
});
