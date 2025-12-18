import { PaywallConfig } from "@/types";

// Global mock store to survive module reloads in some environments (though partial)
// In a real app, use a real DB.
export const MOCK_PAYWALLS: Record<string, PaywallConfig> = {};
