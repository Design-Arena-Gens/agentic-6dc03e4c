export const metadata = {
  title: 'Crude Oil News Agent',
  description: 'Automated crude oil news monitoring and Telegram alerts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
