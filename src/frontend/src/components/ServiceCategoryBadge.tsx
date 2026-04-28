import { cn } from "@/lib/utils";
import { getCategoryMeta } from "../types";
import type { ServiceCategory } from "../types";

interface ServiceCategoryBadgeProps {
  category: ServiceCategory;
  size?: "sm" | "md";
  className?: string;
}

export function ServiceCategoryBadge({
  category,
  size = "md",
  className,
}: ServiceCategoryBadgeProps) {
  const meta = getCategoryMeta(category);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        meta.color,
        className,
      )}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}
