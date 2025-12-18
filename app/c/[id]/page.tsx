import { PaywallForm } from "@/components/paywall-form";
import { PaywallConfig } from "@/types";
import { MOCK_PAYWALLS } from "@/lib/db";
import { APP_CONFIG } from "@/lib/app-config";

// This is a server component
export default async function GatewayPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Lookup in Mock DB
    const foundConfig = MOCK_PAYWALLS[id];

    // Note: If server restarted, memory is cleared. Fallback to a SAFE address.
    // Use a Random Valid Address or user's specific address if connected? 
    // We can't know user's address here.
    // Let's use a burn address or a constant 0x0...0 for demo safety if not found.
    // 0x0000000000000000000000000000000000000000 is often rejected by UI as burn.
    // Let's use the Demo "Creator" placeholder: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Hardhat Account 0 - often used in tests)

    // IMPORTANT: In your case, 'cuhqhm' was likely created before restart.
    // If you recreate the link now, it will work. 
    // BUT to handle the error gracefully:

    const config: PaywallConfig = foundConfig || {
        id: id,
        creatorAddress: APP_CONFIG.RECEIVER_ADDRESS,
        price: APP_CONFIG.DEFAULT_PRICE,
        currency: APP_CONFIG.DEFAULT_CURRENCY,
        title: APP_CONFIG.PAYWALL_TITLE,
        description: "Link data not found. Please Create New Link."
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{config.title}</h1>
                <p className="text-gray-500 max-w-sm mx-auto">{config.description}</p>
            </div>

            <PaywallForm config={config} />

            <div className="mt-12 text-center text-sm text-gray-400">
                Powered by <span className="font-semibold text-gray-600">x402 Protocol</span>
            </div>
        </div>
    );
}
