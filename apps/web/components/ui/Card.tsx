import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: "glass" | "solid";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hoverable = false, variant = "glass", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl p-6 shadow-glass",
        variant === "glass" ? "glass" : "bg-imperial",
        hoverable &&
          "transition-all duration-200 hover:-translate-y-1 hover:shadow-glow hover:border-magenta/30",
        className
      )}
      {...props}
    />
  );
});

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-xl font-semibold text-white", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-lilac/70", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-lilac", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 mt-6", className)} {...props} />
  );
}
