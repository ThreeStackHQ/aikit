import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0f0e1a] flex flex-col items-center justify-center px-6">
      {/* Hero */}
      <div className="text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-[#1a1828] border border-[#2d2b45] rounded-full px-4 py-1.5 text-sm text-violet-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-500 inline-block"></span>
          Wave 49 — AI API Gateway
        </div>

        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          One endpoint.{" "}
          <span className="text-[#7c3aed]">All LLMs.</span>
        </h1>

        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
          Route AI requests to OpenAI, Anthropic, Google, and more — with built-in
          rate limiting, cost budgets, and usage analytics. At $9/mo vs LiteLLM
          Cloud&apos;s $50+.
        </p>

        {/* CTA */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="bg-[#1a1828] hover:bg-[#2d2b45] text-gray-300 px-8 py-3 rounded-lg font-semibold transition-colors border border-[#2d2b45]"
          >
            Sign in
          </Link>
        </div>

        {/* Code snippet */}
        <div className="mt-12 bg-[#1a1828] border border-[#2d2b45] rounded-lg p-6 text-left font-mono text-sm">
          <p className="text-gray-500 mb-2"># One line to add all LLMs to your app</p>
          <p className="text-[#7c3aed]">curl</p>
          <p className="text-gray-300">{"  https://api.aikit.threestack.io/v1/chat \\"}</p>
          <p className="text-gray-300">{"  -H \"Authorization: Bearer ak_xxxx\" \\"}</p>
          <p className="text-gray-300">{"  -d '{\"model\": \"gpt-4o\", \"messages\": [...]}'  # also works with claude-3-opus"}</p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: "🔀", title: "Multi-Provider Routing", desc: "OpenAI, Anthropic, Google, Mistral" },
            { icon: "⚡", title: "Rate Limiting", desc: "Per API key, configurable per tier" },
            { icon: "💰", title: "Cost Budgets", desc: "Set limits, get alerts at threshold" },
            { icon: "📊", title: "Usage Analytics", desc: "Tokens, latency, cost per model" },
            { icon: "🔌", title: "OpenAI Compatible", desc: "Drop-in replacement API format" },
            { icon: "🔄", title: "Fallback & Retry", desc: "Automatic provider fallback on errors" },
          ].map((f) => (
            <div key={f.title} className="bg-[#1a1828] border border-[#2d2b45] rounded-lg p-4 text-left">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-white">{f.title}</div>
              <div className="text-gray-500 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-16 grid grid-cols-3 gap-4 text-sm">
          {[
            { tier: "Free", price: "$0", limit: "100 req/mo", features: ["1 AI model", "Basic analytics", "1 API key"] },
            { tier: "Pro", price: "$9", limit: "10k req/mo", features: ["All models", "Full analytics", "10 API keys", "Cost budgets"], highlight: true },
            { tier: "Business", price: "$29", limit: "Unlimited", features: ["All models", "Full analytics", "Unlimited keys", "Priority support"] },
          ].map((p) => (
            <div
              key={p.tier}
              className={`rounded-lg p-5 text-left border ${p.highlight ? "border-[#7c3aed] bg-[#1a1828]" : "border-[#2d2b45] bg-[#1a1828]"}`}
            >
              {p.highlight && (
                <span className="text-xs bg-[#7c3aed] text-white px-2 py-0.5 rounded-full mb-2 inline-block">Most Popular</span>
              )}
              <div className="font-bold text-white text-lg">{p.tier}</div>
              <div className="text-[#7c3aed] text-2xl font-bold">{p.price}<span className="text-gray-400 text-sm">/mo</span></div>
              <div className="text-gray-400 text-xs mb-3">{p.limit}</div>
              <ul className="space-y-1">
                {p.features.map((f) => (
                  <li key={f} className="text-gray-300 flex items-center gap-1">
                    <span className="text-[#7c3aed]">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
