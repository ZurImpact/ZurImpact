import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Button} from './button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('renders as a button element by default', () => {
    render(<Button>Test</Button>);

    expect(screen.getByRole('button', {name: 'Test'})).toBeInTheDocument();
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );

    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies custom className alongside variant classes', () => {
    render(<Button className="custom-class">Styled</Button>);

    const button = screen.getByText('Styled');
    expect(button).toHaveClass('custom-class');
  });

  it('has the data-slot attribute', () => {
    render(<Button>Slot</Button>);

    expect(screen.getByText('Slot')).toHaveAttribute('data-slot', 'button');
  });
});
