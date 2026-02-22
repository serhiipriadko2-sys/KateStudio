import { describe, expect, it } from 'vitest';
import { getAssistantResponse } from '../assistantService';

describe('assistantService (APP)', () => {
  it('returns deterministic KB answer for known intent', async () => {
    const response = await getAssistantResponse('Где вы находитесь?');

    expect(response.text).toMatch(/Станционная ул\., 5Б/i);
    expect(response.sources?.length).toBeGreaterThan(0);
  });

  it('returns fallback answer for unknown intent', async () => {
    const response = await getAssistantResponse('абракадабра несуществующий интент');

    expect(response.text).toMatch(/Я помогу с адресом, расписанием, ценами и записью/i);
  });
});
