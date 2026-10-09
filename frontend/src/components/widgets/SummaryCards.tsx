import { useEffect, useState } from 'react'
import { getSummary } from '../../api/api'
import type { SummaryResponse } from '../../types'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

const CARDS = [
  { key: 'total_transactions', label: 'Total Transactions', format: (v: number) => v.toLocaleString(), color: 'text-blue-600' },
  { key: 'total_spend',        label: 'Total Spend',        format: fmt,                                color: 'text-red-500'  },
  { key: 'avg_transaction',    label: 'Avg Transaction',    format: fmt,                                color: 'text-yellow-600' },
  { key: 'net_cash_flow',      label: 'Net Cash Flow',      format: fmt,                                color: 'text-green-600' },
] as const

export default function SummaryCards() {
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getSummary().then(setData).catch(() => setError(true))
  }, [])

  if (error) return <ErrorMessage message="Could not load summary." />
  if (!data)  return <LoadingSpinner />

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, format, color }) => (
        <Card key={key}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{format(data[key] as number)}</p>
        </Card>
      ))}
    </div>
  )
}
