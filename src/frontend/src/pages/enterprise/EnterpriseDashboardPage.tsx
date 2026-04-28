import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  ShieldAlert,
  Star,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../../components/EmptyState";
import { useBackend } from "../../hooks/useBackend";
import {
  SERVICE_CATEGORIES,
  formatBudget,
  formatTimestamp,
  getCategoryMeta,
} from "../../types";
import type {
  EnterpriseDispatchPublic,
  EnterpriseDispatchStatus,
  ServiceCategory,
  WorkerProfilePublic,
} from "../../types";

// ─── Enterprise Tier Badge ───────────────────────────────────────────────────
function EnterpriseBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border 
        bg-amber-500/15 text-amber-400 border-amber-500/30 ${className ?? ""}`}
    >
      <Star className="w-3 h-3 fill-amber-400" />
      Enterprise Tier
    </span>
  );
}

// ─── Dispatch Status Badge ───────────────────────────────────────────────────
const DISPATCH_STATUS_STYLES: Record<string, string> = {
  Open: "bg-accent/15 text-accent border-accent/30",
  InProgress: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

function DispatchStatusBadge({ status }: { status: EnterpriseDispatchStatus }) {
  const style =
    DISPATCH_STATUS_STYLES[status as string] ??
    "bg-muted text-muted-foreground border-border";
  const labels: Record<string, string> = {
    Open: "Open",
    InProgress: "In Progress",
    Completed: "Completed",
    Cancelled: "Cancelled",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${style}`}
    >
      {labels[status as string] ?? (status as string)}
    </span>
  );
}

// ─── Worker Card ─────────────────────────────────────────────────────────────
function WorkerCard({
  worker,
  action,
}: {
  worker: WorkerProfilePublic;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <Users className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">
            {worker.userId.toText().slice(0, 8)}…
          </span>
          {worker.enterpriseTier && (
            <EnterpriseBadge className="text-[10px] px-1.5 py-0.5" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {worker.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            {Number(worker.completedJobsCount)} jobs
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {Number(worker.radiusMiles)} mi radius
          </span>
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Dispatch Detail Modal ────────────────────────────────────────────────────
function DispatchDetailModal({
  dispatch,
  onClose,
}: {
  dispatch: EnterpriseDispatchPublic;
  onClose: () => void;
}) {
  const { actor } = useBackend();
  const qc = useQueryClient();
  const [showWorkerBrowser, setShowWorkerBrowser] = useState(false);
  const catMeta = getCategoryMeta(dispatch.serviceCategory);

  const { data: nearbyWorkers, isLoading: workersLoading } = useQuery<
    WorkerProfilePublic[]
  >({
    queryKey: ["nearbyWorkers", dispatch.id.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const [lat, lng] = [0, 0]; // dispatch address lat/lng not in payload; use 0,0 fallback
      return actor.findNearbyWorkers(lat, lng, dispatch.serviceCategory);
    },
    enabled: !!actor && showWorkerBrowser,
  });

  const assignMutation = useMutation({
    mutationFn: async (workerId: WorkerProfilePublic["userId"]) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignWorkerToDispatch(dispatch.id, workerId);
    },
    onSuccess: () => {
      toast.success("Worker assigned to dispatch");
      qc.invalidateQueries({ queryKey: ["myEnterpriseDispatches"] });
    },
    onError: () => toast.error("Failed to assign worker"),
  });

  const removeMutation = useMutation({
    mutationFn: async (workerId: WorkerProfilePublic["userId"]) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeWorkerFromDispatch(dispatch.id, workerId);
    },
    onSuccess: () => {
      toast.success("Worker removed");
      qc.invalidateQueries({ queryKey: ["myEnterpriseDispatches"] });
    },
    onError: () => toast.error("Failed to remove worker"),
  });

  const statusMutation = useMutation({
    mutationFn: async (status: EnterpriseDispatchStatus) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEnterpriseDispatchStatus(dispatch.id, status);
    },
    onSuccess: () => {
      toast.success("Dispatch status updated");
      qc.invalidateQueries({ queryKey: ["myEnterpriseDispatches"] });
      onClose();
    },
    onError: () => toast.error("Failed to update status"),
  });

  const assignedIds = new Set(dispatch.workerIds.map((id) => id.toText()));
  const availableWorkers =
    nearbyWorkers?.filter(
      (w) => w.enterpriseTier && !assignedIds.has(w.userId.toText()),
    ) ?? [];

  return (
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-display">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${catMeta.color}`}
          >
            {catMeta.icon}
          </span>
          {dispatch.title}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <DispatchStatusBadge status={dispatch.status} />
          <Badge variant="outline" className="text-xs">
            {catMeta.label}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatTimestamp(dispatch.createdAt)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Budget</p>
            <p className="text-lg font-bold font-display text-accent">
              {formatBudget(dispatch.budgetUSD)}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Workers</p>
            <p className="text-lg font-bold font-display">
              {dispatch.workerIds.length}
            </p>
          </div>
        </div>

        {dispatch.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dispatch.description}
          </p>
        )}

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{dispatch.address}</span>
        </div>

        {/* Assigned Workers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Assigned Workers</h4>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setShowWorkerBrowser(!showWorkerBrowser)}
              data-ocid="toggle-worker-browser"
            >
              <UserPlus className="w-3 h-3" />
              Add Worker
            </Button>
          </div>

          {dispatch.workerIds.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No workers assigned yet.
            </p>
          ) : (
            <div className="space-y-2">
              {dispatch.workerIds.map((wId) => (
                <div
                  key={wId.toText()}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm flex-1 font-mono text-xs">
                    {wId.toText().slice(0, 14)}…
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => removeMutation.mutate(wId)}
                    disabled={removeMutation.isPending}
                    data-ocid="remove-worker-btn"
                  >
                    <UserMinus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Worker Browser */}
        {showWorkerBrowser && (
          <div className="border border-border rounded-lg p-3 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Enterprise Workers Near Location
            </p>
            {workersLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : availableWorkers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No available enterprise workers found.
              </p>
            ) : (
              <div className="space-y-2">
                {availableWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.userId.toText()}
                    worker={worker}
                    action={
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-accent/40 text-accent hover:bg-accent/10"
                        onClick={() => assignMutation.mutate(worker.userId)}
                        disabled={assignMutation.isPending}
                        data-ocid="assign-worker-btn"
                      >
                        <UserPlus className="w-3 h-3" />
                        Assign
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-row">
        {(dispatch.status as string) === "Open" && (
          <Button
            variant="outline"
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            onClick={() =>
              statusMutation.mutate("InProgress" as EnterpriseDispatchStatus)
            }
            disabled={statusMutation.isPending}
            data-ocid="start-dispatch-btn"
          >
            {statusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Mark In Progress
          </Button>
        )}
        {(dispatch.status as string) === "InProgress" && (
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() =>
              statusMutation.mutate("Completed" as EnterpriseDispatchStatus)
            }
            disabled={statusMutation.isPending}
            data-ocid="complete-dispatch-btn"
          >
            {statusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Mark Completed
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Create Dispatch Modal ────────────────────────────────────────────────────
function CreateDispatchModal({ onClose }: { onClose: () => void }) {
  const { actor } = useBackend();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    serviceCategory: "" as ServiceCategory | "",
    description: "",
    address: "",
    budgetUSD: "",
  });
  const [createdId, setCreatedId] = useState<bigint | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const budget = Number.parseInt(form.budgetUSD, 10);
      if (Number.isNaN(budget) || budget < 500)
        throw new Error("Minimum budget is $500");
      if (!form.serviceCategory) throw new Error("Select a service category");
      const result = await actor.createEnterpriseDispatch({
        title: form.title,
        serviceCategory: form.serviceCategory as ServiceCategory,
        description: form.description,
        address: form.address,
        budgetUSD: BigInt(budget),
      });
      return result;
    },
    onSuccess: (dispatch) => {
      toast.success("Enterprise dispatch created!");
      setCreatedId(dispatch.id);
      qc.invalidateQueries({ queryKey: ["myEnterpriseDispatches"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create dispatch"),
  });

  if (createdId !== null) {
    return (
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center py-6 gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold mb-1">
              Dispatch Created!
            </h3>
            <p className="text-muted-foreground text-sm">
              Your enterprise dispatch is now live.
            </p>
          </div>
          <div className="bg-muted/40 border border-border rounded-lg px-4 py-2.5 w-full">
            <p className="text-xs text-muted-foreground mb-0.5">Dispatch ID</p>
            <p className="font-mono text-sm font-bold text-accent">
              #{createdId.toString()}
            </p>
          </div>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
            onClick={onClose}
          >
            View My Dispatches
          </Button>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-display flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-400" />
          New Enterprise Dispatch
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm">
            Dispatch Title
          </Label>
          <Input
            id="title"
            placeholder="e.g. Factory Grounds Snow Removal"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            data-ocid="dispatch-title-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Service Category</Label>
          <Select
            value={form.serviceCategory}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, serviceCategory: v as ServiceCategory }))
            }
          >
            <SelectTrigger data-ocid="dispatch-category-select">
              <SelectValue placeholder="Select a service…" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm">
            Location / Address
          </Label>
          <Input
            id="address"
            placeholder="123 Industrial Blvd, Chicago, IL"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            data-ocid="dispatch-address-input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget" className="text-sm">
            Budget (USD, min $500)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <Input
              id="budget"
              type="number"
              min="500"
              placeholder="2500"
              className="pl-7"
              value={form.budgetUSD}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetUSD: e.target.value }))
              }
              data-ocid="dispatch-budget-input"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            15% platform commission applies to enterprise dispatches
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the scope of work, requirements, and any special instructions…"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            data-ocid="dispatch-description-input"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          disabled={
            createMutation.isPending ||
            !form.title ||
            !form.serviceCategory ||
            !form.address ||
            !form.budgetUSD
          }
          onClick={() => createMutation.mutate()}
          data-ocid="create-dispatch-submit"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create Dispatch
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Dispatch Card ────────────────────────────────────────────────────────────
function DispatchCard({
  dispatch,
  onClick,
}: {
  dispatch: EnterpriseDispatchPublic;
  onClick: () => void;
}) {
  const catMeta = getCategoryMeta(dispatch.serviceCategory);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors duration-200 group"
        data-ocid="dispatch-card"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${catMeta.color}`}
            >
              {catMeta.icon}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate font-display">
                {dispatch.title}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{dispatch.address}</span>
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <DispatchStatusBadge status={dispatch.status} />
          <span className="text-xs font-bold text-accent">
            {formatBudget(dispatch.budgetUSD)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {dispatch.workerIds.length} workers
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatTimestamp(dispatch.createdAt)}
          </span>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Access Required Screen ───────────────────────────────────────────────────
function EnterpriseAccessRequired() {
  return (
    <div className="flex-1 flex items-center justify-center py-24 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-9 h-9 text-amber-400" />
        </div>
        <EnterpriseBadge className="mb-4 mx-auto" />
        <h2 className="text-2xl font-display font-bold mb-3">
          Enterprise Access Required
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          The Enterprise Dispatch tier is reserved for verified workers who have
          opted into enterprise contracts. You gain access by reaching the
          following milestones:
        </p>
        <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3 mb-6">
          {[
            {
              icon: "✅",
              label: "Complete 25+ jobs on Pluber",
              done: false,
            },
            {
              icon: "⭐",
              label: "Maintain a 4.5+ average rating",
              done: false,
            },
            {
              icon: "🪪",
              label: "Verified ID & insurance on file",
              done: false,
            },
            {
              icon: "📋",
              label: "Sign the Enterprise Contractor Agreement",
              done: false,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-left">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            Enterprise dispatches carry a{" "}
            <strong>15% platform commission</strong> and connect you with
            business clients needing large-scale or recurring work.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function EnterpriseDashboardPage() {
  const { actor, isLoading: actorLoading } = useBackend();
  const [selectedDispatch, setSelectedDispatch] =
    useState<EnterpriseDispatchPublic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: workerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["myWorkerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyWorkerProfile();
    },
    enabled: !!actor && !actorLoading,
  });

  const { data: myDispatches, isLoading: dispatchesLoading } = useQuery<
    EnterpriseDispatchPublic[]
  >({
    queryKey: ["myEnterpriseDispatches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEnterpriseDispatches();
    },
    enabled: !!actor && !actorLoading && workerProfile?.enterpriseTier === true,
  });

  const { data: enterpriseWorkers, isLoading: workersLoading } = useQuery<
    WorkerProfilePublic[]
  >({
    queryKey: ["enterpriseWorkers"],
    queryFn: async () => {
      if (!actor) return [];
      const allWorkers = await actor.findNearbyWorkers(
        0,
        0,
        "LawnMowing" as ServiceCategory,
      );
      return allWorkers.filter((w) => w.enterpriseTier);
    },
    enabled: !!actor && !actorLoading && workerProfile?.enterpriseTier === true,
  });

  const isLoading = actorLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!workerProfile?.enterpriseTier) {
    return <EnterpriseAccessRequired />;
  }

  return (
    <div className="flex-1 bg-background">
      {/* Hero Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <EnterpriseBadge />
              </div>
              <h1 className="text-2xl font-display font-bold">
                Enterprise Dispatch
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                Manage bulk contracts for business clients. Coordinate multiple
                workers per dispatch with priority assignment and dedicated
                support.
              </p>
            </div>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0 self-start"
              onClick={() => setShowCreateModal(true)}
              data-ocid="new-dispatch-btn"
            >
              <Plus className="w-4 h-4" />
              New Dispatch
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mt-6"
          >
            {[
              {
                label: "Commission",
                value: "15%",
                sub: "per dispatch",
                color: "text-amber-400",
              },
              {
                label: "Active Dispatches",
                value: (myDispatches ?? [])
                  .filter(
                    (d) =>
                      (d.status as string) !== "Completed" &&
                      (d.status as string) !== "Cancelled",
                  )
                  .length.toString(),
                sub: "in progress",
                color: "text-primary",
              },
              {
                label: "Enterprise Workers",
                value: (enterpriseWorkers ?? []).length.toString(),
                sub: "available",
                color: "text-accent",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-muted/40 rounded-xl p-3 border border-border text-center"
              >
                <p className={`text-xl font-display font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {stat.sub}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-5 gap-8">
        {/* My Dispatches — wider column */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-base font-display font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            My Dispatches
          </h2>

          {dispatchesLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !myDispatches || myDispatches.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-6 h-6 text-muted-foreground" />}
              title="No dispatches yet"
              description="Create your first enterprise dispatch to coordinate bulk jobs for business clients."
              action={
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 mt-2"
                  onClick={() => setShowCreateModal(true)}
                  data-ocid="create-first-dispatch-btn"
                >
                  <Plus className="w-4 h-4" />
                  Create Dispatch
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {myDispatches.map((d) => (
                <DispatchCard
                  key={d.id.toString()}
                  dispatch={d}
                  onClick={() => setSelectedDispatch(d)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Active Enterprise Workers — narrower column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-display font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Active Workers
          </h2>

          {workersLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : !enterpriseWorkers || enterpriseWorkers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6 text-muted-foreground" />}
              title="No enterprise workers"
              description="Enterprise-tier workers will appear here when available."
            />
          ) : (
            <div className="space-y-2">
              {enterpriseWorkers.map((worker, i) => (
                <motion.div
                  key={worker.userId.toText()}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <WorkerCard worker={worker} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dispatch Detail Modal */}
      <Dialog
        open={selectedDispatch !== null}
        onOpenChange={(open) => !open && setSelectedDispatch(null)}
      >
        {selectedDispatch && (
          <DispatchDetailModal
            dispatch={selectedDispatch}
            onClose={() => setSelectedDispatch(null)}
          />
        )}
      </Dialog>

      {/* Create Dispatch Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => !open && setShowCreateModal(false)}
      >
        {showCreateModal && (
          <CreateDispatchModal onClose={() => setShowCreateModal(false)} />
        )}
      </Dialog>
    </div>
  );
}
