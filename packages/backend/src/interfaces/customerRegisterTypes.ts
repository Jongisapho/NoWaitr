export interface CustomerResult {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    createdAt: Date;
    lastVisitAt: Date | null;
    isReturningCustomer: boolean;
}

export interface VerifyOTPResult {
    message: string;
}