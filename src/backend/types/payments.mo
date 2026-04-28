import Common "common";

module {
  public type JobId = Common.JobId;
  public type PaymentId = Common.PaymentId;
  public type Timestamp = Common.Timestamp;

  public type EscrowStatus = {
    #Held;
    #Released;
    #Refunded;
  };

  public type PaymentRecord = {
    id : PaymentId;
    jobId : JobId;
    var escrowStatus : EscrowStatus;
    stripePaymentIntentId : Text;
    var stripePayoutId : ?Text;
    amountUSD : Nat; // cents
    var tipAmountUSD : Nat; // cents
    commissionAmount : Nat; // 15% of amountUSD for enterprise jobs, in cents
    createdAt : Timestamp;
    var updatedAt : Timestamp;
  };

  // Shared API type
  public type PaymentRecordPublic = {
    id : PaymentId;
    jobId : JobId;
    escrowStatus : EscrowStatus;
    stripePaymentIntentId : Text;
    stripePayoutId : ?Text;
    amountUSD : Nat;
    tipAmountUSD : Nat;
    commissionAmount : Nat;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type InitiatePaymentInput = {
    jobId : JobId;
    stripePaymentIntentId : Text;
    amountUSD : Nat;
  };

  public type AddTipInput = {
    jobId : JobId;
    tipAmountUSD : Nat;
  };
};
