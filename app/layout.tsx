import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rupaya Faucet - Claim RUPX',
  description:
    'Get free RUPX every 12 hours from the Rupaya Faucet. Easy to use, quick claims for Rupaya network users.',
  keywords: 'Rupaya, RUPX, faucet, cryptocurrency, blockchain, free rupx',
  authors: [{ name: 'Rupaya Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://faucet.rupaya.io',
    siteName: 'Rupaya Faucet',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rupaya Faucet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rupayacoin',
    creator: '@rupayacoin',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-neobrut-yellow`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
