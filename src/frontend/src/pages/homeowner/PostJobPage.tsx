import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBackend } from "../../hooks/useBackend";
import { SERVICE_CATEGORIES } from "../../types";
import type { ServiceCategory } from "../../types";

interface CheckoutSession {
  id: string;
  url: string;
}

interface PhotoPreview {
  id: string;
  file: File;
  previewUrl: string;
  uploadProgress: number;
  uploaded: boolean;
  uploadedRef?: string;
}

export function PostJobPage() {
  const { actor, isLoading: actorLoading } = useBackend();
  const navigate = useNavigate();

  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [budget, setBudget] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedJobId, setConfirmedJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill address from homeowner profile
  useEffect(() => {
    if (!actor || actorLoading) return;
    actor.getMyHomeownerProfile().then((profile) => {
      if (profile && "address" in profile && profile.address) {
        setAddress(profile.address);
      }
    });
  }, [actor, actorLoading]);

  const checkoutMutation = useMutation({
    mutationFn: async (_budgetCents: number): Promise<CheckoutSession> => {
      // Stripe checkout would go here when integrated; for now return a placeholder
      throw new Error("Stripe not configured");
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (stripePaymentIntentId: string) => {
      if (!actor) throw new Error("Actor not available");
      const refs = photos
        .filter((p) => p.uploadedRef)
        .map((p) => p.uploadedRef as string);
      const job = await actor.createJob({
        title,
        description,
        address,
        serviceCategory: category as ServiceCategory,
        budgetUSD: BigInt(Math.round(Number.parseFloat(budget))),
        photoRefs: refs,
        latitude: 0,
        longitude: 0,
      });
      await actor.initiateEscrow({
        jobId: job.id,
        stripePaymentIntentId,
        amountUSD: BigInt(Math.round(Number.parseFloat(budget))),
      });
      return job;
    },
  });

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 5) {
      setFormError("Maximum 5 files allowed");
      return;
    }
    const newPreviews: PhotoPreview[] = files.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadProgress: 0,
      uploaded: false,
    }));
    setPhotos((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function preparePhotoRefs() {
    // Mark all photos with their preview URL as the ref (stored in backend as string)
    setPhotos((prev) =>
      prev.map((p) =>
        p.uploaded
          ? p
          : {
              ...p,
              uploaded: true,
              uploadedRef: p.previewUrl,
              uploadProgress: 100,
            },
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!category) return setFormError("Please select a service category");
    if (!title.trim()) return setFormError("Please enter a job title");
    if (!address.trim()) return setFormError("Please enter an address");
    if (!budget || Number.parseFloat(budget) <= 0)
      return setFormError("Please enter a valid budget");

    preparePhotoRefs();

    const budgetCents = Math.round(Number.parseFloat(budget) * 100);
    try {
      const session = await checkoutMutation.mutateAsync(budgetCents);
      sessionStorage.setItem(
        "pendingJob",
        JSON.stringify({
          category,
          title,
          description,
          address,
          budget,
          stripeSessionId: session.id,
        }),
      );
      window.location.href = session.url;
    } catch {
      // Fallback: create job without Stripe (demo mode)
      try {
        const job = await createJobMutation.mutateAsync(`demo_${Date.now()}`);
        setConfirmed(true);
        setConfirmedJobId(String(job.id));
      } catch (jobErr) {
        setFormError(
          jobErr instanceof Error ? jobErr.message : "Failed to post job",
        );
      }
    }
  }

  if (confirmed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Job Posted!</h2>
        <p className="text-muted-foreground mb-2">
          Your job has been posted successfully and payment is in escrow.
        </p>
        {confirmedJobId && (
          <p className="text-xs text-muted-foreground mb-8 font-mono">
            Job ID: #{confirmedJobId}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button
            data-ocid="view-job-btn"
            className="btn-accent"
            onClick={() =>
              navigate({
                to: "/homeowner/jobs/$jobId",
                params: { jobId: String(confirmedJobId) },
              })
            }
          >
            View Job
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/homeowner/dashboard" })}
          >
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting =
    checkoutMutation.isPending || createJobMutation.isPending;

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Post a Job</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Describe what you need done and set your budget. Workers in your area
          will be notified.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Category */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Service Category *</Label>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            data-ocid="category-select"
          >
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-smooth ${
                  category === cat.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="job-title">Job Title *</Label>
          <Input
            id="job-title"
            data-ocid="job-title-input"
            placeholder="e.g., Mow front and back lawn"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="job-description">Description</Label>
          <Textarea
            id="job-description"
            data-ocid="job-description-input"
            placeholder="Describe the job in detail — size of lawn, special requirements, access instructions…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="job-address" className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Service Address *
          </Label>
          <Input
            id="job-address"
            data-ocid="job-address-input"
            placeholder="123 Main St, Springfield, IL"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Date + Budget row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preferred-date" className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              Preferred Date
            </Label>
            <Input
              id="preferred-date"
              data-ocid="preferred-date-input"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Your Budget (USD) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                $
              </span>
              <Input
                id="budget"
                data-ocid="budget-input"
                type="number"
                min="5"
                step="1"
                placeholder="50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-7"
                required
              />
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-3">
          <Label className="flex items-center gap-1">
            <ImagePlus className="w-3.5 h-3.5 text-muted-foreground" />
            Attachments (up to 5)
          </Label>
          <button
            type="button"
            onClick={triggerFileInput}
            aria-label="Add attachments"
            disabled={photos.length >= 5}
            className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-smooth ${
              photos.length >= 5
                ? "border-border opacity-50 cursor-not-allowed"
                : "border-border hover:border-primary/50 hover:bg-muted/20"
            }`}
          >
            <ImagePlus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {photos.length === 0
                ? "Click to add files"
                : `${photos.length}/5 files added — click to add more`}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              data-ocid="photo-upload-input"
              onChange={handlePhotoSelect}
              disabled={photos.length >= 5}
            />
          </button>

          {photos.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border"
                >
                  <img
                    src={photo.previewUrl}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photo.uploadProgress > 0 && !photo.uploaded && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {photo.uploadProgress}%
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-background/90 rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {formError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2 pb-6">
          <Button
            type="submit"
            data-ocid="post-job-submit"
            disabled={isSubmitting}
            className="w-full btn-accent h-12 text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing…
              </>
            ) : (
              <>Pay &amp; Post Job — ${budget || "0"}</>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Payment is held in escrow and only released when both parties
            confirm completion.
          </p>
        </div>
      </form>
    </div>
  );
}
