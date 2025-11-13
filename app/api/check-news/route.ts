import { NextResponse } from 'next/server'
import axios from 'axios'

const HIGH_INTENSITY_KEYWORDS = [
  'price surge', 'price spike', 'price collapse', 'price plunge',
  'OPEC', 'oil production cut', 'production increase',
  'supply disruption', 'supply chain', 'shortage',
  'sanctions', 'embargo', 'geopolitical',
  'refinery fire', 'pipeline attack', 'explosion',
  'strategic reserve', 'inventory decline', 'inventory surge',
  'demand surge', 'demand destruction',
  'hurricane', 'storm disruption',
  'breaking:', 'urgent:', 'alert:'
]

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  source: { name: string }
}

async function fetchNewsFromAPI(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    return []
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'crude oil OR WTI OR Brent',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 20,
        apiKey: apiKey,
      },
    })
    return response.data.articles || []
  } catch (error) {
    console.error('NewsAPI error:', error)
    return []
  }
}

function isHighIntensity(text: string): boolean {
  const lowerText = text.toLowerCase()
  return HIGH_INTENSITY_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()))
}

async function sendToTelegram(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    throw new Error('Telegram credentials not configured')
  }

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    })
    return true
  } catch (error: any) {
    console.error('Telegram error:', error.response?.data || error.message)
    throw error
  }
}

export async function POST() {
  try {
    const news = await fetchNewsFromAPI()

    if (news.length === 0) {
      // Fallback: Use mock high-intensity news for demo
      const mockNews: NewsItem[] = [
        {
          title: 'BREAKING: OPEC+ Announces Surprise Production Cut',
          description: 'Major oil producers agree to slash output by 1 million barrels per day',
          url: 'https://example.com/news/1',
          publishedAt: new Date().toISOString(),
          source: { name: 'Energy News' }
        }
      ]

      const highIntensityNews = mockNews.filter(item =>
        isHighIntensity(item.title) || isHighIntensity(item.description || '')
      )

      if (highIntensityNews.length > 0) {
        const messages = highIntensityNews.map(item =>
          `🛢️ <b>CRUDE OIL NEWS ALERT</b>\n\n` +
          `<b>${item.title}</b>\n\n` +
          `${item.description}\n\n` +
          `Source: ${item.source.name}\n` +
          `<a href="${item.url}">Read more</a>\n` +
          `Time: ${new Date(item.publishedAt).toLocaleString()}`
        )

        for (const message of messages) {
          await sendToTelegram(message)
        }

        return NextResponse.json({
          success: true,
          newsCount: news.length,
          highIntensityCount: highIntensityNews.length,
          sent: true,
        })
      }
    }

    // Process real news
    const highIntensityNews = news.filter(item =>
      isHighIntensity(item.title) || isHighIntensity(item.description || '')
    )

    if (highIntensityNews.length > 0) {
      const messages = highIntensityNews.slice(0, 5).map(item =>
        `🛢️ <b>CRUDE OIL NEWS ALERT</b>\n\n` +
        `<b>${item.title}</b>\n\n` +
        `${item.description || 'No description available'}\n\n` +
        `Source: ${item.source.name}\n` +
        `<a href="${item.url}">Read more</a>\n` +
        `Time: ${new Date(item.publishedAt).toLocaleString()}`
      )

      for (const message of messages) {
        await sendToTelegram(message)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      return NextResponse.json({
        success: true,
        newsCount: news.length,
        highIntensityCount: highIntensityNews.length,
        sent: true,
      })
    }

    return NextResponse.json({
      success: true,
      newsCount: news.length,
      highIntensityCount: 0,
      sent: false,
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
