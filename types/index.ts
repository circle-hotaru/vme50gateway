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

export type ChainType = 'ETHEREUM' | 'SOLANA' | 'BASE' | 'ARBITRUM' | 'POLYGON';

export interface WalletOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  chain: ChainType;
  color: string;
}

export interface PaymentLink {
  id: string;
  title: string;
  description: string;
  email: string;
  type: string;
  url: string;
  amount: number;
  walletAddress: string;
}

export interface IncomingMessage {
  id: string;
  sender: string;
  content: string;
  amount: number;
  timestamp: string;
  isRead: boolean;
  type: 'PAYMENT' | 'SYSTEM';
}

export interface UserState {
  isConnected: boolean;
  address: string | null;
  chain: ChainType | null;
  rank: string;
  stats: {
    threatsDeflected: number;
    taxCollected: number;
    activeShields: number;
    uptime: string;
  };
  paymentLinks: PaymentLink[];
  inbox: IncomingMessage[];
}
