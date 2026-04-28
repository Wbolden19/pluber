import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type ServiceCategory = {
    #LawnMowing;
    #SnowPlowing;
    #LeafRaking;
    #BushTrimming;
    #WeedWhacking;
    #WindowWashing;
    #GutterCleaning;
    #PressureWashing;
    #GeneralYardWork;
  };

  public type VerificationStatus = {
    #Pending;
    #Approved;
    #Rejected;
  };

  public type WorkerProfile = {
    userId : UserId;
    serviceCategories : [ServiceCategory];
    var radiusMiles : Nat;
    var completedJobsCount : Nat;
    var ratingCount : Nat;
    var latitude : Float;
    var longitude : Float;
    var verificationStatus : VerificationStatus;
    var enterpriseTier : Bool;
    var averageRating : Float;
    var insuranceDocRef : ?Text;
    var idDocRef : ?Text;
    createdAt : Timestamp;
  };

  public type HomeownerProfile = {
    userId : UserId;
    var address : Text;
    var latitude : Float;
    var longitude : Float;
    var averageRating : Float;
    var ratingCount : Nat;
    createdAt : Timestamp;
  };

  // Shared (API-boundary) types — no var fields
  public type WorkerProfilePublic = {
    userId : UserId;
    serviceCategories : [ServiceCategory];
    radiusMiles : Nat;
    completedJobsCount : Nat;
    latitude : Float;
    longitude : Float;
    verificationStatus : VerificationStatus;
    enterpriseTier : Bool;
    averageRating : Float;
    createdAt : Timestamp;
  };

  public type HomeownerProfilePublic = {
    userId : UserId;
    address : Text;
    latitude : Float;
    longitude : Float;
    averageRating : Float;
    createdAt : Timestamp;
  };

  public type LiabilityWaiver = {
    userId : UserId;
    acceptedAt : Timestamp;
    version : Text;
  };

  public type RegisterWorkerInput = {
    serviceCategories : [ServiceCategory];
    latitude : Float;
    longitude : Float;
    insuranceDocRef : ?Text;
    idDocRef : ?Text;
  };

  public type RegisterHomeownerInput = {
    address : Text;
    latitude : Float;
    longitude : Float;
  };
};
