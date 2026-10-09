const NAV_ITEMS = [{ label: 'Dashboard', icon: '▦' }]

export default function Sidebar() {
  return (
    <aside className="w-52 bg-white border-r border-gray-200 shrink-0 flex flex-col pt-4">
      {NAV_ITEMS.map(item => (
        <div
          key={item.label}
          className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg mx-2 cursor-default"
        >
          <span>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </aside>
  )
}
