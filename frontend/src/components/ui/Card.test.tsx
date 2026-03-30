import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction} from './card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has the data-slot attribute', () => {
    render(<Card>Content</Card>);

    expect(screen.getByText('Content')).toHaveAttribute('data-slot', 'card');
  });

  it('applies custom className', () => {
    render(<Card className="p-6">Content</Card>);

    expect(screen.getByText('Content')).toHaveClass('p-6');
  });
});

describe('CardHeader', () => {
  it('renders and has data-slot', () => {
    render(<CardHeader>Header</CardHeader>);

    expect(screen.getByText('Header')).toHaveAttribute('data-slot', 'card-header');
  });
});

describe('CardTitle', () => {
  it('renders as h4 with data-slot', () => {
    render(<CardTitle>Title</CardTitle>);

    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H4');
    expect(title).toHaveAttribute('data-slot', 'card-title');
  });
});

describe('CardDescription', () => {
  it('renders as p with data-slot', () => {
    render(<CardDescription>Description</CardDescription>);

    const desc = screen.getByText('Description');
    expect(desc.tagName).toBe('P');
    expect(desc).toHaveAttribute('data-slot', 'card-description');
  });
});

describe('CardContent', () => {
  it('renders with data-slot', () => {
    render(<CardContent>Body</CardContent>);

    expect(screen.getByText('Body')).toHaveAttribute('data-slot', 'card-content');
  });
});

describe('CardFooter', () => {
  it('renders with data-slot', () => {
    render(<CardFooter>Footer</CardFooter>);

    expect(screen.getByText('Footer')).toHaveAttribute('data-slot', 'card-footer');
  });
});

describe('CardAction', () => {
  it('renders with data-slot', () => {
    render(<CardAction>Action</CardAction>);

    expect(screen.getByText('Action')).toHaveAttribute('data-slot', 'card-action');
  });
});
