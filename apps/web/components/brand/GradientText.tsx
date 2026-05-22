import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  as?: ElementType;
}

export function GradientText({
  children,
  className,
  animate = false,
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        "text-gradient",
        animate && "animate-gradient-shift",
        className
      )}
    >
      {children}
    </Tag>
  );
}
