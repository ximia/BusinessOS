"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked?: boolean;
  /** Renders a dash instead of a check (for "some selected" header state). */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Accessible checkbox built on a native button (no extra Radix dependency).
 * Supports an indeterminate visual state for "select all" headers.
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, indeterminate = false, onCheckedChange, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onCheckedChange?.(!checked);
        }}
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          (checked || indeterminate) && "border-primary bg-primary text-primary-foreground",
          className
        )}
        {...props}
      >
        {indeterminate ? (
          <Minus className="h-3 w-3" strokeWidth={3} />
        ) : checked ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : null}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";
