import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Loader2,
  MapPin,
  Phone,
  Shield,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EscrowStatus } from "../../backend";
import { ServiceCategoryBadge } from "../../components/ServiceCategoryBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { useBackend } from "../../hooks/useBackend";
import type {
  JobPublic,
  PaymentRecordPublic,
  WorkerProfilePublic,
} from "../../types";
import { formatBudget, formatTimestamp } from "../../types";

const TIP_PRESETS = [
  { label: "10%", factor: 0.1 },
  { label: "15%", factor: 0.15 },
  { label: "20%", factor: 0.2 },
];

function TimelineStep({
  label,
  date,
  done,
  active,
}: {
  label: string;
  date?: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          done
            ? "bg-accent text-accent-foreground"
            : active
              ? "bg-primary/20 border-2 border-primary text-primary"
              : "bg-muted border border-border text-muted-foreground"
        }`}
      >
        {done ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>
      <div className="pb-5">
        <p
          className={`text-sm font-medium ${done || active ? "text-foreground" : "text-muted-foreground"}`}
        >
          {label}
        </p>
        {date && <p className="text-xs text-muted-foreground mt-0.5">{date}</p>}
      </div>
    </div>
  );
}

function TipModal({
  job,
  onClose,
  onSubmit,
}: {
  job: JobPublic;
  onClose: () => void;
  onSubmit: (tip: bigint, score: bigint, comment: string) => Promise<void>;
}) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const budget = Number(job.budgetUSD);
  const tipAmount =
    selectedPreset !== null
      ? Math.round(budget * TIP_PRESETS[selectedPreset].factor)
      : customTip
        ? Math.round(Number.parseFloat(customTip))
        : 0;

  async function handleSubmit() {
    setLoading(true);
    try {
      await onSubmit(BigInt(tipAmount), BigInt(rating), comment);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <dialog
        open
        className="bg-card border border-border rounded-xl shadow-elevated w-full max-w-md m-0"
        aria-labelledby="tip-modal-title"
      >
        <div className="p-6">
          <h2
            id="tip-modal-title"
            className="text-lg font-display font-bold mb-1"
          >
            Rate & Tip Your Worker
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Great work deserves recognition!
          </p>

          {/* Star Rating */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-2">Your Rating</p>
            <div className="flex gap-1" data-ocid="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                  className="transition-smooth hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${star <= rating ? "fill-chart-4 text-chart-4" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tip Presets */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Add a Tip</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {TIP_PRESETS.map((preset, i) => (
                <button
                  key={preset.label}
                  type="button"
                  data-ocid={`tip-preset-${preset.label}`}
                  onClick={() => {
                    setSelectedPreset(i);
                    setCustomTip("");
                  }}
                  className={`p-2.5 rounded-lg border text-sm font-medium transition-smooth ${
                    selectedPreset === i
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <div>{preset.label}</div>
                  <div className="text-xs mt-0.5">
                    ${Math.round(budget * preset.factor)}
                  </div>
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Custom amount"
                value={customTip}
                data-ocid="tip-custom-input"
                onChange={(e) => {
                  setCustomTip(e.target.value);
                  setSelectedPreset(null);
                }}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Leave a comment for your worker (optional)…"
            value={comment}
            data-ocid="rating-comment"
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] resize-none mb-5"
          />

          {tipAmount > 0 && (
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Total tip:{" "}
              <span className="text-accent font-semibold">${tipAmount}</span>
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Skip
            </Button>
            <Button
              data-ocid="submit-tip-btn"
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1 btn-accent"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `Submit${tipAmount > 0 ? ` & Tip $${tipAmount}` : ""}`
              )}
            </Button>
          </div>
          {rating === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              A star rating is required
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}

export function HomeownerJobDetailPage() {
  const params = useParams({ from: "/homeowner/jobs/$jobId" });
  const jobId = BigInt(params.jobId);
  const { actor, isLoading: actorLoading } = useBackend();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showTipModal, setShowTipModal] = useState(false);

  const {
    data: job,
    isLoading: jobLoading,
    isError,
  } = useQuery<JobPublic | null>({
    queryKey: ["job", String(jobId)],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getJob(jobId);
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: 15_000,
  });

  const { data: payment } = useQuery<PaymentRecordPublic | null>({
    queryKey: ["jobPayment", String(jobId)],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPaymentForJob(jobId);
    },
    enabled: !!actor && !actorLoading && !!job,
  });

  const { data: worker } = useQuery<WorkerProfilePublic | null>({
    queryKey: ["workerProfile", job?.workerId?.toText()],
    queryFn: async () => {
      if (!actor || !job?.workerId) return null;
      return actor.getWorkerProfile(job.workerId);
    },
    enabled: !!actor && !actorLoading && !!job?.workerId,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.homeownerConfirmCompletion(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", String(jobId)] });
      queryClient.invalidateQueries({ queryKey: ["myPostedJobs"] });
      setShowTipModal(true);
    },
    onError: () => toast.error("Failed to confirm completion"),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", String(jobId)] });
      queryClient.invalidateQueries({ queryKey: ["myPostedJobs"] });
      toast.success("Job cancelled");
      navigate({ to: "/homeowner/dashboard" });
    },
    onError: () => toast.error("Failed to cancel job"),
  });

  const disputeMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.disputeJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", String(jobId)] });
      toast.success("Dispute filed — our team will review.");
    },
    onError: () => toast.error("Failed to file dispute"),
  });

  async function handleTipSubmit(tip: bigint, score: bigint, comment: string) {
    if (!actor || !job) return;
    try {
      if (tip > 0n) {
        await actor.addTip({ jobId, tipAmountUSD: tip });
      }
      if (score > 0n && job.workerId) {
        await actor.submitRating({
          ratedUserId: job.workerId,
          jobId,
          score,
          comment: comment || undefined,
        });
      }
      await actor.releaseEscrow(jobId, payment?.stripePayoutId ?? "");
      toast.success("Thank you! Rating and tip submitted.");
      queryClient.invalidateQueries({ queryKey: ["job", String(jobId)] });
      queryClient.invalidateQueries({
        queryKey: ["jobPayment", String(jobId)],
      });
    } catch {
      toast.error("Something went wrong submitting your review.");
    } finally {
      setShowTipModal(false);
    }
  }

  const isLoading = jobLoading || actorLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-display font-semibold mb-1">
          Job not found
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          This job may have been removed or you don't have access.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/homeowner/dashboard" })}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const canConfirm =
    job.workerConfirmed &&
    !job.homeownerConfirmed &&
    job.status !== "Completed";
  const canCancel = ["Open", "Accepted"].includes(job.status);
  const canDispute = ["InProgress", "Accepted"].includes(job.status);

  // Timeline steps
  const timelineSteps = [
    { label: "Job Posted", date: formatTimestamp(job.createdAt), done: true },
    {
      label: "Worker Accepted",
      date: job.acceptedAt ? formatTimestamp(job.acceptedAt) : undefined,
      done: !!job.acceptedAt,
      active: job.status === "Open",
    },
    {
      label: "In Progress",
      done: ["InProgress", "Completed"].includes(job.status),
      active: job.status === "Accepted",
    },
    {
      label: "Completed",
      date: job.completedAt ? formatTimestamp(job.completedAt) : undefined,
      done: job.status === "Completed",
      active: job.status === "InProgress",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-display font-bold truncate">
              {job.title}
            </h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Job #{String(job.id)}
          </p>
        </div>
      </div>

      {/* Details Card */}
      <div className="card-base p-5 mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <ServiceCategoryBadge category={job.serviceCategory} />
        </div>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[200px]">{job.address}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-accent font-bold">
              {formatBudget(job.budgetUSD)}
            </span>
          </span>
        </div>
      </div>

      {/* Payment / Escrow */}
      {payment && (
        <div className="card-base p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Escrow Status</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Amount Held</p>
              <p className="text-xl font-bold font-display text-foreground">
                {formatBudget(payment.amountUSD)}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                payment.escrowStatus === EscrowStatus.Held
                  ? "bg-chart-4/15 text-chart-4 border-chart-4/30"
                  : payment.escrowStatus === EscrowStatus.Released
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {payment.escrowStatus}
            </span>
          </div>
          {payment.tipAmountUSD > 0n && (
            <p className="text-xs text-muted-foreground mt-2">
              + Tip: {formatBudget(payment.tipAmountUSD)}
            </p>
          )}
        </div>
      )}

      {/* Worker Info */}
      {worker && (
        <div className="card-base p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Your Worker</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold font-display">
              W
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {worker.userId.toText().slice(0, 12)}…
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-chart-4 text-chart-4" />
                <span>
                  {worker.averageRating.toFixed(1)} ·{" "}
                  {String(worker.completedJobsCount)} jobs completed
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>Contact via app</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card-base p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4">Job Timeline</h3>
        <div className="relative pl-0">
          {timelineSteps.map((step) => (
            <div key={step.label} className="flex items-start gap-3 relative">
              {timelineSteps.indexOf(step) < timelineSteps.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 w-px h-5 ${step.done ? "bg-accent/50" : "bg-border"}`}
                />
              )}
              <TimelineStep
                label={step.label}
                date={step.date}
                done={step.done}
                active={step.active}
              />
            </div>
          ))}
        </div>

        {/* Confirmation status */}
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-3">
          <div
            className={`flex items-center gap-2 text-xs p-2 rounded-lg ${job.workerConfirmed ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Worker: {job.workerConfirmed ? "Confirmed" : "Pending"}
          </div>
          <div
            className={`flex items-center gap-2 text-xs p-2 rounded-lg ${job.homeownerConfirmed ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            You: {job.homeownerConfirmed ? "Confirmed" : "Pending"}
          </div>
        </div>
      </div>

      {/* Photos */}
      {job.photoRefs.length > 0 && (
        <div className="card-base p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3">Job Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {job.photoRefs.map((ref) => (
              <img
                key={ref}
                src={ref}
                alt="Attached file"
                className="w-full aspect-square object-cover rounded-lg border border-border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pb-8">
        {canConfirm && (
          <Button
            data-ocid="confirm-completion-btn"
            className="w-full btn-accent h-12 text-base font-semibold gap-2"
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            Confirm Completion & Release Payment
          </Button>
        )}

        {job.status === "Completed" && !showTipModal && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/30 text-accent">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">
              Job completed! Payment has been released.
            </span>
          </div>
        )}

        <div className="flex gap-3">
          {canDispute && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-ocid="dispute-btn"
                  variant="outline"
                  className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                  disabled={disputeMutation.isPending}
                >
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  Dispute
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>File a Dispute?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will flag the job for review by our team. Payment will
                    be held until the dispute is resolved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disputeMutation.mutate()}
                    className="bg-destructive text-destructive-foreground"
                  >
                    File Dispute
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-ocid="cancel-job-btn"
                  variant="outline"
                  className="flex-1"
                  disabled={cancelMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Cancel Job
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cancelling will refund your escrow payment. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Job</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelMutation.mutate()}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Cancel Job
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={() => navigate({ to: "/homeowner/dashboard" })}
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Back to Dashboard
        </Button>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <TipModal
          job={job}
          onClose={() => setShowTipModal(false)}
          onSubmit={handleTipSubmit}
        />
      )}
    </div>
  );
}
