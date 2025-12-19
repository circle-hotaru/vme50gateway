import { NextResponse } from 'next/server'
import { listAllPaywalls } from '@/lib/db'

export async function GET() {
  try {
    const paywalls = await listAllPaywalls()

    return NextResponse.json({
      success: true,
      data: paywalls,
    })
  } catch (error: any) {
    console.error('Error listing all paywalls:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list paywalls' },
      { status: 500 }
    )
  }
}

