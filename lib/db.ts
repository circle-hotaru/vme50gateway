import { createAdminClient } from './supabase-admin'
import { PaywallConfig, Submission } from '@/types'

const mapPaywall = (row: any): PaywallConfig => ({
  id: row.id,
  creatorAddress: row.creator_address,
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
})

export async function createPaywall(input: {
  id?: string
  creatorAddress: string
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
