import Types "../types/jobs";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public type JobMap = Map.Map<Types.JobId, Types.Job>;

  // ── Haversine distance ────────────────────────────────────────────────────

  let earthRadiusMiles : Float = 3958.8;

  func toRadians(deg : Float) : Float { deg * 3.14159265358979323846 / 180.0 };

  public func haversineDistanceMiles(lat1 : Float, lng1 : Float, lat2 : Float, lng2 : Float) : Float {
    let dLat = toRadians(lat2 - lat1);
    let dLng = toRadians(lng2 - lng1);
    let a = Float.sin(dLat / 2.0) * Float.sin(dLat / 2.0)
      + Float.cos(toRadians(lat1)) * Float.cos(toRadians(lat2))
      * Float.sin(dLng / 2.0) * Float.sin(dLng / 2.0);
    let c = 2.0 * Float.arctan2(Float.sqrt(a), Float.sqrt(1.0 - a));
    earthRadiusMiles * c
  };

  // ── Convert internal Job to shared public type ────────────────────────────

  public func toPublic(self : Types.Job) : Types.JobPublic {
    {
      id = self.id;
      homeownerId = self.homeownerId;
      title = self.title;
      description = self.description;
      serviceCategory = self.serviceCategory;
      latitude = self.latitude;
      longitude = self.longitude;
      address = self.address;
      budgetUSD = self.budgetUSD;
      status = self.status;
      workerId = self.workerId;
      acceptedAt = self.acceptedAt;
      completedAt = self.completedAt;
      tipAmountUSD = self.tipAmountUSD;
      createdAt = self.createdAt;
      photoRefs = self.photoRefs;
      homeownerConfirmed = self.homeownerConfirmed;
      workerConfirmed = self.workerConfirmed;
    }
  };

  // ── Create a new job ──────────────────────────────────────────────────────

  public func createJob(
    jobs : JobMap,
    id : Types.JobId,
    homeownerId : Types.UserId,
    input : Types.CreateJobInput,
    now : Types.Timestamp,
  ) : Types.Job {
    if (input.title.size() == 0) Runtime.trap("Title cannot be empty");
    if (input.description.size() == 0) Runtime.trap("Description cannot be empty");
    if (input.budgetUSD == 0) Runtime.trap("Budget must be greater than zero");
    let job : Types.Job = {
      id;
      homeownerId;
      title = input.title;
      description = input.description;
      serviceCategory = input.serviceCategory;
      var latitude = input.latitude;
      var longitude = input.longitude;
      address = input.address;
      budgetUSD = input.budgetUSD;
      var status = #Open;
      var workerId = null;
      var acceptedAt = null;
      var completedAt = null;
      var tipAmountUSD = null;
      createdAt = now;
      var photoRefs = input.photoRefs;
      var homeownerConfirmed = false;
      var workerConfirmed = false;
    };
    jobs.add(id, job);
    job
  };

  // ── Get a job by ID ───────────────────────────────────────────────────────

  public func getJob(jobs : JobMap, id : Types.JobId) : ?Types.Job {
    jobs.get(id)
  };

  // ── Update editable job fields (only while #Open) ─────────────────────────
  // Only photoRefs is mutable; title/description/budgetUSD are immutable on Job.

  public func updateJob(job : Types.Job, input : Types.UpdateJobInput) {
    switch (job.status) {
      case (#Open) {};
      case (_) Runtime.trap("Can only update job when status is Open");
    };
    switch (input.photoRefs) { case (?refs) { job.photoRefs := refs }; case null {} };
  };

  // ── Accept a job (worker picks it up) ────────────────────────────────────

  public func acceptJob(job : Types.Job, workerId : Types.UserId, now : Types.Timestamp) {
    switch (job.status) {
      case (#Open) {};
      case (_) Runtime.trap("Job must be Open to accept");
    };
    job.status := #Accepted;
    job.workerId := ?workerId;
    job.acceptedAt := ?now;
  };

  // ── Mark job as InProgress ────────────────────────────────────────────────

  public func startJob(job : Types.Job) {
    switch (job.status) {
      case (#Accepted) {};
      case (_) Runtime.trap("Job must be Accepted to start");
    };
    job.status := #InProgress;
  };

  // ── Worker confirms completion ────────────────────────────────────────────

  public func workerConfirm(job : Types.Job, now : Types.Timestamp) {
    switch (job.status) {
      case (#InProgress) {};
      case (#Accepted) {};
      case (_) Runtime.trap("Job must be InProgress or Accepted to confirm");
    };
    job.workerConfirmed := true;
    if (job.homeownerConfirmed) {
      job.status := #Completed;
      job.completedAt := ?now;
    };
  };

  // ── Homeowner confirms completion ─────────────────────────────────────────

  public func homeownerConfirm(job : Types.Job, now : Types.Timestamp) {
    switch (job.status) {
      case (#InProgress) {};
      case (#Accepted) {};
      case (_) Runtime.trap("Job must be InProgress or Accepted to confirm");
    };
    job.homeownerConfirmed := true;
    if (job.workerConfirmed) {
      job.status := #Completed;
      job.completedAt := ?now;
    };
  };

  // ── Cancel a job ──────────────────────────────────────────────────────────

  public func cancelJob(job : Types.Job) {
    switch (job.status) {
      case (#Open) {};
      case (#Accepted) {};
      case (_) Runtime.trap("Can only cancel Open or Accepted jobs");
    };
    job.status := #Cancelled;
  };

  // ── Dispute a job ─────────────────────────────────────────────────────────

  public func disputeJob(job : Types.Job) {
    switch (job.status) {
      case (#InProgress) {};
      case (#Accepted) {};
      case (_) Runtime.trap("Can only dispute InProgress or Accepted jobs");
    };
    job.status := #Disputed;
  };

  // ── Add tip ───────────────────────────────────────────────────────────────

  public func addTip(job : Types.Job, tipAmountUSD : Nat) {
    switch (job.status) {
      case (#Completed) {};
      case (#InProgress) {};
      case (_) Runtime.trap("Can only tip on Completed or InProgress jobs");
    };
    if (tipAmountUSD == 0) Runtime.trap("Tip amount must be greater than zero");
    job.tipAmountUSD := ?tipAmountUSD;
  };

  // ── Category membership helper ────────────────────────────────────────────

  func categoryEqual(a : Types.ServiceCategory, b : Types.ServiceCategory) : Bool {
    switch (a, b) {
      case (#LawnMowing, #LawnMowing) true;
      case (#SnowPlowing, #SnowPlowing) true;
      case (#LeafRaking, #LeafRaking) true;
      case (#BushTrimming, #BushTrimming) true;
      case (#WeedWhacking, #WeedWhacking) true;
      case (#WindowWashing, #WindowWashing) true;
      case (#GutterCleaning, #GutterCleaning) true;
      case (#PressureWashing, #PressureWashing) true;
      case (#GeneralYardWork, #GeneralYardWork) true;
      case (_, _) false;
    }
  };

  func hasCategory(categories : [Types.ServiceCategory], cat : Types.ServiceCategory) : Bool {
    categories.find(func(c) : Bool { categoryEqual(c, cat) }) != null
  };

  // ── Get open jobs for worker filtered by category and distance ────────────

  public func getOpenJobsForWorker(
    jobs : JobMap,
    lat : Float,
    lng : Float,
    radiusMiles : Nat,
    categories : [Types.ServiceCategory],
  ) : [Types.JobPublic] {
    let radiusF : Float = radiusMiles.toFloat();
    let result = List.empty<Types.JobPublic>();
    for ((_, job) in jobs.entries()) {
      switch (job.status) {
        case (#Open) {
          if (hasCategory(categories, job.serviceCategory)) {
            let dist = haversineDistanceMiles(lat, lng, job.latitude, job.longitude);
            if (dist <= radiusF) {
              result.add(toPublic(job));
            };
          };
        };
        case (_) {};
      };
    };
    result.toArray()
  };

  // ── Get all jobs by homeowner ─────────────────────────────────────────────

  public func getJobsByHomeowner(jobs : JobMap, homeownerId : Types.UserId) : [Types.JobPublic] {
    let result = List.empty<Types.JobPublic>();
    for ((_, job) in jobs.entries()) {
      if (Principal.equal(job.homeownerId, homeownerId)) {
        result.add(toPublic(job));
      };
    };
    result.toArray()
  };

  // ── Get all jobs by worker ────────────────────────────────────────────────

  public func getJobsByWorker(jobs : JobMap, workerId : Types.UserId) : [Types.JobPublic] {
    let result = List.empty<Types.JobPublic>();
    for ((_, job) in jobs.entries()) {
      switch (job.workerId) {
        case (?wId) {
          if (Principal.equal(wId, workerId)) {
            result.add(toPublic(job));
          };
        };
        case null {};
      };
    };
    result.toArray()
  };
};
