import { NextRequest, NextResponse } from 'next/server'
import { listPaywallsByCreator } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const creatorAddress = searchParams.get('creatorAddress')

    if (!creatorAddress) {
      return NextResponse.json(
        { success: false, error: 'creatorAddress is required' },
        { status: 400 }
      )
    }

    const paywalls = await listPaywallsByCreator(creatorAddress)

    return NextResponse.json({
      success: true,
      data: paywalls,
    })
  } catch (error: any) {
    console.error('Error listing paywalls:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list paywalls' },
      { status: 500 }
    )
  }
}

