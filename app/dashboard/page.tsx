'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Wallet,
  Link as LinkIcon,
  Copy,
  ArrowRight,
  Zap,
  Inbox,
  Mail,
  MailOpen,
  Check,
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { APP_CONFIG } from '@/lib/app-config'
import { LinkDetailModal } from '@/components/link-detail-modal'
import { PaywallConfig, Submission } from '@/types'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  const [createdLinks, setCreatedLinks] = useState<PaywallConfig[]>([])
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    payToAddress: '',
    price: APP_CONFIG.DEFAULT_PRICE,
    description: '',
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLink, setSelectedLink] = useState<PaywallConfig | null>(null)
  const [inbox, setInbox] = useState<Submission[]>([])
  const [totalReceived, setTotalReceived] = useState<Record<string, string>>({})
  const [isLoadingInbox, setIsLoadingInbox] = useState(false)
  const [activeTab, setActiveTab] = useState<'links' | 'inbox'>('links')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/paywall/list?creatorAddress=${address}`)
      const data = await res.json()
      if (data.success) {
        setCreatedLinks(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch links:', err)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const fetchInbox = useCallback(async () => {
    if (!address) return

    setIsLoadingInbox(true)
    try {
      const res = await fetch(`/api/paywall/inbox?creatorAddress=${address}`)
      const data = await res.json()
      if (data.success) {
        setInbox(data.data.submissions || [])
        setTotalReceived(data.data.totalReceived || {})
      }
    } catch (err) {
      console.error('Failed to fetch inbox:', err)
    } finally {
      setIsLoadingInbox(false)
    }
  }, [address])

  // Fetch links and inbox when address changes
  useEffect(() => {
    if (address) {
      fetchLinks()
      fetchInbox()
      // Set default pay-to address to current wallet
      setFormData((prev) => ({ ...prev, payToAddress: address }))
    } else {
      setCreatedLinks([])
      setInbox([])
      setFormData((prev) => ({ ...prev, payToAddress: '' }))
    }
  }, [address, fetchLinks, fetchInbox])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const res = await fetch('/api/paywall/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorAddress: address,
          ...formData,
          payToAddress: formData.payToAddress || address,
          price: Number(formData.price),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCreatedLinks([data.data, ...createdLinks])
        setFormData({
          title: '',
          email: '',
          payToAddress: address || '',
          price: APP_CONFIG.DEFAULT_PRICE,
          description: '',
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Wallet size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connect Wallet</h1>
            <p className="text-gray-500 mt-2">
              Please connect your wallet to access your creator dashboard.
            </p>
          </div>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <Zap size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">x402 Gateway</span>
        </div>
        <ConnectButton showBalance={false} accountStatus="address" />
      </header>

      <main className="max-w-5xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'links'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <LinkIcon size={18} />
              <span>My Links</span>
              {createdLinks.length > 0 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {createdLinks.length}
                </span>
              )}
            </div>
            {activeTab === 'links' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'inbox'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox size={18} />
              <span>Inbox</span>
              {inbox.length > 0 && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {inbox.length}
                </span>
              )}
            </div>
            {activeTab === 'inbox' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Links Tab Content */}
        {activeTab === 'links' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Create Form */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Link
                </h2>
                <p className="text-gray-500">
                  Set your price and start sharing.
                </p>
              </div>
              <form
                onSubmit={handleCreate}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Twitter DMs, Consulting, Speaking"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Name this link to remember where you&apos;ll use
                    it
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay-To Address
                  </label>
                  <input
                    type="text"
                    placeholder={address || '0x...'}
                    value={formData.payToAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payToAddress: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Defaults to your current wallet address if empty
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USDC)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value
                      // Only allow valid numbers
                      if (value === '' || !isNaN(Number(value))) {
                        // Check decimal places (max 6 for USDC)
                        const decimalPart = value.split('.')[1]
                        if (!decimalPart || decimalPart.length <= 6) {
                          setFormData({ ...formData, price: value })
                        }
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Generate Link'}{' '}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

            {/* Links List */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Links</h2>
                <p className="text-gray-500">
                  Share these links to receive paid messages.
                </p>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your links...</p>
                  </div>
                ) : (
                  <>
                    {createdLinks.map((link) => (
                      <div
                        key={link.id}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <button
                            onClick={() => setSelectedLink(link)}
                            className="text-left flex-1 hover:opacity-80 transition-opacity"
                          >
                            <h3 className="font-bold text-lg hover:text-blue-600 transition-colors">
                              {link.title || link.email}
                            </h3>
                            {link.title && (
                              <p className="text-sm text-gray-600 mt-0.5">
                                {link.email}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              {link.price} {link.currency}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Click to view details
                            </p>
                          </button>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <LinkIcon size={14} className="text-gray-400" />
                          <span className="text-sm font-mono text-gray-600 truncate flex-1 block">
                            {typeof window !== 'undefined'
                              ? `${window.location.origin}/c/${link.id}`
                              : `/c/${link.id}`}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/c/${link.id}`
                              )
                              setCopiedId(link.id)
                              setTimeout(() => setCopiedId(null), 2000)
                            }}
                            className={`transition-all duration-200 p-1 rounded flex items-center gap-1 ${
                              copiedId === link.id
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-400 hover:text-black hover:bg-gray-200'
                            }`}
                            title="Copy link"
                          >
                            {copiedId === link.id ? (
                              <>
                                <span className="text-xs font-bold">复制成功</span>
                                <Check size={14} />
                              </>
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                    {createdLinks.length === 0 && !isLoading && (
                      <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                        <LinkIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400">
                          No links yet. Create your first one!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inbox Tab Content */}
        {activeTab === 'inbox' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Inbox</h2>
                <p className="text-gray-500 mt-1">
                  Messages from people who paid to contact you
                </p>
              </div>
              {inbox.length > 0 && (
                <span className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                  {inbox.length} {inbox.length === 1 ? 'message' : 'messages'}
                </span>
              )}
            </div>

            {/* Total Received Summary */}
            {Object.keys(totalReceived).length > 0 && (
              <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Total Received
                </h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(totalReceived).map(([currency, amount]) => (
                    <div key={currency} className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {amount}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isLoadingInbox ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your inbox...</p>
                </div>
              ) : (
                <>
                  {inbox.map((submission) => (
                    <div
                      key={submission.id}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-linear-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center shrink-0">
                            <MailOpen className="text-blue-600" size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {submission.name || 'Anonymous'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {submission.contact}
                            </p>
                            {/* Link info */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => {
                                  const fullUrl = `${window.location.origin}/c/${submission.paywallId}`
                                  navigator.clipboard.writeText(fullUrl)
                                  alert('Link copied to clipboard!')
                                }}
                                className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                title="Click to copy link"
                              >
                                <LinkIcon size={14} />
                              </button>
                              <span className="text-sm text-gray-600">
                                {submission.paywallTitle ||
                                  submission.paywallId}
                              </span>
                              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                {submission.paywallPrice}{' '}
                                {submission.paywallCurrency}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">
                            {new Date(submission.timestamp).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(submission.timestamp).toLocaleTimeString(
                              'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="pl-15 space-y-3">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {submission.message}
                          </p>
                        </div>
                        {submission.txHash && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">
                              Transaction Hash:
                            </span>
                            <code className="font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {submission.txHash.slice(0, 10)}...
                              {submission.txHash.slice(-8)}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {inbox.length === 0 && !isLoadingInbox && (
                    <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center">
                      <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No messages yet
                      </h3>
                      <p className="text-gray-400 max-w-sm mx-auto">
                        Share your links to start receiving paid inquiries from
                        interested people!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Link Detail Modal */}
      {selectedLink && (
        <LinkDetailModal
          link={selectedLink}
          isOpen={!!selectedLink}
          onClose={() => setSelectedLink(null)}
        />
      )}
    </div>
  )
}
