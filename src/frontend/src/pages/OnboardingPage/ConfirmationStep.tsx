import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Home,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import type { UserRole } from "../../types";

interface ConfirmationStepProps {
  role: UserRole;
  name: string;
}

const NEXT_STEPS: Record<UserRole, { icon: string; text: string }[]> = {
  homeowner: [
    {
      icon: "📍",
      text: "Post your first job with a price you're comfortable with",
    },
    { icon: "🔔", text: "Workers in your area will be notified instantly" },
    { icon: "✅", text: "Confirm completion and release payment when done" },
  ],
  worker: [
    {
      icon: "⏳",
      text: "Your ID and insurance documents are under review (1–2 business days)",
    },
    {
      icon: "📲",
      text: "You'll be notified when jobs matching your skills appear nearby",
    },
    {
      icon: "💰",
      text: "Payment is released after both parties confirm completion",
    },
  ],
  enterprise: [
    {
      icon: "🏢",
      text: "Your enterprise account is being reviewed by our team",
    },
    {
      icon: "👷",
      text: "Once approved, dispatch workers to your sites at scale",
    },
    {
      icon: "📊",
      text: "Track all dispatches and worker assignments from your dashboard",
    },
  ],
};

const ROLE_META: Record<
  UserRole,
  { icon: React.ReactNode; label: string; color: string }
> = {
  homeowner: {
    icon: <Home className="w-6 h-6" />,
    label: "Homeowner",
    color: "text-primary",
  },
  worker: {
    icon: <Wrench className="w-6 h-6" />,
    label: "Service Worker",
    color: "text-accent",
  },
  enterprise: {
    icon: <Building2 className="w-6 h-6" />,
    label: "Enterprise Client",
    color: "text-primary",
  },
};

export function ConfirmationStep({ role, name }: ConfirmationStepProps) {
  const navigate = useNavigate();
  const meta = ROLE_META[role];
  const steps = NEXT_STEPS[role];

  const handleGoToDashboard = () => {
    if (role === "homeowner") navigate({ to: "/homeowner/dashboard" });
    else if (role === "worker") navigate({ to: "/worker/dashboard" });
    else navigate({ to: "/enterprise/dashboard" });
  };

  return (
    <div className="space-y-6 text-center">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex justify-center"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center"
          >
            <span className={meta.color}>{meta.icon}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Welcome message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          Welcome to Pluber, {name || "there"}!
        </h2>
        <p className="text-muted-foreground text-sm">
          Your <span className="text-foreground font-medium">{meta.label}</span>{" "}
          profile has been created successfully.
        </p>
      </motion.div>

      {/* Worker review notice */}
      {role === "worker" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30 text-left"
        >
          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Verification in progress
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Our team is reviewing your ID and insurance documents. You'll be
              able to accept jobs once approved (typically 1–2 business days).
            </p>
          </div>
        </motion.div>
      )}

      {/* Next steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-left space-y-2"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What happens next
        </p>
        <div className="space-y-3">
          {steps.map((step) => (
            <motion.div
              key={step.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border"
            >
              <span className="text-lg leading-none">{step.icon}</span>
              <span className="text-sm text-foreground leading-relaxed">
                {step.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          data-ocid="btn-go-dashboard"
          onClick={handleGoToDashboard}
          className="w-full btn-accent h-12 text-base font-semibold"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
