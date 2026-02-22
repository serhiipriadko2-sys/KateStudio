import { describe, expect, it } from 'vitest';
import { chatCapabilities } from '../chatCapabilities';

describe('chatCapabilities', () => {
  it('keeps live mode disabled for non-AI launch profile', () => {
    expect(chatCapabilities.liveModeEnabled).toBe(false);
    expect(chatCapabilities.liveModeDisabledReason).toMatch(/non-AI режиме/i);
  });
});
