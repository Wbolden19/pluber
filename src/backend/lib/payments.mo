import Types "../types/payments";
import Map "mo:core/Map";

module {
  public type PaymentMap = Map.Map<Types.PaymentId, Types.PaymentRecord>;
  public type JobPaymentMap = Map.Map<Types.JobId, Types.PaymentId>;

  // Convert internal PaymentRecord to shared public type
  public func toPublic(self : Types.PaymentRecord) : Types.PaymentRecordPublic {
    {
      id = self.id;
      jobId = self.jobId;
      escrowStatus = self.escrowStatus;
      stripePaymentIntentId = self.stripePaymentIntentId;
      stripePayoutId = self.stripePayoutId;
      amountUSD = self.amountUSD;
      tipAmountUSD = self.tipAmountUSD;
      commissionAmount = self.commissionAmount;
      createdAt = self.createdAt;
      updatedAt = self.updatedAt;
    };
  };

  // Initiate escrow (hold payment)
  public func initiateEscrow(
    payments : PaymentMap,
    jobPayments : JobPaymentMap,
    id : Types.PaymentId,
    input : Types.InitiatePaymentInput,
    now : Types.Timestamp,
  ) : Types.PaymentRecord {
    // Calculate 15% commission for enterprise jobs
    let commissionAmount = input.amountUSD * 15 / 100;

    let record : Types.PaymentRecord = {
      id;
      jobId = input.jobId;
      var escrowStatus = #Held;
      stripePaymentIntentId = input.stripePaymentIntentId;
      var stripePayoutId = null;
      amountUSD = input.amountUSD;
      var tipAmountUSD = 0;
      commissionAmount;
      createdAt = now;
      var updatedAt = now;
    };
    payments.add(id, record);
    jobPayments.add(input.jobId, id);
    record;
  };

  // Release escrowed funds to worker after mutual confirmation
  public func releaseEscrow(payment : Types.PaymentRecord, payoutId : Text, now : Types.Timestamp) {
    payment.escrowStatus := #Released;
    payment.stripePayoutId := ?payoutId;
    payment.updatedAt := now;
  };

  // Refund escrow to homeowner (dispute/cancel)
  public func refundEscrow(payment : Types.PaymentRecord, now : Types.Timestamp) {
    payment.escrowStatus := #Refunded;
    payment.updatedAt := now;
  };

  // Add tip amount to payment record
  public func addTip(payment : Types.PaymentRecord, tipAmountUSD : Nat, now : Types.Timestamp) {
    payment.tipAmountUSD := tipAmountUSD;
    payment.updatedAt := now;
  };

  // Get payment record by job ID
  public func getPaymentByJob(
    payments : PaymentMap,
    jobPayments : JobPaymentMap,
    jobId : Types.JobId,
  ) : ?Types.PaymentRecord {
    switch (jobPayments.get(jobId)) {
      case null null;
      case (?paymentId) payments.get(paymentId);
    };
  };
};
