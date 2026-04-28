import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, Loader2, MapPin, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { SERVICE_CATEGORIES } from "../../types";
import type { OnboardingFormData } from "../OnboardingPage";

interface FileUploadFieldProps {
  id: string;
  label: string;
  required?: boolean;
  onFileSelect: (name: string) => void;
  error?: string;
}

function FileUploadField({
  id,
  label,
  required,
  onFileSelect,
  error,
}: FileUploadFieldProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    onFileSelect(file.name);
    // Simulate brief processing
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </p>
      <label
        htmlFor={id}
        data-ocid={`upload-${id}`}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 cursor-pointer transition-smooth flex items-center gap-3",
          error
            ? "border-destructive bg-destructive/5"
            : fileName
              ? "border-accent bg-accent/10"
              : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleChange}
        />
        {loading ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
        ) : fileName ? (
          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
        ) : (
          <Upload className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {fileName ? (
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm font-medium truncate text-foreground">
                {fileName}
              </span>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">
                Click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, or PNG — max 10MB
              </p>
            </div>
          )}
        </div>
        {fileName && !loading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setFileName(null);
              onFileSelect("");
            }}
            className="text-muted-foreground h-7 px-2 text-xs hover:text-destructive"
          >
            Remove
          </Button>
        )}
      </label>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

export function WorkerProfileStep() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;

  const selectedCategories = useWatch<OnboardingFormData, "serviceCategories">({
    name: "serviceCategories",
    defaultValue: [],
  }) as string[];

  const radius = useWatch<OnboardingFormData, "serviceRadius">({
    name: "serviceRadius",
    defaultValue: 10,
  }) as number;

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude);
        setValue("longitude", pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoError("Could not detect location.");
        setGeoLoading(false);
      },
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValueRef.current("latitude", pos.coords.latitude);
        setValueRef.current("longitude", pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoError("Could not detect location.");
        setGeoLoading(false);
      },
    );
    setValueRef.current("serviceRadius", 10);
  }, []);

  const toggleCategory = (val: string) => {
    const next = selectedCategories.includes(val)
      ? selectedCategories.filter((c) => c !== val)
      : [...selectedCategories, val];
    setValue("serviceCategories", next, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Your Worker Profile
        </h2>
        <p className="text-muted-foreground text-sm">
          Tell us your skills and service area. You'll only see jobs you can
          handle.
        </p>
      </div>

      {/* Location detect */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border text-sm">
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="flex-1 text-muted-foreground">
          {geoLoading
            ? "Detecting location…"
            : geoError
              ? geoError
              : "Location detected for job matching"}
        </span>
        {geoLoading ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <button
            type="button"
            onClick={requestGeolocation}
            className="text-primary text-xs hover:underline"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Service categories */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Service Categories <span className="text-destructive">*</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Select all services you offer. You won't see jobs outside your
          selections.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {SERVICE_CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat.value);
            return (
              <button
                key={cat.value}
                type="button"
                data-ocid={`category-${cat.value}`}
                onClick={() => toggleCategory(cat.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-smooth",
                  active
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
        {(errors as { serviceCategories?: { message?: string } })
          .serviceCategories && (
          <p className="text-destructive text-xs">
            {
              (errors as { serviceCategories?: { message?: string } })
                .serviceCategories?.message
            }
          </p>
        )}
      </div>

      {/* Service radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Service Radius</p>
          <span className="text-sm font-semibold text-primary">
            {radius} miles
          </span>
        </div>
        <Slider
          data-ocid="slider-radius"
          min={5}
          max={50}
          step={1}
          value={[radius]}
          onValueChange={([v]) => setValue("serviceRadius", v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 mi</span>
          <span className="text-center text-xs text-muted-foreground/70">
            Radius grows with completed jobs (max 50 mi)
          </span>
          <span>50 mi</span>
        </div>
      </div>

      {/* Document uploads */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            Required Documents
          </p>
          <p className="text-xs text-muted-foreground">
            These are reviewed for your safety and our users'. Processing takes
            1–2 business days.
          </p>
        </div>
        <FileUploadField
          id="id-document"
          label="Government-Issued ID"
          required
          onFileSelect={(name) => setValue("idDocName", name)}
          error={
            (errors as { idDocName?: { message?: string } }).idDocName?.message
          }
        />
        <FileUploadField
          id="insurance-document"
          label="Proof of Insurance"
          required
          onFileSelect={(name) => setValue("insuranceDocName", name)}
          error={
            (errors as { insuranceDocName?: { message?: string } })
              .insuranceDocName?.message
          }
        />
      </div>
    </div>
  );
}
