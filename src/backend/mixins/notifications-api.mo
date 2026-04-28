import NotifTypes "../types/notifications";
import NotifLib "../lib/notifications";
import Map "mo:core/Map";
import List "mo:core/List";

mixin (
  userNotifs : Map.Map<NotifTypes.UserId, List.List<NotifTypes.Notification>>,
  nextNotifId : { var val : Nat },
) {
  // Get all notifications for the caller
  public shared query ({ caller }) func getMyNotifications() : async [NotifTypes.NotificationPublic] {
    NotifLib.getForUser(userNotifs, caller);
  };

  // Mark a specific notification as read
  public shared ({ caller }) func markNotificationRead(notifId : NotifTypes.NotificationId) : async Bool {
    NotifLib.markRead(userNotifs, caller, notifId);
    true;
  };

  // Mark all notifications as read
  public shared ({ caller }) func markAllNotificationsRead() : async Bool {
    NotifLib.markAllRead(userNotifs, caller);
    true;
  };
};
