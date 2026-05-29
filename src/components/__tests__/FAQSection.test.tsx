import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FAQSection from '@/components/FAQSection';
import { FAQ_ITEMS } from '@/lib/faq-data';

describe('FAQSection', () => {
  it('renders a question button for every item in the shared FAQ data', () => {
    render(<FAQSection />);
    for (const item of FAQ_ITEMS) {
      expect(
        screen.getByRole('button', { name: new RegExp(escapeRegExp(item.question), 'i') }),
      ).toBeInTheDocument();
    }
  });

  it('renders the new goal/method questions', () => {
    render(<FAQSection />);
    expect(screen.getByText('Is calorie tracking effective for weight loss?')).toBeInTheDocument();
    expect(screen.getByText('What if I eat out a lot?')).toBeInTheDocument();
  });
});

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
