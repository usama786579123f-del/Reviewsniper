/*
 * Agencies - honest placeholder. There's no agencies collection/database
 * yet (this would be a separate feature to build - adding, editing, and
 * tracking marketing agencies you sell leads to).
 */
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function AgenciesPage() {
  return (
    <AppShell activeLabel="Agencies">
      <div className="dashboard-heading-row">
        <div>
          <div className="crisis-title-row">
            <div className="crisis-title-icon" style={{ color: "#2fa46c", background: "#e3f7ed" }}>
              <Building2 size={20} />
            </div>
            <h1>Agencies</h1>
          </div>
          <p className="dashboard-subtitle">Manage your target marketing agencies. Add, edit, and track their engagement with your leads.</p>
        </div>
        <button className="primary-button primary-button--small" onClick={() => toast.info("Agency management isn't built yet")}>
          + Add Agency
        </button>
      </div>

      <div className="stat-grid">
        <article className="stat-card"><div className="stat-label">Total agencies</div><div className="stat-value">-</div><div className="stat-helper">No agencies added yet</div></article>
        <article className="stat-card"><div className="stat-label">Active agencies</div><div className="stat-value">-</div><div className="stat-helper">No agencies added yet</div></article>
        <article className="stat-card"><div className="stat-label">Contacted</div><div className="stat-value">-</div><div className="stat-helper">No agencies added yet</div></article>
        <article className="stat-card"><div className="stat-label">Response rate</div><div className="stat-value">-</div><div className="stat-helper">No agencies added yet</div></article>
      </div>

      <section className="leads-section">
        <div className="leads-card">
          <div className="empty-leads">
            <div className="empty-illustration">
              <div className="empty-ring empty-ring--one" />
              <div className="empty-ring empty-ring--two" />
              <div className="empty-target"><Building2 size={25} /></div>
            </div>
            <h3>No agencies added yet</h3>
            <p>This page needs its own database of the marketing agencies you plan to sell leads to. Add your first agency to start tracking outreach here - no sample agencies are shown.</p>
            <button className="primary-button primary-button--small" onClick={() => toast.info("Agency management isn't built yet")}>
              <Building2 size={15} /> Add your first agency
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}