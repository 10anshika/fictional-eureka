"use client";
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ConnectionStatus } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const EMPTY_STATUS: ConnectionStatus = {
  shopify: { connected: false, shop_domain: null, last_verified_at: null },
  woocommerce: { connected: false, site_url: null, last_verified_at: null },
  razorpay: { connected: false, last_verified_at: null },
};

function platformCard(name: string, status: ConnectionStatus["shopify" | "woocommerce" | "razorpay"], href: string, icon: string) {
  const connected = status.connected;
  const verifiedLabel = status.last_verified_at
    ? `Last verified ${new Date(status.last_verified_at).toLocaleString("en-IN")}`
    : "Connected; verification time unavailable.";
  return (
    <Link href={href} className="block rounded-3xl border p-6 transition hover:border-slate-300 hover:shadow-sm bg-white">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-3xl">{icon}</div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {connected ? "Connected" : "Not connected"}
        </span>
      </div>
      <div className="text-sm text-slate-600 mb-2">{name}</div>
      <div className="text-xs text-slate-400">{connected ? verifiedLabel : "Connect to enable reconciliation."}</div>
    </Link>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>(EMPTY_STATUS);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    api.getConnectionStatus()
      .then(setStatus)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load settings")
      })
      .finally(() => setLoading(false));
  }, [authChecked]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 mt-2">Manage store connections, billing, alerts, and reconciliation settings.</p>
          </div>
          <Link href="/connect" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
            Connect a store
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2 mb-8">
          {platformCard("Shopify", status.shopify, "/connect", "🛍️")}
          {platformCard("WooCommerce", status.woocommerce, "/connect", "🔧")}
          {platformCard("Razorpay", status.razorpay, "/connect", "💳")}
          <Link href="/settings/billing" className="block rounded-3xl border p-6 transition hover:border-slate-300 hover:shadow-sm bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-3xl">📦</div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Billing overview
              </span>
            </div>
            <div className="text-sm text-slate-600 mb-2">View GMV history, generate exports, and ITC recovery reports.</div>
            <div className="text-xs text-slate-400">Includes billing plan insights and recent export history.</div>
          </Link>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">How reconciliation works</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Orders are synced from Shopify or WooCommerce every 24 hours and on webhook triggers.</li>
              <li>• Razorpay payments are matched against orders to identify ghost orders, refund traps, and variances.</li>
              <li>• Alerts are generated automatically when your threshold rules are exceeded.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Next steps</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Connect your store platform in the onboarding wizard.</li>
              <li>• Add Razorpay credentials and optional webhook secret for automatic sync.</li>
              <li>• Review billing history and export data for accounting.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
