import JobTypes "../types/jobs";
import UserTypes "../types/users";
import JobLib "../lib/jobs";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

mixin (
  jobs : Map.Map<JobTypes.JobId, JobTypes.Job>,
  workers : Map.Map<UserTypes.UserId, UserTypes.WorkerProfile>,
  homeowners : Map.Map<UserTypes.UserId, UserTypes.HomeownerProfile>,
  waivers : Map.Map<UserTypes.UserId, UserTypes.LiabilityWaiver>,
  nextJobId : { var val : Nat },
) {

  // ── Create a new job posting (homeowner only) ─────────────────────────────

  public shared ({ caller }) func createJob(input : JobTypes.CreateJobInput) : async JobTypes.JobPublic {
    switch (homeowners.get(caller)) {
      case null Runtime.trap("Caller is not a registered homeowner");
      case (?_) {};
    };
    switch (waivers.get(caller)) {
      case null Runtime.trap("Homeowner has not signed the liability waiver");
      case (?_) {};
    };
    let id = nextJobId.val;
    nextJobId.val += 1;
    let job = JobLib.createJob(jobs, id, caller, input, Time.now());
    job.toPublic()
  };

  // ── Get a job by ID ───────────────────────────────────────────────────────

  public query func getJob(id : JobTypes.JobId) : async ?JobTypes.JobPublic {
    switch (JobLib.getJob(jobs, id)) {
      case (?job) ?job.toPublic();
      case null null;
    }
  };

  // ── Cancel a job (homeowner, while Open or Accepted) ──────────────────────

  public shared ({ caller }) func cancelJob(id : JobTypes.JobId) : async Bool {
    let job = switch (JobLib.getJob(jobs, id)) {
      case (?j) j;
      case null Runtime.trap("Job not found");
    };
    if (not Principal.equal(job.homeownerId, caller)) {
      Runtime.trap("Only the homeowner can cancel this job");
    };
    JobLib.cancelJob(job);
    true
  };

  // ── Accept a job (worker only) ────────────────────────────────────────────

  public shared ({ caller }) func acceptJob(id : JobTypes.JobId) : async Bool {
    let worker = switch (workers.get(caller)) {
      case (?w) w;
      case null Runtime.trap("Caller is not a registered worker");
    };
    switch (waivers.get(caller)) {
      case null Runtime.trap("Worker has not signed the liability waiver");
      case (?_) {};
    };
    let job = switch (JobLib.getJob(jobs, id)) {
      case (?j) j;
      case null Runtime.trap("Job not found");
    };
    // Validate worker has the required category
    let hasCategory = worker.serviceCategories.find(
      func(c) : Bool {
        switch (c, job.serviceCategory) {
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
      }
    );
    if (hasCategory == null) {
      Runtime.trap("Worker does not have the required service category for this job");
    };
    JobLib.acceptJob(job, caller, Time.now());
    true
  };

  // ── Worker starts the job (move to InProgress) ────────────────────────────

  public shared ({ caller }) func startJob(id : JobTypes.JobId) : async Bool {
    let job = switch (JobLib.getJob(jobs, id)) {
      case (?j) j;
      case null Runtime.trap("Job not found");
    };
    switch (job.workerId) {
      case (?wId) {
        if (not Principal.equal(wId, caller)) Runtime.trap("Only the assigned worker can start this job");
      };
      case null Runtime.trap("No worker assigned to this job");
    };
    JobLib.startJob(job);
    true
  };

  // ── Worker confirms job completed ─────────────────────────────────────────

  public shared ({ caller }) func workerConfirmCompletion(id : JobTypes.JobId) : async Bool {
    let job = switch (JobLib.getJob(jobs, id)) {
      case (?j) j;
      case null Runtime.trap("Job not found");
    };
    switch (job.workerId) {
      case (?wId) {
        if (not Principal.equal(wId, caller)) Runtime.trap("Only the assigned worker can confirm completion");
      };
      case null Runtime.trap("No worker assigned to this job");
    };
    JobLib.workerConfirm(job, Time.now());
    true
  };

  // ── Homeowner confirms job completed (triggers escrow release) ────────────

  public shared ({ caller }) func homeownerConfirmCompletion(id : JobTypes.JobId) : async Bool {
    let job = switch (JobLib.getJob(jobs, id)) {
      case (?j) j;
      case null Runtime.trap("Job not found");
    };
    if (not Principal.equal(job.homeownerId, caller)) {
      Runtime.trap("Only the homeowner can confirm completion");
    };
    JobLib.homeownerConfirm(job, Time.now());
    true
  };

  // ── Dispute a job ─────────────────────────────────────────────────────────

  public shared ({ caller }) func disputeJob(id : JobTypes.JobId) : async Bool {
    let job = switch (JobLib.getJob(jobs, id)) {
      case (?j) j;
      case null Runtime.trap("Job not found");
    };
    // Either party (homeowner or worker) can dispute
    let isHomeowner = Principal.equal(job.homeownerId, caller);
    let isWorker = switch (job.workerId) {
      case (?wId) Principal.equal(wId, caller);
      case null false;
    };
    if (not isHomeowner and not isWorker) {
      Runtime.trap("Only the homeowner or assigned worker can dispute this job");
    };
    JobLib.disputeJob(job);
    true
  };

  // ── Add tip (record tip amount on the job) ───────────────────────────────

  public shared ({ caller }) func addJobTip(id : JobTypes.JobId, tipAmountUSD : Nat) : async Bool {
    let job = switch (JobLib.getJob(jobs, id)) {
      case (?j) j;
      case null Runtime.trap("Job not found");
    };
    if (not Principal.equal(job.homeownerId, caller)) {
      Runtime.trap("Only the homeowner can add a tip");
    };
    JobLib.addTip(job, tipAmountUSD);
    true
  };

  // ── Get all jobs posted by caller (homeowner) ─────────────────────────────

  public shared query ({ caller }) func getMyPostedJobs() : async [JobTypes.JobPublic] {
    JobLib.getJobsByHomeowner(jobs, caller)
  };

  // ── Get all jobs accepted/worked by caller (worker) ───────────────────────

  public shared query ({ caller }) func getMyWorkerJobs() : async [JobTypes.JobPublic] {
    JobLib.getJobsByWorker(jobs, caller)
  };

  // ── Get open jobs visible to caller worker ────────────────────────────────

  public shared query ({ caller }) func getAvailableJobs() : async [JobTypes.JobPublic] {
    let worker = switch (workers.get(caller)) {
      case (?w) w;
      case null Runtime.trap("Caller is not a registered worker");
    };
    JobLib.getOpenJobsForWorker(
      jobs,
      worker.latitude,
      worker.longitude,
      worker.radiusMiles,
      worker.serviceCategories,
    )
  };
};
