"use client";

import * as React from "react";
import { Topbar } from "@/components/admin/topbar";
import { CommandMenu } from "@/components/admin/command-menu";

/**
 * Client-side admin chrome: owns the command-palette open state and wires the
 * topbar search button to it. Rendered by the dashboard layout.
 */
export function AdminChrome({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  return (
    <>
      <Topbar onOpenCommand={() => setCommandOpen(true)} />
      <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </>
  );
}
