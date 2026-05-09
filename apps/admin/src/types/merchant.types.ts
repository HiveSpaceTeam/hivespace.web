export interface Merchant {
  id: string
  name: string
  initials: string
  logoColor: string
  region: string
  status: 'active' | 'review' | 'pending_kyb' | 'suspended'
  tier: 1 | 2 | 3 | 4
  category: string
  gmv30d: string
  gmvDelta: number
  gmvBarPct: number
  orders: number
  joined: string
}

export interface KycItem {
  id: string
  name: string
  type: string
  submittedAt: string
  isUrgent: boolean
  initials: string
  color: string
}

export interface CategoryBreakdown {
  label: string
  pct: number
  color: string
}
