import Types "../types/enterprise";
import Map "mo:core/Map";
import List "mo:core/List";

module {
  public type DispatchMap = Map.Map<Types.EnterpriseDispatchId, Types.EnterpriseDispatch>;

  // Convert internal EnterpriseDispatch to shared public type
  public func toPublic(self : Types.EnterpriseDispatch) : Types.EnterpriseDispatchPublic {
    {
      id               = self.id;
      enterpriseClientId = self.enterpriseClientId;
      title            = self.title;
      description      = self.description;
      serviceCategory  = self.serviceCategory;
      address          = self.address;
      budgetUSD        = self.budgetUSD;
      workerIds        = self.workerIds;
      status           = self.status;
      createdAt        = self.createdAt;
      updatedAt        = self.updatedAt;
    };
  };

  // Create a new enterprise dispatch
  public func createDispatch(
    dispatches : DispatchMap,
    id : Types.EnterpriseDispatchId,
    clientId : Types.UserId,
    input : Types.CreateEnterpriseDispatchInput,
    now : Types.Timestamp,
  ) : Types.EnterpriseDispatch {
    let dispatch : Types.EnterpriseDispatch = {
      id;
      enterpriseClientId = clientId;
      title              = input.title;
      description        = input.description;
      serviceCategory    = input.serviceCategory;
      address            = input.address;
      budgetUSD          = input.budgetUSD;
      var workerIds      = [];
      var status         = #Open;
      createdAt          = now;
      var updatedAt      = now;
    };
    dispatches.add(id, dispatch);
    dispatch;
  };

  // Assign a worker to an enterprise dispatch
  public func assignWorker(
    dispatch : Types.EnterpriseDispatch,
    workerId : Types.UserId,
    now : Types.Timestamp,
  ) {
    let alreadyAssigned = dispatch.workerIds.find(func(id : Types.UserId) : Bool { id == workerId });
    switch alreadyAssigned {
      case (?_) {};
      case null {
        dispatch.workerIds := dispatch.workerIds.concat([workerId]);
        dispatch.updatedAt := now;
        if (dispatch.status == #Open) {
          dispatch.status := #InProgress;
        };
      };
    };
  };

  // Remove a worker from an enterprise dispatch
  public func removeWorker(
    dispatch : Types.EnterpriseDispatch,
    workerId : Types.UserId,
    now : Types.Timestamp,
  ) {
    dispatch.workerIds := dispatch.workerIds.filter(func(id : Types.UserId) : Bool { id != workerId });
    dispatch.updatedAt := now;
    if (dispatch.workerIds.size() == 0 and dispatch.status == #InProgress) {
      dispatch.status := #Open;
    };
  };

  // Update dispatch status
  public func updateStatus(
    dispatch : Types.EnterpriseDispatch,
    status : Types.EnterpriseDispatchStatus,
    now : Types.Timestamp,
  ) {
    dispatch.status    := status;
    dispatch.updatedAt := now;
  };

  // Get all dispatches for an enterprise client
  public func getByClient(dispatches : DispatchMap, clientId : Types.UserId) : [Types.EnterpriseDispatchPublic] {
    let results = List.empty<Types.EnterpriseDispatchPublic>();
    for ((_, dispatch) in dispatches.entries()) {
      if (dispatch.enterpriseClientId == clientId) {
        results.add(toPublic(dispatch));
      };
    };
    results.toArray();
  };

  // Get all open dispatches (for worker discovery)
  public func getOpenDispatches(dispatches : DispatchMap) : [Types.EnterpriseDispatchPublic] {
    let results = List.empty<Types.EnterpriseDispatchPublic>();
    for ((_, dispatch) in dispatches.entries()) {
      if (dispatch.status == #Open) {
        results.add(toPublic(dispatch));
      };
    };
    results.toArray();
  };
};
