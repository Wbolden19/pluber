import type {
  EnterpriseDispatchPublic,
  EnterpriseDispatchStatus,
  EscrowStatus,
  HomeownerProfilePublic,
  JobId,
  JobPublic,
  JobStatus,
  NotificationPublic,
  NotificationType,
  PaymentRecordPublic,
  Rating,
  ServiceCategory,
  Timestamp,
  UserId,
  VerificationStatus,
  WorkerProfilePublic,
} from "../backend.d.ts";

export type {
  JobPublic,
  WorkerProfilePublic,
  HomeownerProfilePublic,
  NotificationPublic,
  PaymentRecordPublic,
  Rating,
  EnterpriseDispatchPublic,
  JobStatus,
  ServiceCategory,
  VerificationStatus,
  EscrowStatus,
  NotificationType,
  EnterpriseDispatchStatus,
  JobId,
  UserId,
  Timestamp,
};

export type UserRole = "homeowner" | "worker" | "enterprise";

export interface AppUser {
  principal: string;
  roles: UserRole[];
  homeownerProfile?: HomeownerProfilePublic | null;
  workerProfile?: WorkerProfilePublic | null;
}

export interface ServiceCategoryMeta {
  value: ServiceCategory;
  label: string;
  icon: string;
  color: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = [
  {
    value: "LawnMowing" as ServiceCategory,
    label: "Lawn Mowing",
    icon: "🌿",
    color: "bg-accent/20 text-accent border-accent/30",
  },
  {
    value: "SnowPlowing" as ServiceCategory,
    label: "Snow Plowing",
    icon: "❄️",
    color: "bg-primary/20 text-primary border-primary/30",
  },
  {
    value: "LeafRaking" as ServiceCategory,
    label: "Leaf Raking",
    icon: "🍂",
    color: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  },
  {
    value: "BushTrimming" as ServiceCategory,
    label: "Bush Trimming",
    icon: "✂️",
    color: "bg-accent/20 text-accent border-accent/30",
  },
  {
    value: "WeedWhacking" as ServiceCategory,
    label: "Weed Whacking",
    icon: "🌱",
    color: "bg-accent/20 text-accent border-accent/30",
  },
  {
    value: "WindowWashing" as ServiceCategory,
    label: "Window Washing",
    icon: "🪟",
    color: "bg-primary/20 text-primary border-primary/30",
  },
  {
    value: "GutterCleaning" as ServiceCategory,
    label: "Gutter Cleaning",
    icon: "🏠",
    color: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  },
  {
    value: "PressureWashing" as ServiceCategory,
    label: "Pressure Washing",
    icon: "💧",
    color: "bg-primary/20 text-primary border-primary/30",
  },
  {
    value: "GeneralYardWork" as ServiceCategory,
    label: "General Yard Work",
    icon: "🏡",
    color: "bg-accent/20 text-accent border-accent/30",
  },
];

export function getCategoryMeta(
  category: ServiceCategory,
): ServiceCategoryMeta {
  return (
    SERVICE_CATEGORIES.find((c) => c.value === category) ?? {
      value: category,
      label: category,
      icon: "🔧",
      color: "bg-muted text-muted-foreground border-border",
    }
  );
}

export function formatBudget(budgetUSD: bigint): string {
  return `$${Number(budgetUSD).toLocaleString()}`;
}

export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
