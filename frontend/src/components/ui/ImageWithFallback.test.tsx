import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ImageWithFallback} from './ImageWithFallback';

describe('ImageWithFallback', () => {
  it('renders an img element with the provided src', () => {
    render(<ImageWithFallback src="https://example.com/photo.jpg" alt="Photo" />);

    const img = screen.getByAltText('Photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('shows fallback placeholder after image load error', () => {
    render(<ImageWithFallback src="https://bad-url.com/missing.jpg" alt="Missing" />);

    const img = screen.getByAltText('Missing');
    fireEvent.error(img);

    // After error, the fallback image should be rendered
    const fallbackImg = screen.getByAltText('Error loading image');
    expect(fallbackImg).toBeInTheDocument();
    expect(fallbackImg).toHaveAttribute('data-original-url', 'https://bad-url.com/missing.jpg');
  });

  it('passes through className to the img element', () => {
    render(<ImageWithFallback src="test.jpg" alt="Test" className="rounded-lg" />);

    expect(screen.getByAltText('Test')).toHaveClass('rounded-lg');
  });

  it('applies className to fallback container after error', () => {
    render(<ImageWithFallback src="bad.jpg" alt="Bad" className="w-48" />);

    fireEvent.error(screen.getByAltText('Bad'));

    // The fallback container div gets the className
    const container = screen.getByAltText('Error loading image').closest('.w-48');
    expect(container).toBeInTheDocument();
  });
});
