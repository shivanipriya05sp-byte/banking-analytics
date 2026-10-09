// All TypeScript interfaces matching the Pydantic response schemas

export interface SummaryResponse {
  total_transactions: number
  total_spend: number
  avg_transaction: number
  net_cash_flow: number
}

export interface DailyTrendItem {
  date: string
  total_spend: number
  transaction_count: number
}

export interface CategoryItem {
  category: string
  total_spend: number
  transaction_count: number
}

export interface MerchantItem {
  merchant_name: string
  total_spend: number
  transaction_count: number
}

export interface TransactionRow {
  id: number
  account_id: number
  date: string
  amount: number
  type: 'credit' | 'debit'
  status: 'success' | 'pending' | 'failed'
  category: string
  merchant_name: string
  channel: string
  description: string | null
}

export interface TransactionListResponse {
  items: TransactionRow[]
  total: number
  page: number
  page_size: number
}

export interface TransactionFilters {
  page?: number
  page_size?: number
  start_date?: string
  end_date?: string
  category?: string
  type?: string
  account_id?: number
}
