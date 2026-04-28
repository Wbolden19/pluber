import Common "common";

module {
  public type UserId = Common.UserId;
  public type JobId = Common.JobId;
  public type RatingId = Common.RatingId;
  public type Timestamp = Common.Timestamp;

  public type Rating = {
    id : RatingId;
    ratedUserId : UserId;
    ratedByUserId : UserId;
    jobId : JobId;
    score : Nat; // 1-5
    comment : ?Text;
    createdAt : Timestamp;
  };

  public type SubmitRatingInput = {
    ratedUserId : UserId;
    jobId : JobId;
    score : Nat;
    comment : ?Text;
  };
};
