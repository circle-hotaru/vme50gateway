import { NextResponse } from 'next/server'
import { APP_CONFIG } from '@/lib/app-config'
import { createPaywall } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { creatorAddress, price, email, description } = body

    if (!creatorAddress || !price || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const paywall = await createPaywall({
      creatorAddress,
      price: price || APP_CONFIG.DEFAULT_PRICE,
      currency: APP_CONFIG.DEFAULT_CURRENCY,
      email,
      description: description || 'Pay to send me a message.',
    })

    return NextResponse.json({ success: true, data: paywall })
  } catch (error) {
    console.error('Failed to create paywall', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
