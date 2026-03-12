export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 mt-1">Your AI API Gateway dashboard</p>
      </div>

      {/* Usage bar */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Monthly Requests</span>
          <span className="text-sm text-gray-300">0 / 100</span>
        </div>
        <div className="w-full bg-[#0f0e1a] rounded-full h-2">
          <div className="bg-[#7c3aed] h-2 rounded-full" style={{ width: "0%" }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Free tier — upgrade for 10k requests/mo</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Requests", value: "0", sub: "this month" },
          { label: "Avg Latency", value: "—", sub: "ms" },
          { label: "Total Cost", value: "$0.00", sub: "this month" },
          { label: "Active API Keys", value: "0", sub: "keys" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#1a1828] border border-[#2d2b45] rounded-lg p-5">
            <div className="text-gray-400 text-sm">{kpi.label}</div>
            <div className="text-white text-2xl font-bold mt-1">{kpi.value}</div>
            <div className="text-gray-500 text-xs mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Getting started */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Get started</h2>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#7c3aed] text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>Create an API key in <a href="/dashboard/api-keys" className="text-[#7c3aed] hover:underline">API Keys</a></span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#2d2b45] text-gray-300 text-xs flex items-center justify-center font-bold">2</span>
            <span>Set your AI provider API keys in <a href="/dashboard/settings" className="text-[#7c3aed] hover:underline">Settings</a></span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#2d2b45] text-gray-300 text-xs flex items-center justify-center font-bold">3</span>
            <span>Send your first request to <code className="bg-[#0f0e1a] px-1 rounded text-violet-400">POST /api/v1/chat</code></span>
          </li>
        </ol>
      </div>
    </div>
  );
}
