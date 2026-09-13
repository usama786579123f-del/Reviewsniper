/*
 * Email Alerts - real history from the "email_alerts" collection,
 * populated by the scraper's direct-to-business outreach emails
 * (Task 5: free-sample offer sent via Brevo when a lead's email is
 * found).
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import AppShell from "@/components/AppShell";

type EmailAlert = {
  _id: string;
  business_name: string;
  niche: string;
  maps_url: string;
  recipient: string;
  status: "sent" | "skipped" | "failed";
  error: string;
  sent_at: string;
};

type Stats = { total: number; sent: number; skipped: number; failed: number };

const EMPTY_STATS: Stats = { total: 0, sent: 0, skipped: 0, failed: 0 };

export default function EmailAlertsPage() {
  const [alerts, setAlerts] = useState<EmailAlert[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (statusFilter) params.set("status", statusFilter);
        const res = await fetch(`/api/email-alerts?${params.toString()}`);
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        if (!cancelled) {
          setAlerts(data.alerts || []);
          setStats(data.stats || EMPTY_STATS);
        }
      } catch (err) {
        if (!cancelled) toast.error("Could not load email alerts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const successRate = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

  return (
    <AppShell activeLabel="Email Alerts">
      <div className="dashboard-heading-row">
        <div>
          <div className="crisis-title-row">
            <div className="crisis-title-icon" style={{ color: "#3268ee", background: "#e7efff" }}>
              <Mail size={20} />
            </div>
            <h1>Email Alerts</h1>
          </div>
          <p className="dashboard-subtitle">
            Direct outreach emails sent to businesses that got a new crisis lead.
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-label">Total attempts</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-helper">All-time outreach attempts</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Sent</div>
          <div className="stat-value">{stats.sent}</div>
          <div className="stat-helper">Delivered via Brevo</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Skipped</div>
          <div className="stat-value">{stats.skipped}</div>
          <div className="stat-helper">No email found for the lead</div>
        </article>
        <article className="stat-card">
          <div className="stat-label">Failed</div>
          <div className="stat-value">{stats.failed}</div>
          <div className="stat-helper">{successRate}% success rate overall</div>
        </article>
      </div>

      <section className="leads-section">
        <div className="leads-card">
          <div style={{ display: "flex", gap: 8, padding: "12px 16px", borderBottom: "1px solid #eee" }}>
            {["", "sent", "skipped", "failed"].map((s) => (
              <button
                key={s || "all"}
                className="primary-button primary-button--small"
                style={{
                  background: statusFilter === s ? "#3268ee" : "#f1f3f9",
                  color: statusFilter === s ? "#fff" : "#333",
                }}
                onClick={() => setStatusFilter(s)}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "#888" }}>Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="empty-leads">
              <div className="empty-illustration">
                <div className="empty-ring empty-ring--one" />
                <div className="empty-ring empty-ring--two" />
                <div className="empty-target">
                  <Mail size={25} />
                </div>
              </div>
              <h3>No email alerts yet</h3>
              <p>Once the scraper finds a crisis lead with an email, an outreach attempt will show up here.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee", color: "#888", fontSize: 13 }}>
                  <th style={{ padding: "10px 16px" }}>Business</th>
                  <th style={{ padding: "10px 16px" }}>Niche</th>
                  <th style={{ padding: "10px 16px" }}>Recipient</th>
                  <th style={{ padding: "10px 16px" }}>Status</th>
                  <th style={{ padding: "10px 16px" }}>Sent at</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a._id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <a href={a.maps_url} target="_blank" rel="noreferrer">
                        {a.business_name}
                      </a>
                    </td>
                    <td style={{ padding: "10px 16px" }}>{a.niche}</td>
                    <td style={{ padding: "10px 16px" }}>{a.recipient || "-"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <StatusBadge status={a.status} error={a.error} />
                    </td>
                    <td style={{ padding: "10px 16px", color: "#888" }}>
                      {new Date(a.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function StatusBadge({ status, error }: { status: string; error?: string }) {
  const config: Record<string, { color: string; bg: string; icon: JSX.Element; label: string }> = {
    sent: { color: "#1a7f37", bg: "#e6f6ea", icon: <CheckCircle2 size={14} />, label: "Sent" },
    skipped: { color: "#8a6d00", bg: "#fff6da", icon: <MinusCircle size={14} />, label: "Skipped" },
    failed: { color: "#c0392b", bg: "#fdeceb", icon: <XCircle size={14} />, label: "Failed" },
  };
  const c = config[status] || config.skipped;
  return (
    <span
      title={error || ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: c.color,
        background: c.bg,
      }}
    >
      {c.icon} {c.label}
    </span>
  );
}
