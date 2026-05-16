"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DesktopPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function DesktopPanel({ children, className }: DesktopPanelProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-[400px] flex-col border-r bg-background shadow-lg",
        className
      )}
    >
      {children}
    </aside>
  );
}

export default DesktopPanel;
