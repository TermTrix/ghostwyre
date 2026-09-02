"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingIndicatorProps {
  /** Optional label; defaults to a neutral "working" state. */
  label?: string;
  className?: string;
}

/**
 * Assistant-side placeholder shown between sending a message and the agent's
 * first reply. Mirrors ChatMessage's assistant layout so the real reply lands
 * in the same spot without the list jumping.
 */
export default function ThinkingIndicator({
  label = "Ghost is working",
  className,
}: ThinkingIndicatorProps) {
  return (
    <div
      className={cn("flex gap-3 mb-4 max-w-[85%]", className)}
      role="status"
      aria-live="polite"
    >
      {/* Avatar with a breathing halo */}
      <div className="relative flex items-center justify-center size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shrink-0 mt-0.5">
        <span
          aria-hidden
          className="absolute inset-0 rounded-lg border border-emerald-400/50 animate-ghost-halo"
        />
        <Shield className="size-4 text-emerald-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-border/60 bg-muted/40 px-3.5 py-2">
          <span className="text-xs font-medium animate-ghost-shimmer">
            {label}
          </span>
          <span aria-hidden className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-emerald-400 animate-ghost-dot"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </span>
        </div>

        {/* Indeterminate progress sweep */}
        <div className="mt-2 h-[3px] w-44 max-w-full overflow-hidden rounded-full bg-border/60">
          <div
            aria-hidden
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0 animate-ghost-sweep"
          />
        </div>

        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
