import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-emerald-500/10 text-emerald-600": variant === "success",
          "bg-amber-500/10 text-amber-600": variant === "warning",
          "bg-red-500/10 text-red-600": variant === "danger",
          "bg-blue-500/10 text-blue-600": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
