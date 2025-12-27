import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { Breathwork } from '../Breathwork';

describe('Breathwork', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('cycles through breathing phases after starting', async () => {
    render(
      <Breathwork
        config={{
          inhaleDuration: 1000,
          holdFullDuration: 1000,
          exhaleDuration: 1000,
          holdEmptyDuration: 1000,
        }}
      />
    );

    expect(screen.getByText('Дыхание')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Вдох')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Пауза')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Выдох')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Тишина')).toBeInTheDocument();
  });
});
