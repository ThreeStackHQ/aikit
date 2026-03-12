import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIKit — AI API Gateway for Indie SaaS",
  description: "One endpoint. All LLMs. Rate limiting, cost budgets, and usage analytics at $9/mo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f0e1a] text-gray-200 min-h-screen">{children}</body>
    </html>
  );
}
