import Map "mo:core/Map";
import List "mo:core/List";

import UserTypes "types/users";
import JobTypes "types/jobs";
import PaymentTypes "types/payments";
import NotifTypes "types/notifications";
import RatingTypes "types/ratings";
import EntTypes "types/enterprise";

import UsersApi "mixins/users-api";
import JobsApi "mixins/jobs-api";
import PaymentsApi "mixins/payments-api";
import NotificationsApi "mixins/notifications-api";
import RatingsApi "mixins/ratings-api";
import EnterpriseApi "mixins/enterprise-api";

actor {
  // --- User state ---
  let workers     = Map.empty<UserTypes.UserId, UserTypes.WorkerProfile>();
  let homeowners  = Map.empty<UserTypes.UserId, UserTypes.HomeownerProfile>();
  let waivers     = Map.empty<UserTypes.UserId, UserTypes.LiabilityWaiver>();

  // --- Job state ---
  let jobs        = Map.empty<JobTypes.JobId, JobTypes.Job>();
  var nextJobIdVal : Nat = 0;
  let nextJobId   = { var val = nextJobIdVal };

  // --- Payment state ---
  let payments    = Map.empty<PaymentTypes.PaymentId, PaymentTypes.PaymentRecord>();
  let jobPayments = Map.empty<JobTypes.JobId, PaymentTypes.PaymentId>();
  var nextPaymentIdVal : Nat = 0;
  let nextPaymentId = { var val = nextPaymentIdVal };

  // --- Notification state ---
  let userNotifs  = Map.empty<NotifTypes.UserId, List.List<NotifTypes.Notification>>();
  var nextNotifIdVal : Nat = 0;
  let nextNotifId = { var val = nextNotifIdVal };

  // --- Rating state ---
  let userRatings = Map.empty<RatingTypes.UserId, List.List<RatingTypes.Rating>>();
  var nextRatingIdVal : Nat = 0;
  let nextRatingId = { var val = nextRatingIdVal };

  // --- Enterprise state ---
  let dispatches   = Map.empty<EntTypes.EnterpriseDispatchId, EntTypes.EnterpriseDispatch>();
  var nextDispatchIdVal : Nat = 0;
  let nextDispatchId = { var val = nextDispatchIdVal };

  // --- Mixin composition ---
  include UsersApi(workers, homeowners, waivers);
  include JobsApi(jobs, workers, homeowners, waivers, nextJobId);
  include PaymentsApi(payments, jobPayments, jobs, nextPaymentId);
  include NotificationsApi(userNotifs, nextNotifId);
  include RatingsApi(userRatings, workers, homeowners, jobs, nextRatingId);
  include EnterpriseApi(dispatches, workers, nextDispatchId);
};
