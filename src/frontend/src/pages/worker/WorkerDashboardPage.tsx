import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  List,
  Map as MapIcon,
  Navigation,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { JobCard } from "../../components/JobCard";
import { useBackend } from "../../hooks/useBackend";
import { SERVICE_CATEGORIES, getCategoryMeta } from "../../types";
import type {
  JobPublic,
  ServiceCategory,
  WorkerProfilePublic,
} from "../../types";

// ─── Haversine distance ───────────────────────────────────────────────────────
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

// ─── Map component with radius circle ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type L = any;

interface WorkerMapProps {
  jobs: JobPublic[];
  workerLat: number;
  workerLng: number;
  radiusMiles: number;
  onJobSelect: (job: JobPublic) => void;
}

function WorkerMap({
  jobs,
  workerLat,
  workerLng,
  radiusMiles,
  onJobSelect,
}: WorkerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L>(null);
  const jobsRef = useRef(jobs);
  const onJobSelectRef = useRef(onJobSelect);
  jobsRef.current = jobs;
  onJobSelectRef.current = onJobSelect;

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    let destroyed = false;

    async function init() {
      if (!el || destroyed) return;
      let Leaflet: L;
      try {
        const leafletUrl =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await import(/* @vite-ignore */ leafletUrl as any);
        Leaflet = mod.default ?? mod;
      } catch {
        return;
      }

      // Load leaflet CSS once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (destroyed) return;
      const map = Leaflet.map(el).setView([workerLat, workerLng], 12);
      mapInstanceRef.current = map;

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Worker marker
      const workerIcon = Leaflet.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;background:oklch(0.68 0.18 190);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconAnchor: [8, 8],
      });
      Leaflet.marker([workerLat, workerLng], { icon: workerIcon })
        .addTo(map)
        .bindPopup("<b>Your Location</b>");

      // Radius circle — convert miles to meters
      Leaflet.circle([workerLat, workerLng], {
        radius: radiusMiles * 1609.34,
        color: "oklch(0.68 0.18 190)",
        fillColor: "oklch(0.68 0.18 190)",
        fillOpacity: 0.07,
        weight: 2,
        dashArray: "6 4",
      }).addTo(map);

      // Job markers
      for (const job of jobsRef.current) {
        const meta = getCategoryMeta(job.serviceCategory);
        const jobIcon = Leaflet.divIcon({
          className: "",
          html: `<div style="width:36px;height:36px;background:oklch(0.21 0.025 200);border:2px solid oklch(0.72 0.22 140);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer">${meta.icon}</div>`,
          iconAnchor: [18, 18],
        });
        Leaflet.marker([job.latitude, job.longitude], { icon: jobIcon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:140px"><b style="font-size:13px">${job.title}</b><br/><span style="color:#888;font-size:11px">$${Number(job.budgetUSD)}</span></div>`,
          )
          .on("click", () => onJobSelectRef.current(job));
      }
    }

    init();
    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [workerLat, workerLng, radiusMiles]); // re-init on location/radius change

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-border"
      style={{ height: "420px" }}
    >
      <div ref={mapRef} className="absolute inset-0" />
    </div>
  );
}

// ─── My Jobs tab ──────────────────────────────────────────────────────────────
const STATUS_GROUPS: { label: string; statuses: string[]; color: string }[] = [
  { label: "Accepted", statuses: ["Accepted"], color: "text-primary" },
  { label: "In Progress", statuses: ["InProgress"], color: "text-chart-4" },
  { label: "Completed", statuses: ["Completed"], color: "text-chart-5" },
];

function MyJobsTab({ jobs }: { jobs: JobPublic[] }) {
  return (
    <div className="space-y-8">
      {STATUS_GROUPS.map(({ label, statuses, color }) => {
        const filtered = jobs.filter((j) => statuses.includes(j.status));
        return (
          <section key={label}>
            <h3
              className={`text-sm font-semibold font-display mb-3 ${color} uppercase tracking-wide`}
            >
              {label} ({filtered.length})
            </h3>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm pl-1">
                No jobs in this status.
              </p>
            ) : (
              <div className="space-y-3">
                {filtered.map((job) => (
                  <Link
                    key={String(job.id)}
                    to="/worker/jobs/$jobId"
                    params={{ jobId: String(job.id) }}
                  >
                    <JobCard job={job} compact />
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function WorkerDashboardPage() {
  const { actor, isLoading: actorLoading } = useBackend();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"find" | "myjobs">("find");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedCategory, setSelectedCategory] = useState<
    ServiceCategory | "all"
  >("all");
  const [workerCoords, setWorkerCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState(false);

  // Fetch available jobs
  const { data: availableJobs = [], isLoading: jobsLoading } = useQuery<
    JobPublic[]
  >({
    queryKey: ["available-jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableJobs();
    },
    enabled: !!actor && !actorLoading,
  });

  // Fetch my jobs
  const { data: myJobs = [], isLoading: myJobsLoading } = useQuery<JobPublic[]>(
    {
      queryKey: ["my-worker-jobs"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getMyWorkerJobs();
      },
      enabled: !!actor && !actorLoading,
    },
  );

  // Fetch worker profile (for radius)
  const { data: workerProfile } = useQuery<WorkerProfilePublic | null>({
    queryKey: ["my-worker-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyWorkerProfile();
    },
    enabled: !!actor && !actorLoading,
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      if (!actor) return false;
      return actor.updateWorkerLocation(lat, lng);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-worker-profile"] }),
  });

  // Get geolocation on mount
  const mutate = updateLocationMutation.mutate;
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setWorkerCoords({ lat: latitude, lng: longitude });
        mutate({ lat: latitude, lng: longitude });
      },
      () => setLocationError(true),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [mutate]);

  const radiusMiles = workerProfile ? Number(workerProfile.radiusMiles) : 10;
  const displayLat = workerCoords?.lat ?? workerProfile?.latitude ?? 40.7128;
  const displayLng = workerCoords?.lng ?? workerProfile?.longitude ?? -74.006;

  // Filter jobs by category and radius
  const filteredJobs = availableJobs.filter((job) => {
    const categoryMatch =
      selectedCategory === "all" || job.serviceCategory === selectedCategory;
    const dist = distanceMiles(
      displayLat,
      displayLng,
      job.latitude,
      job.longitude,
    );
    return categoryMatch && dist <= radiusMiles;
  });

  // Radius progress for display
  const completedJobs = Number(workerProfile?.completedJobsCount ?? 0);
  const progressToNext = ((completedJobs % 10) / 10) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">
              Worker Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {workerCoords ? (
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-accent" />
                  Location updated · {radiusMiles} mi radius
                </span>
              ) : locationError ? (
                "Location unavailable — showing default area"
              ) : (
                "Getting your location…"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Radius progress indicator */}
            {workerProfile && (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">
                  {completedJobs} jobs · {radiusMiles}mi radius
                </span>
                <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {10 - (completedJobs % 10)} more to +2mi
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                qc.invalidateQueries({ queryKey: ["available-jobs"] })
              }
              data-ocid="refresh-jobs"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 bg-card border border-border rounded-lg p-1 w-fit"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "find"}
            onClick={() => setTab("find")}
            data-ocid="tab-find-jobs"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
              tab === "find"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Find Jobs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "myjobs"}
            onClick={() => setTab("myjobs")}
            data-ocid="tab-my-jobs"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth relative ${
              tab === "myjobs"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Jobs
            {myJobs.filter(
              (j) => j.status === "Accepted" || j.status === "InProgress",
            ).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                {
                  myJobs.filter(
                    (j) => j.status === "Accepted" || j.status === "InProgress",
                  ).length
                }
              </span>
            )}
          </button>
        </div>

        {/* ── Find Jobs tab ─────────────────────────────────────────── */}
        {tab === "find" && (
          <div>
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  data-ocid="filter-all"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  }`}
                >
                  All
                </button>
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    data-ocid={`filter-${cat.value.toLowerCase()}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-smooth flex items-center gap-1 ${
                      selectedCategory === cat.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 sm:ml-auto">
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  aria-label="Map view"
                  data-ocid="view-map"
                >
                  <MapIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  data-ocid="view-list"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Jobs count */}
            <p className="text-sm text-muted-foreground mb-3">
              <span className="text-foreground font-semibold">
                {filteredJobs.length}
              </span>{" "}
              jobs within your {radiusMiles}mi radius
            </p>

            {/* Map view */}
            {viewMode === "map" && (
              <div className="mb-4">
                <WorkerMap
                  jobs={filteredJobs}
                  workerLat={displayLat}
                  workerLng={displayLng}
                  radiusMiles={radiusMiles}
                  onJobSelect={(job) => {
                    navigate({
                      to: "/worker/jobs/$jobId",
                      params: { jobId: String(job.id) },
                    });
                  }}
                />
              </div>
            )}

            {/* Job list */}
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No jobs in your area"
                description={
                  selectedCategory !== "all"
                    ? "Try clearing the category filter or check back later."
                    : `No open jobs within your ${radiusMiles}-mile radius right now. Complete more jobs to expand your reach!`
                }
                data-ocid="empty-find-jobs"
              />
            ) : (
              <div className="space-y-3">
                {filteredJobs
                  .sort((a, b) => {
                    const da = distanceMiles(
                      displayLat,
                      displayLng,
                      a.latitude,
                      a.longitude,
                    );
                    const db = distanceMiles(
                      displayLat,
                      displayLng,
                      b.latitude,
                      b.longitude,
                    );
                    return da - db;
                  })
                  .map((job) => {
                    const dist = distanceMiles(
                      displayLat,
                      displayLng,
                      job.latitude,
                      job.longitude,
                    );
                    return (
                      <Link
                        key={String(job.id)}
                        to="/worker/jobs/$jobId"
                        params={{ jobId: String(job.id) }}
                      >
                        <div className="relative" data-ocid="job-list-item">
                          <JobCard job={job} compact />
                          <Badge
                            variant="secondary"
                            className="absolute top-3 right-3 text-xs bg-muted/80 text-muted-foreground border border-border"
                          >
                            {dist.toFixed(1)} mi away
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── My Jobs tab ────────────────────────────────────────────── */}
        {tab === "myjobs" && (
          <div>
            {myJobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : myJobs.length === 0 ? (
              <EmptyState
                icon="🛠️"
                title="No jobs yet"
                description="Accept your first job from the Find Jobs tab to get started."
                action={
                  <Button
                    onClick={() => setTab("find")}
                    data-ocid="cta-find-jobs"
                  >
                    Find Jobs
                  </Button>
                }
                data-ocid="empty-my-jobs"
              />
            ) : (
              <MyJobsTab jobs={myJobs} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
