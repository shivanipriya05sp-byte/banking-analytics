import { useEffect, useState } from 'react'
import { getDailyTrend } from '../../api/api'
import type { DailyTrendItem } from '../../types'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'
import { format, parseISO } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function DailyTrendChart() {
  const [data, setData] = useState<DailyTrendItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getDailyTrend({ days: 30 })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (error)   return <Card><ErrorMessage /></Card>
  if (loading) return <Card><LoadingSpinner /></Card>

  const chartData = data.map(d => ({
    date: format(parseISO(d.date), 'MMM d'),
    spend: d.total_spend,
  }))

  return (
    <Card>
      <p className="text-sm font-medium text-gray-700 mb-4">Daily Spend — Last 30 Days</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} width={56} />
          <Tooltip formatter={(v) => [`${(v as number).toFixed(2)}`, 'Spend']} />
          <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
