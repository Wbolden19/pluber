import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertTriangle, ScrollText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { OnboardingFormData } from "../OnboardingPage";

const WAIVER_TEXT = `PLUBER PLATFORM LIABILITY WAIVER AND RELEASE AGREEMENT

Effective Date: Upon acceptance

PLEASE READ THIS AGREEMENT CAREFULLY BEFORE PROCEEDING. BY ACCEPTING, YOU AGREE TO BE LEGALLY BOUND BY THESE TERMS.

1. NATURE OF PLATFORM
Pluber is a technology platform that connects homeowners seeking home services ("Homeowners") with independent service providers ("Workers"). Pluber acts solely as an intermediary marketplace and does not employ, supervise, or control Workers.

2. INDEPENDENT CONTRACTOR STATUS
All Workers on the Pluber platform are independent contractors, not employees, agents, or representatives of Pluber, Inc. Pluber does not direct, control, or supervise the manner in which Workers perform services.

3. ASSUMPTION OF RISK
Both Homeowners and Workers acknowledge and agree that:
(a) Home services involve inherent risks, including but not limited to property damage, personal injury, and accidents.
(b) Workers enter private residential and commercial properties at their own risk.
(c) Homeowners allow Workers onto their property at their own risk.
(d) All parties assume full responsibility for any risks associated with the services performed.

4. RELEASE OF LIABILITY
TO THE FULLEST EXTENT PERMITTED BY LAW, YOU HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE Pluber, Inc., its officers, directors, employees, agents, licensors, and successors (collectively "Pluber Parties") from any and all claims, demands, damages, losses, costs, and expenses of every kind, whether known or unknown, arising out of or relating to:
(a) Any personal injury, death, or property damage sustained by you or any third party during or in connection with any service performed through the Pluber platform;
(b) Any acts, omissions, negligence, or misconduct of any Worker or Homeowner;
(c) Any disputes between Homeowners and Workers;
(d) Any failure of equipment, tools, or materials used in the performance of services.

5. INDEMNIFICATION
You agree to indemnify, defend, and hold harmless the Pluber Parties from any claims, losses, liability, costs, and expenses (including reasonable attorneys' fees) arising from your use of the platform, your violation of this Agreement, or your violation of any rights of another party.

6. INSURANCE REQUIREMENTS
Workers are encouraged to maintain adequate general liability insurance. Pluber does not provide workers' compensation, liability, or any other insurance coverage for Workers or Homeowners. Each party is responsible for maintaining appropriate insurance coverage.

7. GOVERNING LAW
This Agreement is governed by the laws of the State of Delaware, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration.

8. ENTIRE AGREEMENT
This waiver constitutes the entire agreement between the parties with respect to liability and supersedes all prior negotiations, representations, or agreements relating to the subject matter hereof.

By accepting this waiver, you confirm that:
• You are at least 18 years of age
• You have read and understood this agreement
• You are voluntarily agreeing to its terms
• You acknowledge Pluber bears no liability for injuries or damages during service

This waiver is legally binding and may not be revoked after acceptance.`;

export function WaiverStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const waiverScrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const waiverAgreed = watch("waiverAgreed");

  const handleScroll = () => {
    const el = waiverScrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) setHasScrolled(true);
  };

  useEffect(() => {
    const el = waiverScrollRef.current;
    if (!el) return;
    // Allow acceptance if content is short enough
    if (el.scrollHeight <= el.clientHeight + 40) setHasScrolled(true);
  }, []);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Liability Waiver
        </h2>
        <p className="text-muted-foreground text-sm">
          Please read the full agreement. Scroll to the bottom to enable
          acceptance.
        </p>
      </div>

      {/* Waiver scroll box */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <ScrollText className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pluber Platform Agreement
          </span>
        </div>
        <div
          ref={waiverScrollRef}
          onScroll={handleScroll}
          data-ocid="waiver-scroll"
          className="h-56 overflow-y-auto rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono"
        >
          {WAIVER_TEXT}
        </div>
        {!hasScrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent rounded-b-lg pointer-events-none flex items-end justify-center pb-2">
            <span className="text-xs text-muted-foreground animate-bounce">
              ↓ Scroll to read
            </span>
          </div>
        )}
      </div>

      {/* Consent checkbox */}
      <div
        className={cn(
          "rounded-lg border p-4 transition-smooth",
          !hasScrolled
            ? "opacity-50 pointer-events-none border-border bg-muted/10"
            : waiverAgreed
              ? "border-accent bg-accent/10"
              : "border-border bg-card",
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id="waiver-agree"
            data-ocid="checkbox-waiver"
            checked={waiverAgreed ?? false}
            onCheckedChange={(checked) =>
              setValue("waiverAgreed", checked === true, {
                shouldValidate: true,
              })
            }
            disabled={!hasScrolled}
            className="mt-0.5"
          />
          <Label
            htmlFor="waiver-agree"
            className="text-sm text-foreground leading-relaxed cursor-pointer"
          >
            I agree that{" "}
            <strong className="text-foreground">
              Pluber is not liable for any injuries or damages during service
            </strong>
            . By accepting, I acknowledge this agreement and confirm I have read
            and understood the full liability waiver above.
          </Label>
        </div>
        {(errors as { waiverAgreed?: { message?: string } }).waiverAgreed && (
          <p className="text-destructive text-xs mt-2 ml-7">
            {
              (errors as { waiverAgreed?: { message?: string } }).waiverAgreed
                ?.message
            }
          </p>
        )}
      </div>

      {/* Digital signature */}
      <div className="space-y-1.5">
        <Label htmlFor="signature" className="text-sm font-medium">
          Digital Signature{" "}
          <span className="text-muted-foreground font-normal">
            (type your full name)
          </span>{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="signature"
          data-ocid="input-signature"
          placeholder="Jane Smith"
          disabled={!waiverAgreed}
          {...register("digitalSignature", {
            required: "Digital signature is required",
            minLength: {
              value: 2,
              message: "Please enter your full name",
            },
          })}
          className={cn(
            "font-mono italic text-lg tracking-wide",
            errors.digitalSignature ? "border-destructive" : "",
            !waiverAgreed ? "opacity-50" : "",
          )}
        />
        {errors.digitalSignature && (
          <p className="text-destructive text-xs">
            {errors.digitalSignature.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          By typing your name above, you are providing a legally binding
          electronic signature.
        </p>
      </div>

      {/* Legal note */}
      <div className="flex gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          This agreement is legally binding. If you do not agree, you may not
          use the Pluber platform.
        </p>
      </div>
    </div>
  );
}
