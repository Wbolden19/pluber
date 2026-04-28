import Common "common";
import Users "users";

module {
  public type UserId = Common.UserId;
  public type EnterpriseDispatchId = Common.EnterpriseDispatchId;
  public type Timestamp = Common.Timestamp;
  public type ServiceCategory = Users.ServiceCategory;

  public type EnterpriseDispatchStatus = {
    #Open;
    #InProgress;
    #Completed;
    #Cancelled;
  };

  public type EnterpriseDispatch = {
    id : EnterpriseDispatchId;
    enterpriseClientId : UserId;
    title : Text;
    description : Text;
    serviceCategory : ServiceCategory;
    address : Text;
    budgetUSD : Nat; // cents
    var workerIds : [UserId];
    var status : EnterpriseDispatchStatus;
    createdAt : Timestamp;
    var updatedAt : Timestamp;
  };

  // Shared API type
  public type EnterpriseDispatchPublic = {
    id : EnterpriseDispatchId;
    enterpriseClientId : UserId;
    title : Text;
    description : Text;
    serviceCategory : ServiceCategory;
    address : Text;
    budgetUSD : Nat;
    workerIds : [UserId];
    status : EnterpriseDispatchStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type CreateEnterpriseDispatchInput = {
    title : Text;
    description : Text;
    serviceCategory : ServiceCategory;
    address : Text;
    budgetUSD : Nat;
  };
};
