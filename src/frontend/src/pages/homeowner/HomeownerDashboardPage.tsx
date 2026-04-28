import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Briefcase, CheckCircle, DollarSign, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { JobCard } from "../../components/JobCard";
import { useBackend } from "../../hooks/useBackend";
import type { JobPublic } from "../../types";
import { formatBudget } from "../../types";

type TabKey = "Active" | "Completed" | "All";

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="card-base p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-bold font-display">{value}</p>
      </div>
    </div>
  );
}

export function HomeownerDashboardPage() {
  const { actor, isLoading: actorLoading } = useBackend();
  const [activeTab, setActiveTab] = useState<TabKey>("Active");

  const {
    data: jobs,
    isLoading,
    isError,
  } = useQuery<JobPublic[]>({
    queryKey: ["myPostedJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPostedJobs();
    },
    enabled: !!actor && !actorLoading,
  });

  const allJobs = jobs ?? [];
  const activeJobs = allJobs.filter((j) =>
    ["Open", "Accepted", "InProgress"].includes(j.status),
  );
  const completedJobs = allJobs.filter((j) => j.status === "Completed");
  const totalSpent = completedJobs.reduce(
    (sum, j) => sum + j.budgetUSD + (j.tipAmountUSD ?? 0n),
    0n,
  );

  const tabJobs: Record<TabKey, JobPublic[]> = {
    Active: activeJobs,
    Completed: completedJobs,
    All: allJobs,
  };

  const displayJobs = tabJobs[activeTab];

  const tabs: TabKey[] = ["Active", "Completed", "All"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">My Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your home service requests
          </p>
        </div>
        <Link to="/homeowner/post-job">
          <Button
            data-ocid="post-job-cta"
            className="btn-accent gap-2 flex items-center"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {isLoading || actorLoading ? (
          (["active-jobs", "completed-jobs", "total-spent"] as const).map(
            (k) => <Skeleton key={k} className="h-[72px] rounded-lg" />,
          )
        ) : (
          <>
            <StatCard
              icon={<Briefcase className="w-5 h-5" />}
              label="Active Jobs"
              value={activeJobs.length}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              label="Completed"
              value={completedJobs.length}
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Total Spent"
              value={formatBudget(totalSpent)}
              accent
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-lg bg-muted/40 border border-border mb-6 w-fit"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            data-ocid={`tab-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-smooth ${
              activeTab === tab
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            <span
              className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
            >
              {tabJobs[tab].length}
            </span>
          </button>
        ))}
      </div>

      {/* Job List */}
      {isLoading || actorLoading ? (
        <div className="space-y-3">
          {(["job-skel-a", "job-skel-b", "job-skel-c"] as const).map((k) => (
            <Skeleton key={k} className="h-[120px] rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon="⚠️"
          title="Failed to load jobs"
          description="Something went wrong. Please refresh the page."
        />
      ) : displayJobs.length === 0 ? (
        <EmptyState
          data-ocid="empty-jobs"
          icon={activeTab === "Active" ? "🏡" : "📋"}
          title={
            activeTab === "Active"
              ? "No active jobs"
              : `No ${activeTab.toLowerCase()} jobs`
          }
          description={
            activeTab === "Active"
              ? "Post your first job and get it done today."
              : undefined
          }
          action={
            activeTab === "Active" ? (
              <Link to="/homeowner/post-job">
                <Button data-ocid="empty-post-job-cta" className="btn-accent">
                  Post a Job
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3" data-ocid="job-list">
          {displayJobs.map((job) => (
            <Link
              key={String(job.id)}
              to="/homeowner/jobs/$jobId"
              params={{ jobId: String(job.id) }}
            >
              <JobCard
                job={job}
                onClick={() => {}}
                className="hover:border-primary/40"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
