import { useEffect, useState } from 'react'
import { getTopMerchants } from '../../api/api'
import type { MerchantItem } from '../../types'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function TopMerchants() {
  const [data, setData] = useState<MerchantItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getTopMerchants({ limit: 10 })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (error)   return <Card><ErrorMessage /></Card>
  if (loading) return <Card><LoadingSpinner /></Card>

  const max = data[0]?.total_spend ?? 1

  return (
    <Card>
      <p className="text-sm font-medium text-gray-700 mb-4">Top 10 Merchants</p>
      <ul className="space-y-3">
        {data.map((m, i) => (
          <li key={m.merchant_name}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span className="font-medium">{i + 1}. {m.merchant_name}</span>
              <span>{fmt(m.total_spend)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(m.total_spend / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
