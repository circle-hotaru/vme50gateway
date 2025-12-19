'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  Shield,
  Send,
  CheckCircle,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PaywallConfig } from '@/types'
import { useAccount, useWalletClient } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { createPaymentHeader, selectPaymentRequirements } from 'x402/client'
import { APP_CONFIG } from '@/lib/app-config'

interface PaywallFormProps {
  config: PaywallConfig
}

export function PaywallForm({ config }: PaywallFormProps) {
  const [status, setStatus] = useState<
    | 'idle'
    | 'moderating'
    | 'submitting'
    | 'payment_required'
    | 'paying'
    | 'success'
  >('idle')
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  })
  const [moderationError, setModerationError] = useState<string>('')

  // Store the 402 response data to use for payment construction
  const [paymentRequirements, setPaymentRequirements] = useState<any>(null)
  const [x402Version, setX402Version] = useState<number>(1)

  const { isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  // Remove the old "Wait for Transaction" hook because x402/client handles signing
  // We don't manually watch txHash anymore in this flow.

  const handleSubmit = async (e?: React.FormEvent, paymentProof?: string) => {
    if (e) e.preventDefault()

    if (status === 'submitting' || (status === 'paying' && !paymentProof))
      return

    // Clear any previous moderation errors
    setModerationError('')

    // Step 1: AI Moderation Check (only on initial submit, not on payment retry)
    if (!paymentProof) {
      setStatus('moderating')

      try {
        const moderationRes = await fetch('/api/paywall/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: formData.message,
            name: formData.name,
            contact: formData.contact,
          }),
        })

        const moderationData = await moderationRes.json()

        if (!moderationData.isAppropriate) {
          setModerationError(
            moderationData.reason || '您的消息包含不当内容。请修改后重试。'
          )
          setStatus('idle')
          return
        }
      } catch (error) {
        console.error('Moderation check failed:', error)
        // Continue with submission if moderation API fails
      }

      setStatus('submitting')
    }

    // Step 2: Actual Submission
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (paymentProof) {
        // Official library expects this header
        headers['X-PAYMENT'] = paymentProof
      }

      const res = await fetch('/api/paywall/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...formData, paywallId: config.id }),
      })

      if (res.status === 402) {
        const data = await res.json()
        console.log('402 Response (Requirements):', data)
        // Save the requirements from server
        setPaymentRequirements(data.accepts)
        if (data.x402Version) setX402Version(data.x402Version)

        setStatus('payment_required')
        return
      }

      if (res.ok) {
        setStatus('success')
      } else {
        console.error('Submission failed')
        setStatus('idle')
      }
    } catch (error) {
      console.error(error)
      setStatus('idle')
    }
  }

  const handlePay = async () => {
    if (!isConnected || !walletClient) {
      alert('Please connect wallet first')
      return
    }

    if (!paymentRequirements) {
      alert(
        'Error: No payment requirements found. Please try submitting again first.'
      )
      return
    }

    setStatus('paying')

    try {
      console.log('Selecting Payment Requirements...')
      // 1. Select the correct requirement (e.g. USDC on Base Sepolia)
      // The library helper filters the list returned by the server
      const selectedRequirement = selectPaymentRequirements(
        paymentRequirements,
        APP_CONFIG.NETWORK,
        'exact'
      )

      if (!selectedRequirement) {
        console.error('Requirements:', paymentRequirements)
        throw new Error(
          `No matching payment requirement found for network: ${APP_CONFIG.NETWORK}`
        )
      }

      console.log('Creating Atomic Payment Header...')
      // 2. Create the header using x402 client lib
      // This will automatically:
      // - Construct the transaction
      // - Request user signature (Wallet Popup)
      // - Return the encoded header string
      const paymentHeader = await createPaymentHeader(
        walletClient as any, // Type casting for compatibility
        x402Version,
        selectedRequirement
      )

      console.log(
        'Payment Header Created (Base64):',
        paymentHeader.slice(0, 20) + '...'
      )

      // 3. Resubmit with the Proof immediately
      await handleSubmit(undefined, paymentHeader)
    } catch (error: any) {
      const errorMessage = error?.message || ''
      if (
        errorMessage.includes('User rejected') ||
        errorMessage.includes('User denied')
      ) {
        alert('用户取消了支付')
      } else {
        console.error('Payment Error:', error)
        alert('支付/签名出错: ' + (errorMessage.slice(0, 50) + '...'))
      }
      setStatus('payment_required')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-xl border border-green-200 max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        </motion.div>
        <h3 className="text-xl font-bold text-green-800">Message Sent!</h3>
        <p className="text-green-600 mt-2 text-center">
          Your message has been delivered to the creator.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Form Content */}
      <div
        className={cn(
          'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300',
          status === 'payment_required' || status === 'paying'
            ? 'blur-sm pointer-events-none opacity-50'
            : ''
        )}
      >
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          {/* Moderation Error Message */}
          {moderationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">消息被拒绝</p>
                <p className="text-sm text-red-600 mt-1">{moderationError}</p>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              required
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Info
            </label>
            <input
              required
              type="text"
              placeholder="Email or Telegram handle"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              required
              placeholder="Hi, I'd like to discuss..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={status === 'submitting' || status === 'moderating'}
            className="w-full py-3 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'moderating' ? (
              <>
                <Loader2 className="animate-spin" />
                检查消息内容...
              </>
            ) : status === 'submitting' ? (
              <>
                <Loader2 className="animate-spin" />
                发送中...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>

      {/* 402 Payment Modal */}
      <AnimatePresence>
        {(status === 'payment_required' || status === 'paying') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
          >
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={24} />
              </div>
              <p className="text-gray-500 text-sm mb-6">
                This creator requires a small payment to verify serious
                inquiries.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-500 mb-1">Pay Amount</div>
                <div className="text-3xl font-bold text-gray-900">
                  {config.price} {config.currency}
                </div>
              </div>

              {!isConnected ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 text-center">
                    Please connect your wallet to proceed with payment
                  </p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePay}
                    disabled={status === 'paying'}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'paying' ? (
                      <>
                        Sign & Pay
                        <Loader2 className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Pay {config.price} {config.currency}{' '}
                        <Wallet size={18} />
                      </>
                    )}
                  </button>
                  {status === 'paying' && (
                    <p className="text-xs text-gray-400 mt-3 animate-pulse">
                      Constructing & Confirming Payment...
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
