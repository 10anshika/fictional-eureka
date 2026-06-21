"use client";
// d2c-meets-fintech-reconciliation/frontend/app/dashboard/transactions/[id]/page.tsx
// Transaction detail view

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api, paiseTo, RECON_STATUS_LABELS, RECON_STATUS_COLORS, type Transaction } from "@/lib/api";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [classifying, setClassifying] = useState(false);
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
    api.getTransaction(id)
      .then(setTxn)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [id, authChecked]);

  async function handleClassify() {
    if (!txn) return;
    setClassifying(true);
    setError("");
    try {
      const result = await api.classifyTransaction(id);
      setTxn({
        ...txn,
        ai_classification: result.classification,
        ai_confidence: result.confidence,
        ai_explanation: result.explanation,
        ai_suggested_action: result.suggested_action,
        ai_processed_at: result.processed_at,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Classification failed");
    } finally {
      setClassifying(false);
    }
  }

  if (!authChecked || loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-600">{error}</div>;
  if (!txn) return null;

  const platform = (txn as { ecom_platform?: string }).ecom_platform ?? "shopify";
  const platformLabel = platform === "woocommerce" ? "WooCommerce" : "Shopify";

  const rows = [
    { label: "Platform", value: platform === "woocommerce" ? "🔧 WooCommerce" : "🛍 Shopify" },
    { label: `${platformLabel} Order ID`, value: txn.shopify_order_id },
    { label: `${platformLabel} Status`, value: txn.shopify_status },
    { label: `${platformLabel} Amount`, value: paiseTo(txn.shopify_amount_paise) },
    { label: "Razorpay Payment ID", value: txn.razorpay_payment_id || "—" },
    { label: "Razorpay Status", value: txn.razorpay_status || "—" },
    { label: "Razorpay Amount", value: txn.razorpay_amount_paise != null ? paiseTo(txn.razorpay_amount_paise) : "—" },
    { label: "Gateway Fee", value: paiseTo(txn.razorpay_fee_paise) },
    { label: "GST on Fee (ITC)", value: paiseTo(txn.razorpay_tax_paise) },
    { label: "Variance", value: paiseTo(txn.variance_paise) },
    { label: "Transaction Type", value: txn.transaction_type },
    { label: "Order Date", value: txn.shopify_created_at ? new Date(txn.shopify_created_at).toLocaleString("en-IN") : "—" },
    { label: "Synced At", value: new Date(txn.synced_at).toLocaleString("en-IN") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 text-sm mb-6 flex items-center gap-1">
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-slate-900">Transaction Detail</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${RECON_STATUS_COLORS[txn.recon_status] || "bg-gray-100 text-gray-700"}`}>
              {RECON_STATUS_LABELS[txn.recon_status] || txn.recon_status}
            </span>
          </div>

          {txn.recon_status === "refund_trap" && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
              <strong>🚨 Refund Trap Detected:</strong> Shopify shows this refund as successful, but Razorpay status is <strong>{txn.razorpay_status}</strong>. You may have issued a refund to the customer without receiving it back from Razorpay. Investigate immediately.
            </div>
          )}

          {txn.recon_status === "ghost_order" && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              <strong>👻 Ghost Order:</strong> This Shopify order has no matching Razorpay payment. Either the payment was made via another gateway or this order was manually marked as paid. Verify with your finance team.
            </div>
          )}

          <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-violet-950">AI discrepancy analysis</h2>
                {txn.ai_classification ? (
                  <div className="mt-2 space-y-2 text-sm text-violet-900">
                    <p><strong>{txn.ai_classification}</strong> · {txn.ai_confidence}% confidence</p>
                    <p>{txn.ai_explanation}</p>
                    <p><strong>Suggested action:</strong> {txn.ai_suggested_action}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-violet-700">Classify this discrepancy and save the result to its audit record.</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClassify}
                disabled={classifying}
                className="shrink-0 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {classifying ? "Analyzing..." : txn.ai_classification ? "Analyze again" : "Analyze"}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {rows.map(row => (
              <div key={row.label} className="flex justify-between py-3">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-medium text-slate-900 text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
