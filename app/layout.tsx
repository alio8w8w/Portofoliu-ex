import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { GradientBackground } from '@/components/site/gradient-background'
import { SiteShell } from '@/components/site/site-shell'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Ilina Boclincă — Biomedical Engineer & Web Developer',
    template: '%s | Ilina Boclincă',
  },
  description: 'Portofoliul Ilinei Boclincă: inginerie biomedicală, dezvoltare web full-stack, tutoriale, călătorii și creație de conținut.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#050507',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GradientBackground />
        <SiteShell>{children}</SiteShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
