import PaymentTypes "../types/payments";
import JobTypes "../types/jobs";
import PaymentLib "../lib/payments";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

mixin (
  payments : Map.Map<PaymentTypes.PaymentId, PaymentTypes.PaymentRecord>,
  jobPayments : Map.Map<JobTypes.JobId, PaymentTypes.PaymentId>,
  jobs : Map.Map<JobTypes.JobId, JobTypes.Job>,
  nextPaymentId : { var val : Nat },
) {
  // Initiate escrow (called after job accepted and Stripe payment intent created)
  public shared ({ caller }) func initiateEscrow(input : PaymentTypes.InitiatePaymentInput) : async PaymentTypes.PaymentRecordPublic {
    // Look up the job to verify caller is the homeowner
    let job = switch (jobs.get(input.jobId)) {
      case null Runtime.trap("Job not found");
      case (?j) j;
    };

    if (not Principal.equal(job.homeownerId, caller)) {
      Runtime.trap("Only the homeowner can initiate payment");
    };

    // Prevent duplicate payments for the same job
    if (jobPayments.containsKey(input.jobId)) {
      Runtime.trap("Payment already initiated for this job");
    };

    let id = nextPaymentId.val;
    nextPaymentId.val += 1;

    let record = PaymentLib.initiateEscrow(payments, jobPayments, id, input, Time.now());
    record.toPublic();
  };

  // Get payment record for a job (visible to homeowner and assigned worker)
  public shared query ({ caller }) func getPaymentForJob(jobId : JobTypes.JobId) : async ?PaymentTypes.PaymentRecordPublic {
    let job = switch (jobs.get(jobId)) {
      case null return null;
      case (?j) j;
    };

    // Only homeowner or assigned worker may view payment
    let isHomeowner = Principal.equal(job.homeownerId, caller);
    let isWorker = switch (job.workerId) {
      case null false;
      case (?wid) Principal.equal(wid, caller);
    };

    if (not isHomeowner and not isWorker) {
      return null;
    };

    switch (PaymentLib.getPaymentByJob(payments, jobPayments, jobId)) {
      case null null;
      case (?p) ?p.toPublic();
    };
  };

  // Add tip to a job's payment (homeowner only; job must be InProgress or Completed)
  public shared ({ caller }) func addTip(input : PaymentTypes.AddTipInput) : async Bool {
    let job = switch (jobs.get(input.jobId)) {
      case null Runtime.trap("Job not found");
      case (?j) j;
    };

    if (not Principal.equal(job.homeownerId, caller)) {
      Runtime.trap("Only the homeowner can add a tip");
    };

    switch (job.status) {
      case (#InProgress) {};
      case (#Completed) {};
      case (_) Runtime.trap("Tips can only be added when job is InProgress or Completed");
    };

    let payment = switch (PaymentLib.getPaymentByJob(payments, jobPayments, input.jobId)) {
      case null Runtime.trap("No payment found for this job");
      case (?p) p;
    };

    PaymentLib.addTip(payment, input.tipAmountUSD, Time.now());
    true;
  };

  // Release escrow to worker (called when both parties confirm completion)
  public shared ({ caller }) func releaseEscrow(jobId : JobTypes.JobId, stripePayoutId : Text) : async Bool {
    let job = switch (jobs.get(jobId)) {
      case null Runtime.trap("Job not found");
      case (?j) j;
    };

    // Only the homeowner or assigned worker may trigger release
    let isHomeowner = Principal.equal(job.homeownerId, caller);
    let isWorker = switch (job.workerId) {
      case null false;
      case (?wid) Principal.equal(wid, caller);
    };

    if (not isHomeowner and not isWorker) {
      Runtime.trap("Not authorized to release escrow");
    };

    let payment = switch (PaymentLib.getPaymentByJob(payments, jobPayments, jobId)) {
      case null Runtime.trap("No payment found for this job");
      case (?p) p;
    };

    switch (payment.escrowStatus) {
      case (#Held) {};
      case (_) Runtime.trap("Payment is not in escrow");
    };

    PaymentLib.releaseEscrow(payment, stripePayoutId, Time.now());
    true;
  };

  // Refund escrow (called on job cancel or dispute resolution)
  public shared ({ caller }) func refundEscrow(jobId : JobTypes.JobId) : async Bool {
    let job = switch (jobs.get(jobId)) {
      case null Runtime.trap("Job not found");
      case (?j) j;
    };

    // Only the homeowner can request a refund
    if (not Principal.equal(job.homeownerId, caller)) {
      Runtime.trap("Only the homeowner can request a refund");
    };

    let payment = switch (PaymentLib.getPaymentByJob(payments, jobPayments, jobId)) {
      case null Runtime.trap("No payment found for this job");
      case (?p) p;
    };

    switch (payment.escrowStatus) {
      case (#Held) {};
      case (_) Runtime.trap("Payment is not in escrow");
    };

    PaymentLib.refundEscrow(payment, Time.now());
    true;
  };
};
