import Common "common";
import Users "users";

module {
  public type JobId = Common.JobId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type ServiceCategory = Users.ServiceCategory;

  public type JobStatus = {
    #Open;
    #Accepted;
    #InProgress;
    #Completed;
    #Disputed;
    #Cancelled;
  };

  public type Job = {
    id : JobId;
    homeownerId : UserId;
    title : Text;
    description : Text;
    serviceCategory : ServiceCategory;
    var latitude : Float;
    var longitude : Float;
    address : Text;
    budgetUSD : Nat; // in cents
    var status : JobStatus;
    var workerId : ?UserId;
    var acceptedAt : ?Timestamp;
    var completedAt : ?Timestamp;
    var tipAmountUSD : ?Nat; // in cents
    createdAt : Timestamp;
    var photoRefs : [Text]; // blob/storage refs
    // mutual completion confirmation
    var homeownerConfirmed : Bool;
    var workerConfirmed : Bool;
  };

  // Shared API type
  public type JobPublic = {
    id : JobId;
    homeownerId : UserId;
    title : Text;
    description : Text;
    serviceCategory : ServiceCategory;
    latitude : Float;
    longitude : Float;
    address : Text;
    budgetUSD : Nat;
    status : JobStatus;
    workerId : ?UserId;
    acceptedAt : ?Timestamp;
    completedAt : ?Timestamp;
    tipAmountUSD : ?Nat;
    createdAt : Timestamp;
    photoRefs : [Text];
    homeownerConfirmed : Bool;
    workerConfirmed : Bool;
  };

  public type CreateJobInput = {
    title : Text;
    description : Text;
    serviceCategory : ServiceCategory;
    latitude : Float;
    longitude : Float;
    address : Text;
    budgetUSD : Nat;
    photoRefs : [Text];
  };

  public type UpdateJobInput = {
    title : ?Text;
    description : ?Text;
    budgetUSD : ?Nat;
    photoRefs : ?[Text];
  };
};
