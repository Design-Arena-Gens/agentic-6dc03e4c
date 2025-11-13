'use client'

import { useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState('')

  const checkNews = async () => {
    setLoading(true)
    setStatus('Checking for crude oil news...')

    try {
      const response = await fetch('/api/check-news', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setStatus(`✅ Found ${data.newsCount} news items. ${data.sent ? 'Posted to Telegram!' : 'No high-intensity news to post.'}`)
        setLastCheck(new Date().toLocaleString())
      } else {
        setStatus(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testTelegram = async () => {
    setLoading(true)
    setStatus('Testing Telegram connection...')

    try {
      const response = await fetch('/api/test-telegram', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setStatus('✅ Telegram test message sent successfully!')
      } else {
        setStatus(`❌ Telegram Error: ${data.error}`)
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🛢️ Crude Oil News Agent</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Monitors high-intensity crude oil news and posts alerts to your Telegram group
      </p>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Configuration</h2>
        <p style={{ marginBottom: '10px' }}>
          <strong>Status:</strong> {process.env.NEXT_PUBLIC_CONFIGURED === 'true' ? '✅ Configured' : '⚠️ Needs Setup'}
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Set environment variables in Vercel:
        </p>
        <ul style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
          <li><code>TELEGRAM_BOT_TOKEN</code> - Your Telegram bot token</li>
          <li><code>TELEGRAM_CHAT_ID</code> - Your Telegram group chat ID</li>
          <li><code>NEWS_API_KEY</code> - NewsAPI.org API key (optional)</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={checkNews}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Checking...' : 'Check News Now'}
        </button>

        <button
          onClick={testTelegram}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Test Telegram
        </button>
      </div>

      {status && (
        <div style={{
          padding: '15px',
          background: status.includes('❌') ? '#fee' : '#efe',
          border: `1px solid ${status.includes('❌') ? '#fcc' : '#cfc'}`,
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {status}
        </div>
      )}

      {lastCheck && (
        <p style={{ color: '#666', fontSize: '14px' }}>
          Last checked: {lastCheck}
        </p>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>How It Works</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Monitors multiple news sources for crude oil related news</li>
          <li>Analyzes news for high-intensity keywords (price surge, supply disruption, OPEC decisions, etc.)</li>
          <li>Automatically posts important news to your Telegram group</li>
          <li>Runs continuously - click "Check News Now" for manual checks</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px' }}>
        <strong>⚠️ Setup Instructions:</strong>
        <ol style={{ marginTop: '10px', lineHeight: '1.8', fontSize: '14px' }}>
          <li>Create a Telegram bot via @BotFather and get the token</li>
          <li>Add your bot to the Telegram group</li>
          <li>Get the chat ID (send a message and check https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates)</li>
          <li>Add environment variables in Vercel dashboard</li>
          <li>Redeploy the application</li>
        </ol>
      </div>
    </main>
  )
}
