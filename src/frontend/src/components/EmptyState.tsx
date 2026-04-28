import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-ocid="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl mb-4 border border-border">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold font-display mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
