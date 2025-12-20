'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  DollarSign,
  Zap,
  ArrowRight,
  Wallet,
  History,
  ExternalLink,
  Shield,
} from 'lucide-react'
import { PaywallConfig, Submission } from '@/types'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

interface PaywallWithStats extends PaywallConfig {
  responseRate: number
}

export default function AdvertisePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [paywalls, setPaywalls] = useState<PaywallWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'history'>('all')

  useEffect(() => {
    fetchPaywalls()
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      fetchMySubmissions()
    } else {
      setMySubmissions([])
      // Switch to 'all' tab when wallet disconnects
      if (activeTab === 'history') {
        setActiveTab('all')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

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

  const fetchMySubmissions = async () => {
    if (!address) return

    try {
      setLoadingSubmissions(true)
      const response = await fetch(
        `/api/paywall/my-submissions?address=${address}`
      )
      const result = await response.json()

      if (result.success && result.data) {
        setMySubmissions(result.data)
      } else {
        console.error('Failed to fetch submissions:', result.error)
      }
    } catch (err: any) {
      console.error('Failed to fetch user submissions:', err)
    } finally {
      setLoadingSubmissions(false)
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
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Zap size={18} className="fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100">
              V ME 50 OR BE GONE
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Wallet Connect Button */}
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white">
              <span className="text-cyan-600 dark:text-cyan-400">投流中心</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">
              浏览所有可投放的链接，选择最适合您的投放目标
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === 'all'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Zap size={16} className="inline-block mr-2 mb-0.5" />
                所有链接
                {activeTab === 'all' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                )}
              </button>

              <button
                onClick={() => {
                  if (isConnected) {
                    setActiveTab('history')
                  }
                }}
                disabled={!isConnected}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === 'history'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : isConnected
                    ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                }`}
              >
                <History size={16} className="inline-block mr-2 mb-0.5" />
                我的历史
                {isConnected && mySubmissions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full text-xs">
                    {mySubmissions.length}
                  </span>
                )}
                {activeTab === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                )}
              </button>

              {!isConnected && activeTab !== 'all' && (
                <span className="ml-4 text-xs text-zinc-400 dark:text-zinc-600">
                  连接钱包查看历史记录
                </span>
              )}
            </div>
          </div>

          {/* My Submissions History */}
          {activeTab === 'history' && isConnected && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-cyan-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  我的投放历史
                </h2>
              </div>

              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
              ) : mySubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    您还没有任何投放记录
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mySubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                              {submission.paywallTitle || submission.paywallId}
                            </h3>
                            {submission.paywallPrice && (
                              <span className="text-xs font-bold px-2 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded">
                                ${submission.paywallPrice}{' '}
                                {submission.paywallCurrency}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-sm">
                            {submission.name && (
                              <p className="text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold">姓名:</span>{' '}
                                {submission.name}
                              </p>
                            )}
                            {submission.contact && (
                              <p className="text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold">联系方式:</span>{' '}
                                {submission.contact}
                              </p>
                            )}
                            {submission.message && (
                              <p className="text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold">消息:</span>{' '}
                                {submission.message}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>
                              {new Date(submission.timestamp).toLocaleString(
                                'zh-CN'
                              )}
                            </span>
                            {submission.txHash && (
                              <a
                                href={`https://sepolia.basescan.org/tx/${submission.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                              >
                                <span>查看交易</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            router.push(`/c/${submission.paywallId}`)
                          }
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-bold transition-all"
                        >
                          再次投放
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Paywalls Tab Content */}
          {activeTab === 'all' && (
            <>
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
                      ? `$${Math.min(
                          ...paywalls.map((p) => parseFloat(p.price))
                        )}-${Math.max(
                          ...paywalls.map((p) => parseFloat(p.price))
                        )}`
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
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 transition-all rounded-lg p-6 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Title and ID */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white transition-colors">
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
                              className={`border rounded-lg px-4 py-3 text-center w-[120px] h-[96px] flex flex-col justify-between ${getResponseRateBg(
                                paywall.responseRate
                              )}`}
                            >
                              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                响应率
                              </div>
                              <div
                                className={`text-2xl font-black ${getResponseRateColor(
                                  paywall.responseRate
                                )}`}
                              >
                                {paywall.responseRate}%
                              </div>
                              <div className="text-xs text-transparent">
                                &nbsp;
                              </div>
                            </div>

                            {/* Price */}
                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3 text-center w-[120px] h-[96px] flex flex-col justify-between">
                              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                价格
                              </div>
                              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                                ${paywall.price}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {paywall.currency}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              创建者: {paywall.creatorAddress.slice(0, 6)}...
                              {paywall.creatorAddress.slice(-4)}
                            </span>
                            {paywall.createdAt && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                创建时间:{' '}
                                {new Date(paywall.createdAt).toLocaleDateString(
                                  'zh-CN'
                                )}
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => router.push(`/c/${paywall.id}`)}
                            className="flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-white py-3 px-8 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] transition-all duration-300 border border-cyan-300/50 font-bold text-sm uppercase tracking-wide"
                          >
                            <span>立即投放</span>
                            <ArrowRight size={16} className="fill-white" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#020202] py-6 px-6">
        <div className="max-w-5xl mx-auto text-center">
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
