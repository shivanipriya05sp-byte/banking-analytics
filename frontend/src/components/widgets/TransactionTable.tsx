import { useEffect, useState, useCallback } from 'react'
import { getTransactions } from '../../api/api'
import type { TransactionRow, TransactionFilters } from '../../types'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'

const CATEGORIES = ['Food', 'Travel', 'Utilities', 'Retail', 'Entertainment', 'Healthcare', 'Education', 'Transfers']
const PAGE_SIZE = 15

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function exportCSV(rows: TransactionRow[]) {
  const header = ['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Status', 'Channel']
  const lines = rows.map(r =>
    [r.date, r.merchant_name, r.category, r.type, r.amount.toFixed(2), r.status, r.channel].join(',')
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'transactions.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function TransactionTable() {
  const [items, setItems]   = useState<TransactionRow[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  const [filters, setFilters] = useState<Omit<TransactionFilters, 'page' | 'page_size'>>({})

  const load = useCallback((f: typeof filters, p: number) => {
    setLoading(true)
    setError(false)
    getTransactions({ ...f, page: p, page_size: PAGE_SIZE })
      .then(res => { setItems(res.items); setTotal(res.total) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(filters, page) }, [filters, page, load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function setFilter(key: keyof typeof filters, value: string) {
    setPage(1)
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
  }

  const STATUS_COLOR: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed:  'bg-red-100 text-red-600',
  }

  return (
    <Card className="col-span-full">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mr-auto">Transactions</p>

        {/* Filters */}
        <input type="date" className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
          onChange={e => setFilter('start_date', e.target.value)} />
        <input type="date" className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
          onChange={e => setFilter('end_date', e.target.value)} />

        <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
          onChange={e => setFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
          onChange={e => setFilter('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        <button
          onClick={() => exportCSV(items)}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Table */}
      {error   ? <ErrorMessage /> :
       loading ? <LoadingSpinner /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-gray-700 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                {['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Status'].map(h => (
                  <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4 whitespace-nowrap">{t.date}</td>
                  <td className="py-2 pr-4">{t.merchant_name}</td>
                  <td className="py-2 pr-4">{t.category}</td>
                  <td className={`py-2 pr-4 font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-gray-700'}`}>
                    {t.type}
                  </td>
                  <td className="py-2 pr-4 font-mono">{fmtCurrency(t.amount)}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[t.status] ?? ''}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>{total} total rows</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >‹ Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >Next ›</button>
        </div>
      </div>
    </Card>
  )
}
