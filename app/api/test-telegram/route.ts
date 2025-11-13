import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      return NextResponse.json({
        success: false,
        error: 'Telegram credentials not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.',
      }, { status: 400 })
    }

    const message = `🛢️ <b>Test Message</b>\n\nCrude Oil News Agent is now active!\n\nThis bot will monitor and alert you about high-intensity crude oil news.\n\nTime: ${new Date().toLocaleString()}`

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    })

    return NextResponse.json({
      success: true,
      message: 'Test message sent successfully!',
    })

  } catch (error: any) {
    console.error('Telegram error:', error.response?.data || error.message)
    return NextResponse.json({
      success: false,
      error: error.response?.data?.description || error.message || 'Failed to send message',
    }, { status: 500 })
  }
}
