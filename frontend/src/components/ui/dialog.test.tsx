import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  it('opens from trigger and renders content wrappers', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent className="content-class">
          <DialogHeader className="header-class">
            <DialogTitle className="title-class">Dialog Title</DialogTitle>
            <DialogDescription className="desc-class">Dialog Description</DialogDescription>
          </DialogHeader>
          <DialogFooter className="footer-class">
            <DialogClose>Custom Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Open Dialog'}));

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();

    const content = document.querySelector('[data-slot="dialog-content"]');
    const header = document.querySelector('[data-slot="dialog-header"]');
    const title = document.querySelector('[data-slot="dialog-title"]');
    const description = document.querySelector('[data-slot="dialog-description"]');
    const footer = document.querySelector('[data-slot="dialog-footer"]');

    expect(content).toHaveClass('content-class');
    expect(header).toHaveClass('header-class');
    expect(title).toHaveClass('title-class');
    expect(description).toHaveClass('desc-class');
    expect(footer).toHaveClass('footer-class');
  });

  it('closes when clicking the built-in close button', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Closable dialog</DialogTitle>
          <DialogDescription>Closable dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByText('Closable dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Close'}));
    expect(screen.queryByText('Closable dialog')).not.toBeInTheDocument();
  });

  it('renders portal and overlay slots when open', () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay className="overlay-class" />
          <DialogContent>
            <DialogTitle>Overlay Title</DialogTitle>
            <DialogDescription>Overlay Description</DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    );

    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveClass('overlay-class');
    expect(screen.getByText('Overlay Title')).toBeInTheDocument();
  });
});
