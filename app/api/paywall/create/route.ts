import { NextResponse } from "next/server";
import { PaywallConfig } from "@/types";
import { MOCK_PAYWALLS } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { creatorAddress, price, email, description } = body;

        if (!creatorAddress || !price || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const id = Math.random().toString(36).substring(7);
        const newPaywall: PaywallConfig = {
            id,
            creatorAddress,
            price: price || "1.0",
            currency: "USDC", // Default for MVP
            email: email,
            description: description || "Pay to send me a message.",
        };

        MOCK_PAYWALLS[id] = newPaywall;

        return NextResponse.json({ success: true, data: newPaywall });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
