'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, DollarSign, Zap } from 'lucide-react'
import { PaywallConfig } from '@/types'

interface PaywallWithStats extends PaywallConfig {
  responseRate: number
}

export default function AdvertisePage() {
  const router = useRouter()
  const [paywalls, setPaywalls] = useState<PaywallWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaywalls()
  }, [])

  const fetchPaywalls = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/paywall/all')
      const result = await response.json()

      if (result.success && result.data) {
        // Add mock response rate to each paywall
        const paywallsWithStats = result.data.map((paywall: PaywallConfig) => ({
          ...paywall,
          responseRate: Math.floor(Math.random() * 100), // Random response rate 0-100%
        }))
        setPaywalls(paywallsWithStats)
      } else {
        setError(result.error || 'Failed to load paywalls')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch paywalls')
    } finally {
      setLoading(false)
    }
  }

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-500'
    if (rate >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getResponseRateBg = (rate: number) => {
    if (rate >= 70) return 'bg-green-500/10 border-green-500/30'
    if (rate >= 40) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="h-1 bg-cyan-500 shadow-[0_0_15px_#00ffff] fixed top-0 left-0 right-0 z-50 opacity-40" />

      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">返回</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-500/10 border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black flex items-center justify-center text-xl skew-x-[-12deg] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              V
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg tracking-tighter text-slate-900 dark:text-white">
                投流中心
              </span>
              <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-widest">
                ADVERTISE_HUB
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white">
              <span className="text-cyan-600 dark:text-cyan-400">投流链接</span> 列表
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">
              浏览所有可投放的链接，选择最适合您的投放目标
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 border border-cyan-500/20 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Zap size={20} className="text-cyan-500" />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  总链接数
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {paywalls.length}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-cyan-500/20 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-green-500" />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  平均响应率
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {paywalls.length > 0
                  ? Math.floor(
                      paywalls.reduce((acc, p) => acc + p.responseRate, 0) /
                        paywalls.length
                    )
                  : 0}
                %
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-cyan-500/20 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={20} className="text-yellow-500" />
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  价格范围
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {paywalls.length > 0
                  ? `$${Math.min(...paywalls.map((p) => parseFloat(p.price)))}-${Math.max(...paywalls.map((p) => parseFloat(p.price)))}`
                  : '$0'}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-500 font-bold">{error}</p>
            </div>
          )}

          {/* Paywall List */}
          {!loading && !error && (
            <div className="grid grid-cols-1 gap-4">
              {paywalls.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center">
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                    暂无可投放的链接
                  </p>
                </div>
              ) : (
                paywalls.map((paywall) => (
                  <div
                    key={paywall.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 transition-all rounded-lg p-6 group cursor-pointer"
                    onClick={() => router.push(`/c/${paywall.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Title and ID */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {paywall.title || paywall.id}
                        </h3>
                        {paywall.title && (
                          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600 mb-3">
                            ID: {paywall.id}
                          </p>
                        )}
                        {paywall.description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {paywall.description}
                          </p>
                        )}
                      </div>

                      {/* Right: Stats */}
                      <div className="flex items-start gap-6">
                        {/* Response Rate */}
                        <div
                          className={`border rounded-lg px-4 py-3 text-center min-w-[120px] ${getResponseRateBg(paywall.responseRate)}`}
                        >
                          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                            响应率
                          </div>
                          <div
                            className={`text-2xl font-black ${getResponseRateColor(paywall.responseRate)}`}
                          >
                            {paywall.responseRate}%
                          </div>
                        </div>

                        {/* Price */}
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3 text-center min-w-[120px]">
                          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                            价格
                          </div>
                          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                            ${paywall.price}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {paywall.currency}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>
                        创建者:{' '}
                        {paywall.creatorAddress.slice(0, 6)}...
                        {paywall.creatorAddress.slice(-4)}
                      </span>
                      {paywall.createdAt && (
                        <span>
                          创建时间:{' '}
                          {new Date(paywall.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#020202] py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-cyan-600 text-white font-black flex items-center justify-center text-xl italic shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              V
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-300 text-sm tracking-widest">
              S.H.I.E.L.D._SYSTEM
            </span>
          </div>
          <p className="text-zinc-400 dark:text-zinc-600 text-[8px] font-black uppercase tracking-[0.6em]">
            © 2025 BUREAU OF S.H.I.E.L.D. // NOISE_IS_A_TAXABLE_RESOURCE
          </p>
        </div>
      </footer>
    </div>
  )
}

