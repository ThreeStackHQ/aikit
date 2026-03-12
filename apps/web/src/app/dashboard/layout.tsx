import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/requests", label: "Requests", icon: "⚡" },
  { href: "/dashboard/models", label: "Models", icon: "🤖" },
  { href: "/dashboard/users", label: "Users", icon: "👥" },
  { href: "/dashboard/budgets", label: "Cost Budgets", icon: "💰" },
  { href: "/dashboard/api-keys", label: "API Keys", icon: "🔑" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f0e1a]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1828] border-r border-[#2d2b45] flex flex-col">
        <div className="p-6 border-b border-[#2d2b45]">
          <div className="flex items-center gap-2">
            <span className="text-[#7c3aed] font-bold text-lg">AIKit</span>
            <span className="text-gray-500 text-xs bg-[#0f0e1a] px-2 py-0.5 rounded">Dashboard</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2d2b45] transition-colors text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2d2b45]">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-300 text-sm"
          >
            <span>↩</span> Sign out
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
