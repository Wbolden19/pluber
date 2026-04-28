import Types "../types/users";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";

module {
  public type UserMap = Map.Map<Types.UserId, Types.WorkerProfile>;
  public type HomeownerMap = Map.Map<Types.UserId, Types.HomeownerProfile>;
  public type WaiverMap = Map.Map<Types.UserId, Types.LiabilityWaiver>;

  // Convert internal WorkerProfile to public shared type (excludes doc refs)
  public func toWorkerPublic(self : Types.WorkerProfile) : Types.WorkerProfilePublic {
    {
      userId              = self.userId;
      serviceCategories   = self.serviceCategories;
      radiusMiles         = self.radiusMiles;
      completedJobsCount  = self.completedJobsCount;
      latitude            = self.latitude;
      longitude           = self.longitude;
      verificationStatus  = self.verificationStatus;
      enterpriseTier      = self.enterpriseTier;
      averageRating       = self.averageRating;
      createdAt           = self.createdAt;
    };
  };

  // Convert internal HomeownerProfile to public shared type
  public func toHomeownerPublic(self : Types.HomeownerProfile) : Types.HomeownerProfilePublic {
    {
      userId        = self.userId;
      address       = self.address;
      latitude      = self.latitude;
      longitude     = self.longitude;
      averageRating = self.averageRating;
      createdAt     = self.createdAt;
    };
  };

  // Register a new worker profile — traps if already registered
  public func registerWorker(
    workers : UserMap,
    userId  : Types.UserId,
    input   : Types.RegisterWorkerInput,
    now     : Types.Timestamp,
  ) : Types.WorkerProfile {
    switch (workers.get(userId)) {
      case (?_) { Runtime.trap("Worker already registered") };
      case null {
        let profile : Types.WorkerProfile = {
          userId;
          serviceCategories  = input.serviceCategories;
          var radiusMiles    = 10;
          var completedJobsCount = 0;
          var ratingCount    = 0;
          var latitude       = input.latitude;
          var longitude      = input.longitude;
          var verificationStatus = #Pending;
          var enterpriseTier = false;
          var averageRating  = 0.0;
          var insuranceDocRef = input.insuranceDocRef;
          var idDocRef       = input.idDocRef;
          createdAt          = now;
        };
        workers.add(userId, profile);
        profile;
      };
    };
  };

  // Register a new homeowner profile — traps if already registered
  public func registerHomeowner(
    homeowners : HomeownerMap,
    userId     : Types.UserId,
    input      : Types.RegisterHomeownerInput,
    now        : Types.Timestamp,
  ) : Types.HomeownerProfile {
    switch (homeowners.get(userId)) {
      case (?_) { Runtime.trap("Homeowner already registered") };
      case null {
        let profile : Types.HomeownerProfile = {
          userId;
          var address       = input.address;
          var latitude      = input.latitude;
          var longitude     = input.longitude;
          var averageRating = 0.0;
          var ratingCount   = 0;
          createdAt         = now;
        };
        homeowners.add(userId, profile);
        profile;
      };
    };
  };

  // Record liability waiver acceptance with version
  public func acceptWaiver(
    waivers : WaiverMap,
    userId  : Types.UserId,
    version : Text,
    now     : Types.Timestamp,
  ) : Types.LiabilityWaiver {
    let waiver : Types.LiabilityWaiver = {
      userId;
      acceptedAt = now;
      version;
    };
    waivers.add(userId, waiver);
    waiver;
  };

  // Check if user has accepted the waiver
  public func hasAcceptedWaiver(waivers : WaiverMap, userId : Types.UserId) : Bool {
    switch (waivers.get(userId)) {
      case (?_) true;
      case null false;
    };
  };

  // Compute radius: 10 base + 2 per 10 completed jobs, max 50
  public func computeRadius(completedJobsCount : Nat) : Nat {
    let bonus = (completedJobsCount / 10) * 2;
    let radius = 10 + bonus;
    if (radius > 50) 50 else radius;
  };

  // Update worker average rating (running average using embedded ratingCount)
  public func updateWorkerRating(worker : Types.WorkerProfile, newScore : Float) {
    let count = worker.ratingCount;
    if (count == 0) {
      worker.averageRating := newScore;
    } else {
      let total = worker.averageRating * count.toFloat();
      worker.averageRating := (total + newScore) / (count + 1).toFloat();
    };
    worker.ratingCount := count + 1;
  };

  // Update homeowner average rating (running average using embedded ratingCount)
  public func updateHomeownerRating(homeowner : Types.HomeownerProfile, newScore : Float) {
    let count = homeowner.ratingCount;
    if (count == 0) {
      homeowner.averageRating := newScore;
    } else {
      let total = homeowner.averageRating * count.toFloat();
      homeowner.averageRating := (total + newScore) / (count + 1).toFloat();
    };
    homeowner.ratingCount := count + 1;
  };

  // Haversine distance in miles between two lat/lng points
  func haversine(lat1 : Float, lng1 : Float, lat2 : Float, lng2 : Float) : Float {
    let earthRadiusMiles : Float = 3958.8;
    let toRad = func(deg : Float) : Float { deg * 3.14159265358979323846 / 180.0 };
    let dLat = toRad(lat2 - lat1);
    let dLng = toRad(lng2 - lng1);
    let rLat1 = toRad(lat1);
    let rLat2 = toRad(lat2);
    let sinDLat = Float.sin(dLat / 2.0);
    let sinDLng = Float.sin(dLng / 2.0);
    let a = sinDLat * sinDLat + Float.cos(rLat1) * Float.cos(rLat2) * sinDLng * sinDLng;
    let c = 2.0 * Float.arctan2(Float.sqrt(a), Float.sqrt(1.0 - a));
    earthRadiusMiles * c;
  };

  // Check if a worker has the requested service category
  func hasCategory(categories : [Types.ServiceCategory], target : Types.ServiceCategory) : Bool {
    categories.find(func(c : Types.ServiceCategory) : Bool { c == target }) != null;
  };

  // Find nearby workers filtered by radius and service category
  public func findNearbyWorkers(
    workers  : UserMap,
    lat      : Float,
    lng      : Float,
    category : Types.ServiceCategory,
  ) : [Types.WorkerProfilePublic] {
    var results : [Types.WorkerProfilePublic] = [];
    for ((_, worker) in workers.entries()) {
      if (
        worker.verificationStatus == #Approved and
        hasCategory(worker.serviceCategories, category)
      ) {
        let dist = haversine(lat, lng, worker.latitude, worker.longitude);
        if (dist <= worker.radiusMiles.toFloat()) {
          results := results.concat([toWorkerPublic(worker)]);
        };
      };
    };
    results;
  };
};
