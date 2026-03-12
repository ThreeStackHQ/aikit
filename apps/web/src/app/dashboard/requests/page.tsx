export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Log — AIKit Dashboard",
};

const REQUEST_LOG = [
  { id: "req_3K9mX", time: "2026-03-12 19:38:21", model: "gpt-4o", provider: "OpenAI", promptTokens: 842, completionTokens: 398, cost: "$0.024", latency: "312ms", status: "success", keyName: "Production App" },
  { id: "req_7pQ2N", time: "2026-03-12 19:36:07", model: "claude-3-5-sonnet", provider: "Anthropic", promptTokens: 620, completionTokens: 270, cost: "$0.013", latency: "428ms", status: "success", keyName: "Production App" },
  { id: "req_1wR4L", time: "2026-03-12 19:35:44", model: "gpt-4o-mini", provider: "OpenAI", promptTokens: 240, completionTokens: 100, cost: "$0.002", latency: "198ms", status: "success", keyName: "Dev / Testing" },
  { id: "req_9sT8M", time: "2026-03-12 19:33:11", model: "gemini-2-flash", provider: "Google", promptTokens: 1500, completionTokens: 600, cost: "$0.007", latency: "256ms", status: "success", keyName: "Production App" },
  { id: "req_4vH6Y", time: "2026-03-12 19:31:58", model: "gpt-4o", provider: "OpenAI", promptTokens: 0, completionTokens: 0, cost: "$0.000", latency: "—", status: "error", keyName: "Production App" },
  { id: "req_6mP3Z", time: "2026-03-12 19:30:22", model: "claude-3-haiku", provider: "Anthropic", promptTokens: 310, completionTokens: 110, cost: "$0.001", latency: "187ms", status: "success", keyName: "Dev / Testing" },
  { id: "req_2nV5K", time: "2026-03-12 19:28:15", model: "gpt-4o-mini", provider: "OpenAI", promptTokens: 180, completionTokens: 220, cost: "$0.002", latency: "203ms", status: "success", keyName: "Production App" },
  { id: "req_8cD1J", time: "2026-03-12 19:25:03", model: "gpt-4o", provider: "OpenAI", promptTokens: 920, completionTokens: 480, cost: "$0.028", latency: "389ms", status: "success", keyName: "Production App" },
  { id: "req_5qA7F", time: "2026-03-12 19:22:41", model: "claude-3-5-sonnet", provider: "Anthropic", promptTokens: 740, completionTokens: 310, cost: "$0.016", latency: "461ms", status: "success", keyName: "Dev / Testing" },
  { id: "req_0eB9G", time: "2026-03-12 19:19:30", model: "gemini-2-flash", provider: "Google", promptTokens: 2000, completionTokens: 800, cost: "$0.009", latency: "271ms", status: "success", keyName: "Production App" },
];

const STATUS_COUNTS = { success: 9, error: 1 };
const TOTAL_REQUESTS = 10;

export default function RequestsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Request Log</h1>
          <p className="text-gray-400 text-sm mt-0.5">Full audit trail of all AI API calls.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select className="bg-[#1a1828] border border-[#2d2b45] text-gray-300 text-sm px-3 py-1.5 rounded-lg">
            <option>All providers</option>
            <option>OpenAI</option>
            <option>Anthropic</option>
            <option>Google</option>
          </select>
          <select className="bg-[#1a1828] border border-[#2d2b45] text-gray-300 text-sm px-3 py-1.5 rounded-lg">
            <option>All statuses</option>
            <option>Success</option>
            <option>Error</option>
          </select>
          <select className="bg-[#1a1828] border border-[#2d2b45] text-gray-300 text-sm px-3 py-1.5 rounded-lg">
            <option>All API keys</option>
            <option>Production App</option>
            <option>Dev / Testing</option>
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{TOTAL_REQUESTS}</p>
          <p className="text-gray-500 text-xs mt-1">Shown</p>
        </div>
        <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{STATUS_COUNTS.success}</p>
          <p className="text-gray-500 text-xs mt-1">Success</p>
        </div>
        <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{STATUS_COUNTS.error}</p>
          <p className="text-gray-500 text-xs mt-1">Errors</p>
        </div>
      </div>

      {/* Requests table */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d2b45] text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-3 px-5 text-left">Request ID</th>
                <th className="py-3 px-5 text-left">Time</th>
                <th className="py-3 px-5 text-left">Model</th>
                <th className="py-3 px-5 text-left">API Key</th>
                <th className="py-3 px-5 text-right">Tokens</th>
                <th className="py-3 px-5 text-right">Cost</th>
                <th className="py-3 px-5 text-right">Latency</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {REQUEST_LOG.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-[#2d2b45]/50 hover:bg-[#2d2b45]/20 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <code className="text-xs text-gray-400 font-mono">{req.id}</code>
                  </td>
                  <td className="py-3.5 px-5 text-gray-500 font-mono text-xs whitespace-nowrap">
                    {req.time.split(" ")[1]}
                  </td>
                  <td className="py-3.5 px-5">
                    <div>
                      <span className="text-gray-200 font-mono text-xs">{req.model}</span>
                      <span className="text-gray-600 text-xs ml-2">· {req.provider}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-gray-400 text-xs">{req.keyName}</td>
                  <td className="py-3.5 px-5 text-right text-gray-400">
                    {req.promptTokens > 0 ? (req.promptTokens + req.completionTokens).toLocaleString() : "—"}
                  </td>
                  <td className="py-3.5 px-5 text-right text-gray-300 font-medium">{req.cost}</td>
                  <td className="py-3.5 px-5 text-right text-gray-400 font-mono text-xs">{req.latency}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        req.status === "success"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {req.status === "success" ? "200" : "500"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#2d2b45] flex items-center justify-between text-xs text-gray-500">
          <span>Showing {TOTAL_REQUESTS} of 12,483 requests</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#2d2b45] rounded text-gray-400 hover:text-white transition-colors">← Prev</button>
            <button className="px-3 py-1.5 bg-[#2d2b45] rounded text-gray-400 hover:text-white transition-colors">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
