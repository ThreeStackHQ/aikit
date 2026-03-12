"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊", exact: true },
  { href: "/dashboard/requests", label: "Requests", icon: "⚡", exact: false },
  { href: "/dashboard/models", label: "Models", icon: "🤖", exact: false },
  { href: "/dashboard/users", label: "Users", icon: "👥", exact: false },
  { href: "/dashboard/budgets", label: "Cost Budgets", icon: "🛑", exact: false },
  { href: "/dashboard/api-keys", label: "API Keys", icon: "🔑", exact: false },
  { href: "/dashboard/usage", label: "Usage & Billing", icon: "💳", exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️", exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (item: { href: string; exact: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="flex min-h-screen bg-[#0f0e1a]">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0d0c18] border-r border-[#2d2b45] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-[#2d2b45]">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[#7c3aed] font-bold text-lg">⚡</span>
            <span className="text-white font-bold text-base">AIKit</span>
            <span className="text-gray-600 text-xs ml-1 bg-[#1a1828] px-2 py-0.5 rounded border border-[#2d2b45]">Pro</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[#7c3aed]/15 text-[#7c3aed] font-medium"
                    : "text-gray-400 hover:text-white hover:bg-[#2d2b45]/50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / signout */}
        <div className="p-3 border-t border-[#2d2b45]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2d2b45]/40 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] text-xs font-bold flex items-center justify-center">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-xs font-medium truncate">user@example.com</p>
              <p className="text-gray-600 text-xs">Pro plan</p>
            </div>
          </div>
          <a
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 text-sm mt-0.5 transition-colors"
          >
            <span>↩</span>
            <span>Sign out</span>
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
