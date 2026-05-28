import { describe, it, expect } from 'vitest';
import { FAQ_ITEMS, buildFaqPageJsonLd } from '@/lib/faq-data';

describe('FAQ data (Feature 6 — single source of truth)', () => {
  it('contains the four new goal/method questions', () => {
    const questions = FAQ_ITEMS.map((i) => i.question);
    expect(questions).toContain('Is calorie tracking effective for weight loss?');
    expect(questions).toContain('Do I need to track every day?');
    expect(questions).toContain('What if I eat out a lot?');
    expect(questions).toContain(
      'How many calories should I eat to lose 1 lb per week?',
    );
  });

  it('uses the honest, no-form Android answer (no waitlist, since none is mounted)', () => {
    const android = FAQ_ITEMS.find((i) =>
      /available on android/i.test(i.question),
    );
    expect(android).toBeDefined();
    expect(android!.answer.toLowerCase()).not.toContain('waitlist');
    expect(android!.answer).toContain('iOS first');
    expect(android!.answer.toLowerCase()).toContain('roadmap');
  });

  it('every item has a non-empty question and answer', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThan(0);
    for (const item of FAQ_ITEMS) {
      expect(item.question.trim().length).toBeGreaterThan(0);
      expect(item.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it('builds FAQPage JSON-LD derived from FAQ_ITEMS (no drift)', () => {
    const jsonLd = buildFaqPageJsonLd();
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(FAQ_ITEMS.length);
    for (let i = 0; i < FAQ_ITEMS.length; i++) {
      const entity = jsonLd.mainEntity[i];
      expect(entity['@type']).toBe('Question');
      expect(entity.name).toBe(FAQ_ITEMS[i].question);
      expect(entity.acceptedAnswer['@type']).toBe('Answer');
      expect(entity.acceptedAnswer.text).toBe(FAQ_ITEMS[i].answer);
    }
  });
});
