import Link from "next/link";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 active:opacity-100 shadow-sm",
  secondary:
    "bg-surface-muted text-foreground border border-border hover:bg-border/70",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-surface-muted",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
  danger: "bg-danger text-white hover:opacity-90 active:opacity-100 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs font-medium",
  md: "h-10 gap-2 rounded-md px-4 text-sm font-medium",
  lg: "h-12 gap-2 rounded-lg px-6 text-[0.95rem] font-medium",
  icon: "h-10 w-10 rounded-md",
};

const SPINNER_SIZE: Record<Size, number> = { sm: 13, md: 16, lg: 18, icon: 18 };

type CommonProps = {
  variant?: Variant;
  size?: Size;
  pending?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonProps = CommonProps & {
  href?: undefined;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "className" | "children" | "href"
>;

export type ButtonOrLinkProps = ButtonProps | LinkProps;

function classes(variant: Variant, size: Size, className?: string): string {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-sans transition disabled:pointer-events-none disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button(props: ButtonProps | LinkProps) {
  if (props.href !== undefined) {
    const {
      href,
      external,
      variant = "primary",
      size = "md",
      pending = false,
      className,
      children,
      ...rest
    } = props;
    return (
      <Link
        href={href}
        className={classes(variant, size, className)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {pending && <Spinner size={SPINNER_SIZE[size]} />}
        {children}
      </Link>
    );
  }

  const {
    variant = "primary",
    size = "md",
    pending = false,
    className,
    children,
    disabled,
    type,
    ...rest
  } = props as ButtonProps;
  return (
    <button
      type={type ?? "button"}
      disabled={disabled ?? pending}
      className={classes(variant, size, className)}
      {...rest}
    >
      {pending && <Spinner size={SPINNER_SIZE[size]} />}
      {children}
    </button>
  );
}
