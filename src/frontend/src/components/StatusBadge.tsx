import { cn } from "@/lib/utils";
import type { JobStatus } from "../types";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-accent/15 text-accent border-accent/30",
  Accepted: "bg-primary/15 text-primary border-primary/30",
  InProgress: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  Completed: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
  Disputed: "bg-destructive/15 text-destructive border-destructive/30",
};

const STATUS_LABELS: Record<string, string> = {
  Open: "Open",
  Accepted: "Accepted",
  InProgress: "In Progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Disputed: "Disputed",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
