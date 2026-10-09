import SummaryCards from '../components/widgets/SummaryCards'
import DailyTrendChart from '../components/widgets/DailyTrendChart'
import CategoryChart from '../components/widgets/CategoryChart'
import TopMerchants from '../components/widgets/TopMerchants'
import TransactionTable from '../components/widgets/TransactionTable'

export default function Dashboard() {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h1>

      {/* Row 1 — KPI cards */}
      <SummaryCards />

      {/* Row 2 — Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="xl:col-span-2">
          <DailyTrendChart />
        </div>
        <CategoryChart />
      </div>

      {/* Row 3 — Top merchants */}
      <div className="mt-4">
        <TopMerchants />
      </div>

      {/* Row 4 — Transaction table */}
      <div className="mt-4">
        <TransactionTable />
      </div>
    </main>
  )
}
