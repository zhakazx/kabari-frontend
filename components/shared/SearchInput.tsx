"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { IconSearch } from "@/components/ui/icons";

/**
 * Debounced search input. On submit (Enter) it pushes the keyword into the
 * URL; while typing, it schedules a `router.replace` after a short debounce
 * so the user sees results update without a page reload.
 *
 * When the URL changes externally (e.g. clicking a category chip), the
 * input's `key` is set to the URL value so the input remounts with the new
 * initial value — no effect-driven setState needed.
 */
export function SearchInput({
  paramName = "keyword",
  placeholder = "Cari…",
  debounceMs = 350,
  className,
}: {
  paramName?: string;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushed = useRef(initial);

  function pushUrl(next: string) {
    if (next === lastPushed.current) return;
    lastPushed.current = next;
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(paramName, next);
    else params.delete(paramName);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushUrl(next.trim()), debounceMs);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    pushUrl(value.trim());
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn("relative w-full sm:max-w-xs", className)}
    >
      <IconSearch
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45"
        aria-hidden
      />
      <Input
        key={initial}
        defaultValue={initial}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 pl-9 pr-3"
      />
    </form>
  );
}
