import { PaywallConfig } from '@/types'
import { APP_CONFIG } from '@/lib/app-config'
import { getPaywallById } from '@/lib/db'
import { PaywallPageClient } from '@/components/paywall-page-client'

// This is a server component
export default async function GatewayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const foundConfig = await getPaywallById(id)

  const config: PaywallConfig = foundConfig || {
    id: id,
    creatorAddress: APP_CONFIG.RECEIVER_ADDRESS,
    price: APP_CONFIG.DEFAULT_PRICE,
    currency: APP_CONFIG.DEFAULT_CURRENCY,
    email: 'demo@example.com',
    description: 'Link data not found. Please Create New Link.',
  }

  return <PaywallPageClient config={config} />
}
