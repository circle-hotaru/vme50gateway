export interface PaywallConfig {
    id: string;
    creatorAddress: string;
    price: string; // e.g. "1.0"
    currency: string; // e.g. "USDC"
    email: string;
    description: string;
}

export interface Submission {
    id: string;
    paywallId: string;
    content: string;
    contact: string;
    txHash: string;
    timestamp: string;
}

export interface ApiResponse<T = any> {
    success?: boolean;
    error?: string;
    data?: T;
    details?: any; // For 402 payment details
}
