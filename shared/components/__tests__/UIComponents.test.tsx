/**
 * Tests for new UI components: UpdateBanner, OfflineBanner, Skeleton
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OfflineBanner } from '../OfflineBanner';
import { Skeleton, SkeletonVideoCard, SkeletonAvatar, SkeletonText } from '../Skeleton';
import { UpdateBanner } from '../UpdateBanner';

describe('UpdateBanner', () => {
  it('should not render when not visible', () => {
    const { container } = render(
      <UpdateBanner visible={false} onUpdate={vi.fn()} onDismiss={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when visible', () => {
    render(<UpdateBanner visible={true} onUpdate={vi.fn()} onDismiss={vi.fn()} />);

    expect(screen.getByText('Доступно обновление')).toBeInTheDocument();
  });

  it('should call onUpdate when update button is clicked', () => {
    const onUpdate = vi.fn();
    render(<UpdateBanner visible={true} onUpdate={onUpdate} onDismiss={vi.fn()} />);

    fireEvent.click(screen.getByText('Обновить'));
    expect(onUpdate).toHaveBeenCalled();
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<UpdateBanner visible={true} onUpdate={vi.fn()} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('Позже'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should show updating state', () => {
    render(<UpdateBanner visible={true} updating={true} onUpdate={vi.fn()} onDismiss={vi.fn()} />);

    expect(screen.getByText('Обновление...')).toBeInTheDocument();
  });
});

describe('OfflineBanner', () => {
  it('should not render when not visible', () => {
    const { container } = render(<OfflineBanner visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when visible', () => {
    render(<OfflineBanner visible={true} />);
    expect(screen.getByText('Оффлайн-режим')).toBeInTheDocument();
  });

  it('should have alert role', () => {
    render(<OfflineBanner visible={true} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass('rounded');
  });

  it('should apply circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('should apply custom dimensions', () => {
    const { container } = render(<Skeleton width="200px" height="100px" />);
    expect(container.firstChild).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('should apply animation classes', () => {
    const { container } = render(<Skeleton animation="pulse" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('should apply no animation', () => {
    const { container } = render(<Skeleton animation="none" />);
    expect(container.firstChild).not.toHaveClass('animate-pulse');
  });
});

describe('SkeletonVideoCard', () => {
  it('should render video card skeleton', () => {
    const { container } = render(<SkeletonVideoCard />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('rounded-[2rem]');
  });
});

describe('SkeletonAvatar', () => {
  it('should render avatar skeleton with default size', () => {
    const { container } = render(<SkeletonAvatar />);
    expect(container.firstChild).toHaveStyle({ width: '3rem', height: '3rem' });
  });

  it('should render avatar skeleton with custom size', () => {
    const { container } = render(<SkeletonAvatar size="5rem" />);
    expect(container.firstChild).toHaveStyle({ width: '5rem', height: '5rem' });
  });
});

describe('SkeletonText', () => {
  it('should render 3 lines by default', () => {
    const { container } = render(<SkeletonText />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('should render custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
  });
});
