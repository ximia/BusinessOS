"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Reveal-on-scroll wrapper. Fades and lifts children into view once, with a
 * configurable delay for staggering. Respects prefers-reduced-motion via the
 * global CSS override.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
  ...props
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: keyof typeof motion;
} & Omit<HTMLMotionProps<"div">, "as">) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Stagger container: children using `RevealItem` animate in sequence. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
