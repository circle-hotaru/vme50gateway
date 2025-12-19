import { NextResponse, NextRequest } from 'next/server'
import { withX402 } from 'x402-next'
import { APP_CONFIG } from '@/lib/app-config'
import { createSubmission, listSubmissions } from '@/lib/db'

// GET can be unprotected for the dashboard inbox
export async function GET() {
  try {
    const submissions = await listSubmissions()
    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error('Failed to list submissions', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

// The core logic for SAVING the submission
const handler = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { paywallId, name, contact, message } = body || {}

    if (!paywallId || !contact || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          submissionId: null,
        },
        { status: 400 }
      )
    }

    const submission = await createSubmission({
      paywallId,
      name,
      contact,
      message,
    })

    console.log('New Submission Verified (via x402-next):', submission.id)

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      error: '',
    })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { success: false, submissionId: null, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Export POST wrapped with x402
// Configuration:
// - PayTo: 0x3928da62f59501fcabb35b387402d08136fe3c60
// - Price: $0.01 (USDC)
// - Network: base-sepolia
export const POST = withX402(
  handler as unknown as (req: NextRequest) => Promise<NextResponse>,
  APP_CONFIG.RECEIVER_ADDRESS,
  {
    price: `$${APP_CONFIG.DEFAULT_PRICE}`, // x402 expects string with $ for USD or raw amount? library example used '$0.01'
    // Wait, library example: price: '$0.01', network: 'base-sepolia'
    network: APP_CONFIG.NETWORK,
    config: {
      description: APP_CONFIG.PAYWALL_DESCRIPTION,
    },
  }
) as (req: NextRequest) => Promise<NextResponse>
