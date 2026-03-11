import { render, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useFocusTrap } from '../useFocusTrap';

const FocusTrapContainer = ({
  isActive,
  withInitialFocus = false,
}: {
  isActive: boolean;
  withInitialFocus?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(containerRef, isActive, withInitialFocus ? initialRef : undefined);

  return (
    <div ref={containerRef} tabIndex={-1} data-testid="container">
      <button type="button" data-testid="btn1">
        First
      </button>
      <button type="button" ref={withInitialFocus ? initialRef : undefined} data-testid="btn2">
        Second
      </button>
      <button type="button" data-testid="btn3">
        Third
      </button>
    </div>
  );
};

describe('useFocusTrap', () => {
  it('does nothing when isActive=false', () => {
    const { getByTestId } = render(<FocusTrapContainer isActive={false} />);
    // No focus should be forced
    expect(document.activeElement).not.toBe(getByTestId('btn1'));
  });

  it('focuses first element when isActive=true', () => {
    const { getByTestId } = render(<FocusTrapContainer isActive={true} />);
    expect(document.activeElement).toBe(getByTestId('btn1'));
  });

  it('focuses initialFocusRef element when provided', () => {
    const { getByTestId } = render(<FocusTrapContainer isActive={true} withInitialFocus={true} />);
    expect(document.activeElement).toBe(getByTestId('btn2'));
  });

  it('wraps Tab to first element when focus is on last', () => {
    const { getByTestId } = render(<FocusTrapContainer isActive={true} />);
    getByTestId('btn3').focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(getByTestId('btn1'));
  });

  it('wraps Shift+Tab to last element when focus is on first', () => {
    const { getByTestId } = render(<FocusTrapContainer isActive={true} />);
    getByTestId('btn1').focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(getByTestId('btn3'));
  });

  it('ignores non-Tab key events', () => {
    const { getByTestId } = render(<FocusTrapContainer isActive={true} />);
    getByTestId('btn2').focus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(getByTestId('btn2'));
  });

  it('cleans up event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<FocusTrapContainer isActive={true} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
