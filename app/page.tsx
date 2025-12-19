import Link from 'next/link'
import { ArrowRight, ShieldCheck, Zap, Coins } from 'lucide-react'

export default async function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
          x402
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 hover:text-gray-300 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Start Demo
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-40">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            Monetize your attention.
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-xl leading-relaxed">
            The protocol that turns "Can I pick your brain?" into a transaction.
            Stop getting spammed. Start getting paid.
          </p>

          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all hover:scale-105"
            >
              Create Gateway <ArrowRight size={20} />
            </Link>
            <Link
              href="https://github.com/base-org/web3-masterclass" // Placeholder or actual link if applicable
              className="px-8 py-4 bg-gray-900 border border-gray-800 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
            >
              Read Docs
            </Link>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShieldCheck className="text-blue-500" />}
            title="Spam Defense"
            desc="The 402 HTTP status code acts as a shield. Unpaid requests bounce off your server."
          />
          <FeatureCard
            icon={<Coins className="text-yellow-500" />}
            title="Micropayments"
            desc="Accept USDC on Base. Low fees, instant settlement. No platform rake."
          />
          <FeatureCard
            icon={<Zap className="text-purple-500" />}
            title="Instant Setup"
            desc="Connect wallet, set price, get link. Up and running in 30 seconds."
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: any
  title: string
  desc: string
}) {
  return (
    <div className="p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:bg-gray-900 transition-colors">
      <div className="mb-4 w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  )
}
