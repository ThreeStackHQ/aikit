export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Keys — AIKit Dashboard",
};

const MOCK_KEYS = [
  {
    name: "Production App",
    prefix: "ak_live_7xK2",
    suffix: "...mN9p",
    created: "Feb 28, 2026",
    lastUsed: "Just now",
    requests: "8,241",
    status: "active",
    permissions: "all",
  },
  {
    name: "Dev / Testing",
    prefix: "ak_live_3dR5",
    suffix: "...qT1w",
    created: "Feb 14, 2026",
    lastUsed: "2 hours ago",
    requests: "3,901",
    status: "active",
    permissions: "all",
  },
  {
    name: "Old Key (Revoked)",
    prefix: "ak_live_9sL4",
    suffix: "...bY7u",
    created: "Jan 12, 2026",
    lastUsed: "Feb 10, 2026",
    requests: "341",
    status: "revoked",
    permissions: "read",
  },
];

export default function APIKeysPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage keys used to authenticate requests to AIKit.</p>
        </div>
        <button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <span>+</span> Create Key
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-[#1a1828] border border-[#7c3aed]/20 rounded-xl p-4 flex gap-3 items-start">
        <span className="text-[#7c3aed] text-lg mt-0.5">ℹ</span>
        <div className="text-sm">
          <p className="text-gray-300 font-medium">Keep your API keys secret</p>
          <p className="text-gray-400 mt-0.5">
            API keys grant full access to your AIKit account. Never share them publicly or commit them to version control.
            Use environment variables or a secrets manager.
          </p>
        </div>
      </div>

      {/* Keys table */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d2b45] text-xs text-gray-500 uppercase tracking-wide">
                <th className="py-3 px-5 text-left">Name</th>
                <th className="py-3 px-5 text-left">Key</th>
                <th className="py-3 px-5 text-left">Created</th>
                <th className="py-3 px-5 text-left">Last Used</th>
                <th className="py-3 px-5 text-right">Requests</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_KEYS.map((key) => (
                <tr
                  key={key.name}
                  className={`border-b border-[#2d2b45]/50 ${
                    key.status === "revoked" ? "opacity-50" : "hover:bg-[#2d2b45]/20"
                  } transition-colors`}
                >
                  <td className="py-4 px-5">
                    <span className="text-white font-medium">{key.name}</span>
                  </td>
                  <td className="py-4 px-5">
                    <code className="text-[#7c3aed] font-mono text-xs bg-[#0f0e1a] px-2 py-1 rounded">
                      {key.prefix}•••{key.suffix}
                    </code>
                  </td>
                  <td className="py-4 px-5 text-gray-400">{key.created}</td>
                  <td className="py-4 px-5 text-gray-400">{key.lastUsed}</td>
                  <td className="py-4 px-5 text-right text-gray-300">{key.requests}</td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        key.status === "active"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {key.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    {key.status === "active" ? (
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">
                        Revoke
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pro plan limit */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm font-medium">API Keys</span>
          <span className="text-gray-400 text-sm">2 / 10 used</span>
        </div>
        <div className="w-full bg-[#0f0e1a] rounded-full h-2">
          <div className="bg-[#7c3aed] h-2 rounded-full" style={{ width: "20%" }} />
        </div>
        <p className="text-gray-500 text-xs mt-2">Pro plan — up to 10 API keys</p>
      </div>

      {/* Create Key Section */}
      <div className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Create a new API key</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Key name</label>
            <input
              type="text"
              placeholder="e.g. Production App"
              className="w-full bg-[#0f0e1a] border border-[#2d2b45] rounded-lg px-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-[#7c3aed] transition-colors placeholder:text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Budget limit (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                placeholder="50"
                className="w-full bg-[#0f0e1a] border border-[#2d2b45] rounded-lg pl-7 pr-3 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-[#7c3aed] transition-colors placeholder:text-gray-600"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1">Auto-block requests when monthly spend exceeds this limit.</p>
          </div>
          <button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Create API Key
          </button>
        </div>
        <div className="mt-6 p-4 bg-amber-900/10 border border-amber-700/20 rounded-lg text-sm text-amber-400/80 hidden" id="new-key-result">
          <p className="font-medium mb-2">⚠️ Copy your key now — it won&apos;t be shown again</p>
          <code className="block bg-[#0f0e1a] px-3 py-2 rounded text-[#7c3aed] font-mono text-xs mt-2 break-all">
            ak_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </code>
        </div>
      </div>
    </div>
  );
}
