"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  children: ReactNode;
}

export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  children,
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      {children}
    </Dialog.Root>
  );
}

interface ModalContentProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
  hideCloseButton?: boolean;
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent(
    { title, description, className, children, hideCloseButton = false },
    ref
  ) {
    return (
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 backdrop-blur-xl bg-magenta/10",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          )}
        />
        <Dialog.Content
          ref={ref}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-lg p-6 rounded-2xl",
            "glass-strong shadow-glow",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            className
          )}
        >
          {title && (
            <Dialog.Title className="font-display text-2xl font-semibold text-white mb-1">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="text-sm text-lilac/70 mb-4">
              {description}
            </Dialog.Description>
          )}
          {!hideCloseButton && (
            <Dialog.Close
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center text-lilac/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </Dialog.Close>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    );
  }
);
