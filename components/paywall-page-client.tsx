'use client'

import { PaywallForm } from '@/components/paywall-form'
import { PaywallConfig } from '@/types'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Zap } from 'lucide-react'

interface PaywallPageClientProps {
  config: PaywallConfig
}

export function PaywallPageClient({ config }: PaywallPageClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Connect Button */}
      <header className="flex justify-between items-center p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <Zap size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">x402 Gateway</span>
        </div>
        <ConnectButton showBalance={false} accountStatus="address" />
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center space-y-2">
          <p className="text-gray-500 max-w-sm mx-auto">{config.description}</p>
        </div>

        <PaywallForm config={config} />

        <div className="mt-12 text-center text-sm text-gray-400">
          Powered by{' '}
          <span className="font-semibold text-gray-600">x402 Protocol</span>
        </div>
      </div>
    </div>
  )
}
