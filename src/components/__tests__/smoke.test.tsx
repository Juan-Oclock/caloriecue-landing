import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Testing Library', () => {
  it('renders DOM', () => {
    render(<div>hello</div>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
