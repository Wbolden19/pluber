import Types "../types/notifications";
import Map "mo:core/Map";
import List "mo:core/List";

module {
  public type NotificationList = List.List<Types.Notification>;
  public type UserNotifMap = Map.Map<Types.UserId, NotificationList>;

  // Convert internal Notification to shared public type
  public func toPublic(self : Types.Notification) : Types.NotificationPublic {
    {
      id               = self.id;
      userId           = self.userId;
      notificationType = self.notificationType;
      jobId            = self.jobId;
      message          = self.message;
      isRead           = self.isRead;
      createdAt        = self.createdAt;
    };
  };

  // Create and push a notification to a user
  public func push(
    userNotifs : UserNotifMap,
    id : Types.NotificationId,
    userId : Types.UserId,
    notifType : Types.NotificationType,
    jobId : ?Types.JobId,
    message : Text,
    now : Types.Timestamp,
  ) {
    let notif : Types.Notification = {
      id;
      userId;
      notificationType = notifType;
      jobId;
      message;
      var isRead = false;
      createdAt = now;
    };
    switch (userNotifs.get(userId)) {
      case null {
        let list = List.empty<Types.Notification>();
        list.add(notif);
        userNotifs.add(userId, list);
      };
      case (?notifList) {
        notifList.add(notif);
      };
    };
  };

  // Get all notifications for a user (newest first)
  public func getForUser(userNotifs : UserNotifMap, userId : Types.UserId) : [Types.NotificationPublic] {
    switch (userNotifs.get(userId)) {
      case null { [] };
      case (?notifList) {
        let reversed = notifList.reverse();
        let mapped = reversed.map<Types.Notification, Types.NotificationPublic>(func(n) { toPublic(n) });
        mapped.toArray();
      };
    };
  };

  // Mark a specific notification as read
  public func markRead(
    userNotifs : UserNotifMap,
    userId : Types.UserId,
    notifId : Types.NotificationId,
  ) {
    switch (userNotifs.get(userId)) {
      case null {};
      case (?notifList) {
        notifList.forEach(func(n : Types.Notification) {
          if (n.id == notifId) { n.isRead := true };
        });
      };
    };
  };

  // Mark all notifications as read for a user
  public func markAllRead(userNotifs : UserNotifMap, userId : Types.UserId) {
    switch (userNotifs.get(userId)) {
      case null {};
      case (?notifList) {
        notifList.forEach(func(n : Types.Notification) {
          n.isRead := true;
        });
      };
    };
  };
};
