import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

describe('Sheet', () => {
  it('opens from trigger and renders content wrappers', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent side="left" className="sheet-custom">
          <SheetHeader className="header-custom">
            <SheetTitle className="title-custom">Sheet Title</SheetTitle>
            <SheetDescription className="description-custom">Sheet Description</SheetDescription>
          </SheetHeader>
          <SheetFooter className="footer-custom">
            <SheetClose>Done</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByRole('button', {name: 'Open Sheet'}));

    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();

    const content = document.querySelector('[data-slot="sheet-content"]');
    expect(content).toHaveClass('sheet-custom');
    expect(content).toHaveClass('left-0');
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeInTheDocument();

    expect(document.querySelector('[data-slot="sheet-header"]')).toHaveClass('header-custom');
    expect(document.querySelector('[data-slot="sheet-title"]')).toHaveClass('title-custom');
    expect(document.querySelector('[data-slot="sheet-description"]')).toHaveClass('description-custom');
    expect(document.querySelector('[data-slot="sheet-footer"]')).toHaveClass('footer-custom');
  });

  it('closes with close button', async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Closable Sheet</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByText('Closable Sheet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Close'}));
    expect(screen.queryByText('Closable Sheet')).not.toBeInTheDocument();
  });

  it('supports all side variants', () => {
    const {rerender} = render(
      <Sheet open>
        <SheetContent side="right">
          <SheetTitle>Right</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass('right-0');

    rerender(
      <Sheet open>
        <SheetContent side="left">
          <SheetTitle>Left</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass('left-0');

    rerender(
      <Sheet open>
        <SheetContent side="top">
          <SheetTitle>Top</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass('top-0');

    rerender(
      <Sheet open>
        <SheetContent side="bottom">
          <SheetTitle>Bottom</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-content"]')).toHaveClass('bottom-0');
  });
});
