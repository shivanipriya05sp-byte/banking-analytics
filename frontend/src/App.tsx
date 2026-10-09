import './index.css'
import TopBar from './components/layout/TopBar'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  )
}
