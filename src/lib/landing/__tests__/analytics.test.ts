import { describe, it, expect, vi } from 'vitest';
import {
  trackCalculatorStarted,
  trackCalculatorCompleted,
  trackCalculatorCtaClicked,
  type AnalyticsAdapter,
} from '@/lib/landing/analytics';

function stubAdapter() {
  const track = vi.fn();
  const adapter: AnalyticsAdapter = { track };
  return { track, adapter };
}

describe('analytics helpers', () => {
  it('trackCalculatorStarted fires the event with no payload', () => {
    const { track, adapter } = stubAdapter();
    trackCalculatorStarted(adapter);
    expect(track).toHaveBeenCalledWith('calculator_started');
  });

  it('trackCalculatorCompleted payload contains ONLY goal and activityLevel (Decision #11 guard)', () => {
    const { track, adapter } = stubAdapter();
    trackCalculatorCompleted(
      { goal: 'lose-weight', activityLevel: 'moderate' },
      adapter,
    );
    expect(track).toHaveBeenCalledTimes(1);
    const [eventName, payload] = track.mock.calls[0];
    expect(eventName).toBe('calculator_completed');
    expect(Object.keys(payload!).sort()).toEqual(['activityLevel', 'goal']);
    expect(payload).toEqual({ goal: 'lose-weight', activityLevel: 'moderate' });
  });

  it('trackCalculatorCtaClicked payload contains which and goal', () => {
    const { track, adapter } = stubAdapter();
    trackCalculatorCtaClicked({ which: 'app', goal: 'maintain' }, adapter);
    expect(track).toHaveBeenCalledWith('calculator_cta_clicked', {
      which: 'app',
      goal: 'maintain',
    });
  });
});
