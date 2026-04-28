import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronRight,
  Home,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAppStore } from "../stores/appStore";
import type { UserRole } from "../types";

const ROLE_OPTIONS: {
  role: UserRole;
  icon: typeof Home;
  label: string;
  description: string;
}[] = [
  {
    role: "homeowner",
    icon: Home,
    label: "Homeowner",
    description:
      "Post jobs and hire local workers to get things done around your home.",
  },
  {
    role: "worker",
    icon: Briefcase,
    label: "Worker",
    description:
      "Accept jobs near you, complete them, and earn money on your schedule.",
  },
  {
    role: "enterprise",
    icon: Building2,
    label: "Enterprise",
    description:
      "Subcontract a fleet of Pluber workers for large-scale commercial projects.",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();
  const { setCurrentRole, setAvailableRoles } = useAppStore();
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["homeowner"]);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setShowRoleSelect(true);
    }
  }, [isAuthenticated]);

  function toggleRole(role: UserRole) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function handleContinue() {
    if (selectedRoles.length === 0) return;
    setAvailableRoles(selectedRoles);
    setCurrentRole(selectedRoles[0]);
    const dest =
      selectedRoles[0] === "homeowner"
        ? "/homeowner/dashboard"
        : selectedRoles[0] === "worker"
          ? "/worker/dashboard"
          : "/enterprise/dashboard";
    navigate({ to: dest });
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-16">
      {/* Decorative glows */}
      <div className="absolute top-1/3 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-accent" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-1">
            Welcome to Pluber
          </h1>
          <p className="text-muted-foreground text-sm">
            {showRoleSelect
              ? "How will you use Pluber?"
              : "Sign in to get started"}
          </p>
        </div>

        <div className="card-base p-6">
          {!showRoleSelect ? (
            /* Login Step */
            <div className="flex flex-col gap-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Secure Identity Login
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Pluber uses Internet Identity — a cryptographic login that
                      keeps your identity private and secure. No password
                      needed.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="btn-accent w-full gap-2 text-base"
                onClick={login}
                disabled={isLoading}
                data-ocid="login-btn"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" />
                    Connecting…
                  </span>
                ) : (
                  <>
                    <BadgeCheck className="w-5 h-5" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to Pluber's{" "}
                <button
                  type="button"
                  className="underline underline-offset-2 hover:text-foreground transition-smooth"
                >
                  Terms of Service
                </button>{" "}
                and liability waiver.
              </p>
            </div>
          ) : (
            /* Role Selection Step */
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground mb-2">
                Select all roles that apply to you. You can switch between them
                anytime.
              </p>

              <div className="flex flex-col gap-3">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = selectedRoles.includes(opt.role);
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      data-ocid={`role-select-${opt.role}`}
                      onClick={() => toggleRole(opt.role)}
                      className={`flex items-start gap-4 p-4 rounded-lg border text-left transition-smooth ${
                        selected
                          ? "bg-primary/10 border-primary/50 text-foreground"
                          : "bg-muted/30 border-border hover:border-border/60"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          selected ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        <opt.icon
                          className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm font-display">
                            {opt.label}
                          </span>
                          {selected && (
                            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-primary-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                size="lg"
                className="btn-accent w-full gap-2 text-base mt-2"
                onClick={handleContinue}
                disabled={selectedRoles.length === 0}
                data-ocid="role-continue-btn"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
