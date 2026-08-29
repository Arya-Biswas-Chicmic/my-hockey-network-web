"use client";

import { forwardRef } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface SwitchProps extends Omit<ButtonProps, "children" | "role"> {
  checked: boolean;
}

/**
 * Shared 40x22 switch used by Settings, Supervision, onboarding protection,
 * and the profile-menu theme control. The visual states match the approved
 * Figma control: blue/white when active and gray/white when inactive.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, ...buttonProps }, ref) => (
    <Button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn("mhn-switch", checked && "mhn-switch--checked", className)}
      {...buttonProps}
    >
      <span className="mhn-switch-thumb" aria-hidden="true" />
    </Button>
  ),
);

Switch.displayName = "Switch";
