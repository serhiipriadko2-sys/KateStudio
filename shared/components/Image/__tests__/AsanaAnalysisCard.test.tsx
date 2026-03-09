import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { AsanaAnalysisCard } from '../AsanaAnalysisCard';
import type { AsanaAnalysis } from '../types';

const mockAnalysis: AsanaAnalysis = {
  sanskrit: 'Trikonasana',
  name_ru: 'Поза треугольника',
  energy: 'Brahmana',
  muscles: ['ноги', 'бока', 'плечи'],
  description: 'Открывает бока и укрепляет ноги',
  tips: 'Держите позвоночник вытянутым',
};

describe('AsanaAnalysisCard', () => {
  it('renders string result as plain text', () => {
    render(<AsanaAnalysisCard result="Ошибка анализа" onClose={vi.fn()} />);
    expect(screen.getByText('Ошибка анализа')).toBeTruthy();
  });

  it('renders Sanskrit name from AsanaAnalysis object', () => {
    render(<AsanaAnalysisCard result={mockAnalysis} onClose={vi.fn()} />);
    expect(screen.getByText('Trikonasana')).toBeTruthy();
  });

  it('renders Russian name', () => {
    render(<AsanaAnalysisCard result={mockAnalysis} onClose={vi.fn()} />);
    expect(screen.getByText('Поза треугольника')).toBeTruthy();
  });

  it('renders energy badge', () => {
    render(<AsanaAnalysisCard result={mockAnalysis} onClose={vi.fn()} />);
    expect(screen.getByText('Brahmana')).toBeTruthy();
  });

  it('renders all muscle chips', () => {
    render(<AsanaAnalysisCard result={mockAnalysis} onClose={vi.fn()} />);
    expect(screen.getByText('ноги')).toBeTruthy();
    expect(screen.getByText('бока')).toBeTruthy();
    expect(screen.getByText('плечи')).toBeTruthy();
  });

  it('renders tips text', () => {
    render(<AsanaAnalysisCard result={mockAnalysis} onClose={vi.fn()} />);
    expect(screen.getByText(/Держите позвоночник/)).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<AsanaAnalysisCard result={mockAnalysis} onClose={onClose} />);
    // Close button is the X icon button (no text, find by role)
    const closeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies Langhana energy style', () => {
    const langhana: AsanaAnalysis = { ...mockAnalysis, energy: 'Langhana' };
    const { container } = render(<AsanaAnalysisCard result={langhana} onClose={vi.fn()} />);
    expect(container.querySelector('.bg-indigo-100')).toBeTruthy();
  });

  it('applies Samana energy style', () => {
    const samana: AsanaAnalysis = { ...mockAnalysis, energy: 'Samana' };
    const { container } = render(<AsanaAnalysisCard result={samana} onClose={vi.fn()} />);
    expect(container.querySelector('.bg-emerald-100')).toBeTruthy();
  });
});
