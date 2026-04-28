import Types "../types/ratings";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

module {
  public type RatingList = List.List<Types.Rating>;
  public type UserRatingMap = Map.Map<Types.UserId, RatingList>;

  // Check if a user has already rated another user for a specific job
  public func hasRated(
    userRatings : UserRatingMap,
    ratedUserId : Types.UserId,
    ratedByUserId : Types.UserId,
    jobId : Types.JobId,
  ) : Bool {
    switch (userRatings.get(ratedUserId)) {
      case null { false };
      case (?ratings) {
        switch (ratings.find(func(r : Types.Rating) : Bool {
          r.ratedByUserId == ratedByUserId and r.jobId == jobId
        })) {
          case (?_) { true };
          case null { false };
        };
      };
    };
  };

  // Submit a rating for a user after a completed job
  public func submitRating(
    userRatings : UserRatingMap,
    id : Types.RatingId,
    ratedByUserId : Types.UserId,
    input : Types.SubmitRatingInput,
    now : Types.Timestamp,
  ) : Types.Rating {
    if (input.score < 1 or input.score > 5) {
      Runtime.trap("Score must be between 1 and 5");
    };
    let rating : Types.Rating = {
      id;
      ratedUserId    = input.ratedUserId;
      ratedByUserId;
      jobId          = input.jobId;
      score          = input.score;
      comment        = input.comment;
      createdAt      = now;
    };
    switch (userRatings.get(input.ratedUserId)) {
      case null {
        let list = List.empty<Types.Rating>();
        list.add(rating);
        userRatings.add(input.ratedUserId, list);
      };
      case (?ratings) {
        ratings.add(rating);
      };
    };
    rating;
  };

  // Get all ratings for a user
  public func getRatingsForUser(userRatings : UserRatingMap, userId : Types.UserId) : [Types.Rating] {
    switch (userRatings.get(userId)) {
      case null { [] };
      case (?ratings) { ratings.toArray() };
    };
  };

  // Compute average score for a user
  public func computeAverage(userRatings : UserRatingMap, userId : Types.UserId) : Float {
    switch (userRatings.get(userId)) {
      case null { 0.0 };
      case (?ratings) {
        let count = ratings.size();
        if (count == 0) { return 0.0 };
        let total = ratings.foldLeft(0, func(acc : Nat, r : Types.Rating) : Nat { acc + r.score });
        total.toFloat() / count.toFloat();
      };
    };
  };
};
