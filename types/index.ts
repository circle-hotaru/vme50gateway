export interface PaywallConfig {
    id: string;
    creatorAddress: string;
    payToAddress?: string; // Optional: defaults to creatorAddress if not set
    title?: string; // Optional: link title/name for identification
    price: string; // e.g. "1.0"
    currency: string; // e.g. "USDC"
    email: string;
    description: string;
    createdAt?: string;
}

export interface Submission {
    id: string;
    paywallId: string;
    name?: string;
    message: string;
    contact: string;
    txHash?: string;
    walletAddress?: string;
    paid?: boolean;
    timestamp: string;
    // Joined from paywalls table
    paywallTitle?: string;
    paywallPrice?: string;
    paywallCurrency?: string;
}

export interface ApiResponse<T = any> {
    success?: boolean;
    error?: string;
    data?: T;
    details?: any; // For 402 payment details
}
