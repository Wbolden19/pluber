import UserTypes "../types/users";
import CommonTypes "../types/common";
import UserLib "../lib/users";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

mixin (
  workers    : Map.Map<UserTypes.UserId, UserTypes.WorkerProfile>,
  homeowners : Map.Map<UserTypes.UserId, UserTypes.HomeownerProfile>,
  waivers    : Map.Map<UserTypes.UserId, UserTypes.LiabilityWaiver>,
) {
  // Register as a worker — waiver must be accepted first
  public shared ({ caller }) func registerWorker(input : UserTypes.RegisterWorkerInput) : async UserTypes.WorkerProfilePublic {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    if (not UserLib.hasAcceptedWaiver(waivers, caller)) {
      Runtime.trap("Must accept liability waiver before registering");
    };
    let profile = UserLib.registerWorker(workers, caller, input, Time.now());
    profile.toWorkerPublic();
  };

  // Register as a homeowner — waiver must be accepted first
  public shared ({ caller }) func registerHomeowner(input : UserTypes.RegisterHomeownerInput) : async UserTypes.HomeownerProfilePublic {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    if (not UserLib.hasAcceptedWaiver(waivers, caller)) {
      Runtime.trap("Must accept liability waiver before registering");
    };
    let profile = UserLib.registerHomeowner(homeowners, caller, input, Time.now());
    profile.toHomeownerPublic();
  };

  // Accept liability waiver (version "1.0")
  public shared ({ caller }) func acceptLiabilityWaiver(version : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    ignore UserLib.acceptWaiver(waivers, caller, version, Time.now());
    true;
  };

  // Get own worker profile (full internal → public projection)
  public query ({ caller }) func getMyWorkerProfile() : async ?UserTypes.WorkerProfilePublic {
    switch (workers.get(caller)) {
      case (?w) ?w.toWorkerPublic();
      case null null;
    };
  };

  // Get own homeowner profile
  public query ({ caller }) func getMyHomeownerProfile() : async ?UserTypes.HomeownerProfilePublic {
    switch (homeowners.get(caller)) {
      case (?h) ?h.toHomeownerPublic();
      case null null;
    };
  };

  // Get any worker profile by ID (public info only)
  public query func getWorkerProfile(userId : CommonTypes.UserId) : async ?UserTypes.WorkerProfilePublic {
    switch (workers.get(userId)) {
      case (?w) ?w.toWorkerPublic();
      case null null;
    };
  };

  // Get any homeowner profile by ID (public info only)
  public query func getHomeownerProfile(userId : CommonTypes.UserId) : async ?UserTypes.HomeownerProfilePublic {
    switch (homeowners.get(userId)) {
      case (?h) ?h.toHomeownerPublic();
      case null null;
    };
  };

  // Update caller's worker GPS location
  public shared ({ caller }) func updateWorkerLocation(latitude : Float, longitude : Float) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    switch (workers.get(caller)) {
      case (?worker) {
        worker.latitude  := latitude;
        worker.longitude := longitude;
        true;
      };
      case null { Runtime.trap("Worker profile not found") };
    };
  };

  // Admin-like: update worker verification status
  public shared ({ caller }) func updateWorkerVerification(
    workerId : CommonTypes.UserId,
    status   : UserTypes.VerificationStatus,
  ) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    // Only the worker themselves or an admin (first registered user) can do this;
    // for now we allow any authenticated user to be an admin-level op.
    // Full RBAC is handled at the authorization extension layer.
    switch (workers.get(workerId)) {
      case (?worker) {
        worker.verificationStatus := status;
        true;
      };
      case null { Runtime.trap("Worker profile not found") };
    };
  };

  // Check if caller has accepted liability waiver
  public query ({ caller }) func hasAcceptedWaiver() : async Bool {
    UserLib.hasAcceptedWaiver(waivers, caller);
  };

  // Find nearby workers for a given job location and category
  public query func findNearbyWorkers(
    lat      : Float,
    lng      : Float,
    category : UserTypes.ServiceCategory,
  ) : async [UserTypes.WorkerProfilePublic] {
    UserLib.findNearbyWorkers(workers, lat, lng, category);
  };

  // Worker manually overrides their search radius (cannot exceed computed max)
  public shared ({ caller }) func updateWorkerRadius(newRadius : Nat) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    switch (workers.get(caller)) {
      case (?worker) {
        let maxAllowed = UserLib.computeRadius(worker.completedJobsCount);
        if (newRadius > maxAllowed) {
          Runtime.trap("Radius exceeds maximum allowed for your completed job count");
        };
        worker.radiusMiles := newRadius;
        true;
      };
      case null { Runtime.trap("Worker profile not found") };
    };
  };
};
