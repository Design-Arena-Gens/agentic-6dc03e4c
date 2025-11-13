import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/check-news`, {
      method: 'POST',
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: data,
    })

  } catch (error: any) {
    console.error('Cron error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
