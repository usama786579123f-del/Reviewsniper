/*
 * Crisis Command / Airy Precision: the dashboard is an honest, connection-ready
 * command shell. It shows no fabricated leads, metrics, reviews, agencies, or
 * users — everything below is fetched from the live /api/leads and /api/stats
 * endpoints, and falls back to the original empty state when there's genuinely
 * nothing to show yet.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  ExternalLink,
  FileBarChart,
  Filter,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  UsersRound,
  X,
} from "lucide-react";

const brandMark = "/manus-storage/reviewsniper-reticle_08e036e8.png";
const signalGrid = "/manus-storage/reviewsniper-signal-grid_ea64419c.png";

const primaryNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Crisis Leads", icon: Target },
  { label: "Saved Leads", icon: Bookmark },
  { label: "Email Alerts", icon: Bell },
  { label: "Agencies", icon: Building2 },
  { label: "Export Leads", icon: Download },
  { label: "Analytics", icon: BarChart3 },
];

const secondaryNav = [
  { label: "Subscription", icon: LifeBuoy },
  { label: "Team Members", icon: UsersRound },
  { label: "Settings", icon: Settings },
];

// ---- Types matching the scraper's MongoDB "leads" schema ----
type Lead = {
  _id: string;
  business_name: string;
  niche: string;
  maps_url: string;
  website: string | null;
  phone: string | null;
  stars: number;
  review_text: string;
  hours_ago: number;
  status: "new" | "contacted" | "saved" | "converted" | string;
  scraped_at: string;
};

type Stats = {
  totalLeads: number;
  newLeads: number;
  contactedAgencies: number;
  conversionRate: number;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

function BrandLockup() {
  return (
    <div className="dashboard-brand">
      <img src={brandMark} alt="ReviewSniper reticle" />
      <div className="dashboard-brand-name"><span>Review</span><strong>Sniper</strong></div>
    </div>
  );
}

function ComingSoonButton({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      className={className}
      onClick={
        onClick ??
        (() =>
          toast.info("This workspace is awaiting your backend/API connection", {
            description: "The UI is ready for live review data when you connect your provider.",
          }))
      }
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [niche, setNiche] = useState<string>("");
  const [starRange, setStarRange] = useState<{ min: number; max: number }>({ min: 1, max: 2 });
  const [searchTerm, setSearchTerm] = useState("");

  const [niches, setNiches] = useState<string[]>([]);

  // Fetch stats once (and whenever leads change, so counts stay fresh)
  useEffect(() => {
    axios
      .get<Stats>("/api/stats")
      .then((res) => setStats(res.data))
      .catch(() => {
        // Stat cards just keep showing "—" — handled by the null check below.
      });
  }, [leads.length]);

  // Fetch leads whenever filters/page change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = {
      page,
      limit: 20,
      minStars: starRange.min,
      maxStars: starRange.max,
    };
    if (niche) params.niche = niche;

    axios
      .get<{ leads: Lead[]; pagination: Pagination }>("/api/leads", { params })
      .then((res) => {
        if (cancelled) return;
        setLeads(res.data.leads);
        setPagination(res.data.pagination);
        // Build the "All niches" filter options from what we've seen so far.
        setNiches((prev) => {
          const set = new Set(prev);
          res.data.leads.forEach((l) => set.add(l.niche));
          return Array.from(set);
        });
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load leads. Check that your backend server and MONGODB_URI are set up.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, niche, starRange]);

  function chooseNav(label: string) {
    setActiveItem(label);
    setSidebarOpen(false);
    if (label !== "Dashboard") {
      toast.info(`${label} is ready for connection`, { description: "No data is shown until your backend/API is connected." });
    }
  }

  async function updateLeadStatus(id: string, status: Lead["status"]) {
    try {
      await axios.patch(`/api/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Could not update lead status");
    }
  }

  const visibleLeads = searchTerm
    ? leads.filter(
        (l) =>
          l.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.niche.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leads;

  const statCards = [
    { label: "Total crisis leads", icon: AlertCircle, iconTone: "rose", value: stats?.totalLeads, helper: "Connect a source to calculate" },
    { label: "New leads", icon: Inbox, iconTone: "blue", value: stats?.newLeads, helper: "No live source connected" },
    { label: "Contacted agencies", icon: Send, iconTone: "green", value: stats?.contactedAgencies, helper: "Requires lead activity" },
    { label: "Conversion rate", icon: Sparkles, iconTone: "violet", value: stats ? `${stats.conversionRate}%` : undefined, helper: "Requires lead activity" },
  ];

  return (
    <main className="dashboard-page" style={{ backgroundImage: `url(${signalGrid})` }}>
      <button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar--open" : ""}`}>
        <div className="sidebar-header"><BrandLockup /><button className="sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="side-nav" aria-label="Primary navigation">
          {primaryNav.map(({ label, icon: Icon }) => (
            <button key={label} className={`side-nav-item ${activeItem === label ? "side-nav-item--active" : ""}`} onClick={() => chooseNav(label)}><Icon size={17} /><span>{label}</span>{label === "Crisis Leads" && <span className="nav-badge">{pagination?.total ?? 0}</span>}</button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Manage</div>
        <nav className="side-nav" aria-label="Workspace settings">
          {secondaryNav.map(({ label, icon: Icon }) => <button key={label} className={`side-nav-item ${activeItem === label ? "side-nav-item--active" : ""}`} onClick={() => chooseNav(label)}><Icon size={17} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom-card">
          <div className="mini-orb"><Target size={15} /></div>
          <div><strong>Connect your signal</strong><span>Bring in live review data</span></div>
          <ComingSoonButton className="mini-arrow" aria-label="Connect review source"><ArrowUpRight size={15} /></ComingSoonButton>
        </div>
        <div className="sidebar-footer"><CircleHelp size={15} /><span>Help center</span><span className="sidebar-footer-dot" /></div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-search"><Search size={17} /><input aria-label="Search workspace" placeholder="Search businesses, niches, or keywords..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><kbd>⌘ K</kbd></div>
          <div className="topbar-actions">
            <button className="topbar-icon" aria-label="Notifications" onClick={() => toast.info("Notifications are waiting for live activity")}><Bell size={18} /><span className="notification-dot" /></button>
            <div className="workspace-identity"><div className="workspace-avatar">RS</div><div><strong>Workspace</strong><span>{pagination ? `${pagination.total} leads synced` : "Awaiting connection"}</span></div><ChevronDown size={15} /></div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading-row">
            <div><p className="eyebrow">{activeItem === "Dashboard" ? "Overview" : activeItem}</p><h1>{activeItem}</h1><p className="dashboard-subtitle">{pagination && pagination.total > 0 ? "Live intelligence from your connected review source." : "Your live intelligence will appear here once a review source is connected."}</p></div>
            <div className="dashboard-heading-actions">
              <span className="last-updated"><Activity size={14} /> {pagination ? "Live sync" : "No live sync"}</span>
              <button className="refresh-button" onClick={() => setPage((p) => p)}><SlidersHorizontal size={15} /> Refresh</button>
            </div>
          </div>

          <div className="stat-grid">
            {statCards.map(({ label, icon: Icon, iconTone, value, helper }) => (
              <article className="stat-card" key={label}>
                <div className={`stat-icon stat-icon--${iconTone}`}><Icon size={18} /></div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value !== undefined ? value : "—"}</div>
                <div className="stat-helper">{value !== undefined ? "" : helper}</div>
              </article>
            ))}
          </div>

          <section className="leads-section">
            <div className="filter-row">
              <div className="filter-search"><Search size={16} /><input placeholder="Search connected leads..." aria-label="Search connected leads" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

              <div className="filter-select" style={{ position: "relative" }}>
                <select
                  aria-label="Filter by niche"
                  value={niche}
                  onChange={(e) => { setNiche(e.target.value); setPage(1); }}
                  style={{ appearance: "none", border: 0, background: "transparent", font: "inherit", color: "inherit" }}
                >
                  <option value="">All niches</option>
                  {niches.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <button className="filter-select hide-on-small" onClick={() => toast.info("Country filters will activate with connected data")}>All countries <ChevronDown size={14} /></button>

              <button
                className="filter-select hide-on-small"
                onClick={() => {
                  setStarRange((r) => (r.min === 1 && r.max === 2 ? { min: 1, max: 1 } : r.min === 1 ? { min: 2, max: 2 } : { min: 1, max: 2 }));
                  setPage(1);
                }}
              >
                {starRange.min === starRange.max ? `${starRange.min}★ only` : "1★ – 2★ reviews"} <ChevronDown size={14} />
              </button>

              <ComingSoonButton className="filter-button"><Filter size={15} /> Filters</ComingSoonButton>
            </div>

            <div className="leads-card">
              <div className="leads-card-header">
                <div><h2>Crisis leads</h2><p>Businesses with recent 1-star or 2-star reviews</p></div>
                <div className="lead-actions"><ComingSoonButton className="secondary-button"><Download size={15} /> Export</ComingSoonButton><ComingSoonButton className="primary-button primary-button--small"><FileBarChart size={15} /> Generate report</ComingSoonButton></div>
              </div>

              {loading ? (
                <div className="leads-loading">Loading crisis leads…</div>
              ) : error ? (
                <div className="leads-error">{error}</div>
              ) : visibleLeads.length === 0 ? (
                <div className="empty-leads">
                  <div className="empty-illustration"><div className="empty-ring empty-ring--one" /><div className="empty-ring empty-ring--two" /><div className="empty-target"><Target size={25} /></div></div>
                  <h3>No connected leads yet</h3>
                  <p>Connect a review provider to surface live crisis signals. Your first real lead will appear here without sample or placeholder records.</p>
                  <ComingSoonButton className="primary-button primary-button--small"><Target size={15} /> Connect review source</ComingSoonButton>
                </div>
              ) : (
                <div className="leads-table-wrap">
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>Business</th>
                        <th>Rating</th>
                        <th>Latest review</th>
                        <th>When</th>
                        <th>Status</th>
                        <th>Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLeads.map((lead) => (
                        <tr key={lead._id}>
                          <td>
                            <div className="lead-business-name">{lead.business_name}</div>
                            <div className="lead-niche">{lead.niche}</div>
                          </td>
                          <td><span className="lead-stars">{"★".repeat(lead.stars)} {lead.stars}.0</span></td>
                          <td><span className="lead-review-text" title={lead.review_text}>{lead.review_text || "—"}</span></td>
                          <td><span className="lead-time">{lead.hours_ago < 1 ? "just now" : `${Math.round(lead.hours_ago)}h ago`}</span></td>
                          <td>
                            <select
                              aria-label={`Status for ${lead.business_name}`}
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                              className={`lead-status lead-status--${lead.status}`}
                              style={{ border: 0, appearance: "none" }}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="saved">Saved</option>
                              <option value="converted">Converted</option>
                            </select>
                          </td>
                          <td>
                            {lead.website ? (
                              <a className="lead-link" href={lead.website} target="_blank" rel="noreferrer">Website <ExternalLink size={10} style={{ display: "inline" }} /></a>
                            ) : (
                              <a className="lead-link" href={lead.maps_url} target="_blank" rel="noreferrer">Maps <ExternalLink size={10} style={{ display: "inline" }} /></a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="table-footer">
                <span>Showing {visibleLeads.length} of {pagination?.total ?? 0} connected leads</span>
                <div className="pagination">
                  <button disabled={!pagination || pagination.page <= 1} aria-label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={15} /></button>
                  <button className="pagination-active">{pagination?.page ?? 1}</button>
                  <button disabled={!pagination || pagination.page >= pagination.totalPages} aria-label="Next page" onClick={() => setPage((p) => (pagination ? Math.min(pagination.totalPages, p + 1) : p))}><ChevronRight size={15} /></button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
