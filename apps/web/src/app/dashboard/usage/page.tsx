export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Usage & Billing — AIKit Dashboard",
};

const COST_BREAKDOWN = [
  { model: "gpt-4o", provider: "OpenAI", requests: 4201, tokens: "3.2M", cost: 0.82 },
  { model: "claude-3-5-sonnet", provider: "Anthropic", requests: 2840, tokens: "1.8M", cost: 0.53 },
  { model: "gpt-4o-mini", provider: "OpenAI", requests: 3890, tokens: "4.1M", cost: 0.31 },
  { model: "gemini-2-flash", provider: "Google", requests: 1552, tokens: "2.4M", cost: 0.21 },
];

export default function UsagePage() {
  const currentPlan = "Pro";
  const requestsUsed = 12483;
  const requestsLimit = 50000;
  const usedPct = Math.round((requestsUsed / requestsLimit) * 100);
  const totalCost = 1.87;
  const periodStart = "Mar 1, 2026";
  const periodEnd = "Mar 31, 2026";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Usage & Billing</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Billing period: {periodStart} — {periodEnd}
        </p>
      </div>

      {/* Plan card */}
      <div className="bg-[#1a1828] border border-[#7c3aed]/30 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-lg">{currentPlan} Plan</span>
            <span className="bg-[#7c3aed]/20 text-[#7c3aed] text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <p className="text-gray-400 text-sm">$9/mo · Renews Apr 1, 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#2d2b45] hover:bg-[#3d3b55] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Manage Billing
          </button>
          <Link
            href="/signup"
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Upgrade to Business
          </Link>
        </div>
      </div>

      {/* Usage meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Requests */}
        <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Requests</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Used this month</span>
            <span className="text-gray-200">{requestsUsed.toLocaleString()} / {requestsLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-[#0f0e1a] rounded-full h-2.5 mb-2">
            <div
              className={`h-2.5 rounded-full ${usedPct > 80 ? "bg-amber-500" : "bg-[#7c3aed]"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{usedPct}% used</span>
            <span>{(requestsLimit - requestsUsed).toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Cost */}
        <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">AI Provider Costs</h2>
          <div className="text-3xl font-bold text-white">${totalCost.toFixed(2)}</div>
          <p className="text-gray-400 text-sm mt-1">
            Provider API costs this month
          </p>
          <p className="text-gray-500 text-xs mt-3">
            These are pass-through costs from your provider APIs. AIKit charges flat $9/mo on top.
          </p>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2d2b45]">
          <h2 className="text-white font-semibold">Cost Breakdown by Model</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d2b45] text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-3 px-5 text-left">Model</th>
                <th className="py-3 px-5 text-left">Provider</th>
                <th className="py-3 px-5 text-right">Requests</th>
                <th className="py-3 px-5 text-right">Tokens</th>
                <th className="py-3 px-5 text-right">Cost</th>
                <th className="py-3 px-5 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {COST_BREAKDOWN.map((row) => (
                <tr key={row.model} className="border-b border-[#2d2b45]/50 hover:bg-[#2d2b45]/20 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs text-gray-200">{row.model}</td>
                  <td className="py-3.5 px-5 text-gray-400">{row.provider}</td>
                  <td className="py-3.5 px-5 text-right text-gray-300">{row.requests.toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-right text-gray-300">{row.tokens}</td>
                  <td className="py-3.5 px-5 text-right text-white font-semibold">${row.cost.toFixed(2)}</td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-[#0f0e1a] rounded-full h-1.5">
                        <div
                          className="bg-[#7c3aed] h-1.5 rounded-full"
                          style={{ width: `${Math.round((row.cost / totalCost) * 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs w-8 text-right">
                        {Math.round((row.cost / totalCost) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-[#2d2b45]/20">
                <td colSpan={4} className="py-3 px-5 text-gray-400 font-medium text-sm">Total</td>
                <td className="py-3 px-5 text-right text-white font-bold">${totalCost.toFixed(2)}</td>
                <td className="py-3 px-5 text-right text-gray-500 text-xs">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade CTA (shows for non-Business users) */}
      <div className="bg-gradient-to-r from-[#1a1828] to-[#1a1828] border border-[#2d2b45] rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-semibold mb-1">Need more capacity?</h3>
          <p className="text-gray-400 text-sm">
            Business plan gives you unlimited requests, custom rate limits, and priority support.
          </p>
        </div>
        <Link
          href="/signup"
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
        >
          Upgrade to Business — $29/mo
        </Link>
      </div>
    </div>
  );
}
