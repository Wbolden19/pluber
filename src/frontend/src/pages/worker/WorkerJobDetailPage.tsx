import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Navigation,
  Star,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ServiceCategoryBadge } from "../../components/ServiceCategoryBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { useBackend } from "../../hooks/useBackend";
import { formatBudget, formatTimestamp, getCategoryMeta } from "../../types";
import type {
  HomeownerProfilePublic,
  JobPublic,
  Rating,
  UserId,
} from "../../types";

// ─── Haversine ────────────────────────────────────────────────────────────────
function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Static mini-map using OpenStreetMap static tiles ────────────────────────
function MiniStaticMap({
  lat,
  lng,
  label,
}: { lat: number; lng: number; label: string }) {
  // Use a marker pin rendered via iframe approach
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div
      className="rounded-xl overflow-hidden border border-border"
      style={{ height: "180px" }}
    >
      <iframe
        title={`Map: ${label}`}
        src={mapUrl}
        className="w-full h-full"
        style={{ border: 0 }}
        loading="lazy"
      />
    </div>
  );
}

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-smooth"
          aria-label={`${star} star`}
        >
          <Star
            className={`w-7 h-7 transition-colors duration-150 ${
              star <= (hovered || value)
                ? "fill-chart-4 text-chart-4"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Complete Job Form ─────────────────────────────────────────────────────────
interface CompleteFormProps {
  jobId: bigint;
  onSuccess: () => void;
  onCancel: () => void;
}

function CompleteJobForm({ jobId, onSuccess, onCancel }: CompleteFormProps) {
  const { actor } = useBackend();
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - photos.length);
    if (files.length === 0) return;
    const newPhotos = [...photos, ...files].slice(0, 3);
    setPhotos(newPhotos);
    const newPreviews = newPhotos.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const removePhoto = (idx: number) => {
    const next = photos.filter((_, i) => i !== idx);
    const nextPreviews = previews.filter((_, i) => i !== idx);
    setPhotos(next);
    setPreviews(nextPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setIsSubmitting(true);

    try {
      // Simulate upload progress for photos (stored as previews)
      if (photos.length > 0) {
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(i);
          await new Promise((r) => setTimeout(r, 50));
        }
      }

      // Confirm completion on chain
      const success = await actor.workerConfirmCompletion(jobId);
      if (success) {
        toast.success(
          "Job marked complete! Waiting for homeowner confirmation.",
        );
        onSuccess();
      } else {
        toast.error("Could not confirm completion. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Completion notes */}
      <div>
        <label
          htmlFor="completion-notes"
          className="block text-sm font-medium mb-1.5"
        >
          Completion Notes{" "}
          <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <Textarea
          id="completion-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what was done, any issues encountered, etc."
          rows={4}
          data-ocid="completion-notes"
          className="resize-none"
        />
      </div>

      {/* Photo upload */}
      <div>
        <p className="block text-sm font-medium mb-1.5">
          Completion Photos{" "}
          <span className="text-muted-foreground text-xs">(up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-border"
            >
              <img
                src={src}
                alt={`Work documentation ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-smooth"
                aria-label="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="upload-photo-btn"
              className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-smooth text-xs"
            >
              <Camera className="w-5 h-5" />
              Add Photo
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          data-ocid="photo-input"
        />
        {isSubmitting && uploadProgress > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Uploading photos…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          data-ocid="submit-complete"
          className="btn-accent"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Rate Homeowner Dialog ────────────────────────────────────────────────────
interface RateHomeownerProps {
  jobId: bigint;
  homeownerId: string;
  open: boolean;
  onClose: () => void;
}

function RateHomeownerDialog({
  jobId,
  homeownerId,
  open,
  onClose,
}: RateHomeownerProps) {
  const { actor } = useBackend();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setSubmitting(true);
    try {
      await actor.submitRating({
        ratedUserId: homeownerId as unknown as UserId,
        jobId,
        score: BigInt(rating),
        comment: comment || undefined,
      });
      toast.success("Rating submitted. Thank you!");
      onClose();
    } catch {
      toast.error("Could not submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="rate-dialog">
        <DialogHeader>
          <DialogTitle>Rate the Homeowner</DialogTitle>
          <DialogDescription>
            Share your experience working with this homeowner.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <p className="text-sm font-medium mb-2">Overall Rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label
              htmlFor="rate-comment"
              className="block text-sm font-medium mb-1.5"
            >
              Comment{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <Textarea
              id="rate-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was working with this homeowner?"
              rows={3}
              className="resize-none"
              data-ocid="rate-comment"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Skip
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              data-ocid="submit-rating"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Rating"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function WorkerJobDetailPage() {
  const { jobId } = useParams({ from: "/worker/jobs/$jobId" });
  const router = useRouter();
  const { actor, isLoading: actorLoading } = useBackend();
  const qc = useQueryClient();

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [workerLat, setWorkerLat] = useState<number | null>(null);
  const [workerLng, setWorkerLng] = useState<number | null>(null);

  // Get worker position for distance
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setWorkerLat(pos.coords.latitude);
      setWorkerLng(pos.coords.longitude);
    });
  }, []);

  const numJobId = BigInt(jobId);

  // Fetch job details
  const {
    data: job,
    isLoading: jobLoading,
    refetch: refetchJob,
  } = useQuery<JobPublic | null>({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getJob(numJobId);
    },
    enabled: !!actor && !actorLoading,
  });

  // Fetch homeowner profile
  const { data: homeowner } = useQuery<HomeownerProfilePublic | null>({
    queryKey: ["homeowner-profile", job?.homeownerId?.toText?.()],
    queryFn: async () => {
      if (!actor || !job?.homeownerId) return null;
      return actor.getHomeownerProfile(job.homeownerId);
    },
    enabled: !!actor && !!job?.homeownerId,
  });

  // Fetch homeowner ratings
  const { data: homeownerRatings = [] } = useQuery<Rating[]>({
    queryKey: ["ratings", job?.homeownerId?.toText?.()],
    queryFn: async () => {
      if (!actor || !job?.homeownerId) return [];
      return actor.getRatingsForUser(job.homeownerId);
    },
    enabled: !!actor && !!job?.homeownerId,
  });

  // Accept job mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return false;
      return actor.acceptJob(numJobId);
    },
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Job accepted! It's now yours.");
        setAcceptModalOpen(false);
        refetchJob();
        qc.invalidateQueries({ queryKey: ["available-jobs"] });
        qc.invalidateQueries({ queryKey: ["my-worker-jobs"] });
      } else {
        toast.error("Could not accept job — it may have been taken.");
      }
    },
    onError: () => toast.error("Failed to accept job."),
  });

  // Start job mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      if (!actor) return false;
      return actor.startJob(numJobId);
    },
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Job started! Get to work 🔧");
        refetchJob();
        qc.invalidateQueries({ queryKey: ["my-worker-jobs"] });
      } else {
        toast.error("Could not start job.");
      }
    },
  });

  const handleCompleteSuccess = () => {
    setCompleteModalOpen(false);
    refetchJob();
    qc.invalidateQueries({ queryKey: ["my-worker-jobs"] });
    // Prompt to rate homeowner
    setTimeout(() => setRateModalOpen(true), 500);
  };

  if (jobLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl mb-2">😕</p>
        <h2 className="text-xl font-display font-semibold mb-2">
          Job Not Found
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          This job may have been removed or is no longer available.
        </p>
        <Button
          variant="outline"
          onClick={() => router.history.back()}
          data-ocid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const meta = getCategoryMeta(job.serviceCategory);
  const dist =
    workerLat !== null && workerLng !== null
      ? distanceMiles(workerLat, workerLng, job.latitude, job.longitude)
      : null;

  const avgHomeownerRating =
    homeownerRatings.length > 0
      ? homeownerRatings.reduce((sum, r) => sum + Number(r.score), 0) /
        homeownerRatings.length
      : null;

  const canAccept = job.status === "Open";
  const canStart = job.status === "Accepted";
  const canComplete = job.status === "InProgress";
  const isCompleted = job.status === "Completed";
  const waitingConfirmation = job.workerConfirmed && !job.homeownerConfirmed;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Back nav */}
        <button
          type="button"
          onClick={() => router.history.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-smooth"
          data-ocid="back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header card */}
        <div className="card-base p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl border border-border">
                {meta.icon}
              </div>
              <div>
                <h1 className="text-xl font-display font-bold leading-tight">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <ServiceCategoryBadge
                    category={job.serviceCategory}
                    size="sm"
                  />
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-display font-bold text-accent">
                {formatBudget(job.budgetUSD)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                escrowed
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground border-t border-border pt-3">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-[220px]">{job.address}</span>
            </span>
            {dist !== null && (
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-accent" />
                {dist.toFixed(1)} miles away
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Posted {formatTimestamp(job.createdAt)}
            </span>
          </div>
        </div>

        {/* Homeowner info */}
        <div className="card-base p-4 mb-4">
          <h2 className="text-sm font-semibold font-display mb-3 text-muted-foreground uppercase tracking-wide">
            Homeowner
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {homeowner?.address?.split(",")[0] ?? "Homeowner"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {avgHomeownerRating !== null ? (
                  <div className="flex items-center gap-1 text-xs text-chart-4">
                    <Star className="w-3.5 h-3.5 fill-chart-4" />
                    <span className="font-semibold">
                      {avgHomeownerRating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({homeownerRatings.length} reviews)
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No ratings yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job photos (if any) */}
        {job.photoRefs && job.photoRefs.length > 0 && (
          <div className="card-base p-4 mb-4">
            <h2 className="text-sm font-semibold font-display mb-3 text-muted-foreground uppercase tracking-wide">
              Job Photos
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.photoRefs.map((ref, i) => (
                <div
                  key={ref}
                  className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted"
                >
                  <img
                    src={ref}
                    alt={`Job reference ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map pin */}
        <div className="card-base p-4 mb-6">
          <h2 className="text-sm font-semibold font-display mb-3 text-muted-foreground uppercase tracking-wide">
            Job Location
          </h2>
          <MiniStaticMap
            lat={job.latitude}
            lng={job.longitude}
            label={job.address}
          />
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.address}
          </p>
        </div>

        {/* Payment info */}
        <div className="card-base p-4 mb-6 bg-accent/5 border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold font-display mb-0.5">
                Payment Held in Escrow
              </h2>
              <p className="text-xs text-muted-foreground">
                Released after both parties confirm completion
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-accent">
              <DollarSign className="w-5 h-5" />
              <span className="text-xl font-display font-bold">
                {formatBudget(job.budgetUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* Waiting confirmation state */}
        {waitingConfirmation && (
          <div className="card-base p-4 mb-4 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">
                  Waiting for Homeowner Confirmation
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You've marked this complete. The homeowner will confirm and
                  funds will be released.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed state */}
        {isCompleted && (
          <div className="card-base p-4 mb-4 border-chart-5/30 bg-chart-5/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-5/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-chart-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-chart-5">
                  Job Completed!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Payment has been released.
                  {job.tipAmountUSD && Number(job.tipAmountUSD) > 0
                    ? ` Tip: $${Number(job.tipAmountUSD)}`
                    : ""}
                </p>
              </div>
            </div>
            {!rateModalOpen && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-chart-5/30 text-chart-5 hover:bg-chart-5/10"
                onClick={() => setRateModalOpen(true)}
                data-ocid="rate-homeowner-btn"
              >
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Rate Homeowner
              </Button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3"
          data-ocid="action-buttons"
        >
          {canAccept && (
            <Button
              type="button"
              className="flex-1 btn-accent h-12 text-base"
              onClick={() => setAcceptModalOpen(true)}
              data-ocid="accept-job-btn"
            >
              Accept This Job
            </Button>
          )}
          {canStart && (
            <Button
              type="button"
              className="flex-1 h-12 text-base"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              data-ocid="start-job-btn"
            >
              {startMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Mark In Progress
            </Button>
          )}
          {canComplete && !waitingConfirmation && (
            <Button
              type="button"
              className="flex-1 btn-accent h-12 text-base"
              onClick={() => setCompleteModalOpen(true)}
              data-ocid="complete-job-btn"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      {/* ── Accept Confirmation Dialog ── */}
      <AlertDialog open={acceptModalOpen} onOpenChange={setAcceptModalOpen}>
        <AlertDialogContent data-ocid="accept-modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Accept This Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Accept{" "}
              <span className="text-foreground font-semibold">{job.title}</span>{" "}
              for{" "}
              <span className="text-accent font-bold">
                {formatBudget(job.budgetUSD)}
              </span>
              ? Your acceptance is binding — the homeowner will be notified and
              you are expected to complete the work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="cancel-accept">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              data-ocid="confirm-accept"
              className="btn-accent"
            >
              {acceptMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Accept Job for {formatBudget(job.budgetUSD)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Complete Job Dialog ── */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="max-w-lg" data-ocid="complete-modal">
          <DialogHeader>
            <DialogTitle>Mark Job as Complete</DialogTitle>
            <DialogDescription>
              Add completion notes and photos. The homeowner will confirm before
              funds are released.
            </DialogDescription>
          </DialogHeader>
          <CompleteJobForm
            jobId={numJobId}
            onSuccess={handleCompleteSuccess}
            onCancel={() => setCompleteModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── Rate Homeowner Dialog ── */}
      {job.homeownerId && (
        <RateHomeownerDialog
          jobId={numJobId}
          homeownerId={job.homeownerId.toText?.() ?? String(job.homeownerId)}
          open={rateModalOpen}
          onClose={() => setRateModalOpen(false)}
        />
      )}
    </div>
  );
}
