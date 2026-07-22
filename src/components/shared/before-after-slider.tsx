"use client";

import * as React from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Draggable before/after comparison slider. Pointer + keyboard accessible.
 */
export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  const [position, setPosition] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const setFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    };
    const onUp = () => (dragging.current = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setFromClientX]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-border",
        className
      )}
      onPointerDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
    >
      {/* After (base layer) */}
      <Image
        src={after}
        alt={afterLabel}
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
      />
      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
        {afterLabel}
      </span>

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before}
          alt={beforeLabel}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {beforeLabel}
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
        style={{ left: `${position}%` }}
      >
        <button
          type="button"
          role="slider"
          aria-label="Comparison slider"
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 4));
            if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 4));
          }}
          className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <MoveHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
