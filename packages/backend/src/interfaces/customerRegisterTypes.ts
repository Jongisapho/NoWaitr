export interface CustomerResult {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    createdAt: Date;
    lastVisitAt: Date | null;
    isReturningCustomer: boolean;
}

export interface CustomerLoginRessponse {
    message: string;
    token: string;
    customer: {
        id: number;
        name: string | null;
        email: string;
        phone: string | null;
    };
}

export interface VerifyOTPResult {
    message: string;
}