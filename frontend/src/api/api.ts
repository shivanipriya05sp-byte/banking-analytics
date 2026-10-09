import axios from 'axios'
import type {
  SummaryResponse,
  DailyTrendItem,
  CategoryItem,
  MerchantItem,
  TransactionListResponse,
  TransactionFilters,
} from '../types'

const api = axios.create({ baseURL: '' })

export const getSummary = (params?: { account_id?: number; start_date?: string; end_date?: string }) =>
  api.get<SummaryResponse>('/api/summary', { params }).then(r => r.data)

export const getDailyTrend = (params?: { days?: number; account_id?: number }) =>
  api.get<DailyTrendItem[]>('/api/trend/daily', { params }).then(r => r.data)

export const getCategories = (params?: { start_date?: string; end_date?: string; account_id?: number }) =>
  api.get<CategoryItem[]>('/api/categories', { params }).then(r => r.data)

export const getTopMerchants = (params?: { limit?: number; start_date?: string; end_date?: string }) =>
  api.get<MerchantItem[]>('/api/merchants/top', { params }).then(r => r.data)

export const getTransactions = (filters: TransactionFilters = {}) =>
  api.get<TransactionListResponse>('/api/transactions', { params: filters }).then(r => r.data)
