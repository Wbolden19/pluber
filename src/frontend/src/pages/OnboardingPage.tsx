import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronLeft,
  FileText,
  Home,
  MapPin,
  Shield,
  Upload,
  User,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import type { ServiceCategory } from "../backend.d.ts";
import { useBackend } from "../hooks/useBackend";
import { SERVICE_CATEGORIES, type UserRole } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OnboardingFormData {
  role: UserRole;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  serviceCategories: string[];
  serviceRadius: number;
  idDocName: string;
  insuranceDocName: string;
  latitude: number;
  longitude: number;
  waiverAgreed: boolean;
  digitalSignature: string;
}

const WAIVER_VERSION = "v1.0.0";
const STEPS = ["Role", "Profile", "Waiver", "Done"];

// ─── Step 1: Role Selection ───────────────────────────────────────────────────

function RoleStep() {
  const { setValue, watch } = useFormContext<OnboardingFormData>();
  const selected = watch("role");

  const roles: {
    value: UserRole;
    icon: React.ReactElement;
    title: string;
    desc: string;
  }[] = [
    {
      value: "homeowner",
      icon: <Home className="w-7 h-7" />,
      title: "Homeowner",
      desc: "Post jobs and hire local pros for lawn, snow, yard work, and more.",
    },
    {
      value: "worker",
      icon: <Wrench className="w-7 h-7" />,
      title: "Worker",
      desc: "Earn money completing jobs in your area on your own schedule.",
    },
    {
      value: "enterprise",
      icon: <Shield className="w-7 h-7" />,
      title: "Enterprise",
      desc: "Dispatch workers at scale for commercial property management.",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        How will you use Pluber?
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        Choose your primary role. You can add more later.
      </p>
      <div className="flex flex-col gap-3">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            data-ocid={`role-card-${r.value}`}
            onClick={() => setValue("role", r.value, { shouldValidate: true })}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-smooth w-full",
              selected === r.value
                ? "border-accent bg-accent/10"
                : "border-border bg-card hover:border-border/80 hover:bg-muted/30",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-smooth",
                selected === r.value
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {r.icon}
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-foreground">
                {r.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {r.desc}
              </p>
            </div>
            {selected === r.value && (
              <CheckCircle2 className="w-5 h-5 text-accent ml-auto shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2a: Homeowner Profile ───────────────────────────────────────────────

function HomeownerProfileStep() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();
  const [locating, setLocating] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude);
        setValue("longitude", pos.coords.longitude);
        toast.success("Location detected!");
        setLocating(false);
      },
      () => {
        toast.error("Could not detect location");
        setLocating(false);
      },
    );
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        Your Home Info
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        We'll use this to match you with nearby workers.
      </p>
      <div className="flex flex-col gap-4">
        <Field label="Full Name" error={errors.fullName?.message}>
          <input
            data-ocid="input-full-name"
            className="field-input"
            placeholder="Jane Smith"
            {...register("fullName", { required: "Full name is required" })}
          />
        </Field>
        <Field label="Street Address" error={errors.address?.message}>
          <input
            data-ocid="input-address"
            className="field-input"
            placeholder="123 Maple St"
            {...register("address", { required: "Address is required" })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" error={errors.city?.message}>
            <input
              data-ocid="input-city"
              className="field-input"
              placeholder="Springfield"
              {...register("city", { required: "City is required" })}
            />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <input
              data-ocid="input-state"
              className="field-input"
              placeholder="IL"
              {...register("state", {
                required: "State is required",
                maxLength: { value: 2, message: "2-letter code" },
              })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ZIP Code" error={errors.zip?.message}>
            <input
              data-ocid="input-zip"
              className="field-input"
              placeholder="62701"
              {...register("zip", {
                required: "ZIP is required",
                pattern: { value: /^\d{5}$/, message: "5-digit ZIP" },
              })}
            />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input
              data-ocid="input-phone"
              className="field-input"
              placeholder="(555) 000-0000"
              {...register("phone", { required: "Phone is required" })}
            />
          </Field>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={detectLocation}
          disabled={locating}
          className="gap-2 w-fit"
          data-ocid="btn-detect-location"
        >
          <MapPin className="w-4 h-4" />
          {locating ? "Detecting…" : "Detect my location"}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2b: Worker Profile ──────────────────────────────────────────────────

function WorkerProfileStep() {
  const { watch, setValue } = useFormContext<OnboardingFormData>();
  const selected = watch("serviceCategories") ?? [];
  const radius = watch("serviceRadius") ?? 10;
  const idRef = useRef<HTMLInputElement>(null);
  const insRef = useRef<HTMLInputElement>(null);
  const idDocName = watch("idDocName");
  const insuranceDocName = watch("insuranceDocName");

  const toggleCat = (val: string) => {
    setValue(
      "serviceCategories",
      selected.includes(val)
        ? selected.filter((c) => c !== val)
        : [...selected, val],
    );
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        Worker Setup
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        Select your services, set your range, and upload your documents.
      </p>

      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-2">
          Services You Offer
        </p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              data-ocid={`cat-chip-${cat.value}`}
              onClick={() => toggleCat(cat.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-smooth",
                selected.includes(cat.value)
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-muted/50 text-muted-foreground border-border hover:border-accent/50",
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-medium text-foreground mb-1">
          Service Radius:{" "}
          <span className="text-accent font-semibold">{radius} mi</span>
        </p>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={radius}
          data-ocid="input-radius"
          id="input-radius"
          onChange={(e) => setValue("serviceRadius", Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>5 mi</span>
          <span>50 mi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <DocUpload
          label="Government ID"
          hint="Driver's license or state ID"
          icon={<User className="w-4 h-4" />}
          fileName={idDocName}
          ocid="upload-id-doc"
          onPick={() => idRef.current?.click()}
        />
        <input
          ref={idRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) =>
            setValue("idDocName", e.target.files?.[0]?.name ?? "")
          }
        />

        <DocUpload
          label="Proof of Insurance"
          hint="Current insurance certificate"
          icon={<FileText className="w-4 h-4" />}
          fileName={insuranceDocName}
          ocid="upload-insurance-doc"
          onPick={() => insRef.current?.click()}
        />
        <input
          ref={insRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) =>
            setValue("insuranceDocName", e.target.files?.[0]?.name ?? "")
          }
        />
      </div>
    </div>
  );
}

// ─── Step 3: Waiver ───────────────────────────────────────────────────────────

function WaiverStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();
  const agreed = watch("waiverAgreed");

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        Liability Waiver
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Read and sign before continuing.
      </p>

      <div
        className="h-44 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed space-y-3 mb-5"
        data-ocid="waiver-scroll"
      >
        <p>
          <strong className="text-foreground">
            1. No Liability for Injuries or Damages.
          </strong>{" "}
          Pluber LLC ("Pluber") is a technology platform that connects
          homeowners with independent service workers. Pluber is not liable for
          any bodily injury, property damage, theft, or loss arising from jobs
          arranged through the platform. All work is performed by independent
          contractors, not Pluber employees.
        </p>
        <p>
          <strong className="text-foreground">
            2. Independent Contractor Relationship.
          </strong>{" "}
          Workers on Pluber are independent contractors solely responsible for
          their own tools, safety, licensing, and compliance with applicable
          laws. Pluber does not direct, supervise, or control the manner in
          which services are performed and assumes no responsibility for worker
          conduct, quality of work, or accidents occurring on or around job
          sites.
        </p>
        <p>
          <strong className="text-foreground">
            3. User Assumption of Risk.
          </strong>{" "}
          By using Pluber, both homeowners and workers voluntarily assume all
          risks associated with the arrangement and performance of services.
          Users agree to indemnify, defend, and hold harmless Pluber LLC and its
          officers, directors, and employees from any claims, damages, or
          expenses arising from their use of the platform. Disputes between
          homeowners and workers are the sole responsibility of the parties
          involved.
        </p>
      </div>

      <label
        className="flex items-start gap-3 mb-4 cursor-pointer"
        data-ocid="waiver-checkbox-label"
      >
        <input
          type="checkbox"
          {...register("waiverAgreed", { required: true })}
          data-ocid="waiver-checkbox"
          className="mt-0.5 accent-accent w-4 h-4 shrink-0"
        />
        <span
          className={cn(
            "text-sm",
            agreed ? "text-foreground" : "text-muted-foreground",
          )}
        >
          I have read and agree to the Pluber Liability Waiver
        </span>
      </label>

      <Field label="Digital Signature" error={errors.digitalSignature?.message}>
        <input
          data-ocid="input-signature"
          className="field-input font-mono"
          placeholder="Type your full legal name"
          {...register("digitalSignature", {
            required: "Signature is required",
            minLength: { value: 2, message: "Enter your full name" },
          })}
        />
      </Field>
    </div>
  );
}

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────

function ConfirmationStep({
  data,
  onGoToDashboard,
}: {
  data: OnboardingFormData;
  onGoToDashboard: () => void;
}) {
  const roleLabel =
    data.role === "homeowner"
      ? "Homeowner"
      : data.role === "worker"
        ? "Worker"
        : "Enterprise";

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-accent" />
        </div>
      </div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-2">
        You're all set!
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Here's a summary of your account setup.
      </p>

      <div className="bg-muted/30 rounded-xl border border-border p-4 text-left text-sm space-y-2 mb-6">
        <Row label="Role" value={roleLabel} />
        <Row label="Signed as" value={data.digitalSignature} />
        {(data.role === "homeowner" || data.role === "enterprise") && (
          <>
            <Row label="Address" value={data.address} />
            <Row
              label="City / State"
              value={`${data.city}, ${data.state} ${data.zip}`}
            />
            <Row label="Phone" value={data.phone} />
          </>
        )}
        {data.role === "worker" && (
          <>
            <Row
              label="Services"
              value={
                data.serviceCategories.length > 0
                  ? data.serviceCategories.join(", ")
                  : "None selected"
              }
            />
            <Row label="Radius" value={`${data.serviceRadius} miles`} />
            {data.idDocName && <Row label="ID Doc" value={data.idDocName} />}
            {data.insuranceDocName && (
              <Row label="Insurance" value={data.insuranceDocName} />
            )}
          </>
        )}
        <Row label="Waiver" value="Signed ✓" />
      </div>

      <Button
        data-ocid="btn-get-started"
        onClick={onGoToDashboard}
        className="btn-accent w-full text-base py-3 h-auto"
      >
        Get Started →
      </Button>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="block text-sm font-medium text-foreground mb-1">{label}</p>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function DocUpload({
  label,
  hint,
  icon,
  fileName,
  onPick,
  ocid,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  fileName: string;
  onPick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onPick}
      className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-accent/60 bg-muted/20 transition-smooth text-left w-full"
    >
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {fileName || hint}
        </p>
      </div>
      <Upload className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right truncate">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const { actor } = useBackend();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const methods = useForm<OnboardingFormData>({
    defaultValues: {
      role: undefined,
      fullName: "",
      serviceCategories: [],
      serviceRadius: 10,
      waiverAgreed: false,
      latitude: 0,
      longitude: 0,
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      idDocName: "",
      insuranceDocName: "",
      digitalSignature: "",
    },
  });

  const { handleSubmit, watch, trigger, getValues } = methods;
  const role = watch("role");

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 0) {
      if (!role) {
        toast.error("Please select a role");
        return false;
      }
      return true;
    }
    if (currentStep === 1) {
      if (role === "homeowner" || role === "enterprise") {
        return trigger([
          "fullName",
          "address",
          "city",
          "state",
          "zip",
          "phone",
        ]);
      }
      if (role === "worker") {
        const cats = getValues("serviceCategories");
        if (!cats || cats.length === 0) {
          toast.error("Select at least one service category");
          return false;
        }
        return true;
      }
    }
    if (currentStep === 2) {
      if (!getValues("waiverAgreed")) {
        toast.error("You must agree to the liability waiver");
        return false;
      }
      return trigger("digitalSignature");
    }
    return true;
  };

  const handleNext = async () => {
    if (await validateCurrentStep()) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => setCurrentStep((s) => Math.max(0, s - 1));

  const onSubmit = async (data: OnboardingFormData) => {
    if (!actor) {
      toast.error("Backend not ready. Please try again.");
      return;
    }
    setSubmitting(true);
    try {
      const lat = data.latitude ?? 0;
      const lng = data.longitude ?? 0;
      if (data.role === "worker") {
        await actor.registerWorker({
          latitude: lat,
          longitude: lng,
          serviceCategories: data.serviceCategories.map(
            (c) => c as ServiceCategory,
          ),
          idDocRef: data.idDocName || undefined,
          insuranceDocRef: data.insuranceDocName || undefined,
        });
      } else {
        const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`;
        await actor.registerHomeowner({
          latitude: lat,
          longitude: lng,
          address: fullAddress,
        });
      }
      await actor.acceptLiabilityWaiver(WAIVER_VERSION);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goToDashboard = () => {
    const r = getValues("role");
    if (r === "worker") navigate({ to: "/worker/dashboard" });
    else if (r === "enterprise") navigate({ to: "/enterprise/dashboard" });
    else navigate({ to: "/homeowner/dashboard" });
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-elevated p-8">
          <ConfirmationStep
            data={getValues()}
            onGoToDashboard={goToDashboard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
          {/* Header + Progress */}
          <div className="bg-muted/30 border-b border-border px-6 py-5">
            <h1 className="text-lg font-display font-bold text-foreground mb-4">
              Set Up Your Pluber Account
            </h1>
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-smooth",
                        i < currentStep
                          ? "bg-accent border-accent text-accent-foreground"
                          : i === currentStep
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted border-border text-muted-foreground",
                      )}
                    >
                      {i < currentStep ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium hidden sm:block",
                        i === currentStep
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-1 transition-smooth",
                        i < currentStep ? "bg-accent" : "bg-border",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="px-6 py-6">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep === 0 && <RoleStep />}
                    {currentStep === 1 &&
                      (role === "worker" ? (
                        <WorkerProfileStep />
                      ) : (
                        <HomeownerProfileStep />
                      ))}
                    {currentStep === 2 && <WaiverStep />}
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 0 || submitting}
                    className="gap-1.5"
                    data-ocid="btn-back"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                  {currentStep < 2 ? (
                    <Button
                      type="button"
                      data-ocid="btn-next-step"
                      onClick={handleNext}
                      disabled={currentStep === 0 && !role}
                      className="btn-accent min-w-28"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      data-ocid="btn-submit-onboarding"
                      disabled={submitting}
                      className="btn-accent min-w-36"
                    >
                      {submitting ? "Creating account…" : "Complete Setup"}
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          By creating an account, you agree to Pluber's Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </div>
  );
}
