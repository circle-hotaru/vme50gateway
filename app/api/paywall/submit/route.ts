import { NextResponse, NextRequest } from "next/server";
import { withX402 } from "x402-next";
import { APP_CONFIG } from "@/lib/app-config";

// Shared memory store (same as before)
// We need to import SUBMISSIONS or define it here. 
// Ideally it should be imported from a shared file to persist across hot-reloads if possible, 
// OR we just keep it here.
// But the original file exported SUBMISSIONS.
// I will keep the SUBMISSIONS export but move it to a separate lines or keep it.
// The `withX402` wraps the handler.

export const SUBMISSIONS: any[] = [];

// GET can be unprotected for the dashboard inbox
export async function GET(req: Request) {
    return NextResponse.json({ success: true, data: SUBMISSIONS });
}

// The core logic for SAVING the submission
const handler = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const submission = {
            id: Date.now(),
            ...body,
            paid: true,
            // We can't easily access the decoded payment details here unless we parse it again or if wrapping injects it?
            // x402-next wrapper doesn't seem to inject decoded payment into request object in the example.
            // But we know it's paid if we reached here!
            timestamp: new Date().toISOString(),
        };

        SUBMISSIONS.push(submission);
        console.log("New Submission Verified (via x402-next):", submission.id);

        // Mock Forwarding
        console.log(`[x402 Gateway] Forwarding message to Creator...`);
        console.log(`[Email] Sending notification to creator@example.com... ✅ Sent.`);
        console.log(`[Telegram] Pushing alert to @CreatorBot... ✅ Sent.`);

        return NextResponse.json({ success: true, submissionId: submission.id });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
};

// Export POST wrapped with x402
// Configuration:
// - PayTo: 0x3928da62f59501fcabb35b387402d08136fe3c60
// - Price: $0.01 (USDC)
// - Network: base-sepolia
export const POST = withX402(
    handler,
    APP_CONFIG.RECEIVER_ADDRESS,
    {
        price: `$${APP_CONFIG.DEFAULT_PRICE}`, // x402 expects string with $ for USD or raw amount? library example used '$0.01'
        // Wait, library example: price: '$0.01', network: 'base-sepolia'
        network: APP_CONFIG.NETWORK,
        config: {
            description: APP_CONFIG.PAYWALL_DESCRIPTION
        }
    }
);
