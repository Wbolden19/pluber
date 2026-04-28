import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface UserAvatarProps {
  name?: string;
  rating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showRating?: boolean;
}

export function UserAvatar({
  name,
  rating,
  size = "md",
  className,
  showRating = false,
}: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-semibold text-primary font-display",
          sizeClasses[size],
        )}
      >
        {initials}
      </div>
      {showRating && rating !== undefined && (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-chart-4 text-chart-4" />
          <span className="text-sm font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
