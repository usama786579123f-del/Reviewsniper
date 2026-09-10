/*
 * Email Alerts - honest placeholder. We never built the SendGrid/Brevo
 * email-sending piece from the original plan, so this shows a clear
 * "not connected yet" state instead of fabricated send history.
 */
import { toast } from "sonner";
import { Mail } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function EmailAlertsPage() {
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
          <p className="dashboard-subtitle">Manage automated email alerts and view the history of sent campaigns.</p>
        </div>
      </div>

      <div className="stat-grid">
        <article className="stat-card"><div className="stat-label">Total alerts sent</div><div className="stat-value">-</div><div className="stat-helper">Email sending isn't connected yet</div></article>
        <article className="stat-card"><div className="stat-label">Successful deliveries</div><div className="stat-value">-</div><div className="stat-helper">Requires an email provider</div></article>
        <article className="stat-card"><div className="stat-label">Failed deliveries</div><div className="stat-value">-</div><div className="stat-helper">Requires an email provider</div></article>
        <article className="stat-card"><div className="stat-label">Open rate</div><div className="stat-value">-</div><div className="stat-helper">Requires an email provider</div></article>
      </div>

      <section className="leads-section">
        <div className="leads-card">
          <div className="empty-leads">
            <div className="empty-illustration">
              <div className="empty-ring empty-ring--one" />
              <div className="empty-ring empty-ring--two" />
              <div className="empty-target"><Mail size={25} /></div>
            </div>
            <h3>Email alerts aren't set up yet</h3>
            <p>This feature needs an email provider (like SendGrid or Brevo) connected on the backend. Once that's wired up, alerts sent to agencies will show up here - no sample campaigns are shown.</p>
            <button className="primary-button primary-button--small" onClick={() => toast.info("Connect an email provider to enable this feature")}>
              <Mail size={15} /> Connect email provider
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}