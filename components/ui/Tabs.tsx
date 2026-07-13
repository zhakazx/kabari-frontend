"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function Tabs({
  items,
  defaultId,
  id,
  onChange,
  className,
}: {
  items: TabItem[];
  defaultId?: string;
  id?: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultId ?? items[0]?.id);
  const active = id ?? internal;

  const select = (next: string) => {
    if (id === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        role="tablist"
        className="flex gap-1 border-b border-border overflow-x-auto"
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => select(item.id)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent text-foreground"
                  : "border-transparent text-foreground/55 hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-5">
        {items.find((i) => i.id === active)?.content}
      </div>
    </div>
  );
}
