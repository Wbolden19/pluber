import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { OnboardingFormData } from "../OnboardingPage";

export function HomeownerProfileStep() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
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
        setGeoError(
          "Unable to detect location. Please enter address manually.",
        );
        setGeoLoading(false);
      },
    );
  };

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setValueRef.current("latitude", pos.coords.latitude);
        setValueRef.current("longitude", pos.coords.longitude);
      },
      () => {
        setGeoError(
          "Unable to detect location. Please enter address manually.",
        );
      },
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Your Home Address
        </h2>
        <p className="text-muted-foreground text-sm">
          This helps workers find jobs near them. Your exact location stays
          private.
        </p>
      </div>

      {/* Geolocation banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Auto-detect location
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {geoLoading
              ? "Detecting your location…"
              : geoError
                ? geoError
                : "Location detected. Coordinates will be saved with your profile."}
          </p>
        </div>
        {geoLoading ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={requestGeolocation}
            className="text-primary text-xs h-7 px-2"
          >
            Retry
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm font-medium">
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            data-ocid="input-address"
            placeholder="123 Main Street"
            {...register("address", {
              required: "Street address is required",
            })}
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && (
            <p className="text-destructive text-xs">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              data-ocid="input-city"
              placeholder="Springfield"
              {...register("city", { required: "City is required" })}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-destructive text-xs">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-sm font-medium">
              State <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              data-ocid="input-state"
              placeholder="IL"
              maxLength={2}
              {...register("state", {
                required: "State is required",
                minLength: { value: 2, message: "Enter 2-letter state code" },
              })}
              className={`uppercase ${errors.state ? "border-destructive" : ""}`}
            />
            {errors.state && (
              <p className="text-destructive text-xs">{errors.state.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="zip" className="text-sm font-medium">
              ZIP Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zip"
              data-ocid="input-zip"
              placeholder="62701"
              {...register("zip", {
                required: "ZIP code is required",
                pattern: {
                  value: /^\d{5}(-\d{4})?$/,
                  message: "Invalid ZIP code",
                },
              })}
              className={errors.zip ? "border-destructive" : ""}
            />
            {errors.zip && (
              <p className="text-destructive text-xs">{errors.zip.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              data-ocid="input-phone"
              type="tel"
              placeholder="(555) 000-0000"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[\d\s\-().+]{7,20}$/,
                  message: "Enter a valid phone number",
                },
              })}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-destructive text-xs">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
