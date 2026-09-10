/*
 * Team Members - honest placeholder. There's no login/user-account system
 * built yet, so there's nobody to list here. Building this for real would
 * mean adding authentication first.
 */
import { toast } from "sonner";
import { UsersRound } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function TeamMembersPage() {
  return (
    <AppShell activeLabel="Team Members">
      <div className="dashboard-heading-row">
        <div>
          <div className="crisis-title-row">
            <div className="crisis-title-icon" style={{ color: "#7a62df", background: "#eee9ff" }}>
              <UsersRound size={20} />
            </div>
            <h1>Team Members</h1>
          </div>
          <p className="dashboard-subtitle">Manage your team, assign roles, and keep everyone on the same page.</p>
        </div>
        <button className="primary-button primary-button--small" onClick={() => toast.info("Team accounts aren't built yet")}>
          + Add Team Member
        </button>
      </div>

      <div className="stat-grid">
        <article className="stat-card"><div className="stat-label">Total members</div><div className="stat-value">-</div><div className="stat-helper">No login system connected yet</div></article>
        <article className="stat-card"><div className="stat-label">Active members</div><div className="stat-value">-</div><div className="stat-helper">No login system connected yet</div></article>
        <article className="stat-card"><div className="stat-label">Managers</div><div className="stat-value">-</div><div className="stat-helper">No login system connected yet</div></article>
        <article className="stat-card"><div className="stat-label">Workers</div><div className="stat-value">-</div><div className="stat-helper">No login system connected yet</div></article>
      </div>

      <section className="leads-section">
        <div className="leads-card">
          <div className="empty-leads">
            <div className="empty-illustration">
              <div className="empty-ring empty-ring--one" />
              <div className="empty-ring empty-ring--two" />
              <div className="empty-target"><UsersRound size={25} /></div>
            </div>
            <h3>No team members yet</h3>
            <p>This page needs a real login/account system before people can be invited here. Right now the app only has the single owner login screen - no sample teammates are shown.</p>
            <button className="primary-button primary-button--small" onClick={() => toast.info("Team accounts aren't built yet")}>
              <UsersRound size={15} /> Invite a team member
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}