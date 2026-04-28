import Common "common";

module {
  public type UserId = Common.UserId;
  public type JobId = Common.JobId;
  public type NotificationId = Common.NotificationId;
  public type Timestamp = Common.Timestamp;

  public type NotificationType = {
    #JobAvailable;
    #JobAccepted;
    #JobCompleted;
    #TipReceived;
    #RatingReceived;
    #EnterpriseDispatch;
  };

  public type Notification = {
    id : NotificationId;
    userId : UserId;
    notificationType : NotificationType;
    jobId : ?JobId;
    message : Text;
    var isRead : Bool;
    createdAt : Timestamp;
  };

  // Shared API type
  public type NotificationPublic = {
    id : NotificationId;
    userId : UserId;
    notificationType : NotificationType;
    jobId : ?JobId;
    message : Text;
    isRead : Bool;
    createdAt : Timestamp;
  };
};
