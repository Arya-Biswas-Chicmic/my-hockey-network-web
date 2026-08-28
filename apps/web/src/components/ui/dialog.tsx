'use client';

import { XIcon } from 'lucide-react';
import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent } from '@/components/ui/drawer';

type DialogVariant = 'dialog' | 'drawer';
const DialogVariantContext = React.createContext<DialogVariant>('dialog');

function Dialog({
  variant = 'dialog',
  ...props
}: Readonly<DialogPrimitive.Root.Props & { variant?: DialogVariant }>) {
  if (variant === 'drawer') {
    const { open, defaultOpen, modal, onOpenChange, children } = props;
    return (
      <DialogVariantContext.Provider value={variant}>
        <Drawer
          defaultOpen={defaultOpen}
          modal={modal === true || modal === false ? modal : true}
          onOpenChange={(nextOpen) => onOpenChange?.(nextOpen, undefined as never)}
          open={open}
          swipeDirection="right"
        >
          {children}
        </Drawer>
      </DialogVariantContext.Provider>
    );
  }

  return (
    <DialogVariantContext.Provider value="dialog">
      <DialogPrimitive.Root data-slot="dialog" {...props} />
    </DialogVariantContext.Provider>
  );
}

function DialogTrigger({
  asChild,
  children,
  ...props
}: Readonly<DialogPrimitive.Trigger.Props & { asChild?: boolean }>) {
  if (asChild && React.isValidElement(children)) {
    return (
      <DialogPrimitive.Trigger data-slot="dialog-trigger" render={children} {...props} />
    );
  }
  return (
    <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props}>
      {children}
    </DialogPrimitive.Trigger>
  );
}

function DialogPortal({ ...props }: Readonly<DialogPrimitive.Portal.Props>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: Readonly<DialogPrimitive.Close.Props>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: Readonly<DialogPrimitive.Backdrop.Props>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn('cn-dialog-overlay fixed inset-0 isolate z-50', className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  variant = 'dialog',
  ...props
}: Readonly<
  DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean;
    variant?: 'dialog' | 'drawer';
  }
>) {
  const dialogVariant = React.useContext(DialogVariantContext);

  if (dialogVariant === 'drawer') {
    return (
      <DrawerContent
        className={cn(
          'w-140 max-w-[calc(100vw-2rem)] rounded-l-lg rounded-r-none border-y-0 border-r-0 bg-card',
          className,
        )}
      >
        {children}
        {showCloseButton ? (
          <DrawerClose
            render={
              <Button
                aria-label="Close"
                className="cn-dialog-close size-9 shrink-0 rounded-full bg-muted"
                size="icon"
                variant="icon"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DrawerClose>
        ) : null}
      </DrawerContent>
    );
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-variant={variant}
        className={cn(
          'cn-dialog-content fixed z-50 flex flex-col outline-none',
          variant === 'drawer'
            ? 'top-0 right-0 h-dvh max-h-dvh w-full max-w-[min(36rem,100vw)] translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0'
            : 'top-1/2 left-1/2 max-h-[85dvh] w-full -translate-x-1/2 -translate-y-1/2',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="icon" className="cn-dialog-close" size="icon" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: Readonly<React.ComponentProps<'div'>>) {
  const dialogVariant = React.useContext(DialogVariantContext);

  return (
    <div
      data-slot="dialog-header"
      className={cn(
        dialogVariant === 'drawer'
          ? 'flex shrink-0 flex-col border-b border-border px-6 py-4 pr-14 text-left'
          : 'cn-dialog-header flex shrink-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({
  className,
  scroll = true,
  ...props
}: Readonly<React.ComponentProps<'div'> & { scroll?: boolean }>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        'min-h-0 flex-1 px-6 py-5',
        scroll ? 'overflow-y-auto' : 'overflow-visible',
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: Readonly<
  React.ComponentProps<'div'> & {
    showCloseButton?: boolean;
  }
>) {
  const dialogVariant = React.useContext(DialogVariantContext);

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        dialogVariant === 'drawer'
          ? 'flex shrink-0 flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end'
          : 'cn-dialog-footer flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: Readonly<DialogPrimitive.Title.Props>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('cn-dialog-title', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: Readonly<DialogPrimitive.Description.Props>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('cn-dialog-description', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
