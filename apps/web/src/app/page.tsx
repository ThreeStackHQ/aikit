import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AIKit — One Endpoint. All LLMs.",
  description:
    "AI API Gateway for indie SaaS. Route to OpenAI, Anthropic, and Google from a single endpoint. Track costs, enforce budgets. From $9/mo.",
  keywords: ["AI API gateway", "LLM proxy", "OpenAI", "Anthropic", "cost tracking"],
  openGraph: {
    title: "AIKit — One Endpoint. All LLMs.",
    description:
      "Route AI requests to OpenAI, Anthropic, Google and more from a single API. Built-in cost budgets and analytics. $9/mo.",
    url: "https://aikit.threestack.io",
    siteName: "AIKit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIKit — One Endpoint. All LLMs.",
    description: "AI API Gateway for indie SaaS. $9/mo.",
  },
};

const FEATURES = [
  {
    icon: "🔀",
    title: "Universal Proxy",
    desc: "One API for OpenAI, Anthropic, Google AI, Mistral — switch models in one line.",
  },
  {
    icon: "💰",
    title: "Cost Tracking",
    desc: "Per-request token cost breakdowns. Know exactly what each call costs.",
  },
  {
    icon: "🛑",
    title: "Budget Controls",
    desc: "Set monthly spend limits per API key. Auto-block requests when limits hit.",
  },
  {
    icon: "🔑",
    title: "API Key Management",
    desc: "Scoped keys per user/team. Revoke instantly without touching your code.",
  },
  {
    icon: "🔄",
    title: "Provider Failover",
    desc: "Auto-retry on provider errors. Falls back to next provider in milliseconds.",
  },
  {
    icon: "📋",
    title: "Request Logs",
    desc: "Full audit trail — model, tokens, latency, cost, status for every request.",
  },
];

const COMPARISON = [
  { feature: "Monthly price", aikit: "$9/mo", litellm: "$50+/mo", portkey: "$49/mo" },
  { feature: "Managed hosting", aikit: "✓", litellm: "—", portkey: "✓" },
  { feature: "Self-hosted option", aikit: "—", litellm: "✓", portkey: "—" },
  { feature: "Cost tracking", aikit: "✓", litellm: "✓", portkey: "✓" },
  { feature: "Budget caps", aikit: "✓", litellm: "Partial", portkey: "✓" },
  { feature: "OpenAI-compatible API", aikit: "✓", litellm: "✓", portkey: "✓" },
  { feature: "Support", aikit: "Email", litellm: "Community", portkey: "Slack" },
];

const PRICING = [
  {
    tier: "Free",
    price: "$0",
    period: "/mo",
    limit: "1,000 req/mo",
    features: ["1 AI provider", "Basic analytics", "1 API key", "Community support"],
    highlight: false,
    cta: "Get Started",
  },
  {
    tier: "Pro",
    price: "$9",
    period: "/mo",
    limit: "50,000 req/mo",
    features: [
      "All providers",
      "Full cost analytics",
      "10 API keys",
      "Budget controls",
      "Email support",
    ],
    highlight: true,
    cta: "Start Pro",
  },
  {
    tier: "Business",
    price: "$29",
    period: "/mo",
    limit: "Unlimited",
    features: [
      "All providers",
      "Full analytics",
      "Unlimited keys",
      "Budget controls",
      "Priority support",
      "Custom rate limits",
    ],
    highlight: false,
    cta: "Start Business",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0e1a] text-gray-200">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0f0e1a]/90 backdrop-blur border-b border-[#2d2b45]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-[#7c3aed]">⚡</span>
            <span className="text-white">AIKit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#compare" className="hover:text-white transition-colors">Compare</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1a1828] border border-[#7c3aed]/30 rounded-full px-4 py-1.5 text-sm text-violet-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] inline-block animate-pulse"></span>
          AI API Gateway — Wave 49
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
          One endpoint.{" "}
          <span className="text-[#7c3aed]">All LLMs.</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Route to OpenAI, Anthropic, and Google AI from a single API. Track costs,
          enforce budgets, and never get locked in. At{" "}
          <span className="text-white font-semibold">$9/mo</span> vs LiteLLM Cloud&apos;s $50+.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Link
            href="/signup"
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3 rounded-lg font-semibold transition-colors text-base"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="bg-[#1a1828] hover:bg-[#2d2b45] text-gray-300 px-8 py-3 rounded-lg font-semibold transition-colors border border-[#2d2b45] text-base"
          >
            View Features
          </a>
        </div>

        {/* Code snippet */}
        <div className="max-w-2xl mx-auto bg-[#1a1828] border border-[#2d2b45] rounded-xl p-6 text-left font-mono text-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2d2b45]">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            <span className="text-gray-500 text-xs ml-2">terminal</span>
          </div>
          <p className="text-gray-500 mb-2"># One line to add all LLMs to your app</p>
          <p>
            <span className="text-[#7c3aed]">curl</span>{" "}
            <span className="text-gray-300">https://api.aikit.threestack.io/v1/chat \</span>
          </p>
          <p className="text-gray-300">{"  "}<span className="text-green-400">-H</span>{' "X-API-Key: ak_live_xxxx" \\'}</p>
          <p className="text-gray-300">{"  "}<span className="text-green-400">-d</span>{' \'{"model": "gpt-4o", "messages": [...]}\''}</p>
          <p className="text-gray-500 mt-3 text-xs"># also works: claude-3-5-sonnet, gemini-2-flash</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Everything you need to ship AI features</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Stop managing multiple provider SDKs. AIKit handles routing, tracking, and safety.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#1a1828] border border-[#2d2b45] rounded-xl p-6 hover:border-[#7c3aed]/40 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How does AIKit compare?</h2>
          <p className="text-gray-400">Managed gateway at a fraction of the price.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d2b45]">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                <th className="py-3 px-4 text-[#7c3aed] font-bold text-center bg-[#1a1828] rounded-t-lg">
                  AIKit ⚡
                </th>
                <th className="py-3 px-4 text-gray-400 font-medium text-center">LiteLLM Cloud</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-center">Portkey</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-[#2d2b45] ${i % 2 === 0 ? "" : "bg-[#1a1828]/30"}`}
                >
                  <td className="py-3 px-4 text-gray-300">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-white font-medium bg-[#1a1828]">
                    {row.aikit}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">{row.litellm}</td>
                  <td className="py-3 px-4 text-center text-gray-400">{row.portkey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-400">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((plan) => (
            <div
              key={plan.tier}
              className={`rounded-xl p-6 border ${
                plan.highlight
                  ? "border-[#7c3aed] bg-[#1a1828] ring-1 ring-[#7c3aed]/30"
                  : "border-[#2d2b45] bg-[#1a1828]"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs bg-[#7c3aed] text-white px-3 py-1 rounded-full mb-4 inline-block">
                  Most Popular
                </span>
              )}
              <div className="font-bold text-white text-xl mb-1">{plan.tier}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[#7c3aed] text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>
              <div className="text-gray-500 text-xs mb-5">{plan.limit}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-gray-300 flex items-start gap-2 text-sm">
                    <span className="text-[#7c3aed] mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                    : "bg-[#2d2b45] hover:bg-[#3d3b55] text-gray-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-[#1a1828] via-[#1a1828] to-[#1a1828] border border-[#7c3aed]/30 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#7c3aed]/5 rounded-2xl"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start routing AI requests today
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Free forever for 1,000 requests/mo. No credit card required.
            </p>
            <Link
              href="/signup"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-3 rounded-lg font-semibold transition-colors text-base inline-block"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2d2b45] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-[#7c3aed]">⚡</span>
            <span>AIKit</span>
            <span className="ml-4">© 2026 ThreeStack</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="mailto:hello@threestack.io" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
