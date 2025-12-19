import { NextResponse, NextRequest } from 'next/server'
import { withX402 } from 'x402-next'
import { APP_CONFIG } from '@/lib/app-config'
import { createSubmission, listSubmissions, getPaywallById } from '@/lib/db'

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
// Note: req parameter is required by withX402 signature but we use bodyData from closure
const createHandler = (bodyData: any) => async (_req: NextRequest) => {
  try {
    const { paywallId, name, contact, message } = bodyData || {}

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

// Dynamic POST handler that uses the correct creator address based on paywallId
export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get paywallId
    const body = await req.json()
    const { paywallId } = body || {}

    if (!paywallId) {
      return NextResponse.json(
        { success: false, error: 'paywallId is required' },
        { status: 400 }
      )
    }

    // Get the paywall configuration to get the creator's address
    const paywallConfig = await getPaywallById(paywallId)

    if (!paywallConfig) {
      return NextResponse.json(
        { success: false, error: 'Paywall not found' },
        { status: 404 }
      )
    }

    // Create handler with body data already parsed (to avoid re-parsing)
    const handler = createHandler(body)

    // Create a new request with the body we've already parsed
    // This is necessary because we consumed the original request body
    const newReq = new NextRequest(req.url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(body),
    })

    // Use withX402 dynamically with the pay-to address (defaults to creator address)
    const payToAddress =
      paywallConfig.payToAddress || paywallConfig.creatorAddress
    const protectedHandler = withX402(
      handler as unknown as (req: NextRequest) => Promise<NextResponse>,
      payToAddress as `0x${string}`,
      {
        price: `$${paywallConfig.price}`,
        network: APP_CONFIG.NETWORK,
        config: {
          description:
            paywallConfig.description || APP_CONFIG.PAYWALL_DESCRIPTION,
        },
      }
    ) as (req: NextRequest) => Promise<NextResponse>

    return protectedHandler(newReq)
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
