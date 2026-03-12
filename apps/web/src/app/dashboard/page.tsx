export const dynamic = "force-dynamic";

// Mock data for dashboard
const KPI_CARDS = [
  { label: "Total Requests", value: "12,483", sub: "this month", trend: "+18%", positive: true },
  { label: "Avg Latency", value: "342ms", sub: "p50", trend: "-12ms", positive: true },
  { label: "Total Cost", value: "$1.87", sub: "this month", trend: "+$0.42", positive: false },
  { label: "Active Users", value: "24", sub: "last 30 days", trend: "+6", positive: true },
];

const RECENT_REQUESTS = [
  { time: "19:38", model: "gpt-4o", provider: "OpenAI", tokens: 1240, cost: "$0.024", status: "success", latency: "312ms" },
  { time: "19:36", model: "claude-3-5-sonnet", provider: "Anthropic", tokens: 890, cost: "$0.013", status: "success", latency: "428ms" },
  { time: "19:35", model: "gpt-4o-mini", provider: "OpenAI", tokens: 340, cost: "$0.002", status: "success", latency: "198ms" },
  { time: "19:33", model: "gemini-2-flash", provider: "Google", tokens: 2100, cost: "$0.007", status: "success", latency: "256ms" },
  { time: "19:31", model: "gpt-4o", provider: "OpenAI", tokens: 750, cost: "$0.015", status: "error", latency: "—" },
  { time: "19:30", model: "claude-3-haiku", provider: "Anthropic", tokens: 420, cost: "$0.001", status: "success", latency: "187ms" },
];

const COST_BY_MODEL = [
  { model: "gpt-4o", cost: 0.82, pct: 44 },
  { model: "claude-3-5-sonnet", cost: 0.53, pct: 28 },
  { model: "gpt-4o-mini", cost: 0.31, pct: 17 },
  { model: "gemini-2-flash", cost: 0.21, pct: 11 },
];

// Simple SVG area chart data (30 days)
const CHART_DATA = [45, 82, 60, 110, 95, 142, 180, 156, 210, 185, 240, 220, 195, 260, 280, 310, 285, 340, 320, 380, 360, 400, 420, 390, 450, 480, 460, 520, 490, 530];

function AreaChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const width = 600;
  const height = 120;
  const padding = { top: 10, bottom: 10 };
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = chartHeight - (v / max) * chartHeight + padding.top;
    return `${x},${y}`;
  });

  const areaPoints = [
    `0,${height}`,
    ...points,
    `${width},${height}`,
  ].join(" ");

  const linePoints = points.join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#areaGrad)" />
      <polyline points={linePoints} fill="none" stroke="#7c3aed" strokeWidth="2" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-0.5">March 2026</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-[#1a1828] border border-[#2d2b45] text-gray-300 text-sm px-3 py-1.5 rounded-lg">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>This month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-5">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{kpi.label}</p>
            <p className="text-white text-2xl font-bold mt-2">{kpi.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-500 text-xs">{kpi.sub}</p>
              <span className={`text-xs font-medium ${kpi.positive ? "text-green-400" : "text-red-400"}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Requests chart */}
        <div className="lg:col-span-2 bg-[#1a1828] border border-[#2d2b45] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Requests (30 days)</h2>
            <span className="text-xs text-gray-500">Total: 12,483</span>
          </div>
          <AreaChart data={CHART_DATA} />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Feb 10</span>
            <span>Feb 20</span>
            <span>Mar 1</span>
            <span>Mar 12</span>
          </div>
        </div>

        {/* Cost by model */}
        <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Cost by Model</h2>
          <div className="space-y-3">
            {COST_BY_MODEL.map((m) => (
              <div key={m.model}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300 font-mono text-xs">{m.model}</span>
                  <span className="text-gray-400">${m.cost.toFixed(2)}</span>
                </div>
                <div className="w-full bg-[#0f0e1a] rounded-full h-1.5">
                  <div
                    className="bg-[#7c3aed] h-1.5 rounded-full"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#2d2b45]">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total cost</span>
              <span className="text-white font-semibold">$1.87</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2d2b45] flex items-center justify-between">
          <h2 className="text-white font-semibold">Recent Requests</h2>
          <a href="/dashboard/requests" className="text-xs text-[#7c3aed] hover:underline">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d2b45] text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-3 px-5 text-left">Time</th>
                <th className="py-3 px-5 text-left">Model</th>
                <th className="py-3 px-5 text-left">Provider</th>
                <th className="py-3 px-5 text-right">Tokens</th>
                <th className="py-3 px-5 text-right">Cost</th>
                <th className="py-3 px-5 text-right">Latency</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_REQUESTS.map((req, i) => (
                <tr key={i} className="border-b border-[#2d2b45]/50 hover:bg-[#2d2b45]/20 transition-colors">
                  <td className="py-3 px-5 text-gray-500 font-mono text-xs">{req.time}</td>
                  <td className="py-3 px-5 text-gray-300 font-mono text-xs">{req.model}</td>
                  <td className="py-3 px-5 text-gray-400">{req.provider}</td>
                  <td className="py-3 px-5 text-right text-gray-400">{req.tokens.toLocaleString()}</td>
                  <td className="py-3 px-5 text-right text-gray-300">{req.cost}</td>
                  <td className="py-3 px-5 text-right text-gray-400 font-mono text-xs">{req.latency}</td>
                  <td className="py-3 px-5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        req.status === "success"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Getting started (if new user, would check real data) */}
      <div className="bg-[#1a1828] border border-[#2d2b45]/50 border-dashed rounded-xl p-5">
        <h3 className="text-white font-medium mb-3">Quick start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {[
            { step: "1", title: "Create API Key", link: "/dashboard/api-keys", desc: "Generate a key to authenticate requests" },
            { step: "2", title: "Add Provider Keys", link: "/dashboard/settings", desc: "Add OpenAI / Anthropic / Google keys" },
            { step: "3", title: "Send First Request", link: "#", desc: "POST /api/v1/chat with your AI model" },
          ].map((s) => (
            <a key={s.step} href={s.link} className="flex gap-3 p-3 rounded-lg hover:bg-[#2d2b45]/30 transition-colors group">
              <span className="w-7 h-7 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] text-sm font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-[#7c3aed]/30 transition-colors">
                {s.step}
              </span>
              <div>
                <p className="text-gray-200 font-medium group-hover:text-white transition-colors">{s.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
