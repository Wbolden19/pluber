import { cn } from "@/lib/utils";
import { Building2, Home, Wrench } from "lucide-react";
import { motion } from "motion/react";
import type { UserRole } from "../../types";

interface RoleStepProps {
  selected: UserRole | null;
  onSelect: (role: UserRole) => void;
}

const ROLES: {
  id: UserRole;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}[] = [
  {
    id: "homeowner",
    icon: <Home className="w-8 h-8" />,
    title: "Homeowner",
    description:
      "Post jobs, set your price, and get matched with local workers. Track progress and pay securely.",
  },
  {
    id: "worker",
    icon: <Wrench className="w-8 h-8" />,
    title: "Service Worker",
    description:
      "Browse nearby jobs in your specialty, accept what fits your schedule, and earn on your terms.",
  },
  {
    id: "enterprise",
    icon: <Building2 className="w-8 h-8" />,
    title: "Enterprise Client",
    description:
      "Dispatch workers at scale for commercial properties. Ideal for property managers and facilities teams.",
    badge: "15% commission",
  },
];

export function RoleStep({ selected, onSelect }: RoleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          What brings you to Pluber?
        </h2>
        <p className="text-muted-foreground text-sm">
          Select the role that best describes you. You can always add more
          later.
        </p>
      </div>

      <div className="grid gap-4">
        {ROLES.map((role, index) => (
          <motion.button
            key={role.id}
            data-ocid={`role-card-${role.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(role.id)}
            className={cn(
              "w-full text-left p-5 rounded-xl border-2 transition-smooth relative",
              selected === role.id
                ? "border-accent bg-accent/10 shadow-elevated"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-lg transition-smooth",
                  selected === role.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-semibold text-foreground">
                    {role.title}
                  </span>
                  {role.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                      {role.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </div>
              {selected === role.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  <svg
                    className="w-3 h-3 text-accent-foreground"
                    fill="currentColor"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                  >
                    <path d="M10 3L5 8.5 2 5.5l-1 1L5 10.5l6-7-1-0.5z" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
