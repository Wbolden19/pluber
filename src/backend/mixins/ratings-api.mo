import RatingTypes "../types/ratings";
import UserTypes "../types/users";
import JobTypes "../types/jobs";
import RatingLib "../lib/ratings";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

mixin (
  userRatings : Map.Map<RatingTypes.UserId, List.List<RatingTypes.Rating>>,
  workers : Map.Map<UserTypes.UserId, UserTypes.WorkerProfile>,
  homeowners : Map.Map<UserTypes.UserId, UserTypes.HomeownerProfile>,
  jobs : Map.Map<JobTypes.JobId, JobTypes.Job>,
  nextRatingId : { var val : Nat },
) {
  // Submit a rating for a user after job completion
  public shared ({ caller }) func submitRating(input : RatingTypes.SubmitRatingInput) : async RatingTypes.Rating {
    // Verify job exists and is completed
    let job = switch (jobs.get(input.jobId)) {
      case null { Runtime.trap("Job not found") };
      case (?j) { j };
    };
    if (job.status != #Completed) {
      Runtime.trap("Can only rate participants of a completed job");
    };

    // Caller must be a participant in the job (homeowner or worker)
    let isHomeowner = job.homeownerId == caller;
    let isWorker = switch (job.workerId) {
      case (?wId) { wId == caller };
      case null { false };
    };
    if (not isHomeowner and not isWorker) {
      Runtime.trap("Caller is not a participant in this job");
    };

    // Rated user must also be a participant
    let ratedIsHomeowner = job.homeownerId == input.ratedUserId;
    let ratedIsWorker = switch (job.workerId) {
      case (?wId) { wId == input.ratedUserId };
      case null { false };
    };
    if (not ratedIsHomeowner and not ratedIsWorker) {
      Runtime.trap("Rated user is not a participant in this job");
    };

    // Prevent self-rating
    if (caller == input.ratedUserId) {
      Runtime.trap("Cannot rate yourself");
    };

    // Prevent duplicate rating for same job and pair
    if (RatingLib.hasRated(userRatings, input.ratedUserId, caller, input.jobId)) {
      Runtime.trap("You have already rated this user for this job");
    };

    let id = nextRatingId.val;
    nextRatingId.val += 1;
    let now = Time.now();
    RatingLib.submitRating(userRatings, id, caller, input, now);
  };

  // Get ratings for a specific user
  public query func getRatingsForUser(userId : RatingTypes.UserId) : async [RatingTypes.Rating] {
    RatingLib.getRatingsForUser(userRatings, userId);
  };

  // Get average rating for a specific user
  public query func getAverageRating(userId : RatingTypes.UserId) : async Float {
    RatingLib.computeAverage(userRatings, userId);
  };
};
