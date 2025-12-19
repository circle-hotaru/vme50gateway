import { NextResponse, NextRequest } from 'next/server'
import { withX402 } from 'x402-next'
import { APP_CONFIG } from '@/lib/app-config'
import {
  createSubmission,
  listSubmissions,
  getPaywallById,
  updateSubmissionPaymentInfo,
} from '@/lib/db'

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

    // Create submission without payment info first
    // Payment info will be added after settlement
    const submission = await createSubmission({
      paywallId,
      name,
      contact,
      message,
    })

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

    // Execute the protected handler
    const response = await protectedHandler(newReq)

    // After successful payment settlement, extract payment info from response headers
    // and update the submission record
    if (response.ok) {
      try {
        // x402 adds payment settlement info in X-PAYMENT-RESPONSE header (base64 encoded)
        const paymentResponseHeader = response.headers.get('x-payment-response')
        if (paymentResponseHeader) {
          const paymentResponse = JSON.parse(
            Buffer.from(paymentResponseHeader, 'base64').toString('utf-8')
          )

          // Extract transaction hash and payer address from settlement
          const { transaction, payer } = paymentResponse
          const responseBody = await response.json()
          const submissionId = responseBody.submissionId

          if (submissionId && transaction && payer) {
            // Update the submission with payment information
            await updateSubmissionPaymentInfo(submissionId, payer, transaction)
          }

          // Return new response with the same body
          return NextResponse.json(responseBody)
        }
      } catch (error) {
        console.error('Failed to extract/save payment info:', error)
        // Don't fail the request if payment info extraction fails
      }
    }

    return response
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
