export const APP_CONFIG = {
    // Blockchain
    NETWORK: "base-sepolia" as const, // x402-next Type requires specific string literal
    USDC_ADDRESS: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
    USDC_DECIMALS: 6,

    // Creator / Payment
    RECEIVER_ADDRESS: "0x3928da62f59501fcabb35b387402d08136fe3c60" as `0x${string}`,
    DEFAULT_PRICE: "0.01",
    DEFAULT_CURRENCY: "USDC",

    // Paywall Settings
    PAYWALL_TITLE: "Contact Creator (Demo)",
    PAYWALL_DESCRIPTION: "Message Submission (x402 Protected)",
};
