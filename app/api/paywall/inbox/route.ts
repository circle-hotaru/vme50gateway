import { NextResponse, NextRequest } from 'next/server'
import { listSubmissionsByCreator, getTotalReceivedByCreator } from '@/lib/db'

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

    const [submissions, totalReceived] = await Promise.all([
      listSubmissionsByCreator(creatorAddress),
      getTotalReceivedByCreator(creatorAddress),
    ])

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        totalReceived,
      },
    })
  } catch (error) {
    console.error('Failed to fetch inbox submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inbox' },
      { status: 500 }
    )
  }
}
