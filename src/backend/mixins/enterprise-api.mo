import EntTypes "../types/enterprise";
import UserTypes "../types/users";
import EntLib "../lib/enterprise";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

mixin (
  dispatches : Map.Map<EntTypes.EnterpriseDispatchId, EntTypes.EnterpriseDispatch>,
  workers : Map.Map<UserTypes.UserId, UserTypes.WorkerProfile>,
  nextDispatchId : { var val : Nat },
) {
  // Create an enterprise dispatch (enterprise-tier clients only)
  public shared ({ caller }) func createEnterpriseDispatch(input : EntTypes.CreateEnterpriseDispatchInput) : async EntTypes.EnterpriseDispatchPublic {
    // Only enterprise workers (who have been vetted) or anyone flagged as enterprise client
    // For access control: we verify the caller has a worker profile with enterpriseTier=true
    // OR we allow any registered worker to create enterprise dispatches as a client
    // Per requirements: enterprise clients create dispatches — check enterpriseTier on worker profile
    switch (workers.get(caller)) {
      case (?worker) {
        if (not worker.enterpriseTier) {
          Runtime.trap("Enterprise tier required to create enterprise dispatches");
        };
      };
      case null {
        Runtime.trap("Worker profile required to create enterprise dispatches");
      };
    };
    let id = nextDispatchId.val;
    nextDispatchId.val += 1;
    let now = Time.now();
    let dispatch = EntLib.createDispatch(dispatches, id, caller, input, now);
    dispatch.toPublic();
  };

  // Assign a worker to an enterprise dispatch
  public shared ({ caller }) func assignWorkerToDispatch(
    dispatchId : EntTypes.EnterpriseDispatchId,
    workerId : UserTypes.UserId,
  ) : async Bool {
    switch (dispatches.get(dispatchId)) {
      case null { false };
      case (?dispatch) {
        // Only the enterprise client who created the dispatch can assign workers
        if (dispatch.enterpriseClientId != caller) {
          Runtime.trap("Only the dispatch creator can assign workers");
        };
        // Worker must have enterpriseTier enabled
        switch (workers.get(workerId)) {
          case null { Runtime.trap("Worker profile not found") };
          case (?worker) {
            if (not worker.enterpriseTier) {
              Runtime.trap("Worker must have enterprise tier enabled");
            };
          };
        };
        EntLib.assignWorker(dispatch, workerId, Time.now());
        true;
      };
    };
  };

  // Remove a worker from an enterprise dispatch
  public shared ({ caller }) func removeWorkerFromDispatch(
    dispatchId : EntTypes.EnterpriseDispatchId,
    workerId : UserTypes.UserId,
  ) : async Bool {
    switch (dispatches.get(dispatchId)) {
      case null { false };
      case (?dispatch) {
        if (dispatch.enterpriseClientId != caller) {
          Runtime.trap("Only the dispatch creator can remove workers");
        };
        EntLib.removeWorker(dispatch, workerId, Time.now());
        true;
      };
    };
  };

  // Update enterprise dispatch status
  public shared ({ caller }) func updateEnterpriseDispatchStatus(
    dispatchId : EntTypes.EnterpriseDispatchId,
    status : EntTypes.EnterpriseDispatchStatus,
  ) : async Bool {
    switch (dispatches.get(dispatchId)) {
      case null { false };
      case (?dispatch) {
        if (dispatch.enterpriseClientId != caller) {
          Runtime.trap("Only the dispatch creator can update status");
        };
        EntLib.updateStatus(dispatch, status, Time.now());
        true;
      };
    };
  };

  // Get all enterprise dispatches for the caller (enterprise client)
  public shared query ({ caller }) func getMyEnterpriseDispatches() : async [EntTypes.EnterpriseDispatchPublic] {
    EntLib.getByClient(dispatches, caller);
  };

  // Get open enterprise dispatches (for enterprise worker discovery)
  public query func getOpenEnterpriseDispatches() : async [EntTypes.EnterpriseDispatchPublic] {
    EntLib.getOpenDispatches(dispatches);
  };

  // Get a specific enterprise dispatch
  public query func getEnterpriseDispatch(id : EntTypes.EnterpriseDispatchId) : async ?EntTypes.EnterpriseDispatchPublic {
    switch (dispatches.get(id)) {
      case null { null };
      case (?dispatch) { ?dispatch.toPublic() };
    };
  };
};
