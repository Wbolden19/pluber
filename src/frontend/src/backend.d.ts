import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InitiatePaymentInput {
    jobId: JobId;
    stripePaymentIntentId: string;
    amountUSD: bigint;
}
export type Timestamp = bigint;
export interface Rating {
    id: RatingId;
    ratedUserId: UserId;
    createdAt: Timestamp;
    jobId: JobId;
    score: bigint;
    ratedByUserId: UserId;
    comment?: string;
}
export interface CreateJobInput {
    latitude: number;
    photoRefs: Array<string>;
    title: string;
    serviceCategory: ServiceCategory;
    description: string;
    longitude: number;
    address: string;
    budgetUSD: bigint;
}
export interface AddTipInput {
    tipAmountUSD: bigint;
    jobId: JobId;
}
export interface WorkerProfilePublic {
    latitude: number;
    enterpriseTier: boolean;
    userId: UserId;
    createdAt: Timestamp;
    serviceCategories: Array<ServiceCategory>;
    averageRating: number;
    longitude: number;
    radiusMiles: bigint;
    completedJobsCount: bigint;
    verificationStatus: VerificationStatus;
}
export type JobId = bigint;
export type EnterpriseDispatchId = bigint;
export interface SubmitRatingInput {
    ratedUserId: UserId;
    jobId: JobId;
    score: bigint;
    comment?: string;
}
export interface RegisterHomeownerInput {
    latitude: number;
    longitude: number;
    address: string;
}
export type UserId = Principal;
export interface RegisterWorkerInput {
    latitude: number;
    idDocRef?: string;
    serviceCategories: Array<ServiceCategory>;
    longitude: number;
    insuranceDocRef?: string;
}
export interface PaymentRecordPublic {
    id: PaymentId;
    tipAmountUSD: bigint;
    createdAt: Timestamp;
    jobId: JobId;
    escrowStatus: EscrowStatus;
    updatedAt: Timestamp;
    commissionAmount: bigint;
    stripePaymentIntentId: string;
    amountUSD: bigint;
    stripePayoutId?: string;
}
export type PaymentId = bigint;
export type NotificationId = bigint;
export interface JobPublic {
    id: JobId;
    status: JobStatus;
    latitude: number;
    completedAt?: Timestamp;
    photoRefs: Array<string>;
    title: string;
    serviceCategory: ServiceCategory;
    workerId?: UserId;
    workerConfirmed: boolean;
    tipAmountUSD?: bigint;
    createdAt: Timestamp;
    homeownerId: UserId;
    description: string;
    longitude: number;
    address: string;
    budgetUSD: bigint;
    acceptedAt?: Timestamp;
    homeownerConfirmed: boolean;
}
export interface HomeownerProfilePublic {
    latitude: number;
    userId: UserId;
    createdAt: Timestamp;
    averageRating: number;
    longitude: number;
    address: string;
}
export type RatingId = bigint;
export interface EnterpriseDispatchPublic {
    id: EnterpriseDispatchId;
    status: EnterpriseDispatchStatus;
    title: string;
    serviceCategory: ServiceCategory;
    createdAt: Timestamp;
    description: string;
    enterpriseClientId: UserId;
    updatedAt: Timestamp;
    workerIds: Array<UserId>;
    address: string;
    budgetUSD: bigint;
}
export interface CreateEnterpriseDispatchInput {
    title: string;
    serviceCategory: ServiceCategory;
    description: string;
    address: string;
    budgetUSD: bigint;
}
export interface NotificationPublic {
    id: NotificationId;
    userId: UserId;
    notificationType: NotificationType;
    createdAt: Timestamp;
    jobId?: JobId;
    isRead: boolean;
    message: string;
}
export enum EnterpriseDispatchStatus {
    Open = "Open",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
    Completed = "Completed"
}
export enum EscrowStatus {
    Refunded = "Refunded",
    Held = "Held",
    Released = "Released"
}
export enum JobStatus {
    Disputed = "Disputed",
    Open = "Open",
    Accepted = "Accepted",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
    Completed = "Completed"
}
export enum NotificationType {
    JobAccepted = "JobAccepted",
    EnterpriseDispatch = "EnterpriseDispatch",
    TipReceived = "TipReceived",
    JobCompleted = "JobCompleted",
    JobAvailable = "JobAvailable",
    RatingReceived = "RatingReceived"
}
export enum ServiceCategory {
    BushTrimming = "BushTrimming",
    GeneralYardWork = "GeneralYardWork",
    LeafRaking = "LeafRaking",
    LawnMowing = "LawnMowing",
    WindowWashing = "WindowWashing",
    WeedWhacking = "WeedWhacking",
    SnowPlowing = "SnowPlowing",
    GutterCleaning = "GutterCleaning",
    PressureWashing = "PressureWashing"
}
export enum VerificationStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending"
}
export interface backendInterface {
    acceptJob(id: JobId): Promise<boolean>;
    acceptLiabilityWaiver(version: string): Promise<boolean>;
    addJobTip(id: JobId, tipAmountUSD: bigint): Promise<boolean>;
    addTip(input: AddTipInput): Promise<boolean>;
    assignWorkerToDispatch(dispatchId: EnterpriseDispatchId, workerId: UserId): Promise<boolean>;
    cancelJob(id: JobId): Promise<boolean>;
    createEnterpriseDispatch(input: CreateEnterpriseDispatchInput): Promise<EnterpriseDispatchPublic>;
    createJob(input: CreateJobInput): Promise<JobPublic>;
    disputeJob(id: JobId): Promise<boolean>;
    findNearbyWorkers(lat: number, lng: number, category: ServiceCategory): Promise<Array<WorkerProfilePublic>>;
    getAvailableJobs(): Promise<Array<JobPublic>>;
    getAverageRating(userId: UserId): Promise<number>;
    getEnterpriseDispatch(id: EnterpriseDispatchId): Promise<EnterpriseDispatchPublic | null>;
    getHomeownerProfile(userId: UserId): Promise<HomeownerProfilePublic | null>;
    getJob(id: JobId): Promise<JobPublic | null>;
    getMyEnterpriseDispatches(): Promise<Array<EnterpriseDispatchPublic>>;
    getMyHomeownerProfile(): Promise<HomeownerProfilePublic | null>;
    getMyNotifications(): Promise<Array<NotificationPublic>>;
    getMyPostedJobs(): Promise<Array<JobPublic>>;
    getMyWorkerJobs(): Promise<Array<JobPublic>>;
    getMyWorkerProfile(): Promise<WorkerProfilePublic | null>;
    getOpenEnterpriseDispatches(): Promise<Array<EnterpriseDispatchPublic>>;
    getPaymentForJob(jobId: JobId): Promise<PaymentRecordPublic | null>;
    getRatingsForUser(userId: UserId): Promise<Array<Rating>>;
    getWorkerProfile(userId: UserId): Promise<WorkerProfilePublic | null>;
    hasAcceptedWaiver(): Promise<boolean>;
    homeownerConfirmCompletion(id: JobId): Promise<boolean>;
    initiateEscrow(input: InitiatePaymentInput): Promise<PaymentRecordPublic>;
    markAllNotificationsRead(): Promise<boolean>;
    markNotificationRead(notifId: NotificationId): Promise<boolean>;
    refundEscrow(jobId: JobId): Promise<boolean>;
    registerHomeowner(input: RegisterHomeownerInput): Promise<HomeownerProfilePublic>;
    registerWorker(input: RegisterWorkerInput): Promise<WorkerProfilePublic>;
    releaseEscrow(jobId: JobId, stripePayoutId: string): Promise<boolean>;
    removeWorkerFromDispatch(dispatchId: EnterpriseDispatchId, workerId: UserId): Promise<boolean>;
    startJob(id: JobId): Promise<boolean>;
    submitRating(input: SubmitRatingInput): Promise<Rating>;
    updateEnterpriseDispatchStatus(dispatchId: EnterpriseDispatchId, status: EnterpriseDispatchStatus): Promise<boolean>;
    updateWorkerLocation(latitude: number, longitude: number): Promise<boolean>;
    updateWorkerRadius(newRadius: bigint): Promise<boolean>;
    updateWorkerVerification(workerId: UserId, status: VerificationStatus): Promise<boolean>;
    workerConfirmCompletion(id: JobId): Promise<boolean>;
}
