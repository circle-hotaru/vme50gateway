import { NextResponse, NextRequest } from 'next/server'
import { listSubmissionsByCreator } from '@/lib/db'

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

    const submissions = await listSubmissionsByCreator(creatorAddress)
    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error('Failed to fetch inbox submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inbox' },
      { status: 500 }
    )
  }
}

