import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
  hover?: boolean;
  bordered?: boolean;
}

const paddingMap = { sm: "p-3", md: "p-4", lg: "p-6", none: "" };

export function Card({ children, className, padding = "md", hover, bordered = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        bordered && "border border-gray-200 dark:border-gray-700/60",
        paddingMap[padding],
        hover && "hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
