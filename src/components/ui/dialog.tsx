"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // v1.9 (measured): the reference's dialog scrim — warm dark at 25%
        // with a 12px backdrop blur (frosted glass), not plain black/50.
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[rgba(46,42,38,0.25)] backdrop-blur-[12px]",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  closeClassName,
  scrimFlex = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  /** v1.9: per-dialog overlay tweaks (e.g. the wizard's 0.3-alpha scrim). */
  overlayClassName?: string
  /** v2.10: per-dialog close-square overrides (the check-in's raised bg). */
  closeClassName?: string
  /** v2.10 (measured): the live's form dialogs + wizard render the panel
   * INSIDE the scrim — one fixed flex root (centered, pad 24px 16px)
   * carrying the scrim bg, with the panel as a relative child. The
   * check-in/invite keep the classic split (overlay + fixed content). */
  scrimFlex?: boolean
}) {
  const panel = (
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        // v2.0 (measured): standard form panels are radius 20 with pad
        // 28/28/24. v2.1 (measured): live dialog panels carry NO
        // box-shadow — depth comes from the blurred scrim only (the
        // -8px pair measured box-shadow: none on every live panel:
        // add-task/goal-edit/task-edit/check-in/invite/wizard). The
        // check-in modal (448/r16/p24) and the wizard (680/r24)
        // override via className. v2.10 (measured): in scrimFlex mode
        // the panel is a RELATIVE child of the overlay root (no fixed
        // positioning of its own; it computes z auto inside the root).
        cn(
          "bg-orb-raised data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border-0 duration-200",
          scrimFlex
            ? "relative w-full max-w-[500px] rounded-[20px] p-[28px_28px_24px]"
            : "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-[20px] p-[28px_28px_24px] sm:max-w-[500px]",
          className
        )
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          // v2.0 (measured): the reference's dialog close is a 30px r8
          // raised well square, not a ghost icon. v2.10 (measured): the
          // X renders at 13px in #5A5A5A (was 14px #2F2823).
          className={cn(
            "ring-offset-background focus:ring-ring absolute top-[18px] right-[18px] flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-orb-well text-[#5A5A5A] shadow-[-4px_-4px_8px_rgba(255,250,244,0.82),4px_4px_8px_rgba(160,143,126,0.28)] transition-opacity hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
            closeClassName
          )}
        >
          <XIcon className="size-[13px]" strokeWidth={2} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  )
  return (
    <DialogPortal data-slot="dialog-portal">
      {scrimFlex ? (
        <DialogOverlay
          data-slot="dialog-overlay"
          className={cn(
            "flex items-center justify-center p-[24px_16px]",
            overlayClassName
          )}
        >
          {panel}
        </DialogOverlay>
      ) : (
        <>
          <DialogOverlay className={overlayClassName} />
          {panel}
        </>
      )}
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      // v2.10: NO base typography. The Radix `asChild` Slot CONCATENATES
      // the base classes with the child's (it never runs tailwind-merge),
      // so a base `text-lg leading-none` used to survive alongside the
      // child's `leading-[22.5px]` — and in Tailwind v4's stylesheet
      // order `.leading-none` (line-height: 1) is emitted AFTER the
      // arbitrary value and wins the same-specificity cascade. Every
      // caller now carries its own explicit typography.
      className={cn(className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
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
}
