import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  DollarSign,
  MapPin,
  Shield,
  Sliders,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { UserAvatar } from "../components/UserAvatar";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import {
  type HomeownerProfilePublic,
  type Rating,
  type VerificationStatus,
  type WorkerProfilePublic,
  formatTimestamp,
  getCategoryMeta,
} from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────

function StarRating({
  score,
  size = "sm",
}: { score: number; size?: "sm" | "md" }) {
  const stars = Math.round(score);
  const iconClass = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            i <= stars ? "fill-chart-4 text-chart-4" : "text-border",
          )}
        />
      ))}
    </div>
  );
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, { label: string; cls: string }> = {
    Approved: {
      label: "Verified",
      cls: "bg-accent/15 text-accent border-accent/30",
    },
    Pending: {
      label: "Pending Review",
      cls: "bg-chart-4/15 text-chart-4 border-chart-4/30",
    },
    Rejected: {
      label: "Not Verified",
      cls: "bg-destructive/15 text-destructive border-destructive/30",
    },
  };
  const { label, cls } = map[status] ?? map.Pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
        cls,
      )}
    >
      <Shield className="w-3 h-3" />
      {label}
    </span>
  );
}

function RadiusSlider({
  currentRadius,
  completedJobs,
  onSave,
  isSaving,
}: {
  currentRadius: number;
  completedJobs: number;
  onSave: (v: number) => void;
  isSaving: boolean;
}) {
  const maxUnlocked = Math.min(50, 10 + Math.floor(completedJobs / 10) * 2);
  const [value, setValue] = useState(currentRadius);
  const needed =
    value > maxUnlocked ? Math.ceil((value - 10) / 2) * 10 - completedJobs : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Service Radius</span>
        <span className="text-sm font-bold text-primary">{value} mi</span>
      </div>
      <input
        type="range"
        min={5}
        max={50}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-primary"
        data-ocid="radius-slider"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>5 mi</span>
        <span>50 mi</span>
      </div>
      {value > maxUnlocked && (
        <p className="text-xs text-chart-4">
          You need {needed} more completed job{needed !== 1 ? "s" : ""} to
          unlock {value} miles.
        </p>
      )}
      <Button
        size="sm"
        onClick={() => onSave(value)}
        disabled={isSaving || value > maxUnlocked || value === currentRadius}
        data-ocid="save-radius-btn"
        className="btn-primary"
      >
        {isSaving ? "Saving…" : "Save Radius"}
      </Button>
    </div>
  );
}

// ── Worker Profile ─────────────────────────────────────────────────────────

function WorkerProfileView({
  profile,
  ratings,
  isOwn,
}: {
  profile: WorkerProfilePublic;
  ratings: Rating[];
  isOwn: boolean;
}) {
  const { actor } = useBackend();
  const qc = useQueryClient();
  const completedJobs = Number(profile.completedJobsCount);
  const radiusMiles = Number(profile.radiusMiles);
  const radiusMutation = useMutation({
    mutationFn: async (newRadius: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateWorkerRadius(BigInt(newRadius));
    },
    onSuccess: () => {
      toast.success("Radius updated!");
      qc.invalidateQueries({ queryKey: ["myWorkerProfile"] });
    },
    onError: () => toast.error("Failed to update radius"),
  });

  const maxRadius = Math.min(50, 10 + Math.floor(completedJobs / 10) * 2);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <UserAvatar
            name={profile.userId.toText().slice(0, 8)}
            size="lg"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold truncate">
                Worker #{profile.userId.toText().slice(0, 8)}
              </h1>
              {profile.enterpriseTier && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-chart-3/15 text-chart-3 border border-chart-3/30">
                  <Building2 className="w-3 h-3" />
                  Enterprise
                </span>
              )}
              <VerificationBadge status={profile.verificationStatus} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <StarRating score={profile.averageRating} size="md" />
                <span className="text-sm font-semibold text-foreground">
                  {profile.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {completedJobs} jobs completed
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {radiusMiles} mi radius (max {maxRadius} mi)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Jobs Done",
            value: completedJobs,
            icon: <Briefcase className="w-5 h-5 text-primary" />,
          },
          {
            label: "Rating",
            value: profile.averageRating.toFixed(1),
            icon: <Star className="w-5 h-5 text-chart-4" />,
          },
          {
            label: "Radius",
            value: `${radiusMiles} mi`,
            icon: <MapPin className="w-5 h-5 text-accent" />,
          },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="bg-card border-border p-4 text-center">
            <div className="flex justify-center mb-2">{icon}</div>
            <div className="text-2xl font-display font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </Card>
        ))}
      </div>

      {/* Service categories */}
      <Card className="bg-card border-border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Services Offered
        </h2>
        {profile.serviceCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services listed.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.serviceCategories.map((cat) => {
              const meta = getCategoryMeta(cat);
              return (
                <Badge
                  key={cat}
                  variant="outline"
                  className={cn("text-xs font-medium border", meta.color)}
                >
                  {meta.icon} {meta.label}
                </Badge>
              );
            })}
          </div>
        )}
      </Card>

      {/* Radius editor (own profile only) */}
      {isOwn && (
        <Card className="bg-card border-border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Edit Service Radius
          </h2>
          <RadiusSlider
            currentRadius={radiusMiles}
            completedJobs={completedJobs}
            onSave={(v) => radiusMutation.mutate(v)}
            isSaving={radiusMutation.isPending}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Your radius expands 2 miles for every 10 jobs completed. Max 50
            miles.
          </p>
        </Card>
      )}

      {/* Reviews */}
      <Card className="bg-card border-border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Recent Reviews
        </h2>
        {ratings.length === 0 ? (
          <EmptyState
            icon={<Star className="w-8 h-8 text-muted-foreground" />}
            title="No reviews yet"
            description="Complete jobs to start receiving reviews from homeowners."
          />
        ) : (
          <div className="space-y-4">
            {ratings.slice(0, 10).map((r) => (
              <motion.div
                key={r.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-border last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <StarRating score={Number(r.score)} />
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(r.createdAt)}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm text-foreground/80 mt-1">{r.comment}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Tip total */}
      <Card className="bg-card border-border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Tips Received
        </h2>
        <p className="text-3xl font-display font-bold text-accent">
          {ratings.length} review{ratings.length !== 1 ? "s" : ""} with comments
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tips are processed through the Pluber escrow system.
        </p>
      </Card>
    </div>
  );
}

// ── Homeowner Profile ──────────────────────────────────────────────────────

function HomeownerProfileView({
  profile,
  ratings,
}: {
  profile: HomeownerProfilePublic;
  ratings: Rating[];
}) {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <UserAvatar
            name={profile.userId.toText().slice(0, 8)}
            size="lg"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <h1 className="text-xl font-display font-bold truncate">
              Homeowner #{profile.userId.toText().slice(0, 8)}
            </h1>
            <div className="flex items-center gap-1.5">
              <StarRating score={profile.averageRating} size="md" />
              <span className="text-sm font-semibold">
                {profile.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {profile.address}
            </div>
            <p className="text-xs text-muted-foreground">
              Member since {formatTimestamp(profile.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Rating",
            value: profile.averageRating.toFixed(1),
            icon: <Star className="w-5 h-5 text-chart-4" />,
          },
          {
            label: "Reviews",
            value: ratings.length,
            icon: <Briefcase className="w-5 h-5 text-primary" />,
          },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="bg-card border-border p-4 text-center">
            <div className="flex justify-center mb-2">{icon}</div>
            <div className="text-2xl font-display font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border p-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Review History
        </h2>
        {ratings.length === 0 ? (
          <EmptyState
            icon={<Star className="w-8 h-8 text-muted-foreground" />}
            title="No reviews yet"
            description="Workers will leave reviews after completed jobs."
          />
        ) : (
          <div className="space-y-4">
            {ratings.slice(0, 10).map((r) => (
              <div
                key={r.id.toString()}
                className="border-b border-border last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <StarRating score={Number(r.score)} />
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(r.createdAt)}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm text-foreground/80 mt-1">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { userId } = useParams({ from: "/profile/$userId" });
  const navigate = useNavigate();
  const { actor, isLoading: actorLoading } = useBackend();
  const { principalText } = useAuth();

  const isOwn = principalText === userId;

  // Try fetching worker profile first, then homeowner
  const workerQ = useQuery({
    queryKey: ["workerProfile", userId],
    queryFn: async () => {
      if (!actor) return null;
      // If own profile, use getMyWorkerProfile for full data
      if (isOwn) return actor.getMyWorkerProfile();
      return actor.getWorkerProfile({ toText: () => userId } as never);
    },
    enabled: !!actor && !actorLoading,
  });

  const homeownerQ = useQuery({
    queryKey: ["homeownerProfile", userId],
    queryFn: async () => {
      if (!actor) return null;
      if (isOwn) return actor.getMyHomeownerProfile();
      return actor.getHomeownerProfile({ toText: () => userId } as never);
    },
    enabled: !!actor && !actorLoading,
  });

  const ratingsQ = useQuery({
    queryKey: ["ratings", userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRatingsForUser({ toText: () => userId } as never);
    },
    enabled: !!actor && !actorLoading,
  });

  const isLoading =
    workerQ.isLoading || homeownerQ.isLoading || ratingsQ.isLoading;
  const workerProfile = workerQ.data ?? null;
  const homeownerProfile = homeownerQ.data ?? null;
  const ratings = ratingsQ.data ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="gap-1 text-muted-foreground hover:text-foreground"
          data-ocid="back-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-lg font-display font-semibold">
          {isOwn ? "My Profile" : "Profile"}
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : workerProfile ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WorkerProfileView
            profile={workerProfile}
            ratings={ratings}
            isOwn={isOwn}
          />
        </motion.div>
      ) : homeownerProfile ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HomeownerProfileView profile={homeownerProfile} ratings={ratings} />
        </motion.div>
      ) : (
        <EmptyState
          icon={<Shield className="w-10 h-10 text-muted-foreground" />}
          title="Profile not found"
          description="This user hasn't set up their profile yet."
        />
      )}
    </div>
  );
}
