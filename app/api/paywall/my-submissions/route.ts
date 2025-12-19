import { NextResponse, NextRequest } from 'next/server'
import { listSubmissionsByWallet } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('address')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Normalize address to lowercase for case-insensitive matching
    const normalizedAddress = walletAddress.toLowerCase()
    const submissions = await listSubmissionsByWallet(normalizedAddress)

    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error('Failed to fetch user submissions', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
