'use client'

import { X, Mail, Wallet } from 'lucide-react'
import { PaywallConfig } from '@/types'

interface LinkDetailModalProps {
  link: PaywallConfig
  isOpen: boolean
  onClose: () => void
}

export function LinkDetailModal({
  link,
  isOpen,
  onClose,
}: LinkDetailModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 transform scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {link.title || 'Link Details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(link.createdAt || '').toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Pay-To Address */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">
                Pay-To Address
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <p className="text-sm font-mono text-gray-700 break-all">
                {link.payToAddress || link.creatorAddress}
              </p>
            </div>
            {link.payToAddress && link.payToAddress !== link.creatorAddress && (
              <div className="mt-2 bg-white/60 p-2 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Creator Address:</span>
                </p>
                <p className="text-xs font-mono text-gray-600 break-all mt-1">
                  {link.creatorAddress}
                </p>
              </div>
            )}
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Price:</span> {link.price}{' '}
              {link.currency}
            </div>
          </div>

          {/* Contact Email */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Mail size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">Contact Email</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-700">{link.email}</p>
            </div>
          </div>

          {/* Description */}
          {link.description && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="font-semibold text-gray-900 block mb-2">
                Description
              </span>
              <p className="text-sm text-gray-600">{link.description}</p>
            </div>
          )}

          {/* Link ID */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-mono">ID: {link.id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
