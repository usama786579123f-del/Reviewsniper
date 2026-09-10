/*
 * Shared shell (sidebar + topbar) for every workspace page. Keeping this in
 * one place means every page (Dashboard, Crisis Leads, Saved Leads, etc.)
 * gets the same navigation without copy-pasting the whole sidebar six times.
 */
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  CircleHelp,
  Download,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Menu,
  Search,
  Settings,
  Target,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";

function BrandLockup() {
  return (
    <div className="dashboard-brand">
      <img src="/images/logo.png" alt="ReviewSniper logo" style={{ width: 26, height: 26, objectFit: "contain" }} />
      <div className="dashboard-brand-name"><span>Review</span><strong>Sniper</strong></div>
    </div>
  );
}

const primaryNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Crisis Leads", icon: Target, href: "/crisis-leads" },
  { label: "Saved Leads", icon: Bookmark, href: "/saved-leads" },
  { label: "Email Alerts", icon: Mail, href: "/email-alerts" },
  { label: "Agencies", icon: Building2, href: "/agencies" },
  { label: "Export Leads", icon: Download, href: "/export-leads" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
];

const secondaryNav = [
  { label: "Subscription", icon: LifeBuoy, href: "#" },
  { label: "Team Members", icon: UsersRound, href: "/team-members" },
  { label: "Settings", icon: Settings, href: "#" },
];

export default function AppShell({
  activeLabel,
  badges = {},
  children,
}: {
  activeLabel: string;
  badges?: Record<string, number>;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className="dashboard-page" style={{ backgroundImage: `url(/images/background.png)` }}>
      <button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>
      {sidebarOpen && (
        <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <BrandLockup />
          <button className="sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="side-nav" aria-label="Primary navigation">
          {primaryNav.map(({ label, icon: Icon, href }) => (
            <a key={label} href={href} className={`side-nav-item ${activeLabel === label ? "side-nav-item--active" : ""}`}>
              <Icon size={17} />
              <span>{label}</span>
              {badges[label] !== undefined && <span className="nav-badge">{badges[label]}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Manage</div>
        <nav className="side-nav" aria-label="Workspace settings">
          {secondaryNav.map(({ label, icon: Icon, href }) =>
            href === "#" ? (
              <button key={label} className="side-nav-item" onClick={() => toast.info(`${label} is ready for connection`)}>
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ) : (
              <a key={label} href={href} className={`side-nav-item ${activeLabel === label ? "side-nav-item--active" : ""}`}>
                <Icon size={17} />
                <span>{label}</span>
              </a>
            )
          )}
        </nav>
        <div className="sidebar-promo">
          <div className="sidebar-promo-icon"><TrendingUp size={16} /></div>
          <strong>More Leads. More Clients. More Revenue.</strong>
          <p>Let agencies find your crisis leads, while you focus on growth.</p>
          <div className="sidebar-promo-bars">
            <span style={{ height: "35%" }} />
            <span style={{ height: "55%" }} />
            <span style={{ height: "40%" }} />
            <span style={{ height: "75%" }} />
            <span style={{ height: "95%" }} />
          </div>
        </div>
        <div className="sidebar-footer"><CircleHelp size={15} /><span>Help center</span></div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-search">
            <Search size={17} />
            <input
              aria-label="Search workspace"
              placeholder="Search businesses, niches, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="topbar-actions">
            <button
              className="topbar-icon"
              aria-label="Notifications"
              onClick={() => toast.info("Notifications are waiting for live activity")}
            >
              <Bell size={18} />
            </button>
            <div className="workspace-identity">
              <div className="workspace-avatar">RS</div>
              <div><strong>Workspace</strong><span>Agency Account</span></div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <div className="dashboard-content">{children}</div>
      </section>
    </main>
  );
}