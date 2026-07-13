"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingText,
  className,
  variant = "primary",
  size = "md",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      pending={pending}
      className={cn("w-full", className)}
    >
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}
