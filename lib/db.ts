import { createAdminClient } from './supabase-admin'
import { PaywallConfig, Submission } from '@/types'

const mapPaywall = (row: any): PaywallConfig => ({
  id: row.id,
  creatorAddress: row.creator_address,
  payToAddress: row.pay_to_address,
  title: row.title,
  price: row.price,
  currency: row.currency,
  email: row.email,
  description: row.description,
  createdAt: row.created_at,
})

const mapSubmission = (row: any): Submission => ({
  id: row.id,
  paywallId: row.paywall_id,
  name: row.name,
  contact: row.contact,
  message: row.message ?? row.content,
  txHash: row.tx_hash,
  walletAddress: row.wallet_address,
  paid: row.paid,
  timestamp: row.created_at,
  // Include paywall info if available (from joins)
  paywallTitle: row.paywalls?.title || row.paywall_title,
  paywallPrice: row.paywalls?.price || row.paywall_price,
  paywallCurrency: row.paywalls?.currency || row.paywall_currency,
})

export async function createPaywall(input: {
  id?: string
  creatorAddress: string
  payToAddress?: string
  title?: string
  price: string
  currency?: string
  email: string
  description?: string
}): Promise<PaywallConfig> {
  const supabase = createAdminClient()
  const id = input.id || crypto.randomUUID()
  const { data, error } = await supabase
    .from('paywalls')
    .insert({
      id,
      creator_address: input.creatorAddress,
      pay_to_address: input.payToAddress || input.creatorAddress,
      title: input.title || '',
      price: input.price,
      currency: input.currency || 'USDC',
      email: input.email,
      description: input.description || '',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapPaywall(data)
}

export async function getPaywallById(
  id: string
): Promise<PaywallConfig | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('paywalls')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) return null
  return mapPaywall(data)
}

export async function createSubmission(input: {
  paywallId: string
  name: string
  contact: string
  message: string
  txHash?: string
  walletAddress?: string
}): Promise<Submission> {
  const supabase = createAdminClient()
  const id = crypto.randomUUID()
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      id,
      paywall_id: input.paywallId,
      name: input.name,
      contact: input.contact,
      message: input.message,
      tx_hash: input.txHash,
      wallet_address: input.walletAddress,
      paid: true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapSubmission(data)
}

export async function listSubmissions(): Promise<Submission[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(mapSubmission)
}

export async function listPaywallsByCreator(
  creatorAddress: string
): Promise<PaywallConfig[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('paywalls')
    .select('*')
    .eq('creator_address', creatorAddress)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(mapPaywall)
}

export async function listSubmissionsByCreator(
  creatorAddress: string
): Promise<Submission[]> {
  const supabase = createAdminClient()

  // Get submissions with joined paywall info
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      *,
      paywalls!inner(
        id,
        title,
        price,
        currency,
        creator_address
      )
    `
    )
    .eq('paywalls.creator_address', creatorAddress)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(mapSubmission)
}

export async function getTotalReceivedByCreator(
  creatorAddress: string
): Promise<Record<string, string>> {
  const supabase = createAdminClient()

  // Get all paid submissions with paywall info
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      paid,
      paywalls!inner(
        price,
        currency,
        creator_address
      )
    `
    )
    .eq('paywalls.creator_address', creatorAddress)
    .eq('paid', true)

  if (error) {
    throw error
  }

  // Calculate total by currency
  const totals: Record<string, number> = {}

  for (const row of data || []) {
    // Handle both single object and array cases
    const paywall = Array.isArray(row.paywalls) ? row.paywalls[0] : row.paywalls
    const currency = paywall?.currency || 'USDC'
    const price = parseFloat(paywall?.price || '0')

    if (!totals[currency]) {
      totals[currency] = 0
    }
    totals[currency] += price
  }

  // Convert to string for consistent API response
  const result: Record<string, string> = {}
  for (const [currency, amount] of Object.entries(totals)) {
    result[currency] = amount.toFixed(2)
  }

  return result
}
