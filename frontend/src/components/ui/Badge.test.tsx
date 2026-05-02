import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Badge} from './badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('has the data-slot attribute', () => {
    render(<Badge>Tag</Badge>);

    expect(screen.getByText('Tag')).toHaveAttribute('data-slot', 'badge');
  });

  it('renders as span by default', () => {
    render(<Badge>Label</Badge>);

    expect(screen.getByText('Label').tagName).toBe('SPAN');
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/tag">Link Badge</a>
      </Badge>,
    );

    const link = screen.getByText('Link Badge');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/tag');
  });

  it('applies custom className', () => {
    render(<Badge className="bg-info-container">Custom</Badge>);

    expect(screen.getByText('Custom')).toHaveClass('bg-info-container');
  });
});
