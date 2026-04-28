import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  Check,
  CheckCheck,
  DollarSign,
  MapPin,
  Star,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { useBackend } from "../hooks/useBackend";
import { useNotifications } from "../hooks/useNotifications";
import {
  type NotificationPublic,
  type NotificationType,
  formatTimestamp,
} from "../types";

// ── Notification icon map ──────────────────────────────────────────────────

const NOTIF_ICON: Record<NotificationType, React.ReactNode> = {
  JobAvailable: <MapPin className="w-4 h-4" />,
  JobAccepted: <Check className="w-4 h-4" />,
  JobCompleted: <Trophy className="w-4 h-4" />,
  TipReceived: <DollarSign className="w-4 h-4" />,
  RatingReceived: <Star className="w-4 h-4" />,
  EnterpriseDispatch: <Building2 className="w-4 h-4" />,
};

const NOTIF_COLOR: Record<NotificationType, string> = {
  JobAvailable: "bg-accent/15 text-accent border-accent/30",
  JobAccepted: "bg-primary/15 text-primary border-primary/30",
  JobCompleted: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  TipReceived: "bg-accent/15 text-accent border-accent/30",
  RatingReceived: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  EnterpriseDispatch: "bg-chart-3/15 text-chart-3 border-chart-3/30",
};

const NOTIF_LABEL: Record<NotificationType, string> = {
  JobAvailable: "Job Available",
  JobAccepted: "Job Accepted",
  JobCompleted: "Completed",
  TipReceived: "Tip Received",
  RatingReceived: "Review Received",
  EnterpriseDispatch: "Enterprise",
};

// ── Notification row ───────────────────────────────────────────────────────

function NotificationRow({
  notif,
  onRead,
}: {
  notif: NotificationPublic;
  onRead: (id: bigint) => void;
}) {
  const typeKey = notif.notificationType as NotificationType;
  const iconColor =
    NOTIF_COLOR[typeKey] ?? "bg-muted text-muted-foreground border-border";
  const label = NOTIF_LABEL[typeKey] ?? typeKey;
  const icon = NOTIF_ICON[typeKey] ?? <Bell className="w-4 h-4" />;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      onClick={() => !notif.isRead && onRead(notif.id)}
      data-ocid={`notif-row-${notif.id}`}
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-smooth",
        notif.isRead
          ? "bg-card/60 border-border"
          : "bg-card border-primary/30 shadow-card hover:shadow-elevated",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border",
          iconColor,
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full border",
              iconColor,
            )}
          >
            {label}
          </span>
          {!notif.isRead && (
            <span
              className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
              aria-label="Unread"
            />
          )}
        </div>
        <p
          className={cn(
            "text-sm leading-snug break-words",
            notif.isRead ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {notif.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimestamp(notif.createdAt)}
        </p>
      </div>

      {/* Mark read hint */}
      {!notif.isRead && (
        <div
          className="flex-shrink-0 self-center text-muted-foreground/50"
          title="Click to mark as read"
        >
          <Check className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { notifications, unreadCount, isLoading } = useNotifications();
  const { actor } = useBackend();
  const qc = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markNotificationRead(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: () => toast.error("Could not mark notification as read"),
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Could not mark all as read"),
  });

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge
              className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5"
              data-ocid="unread-badge"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="gap-1.5 text-xs"
            data-ocid="mark-all-read-btn"
          >
            <CheckCheck className="w-4 h-4" />
            {markAllMutation.isPending ? "Marking…" : "Mark all read"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-muted-foreground" />}
          title="No notifications yet"
          description="You'll be notified about job activity, tips, and reviews here."
        />
      ) : (
        <div className="space-y-6">
          {/* Unread section */}
          {unread.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                New · {unread.length}
              </p>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {unread.map((n) => (
                    <NotificationRow
                      key={n.id.toString()}
                      notif={n}
                      onRead={(id) => markReadMutation.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Read section */}
          {read.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Earlier · {read.length}
              </p>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {read.map((n) => (
                    <NotificationRow
                      key={n.id.toString()}
                      notif={n}
                      onRead={(id) => markReadMutation.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
