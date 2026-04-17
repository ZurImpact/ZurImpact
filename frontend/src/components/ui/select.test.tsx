import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

describe('Select', () => {
  it('opens and selects an item', async () => {
    const onValueChange = vi.fn();

    render(
      <Select onValueChange={onValueChange} defaultOpen>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Activities</SelectLabel>
            <SelectItem value="bike">Bike</SelectItem>
            <SelectItem value="walk">Walk</SelectItem>
          </SelectGroup>
          <SelectSeparator />
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger');

    expect(await screen.findByText('Activities')).toBeInTheDocument();
    expect(await screen.findByText('Bike')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Walk'));
    expect(onValueChange).toHaveBeenCalledWith('walk');
  });

  it('supports disabled items', async () => {
    const onValueChange = vi.fn();

    render(
      <Select onValueChange={onValueChange} defaultOpen>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bike">Bike</SelectItem>
          <SelectItem value="walk" disabled>
            Walk
          </SelectItem>
        </SelectContent>
      </Select>,
    );

    const disabledText = await screen.findByText('Walk');
    const disabledItem = disabledText.closest('[data-slot="select-item"]');
    expect(disabledItem).toHaveAttribute('data-disabled');

    fireEvent.click(disabledText);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies trigger size and custom className', () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger" size="sm" className="custom-trigger">
          <SelectValue placeholder="Sized" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveAttribute('data-size', 'sm');
    expect(trigger).toHaveClass('custom-trigger');
  });

  it('renders content and separator when open', async () => {
    render(
      <Select defaultOpen>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Scroll" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Menu</SelectLabel>
            <SelectItem value="one">One</SelectItem>
            <SelectItem value="two">Two</SelectItem>
          </SelectGroup>
          <SelectSeparator />
        </SelectContent>
      </Select>,
    );

    await waitFor(() => {
      expect(document.querySelector('[data-slot="select-content"]')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="select-separator"]')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });
  });
});
