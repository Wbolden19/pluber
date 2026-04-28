import { cn } from "@/lib/utils";
import { Clock, DollarSign, MapPin } from "lucide-react";
import { formatBudget, formatTimestamp } from "../types";
import type { JobPublic } from "../types";
import { ServiceCategoryBadge } from "./ServiceCategoryBadge";
import { StatusBadge } from "./StatusBadge";

interface JobCardProps {
  job: JobPublic;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function JobCard({
  job,
  onClick,
  compact = false,
  className,
}: JobCardProps) {
  return (
    <div
      data-ocid="job-card"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "card-base p-4 cursor-pointer",
        onClick && "hover:border-primary/50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className={cn(
            "font-semibold font-display leading-snug",
            compact ? "text-sm" : "text-base",
          )}
        >
          {job.title}
        </h3>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <ServiceCategoryBadge category={job.serviceCategory} size="sm" />
      </div>

      {!compact && (
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {job.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-accent" />
          <span className="text-accent font-semibold">
            {formatBudget(job.budgetUSD)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[160px]">{job.address}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimestamp(job.createdAt)}</span>
        </span>
      </div>
    </div>
  );
}
