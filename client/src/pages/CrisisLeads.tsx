/*
 * Crisis Leads - dedicated list page. Same sidebar/topbar shell as the
 * Dashboard, but focused entirely on the leads table with the richer
 * column set from the reference design (location, niche tag, added time).
 * Every value shown comes from the real /api/leads + /api/stats endpoints -
 * no sample/fake rows. Fields the reference mockup showed that our data
 * doesn't have (email address, decimal star precision) are simply left out
 * rather than invented.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
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
  MoreVertical,
  Search,
  Send,
  Settings,
  Sparkles,
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
  { label: "Saved Leads", icon: Bookmark, href: "#" },
  { label: "Email Alerts", icon: Bell, href: "#" },
  { label: "Agencies", icon: Building2, href: "#" },
  { label: "Export Leads", icon: Download, href: "#" },
  { label: "Analytics", icon: BarChart3, href: "#" },
];

const secondaryNav = [
  { label: "Subscription", icon: LifeBuoy },
  { label: "Team Members", icon: UsersRound },
  { label: "Settings", icon: Settings },
];

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

type Stats = { totalLeads: number; newLeads: number; contactedAgencies: number; conversionRate: number };
type Pagination = { page: number; limit: number; total: number; totalPages: number };

// Our niche strings look like "Dental Clinics in Dubai" - split that into a
// short tag ("Dental Clinics") and a place ("Dubai") for display.
function splitNiche(niche: string): { tag: string; place: string } {
  const match = niche.match(/^(.*?)\s+in\s+(.+)$/i);
  if (match) return { tag: match[1], place: match[2] };
  return { tag: niche, place: "" };
}

const US_CITIES = ["miami", "houston", "dallas", "tampa", "atlanta"];
function countryForPlace(place: string): { flag: string; country: string } {
  const p = place.toLowerCase();
  if (p.includes("dubai") || p.includes("abu dhabi") || p.includes("uae")) {
    return { flag: "\u{1F1E6}\u{1F1EA}", country: "UAE" };
  }
  if (US_CITIES.some((c) => p.includes(c))) {
    return { flag: "\u{1F1FA}\u{1F1F8}", country: "USA" };
  }
  return { flag: "\u{1F30D}", country: "" };
}

const TAG_COLORS = [
  { bg: "#ffe8ec", fg: "#e25f6c" },
  { bg: "#e7efff", fg: "#3268ee" },
  { bg: "#e3f7ed", fg: "#2fa46c" },
  { bg: "#fff5df", fg: "#b9860a" },
  { bg: "#eee9ff", fg: "#7a62df" },
];
function tagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

function ComingSoonButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      className={className}
      onClick={() =>
        toast.info("This action is awaiting your backend/API connection", {
          description: "The UI is ready - wire this button up to your workflow when you're ready.",
        })
      }
    >
      {children}
    </button>
  );
}

export default function CrisisLeadsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [niche, setNiche] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [niches, setNiches] = useState<string[]>([]);

  useEffect(() => {
    axios.get<Stats>("/api/stats").then((res) => setStats(res.data)).catch(() => {});
  }, [leads.length]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = { page, limit: 20, minStars: 1, maxStars: 2 };
    if (niche) params.niche = niche;

    axios
      .get<{ leads: Lead[]; pagination: Pagination }>("/api/leads", { params })
      .then((res) => {
        if (cancelled) return;
        setLeads(res.data.leads);
        setPagination(res.data.pagination);
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
  }, [page, niche, refreshKey]);

  async function updateLeadStatus(id: string, status: Lead["status"]) {
    try {
      await axios.patch(`/api/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Could not update lead status");
    }
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === visibleLeads.length ? new Set() : new Set(visibleLeads.map((l) => l._id))));
  }

  const visibleLeads = searchTerm
    ? leads.filter(
        (l) =>
          l.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.niche.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leads;

  const statCards = [
    { label: "Total crisis leads", icon: AlertCircle, tone: "rose", value: stats?.totalLeads },
    { label: "New leads", icon: Inbox, tone: "blue", value: stats?.newLeads },
    { label: "Contacted agencies", icon: Send, tone: "green", value: stats?.contactedAgencies },
    { label: "Conversion rate", icon: Sparkles, tone: "violet", value: stats ? `${stats.conversionRate}%` : undefined },
  ];

  return (
    <main className="dashboard-page">
      <button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

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
            <a key={label} href={href} className={`side-nav-item ${label === "Crisis Leads" ? "side-nav-item--active" : ""}`}>
              <Icon size={17} />
              <span>{label}</span>
              {label === "Crisis Leads" && <span className="nav-badge">{pagination?.total ?? 0}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Manage</div>
        <nav className="side-nav" aria-label="Workspace settings">
          {secondaryNav.map(({ label, icon: Icon }) => (
            <button key={label} className="side-nav-item" onClick={() => toast.info(`${label} is ready for connection`)}>
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
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
            <button className="topbar-icon" aria-label="Notifications" onClick={() => toast.info("Notifications are waiting for live activity")}>
              <Bell size={18} />
              {pagination && pagination.total > 0 && <span className="notification-count">{pagination.total > 99 ? "99+" : pagination.total}</span>}
            </button>
            <div className="workspace-identity">
              <div className="workspace-avatar">RS</div>
              <div><strong>Workspace</strong><span>Agency Account</span></div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading-row">
            <div>
              <div className="crisis-title-row">
                <div className="crisis-title-icon"><AlertCircle size={20} /></div>
                <h1>Crisis Leads</h1>
              </div>
              <p className="dashboard-subtitle">Real-time businesses with recent 1-star or 2-star reviews. Take action before your competitors do.</p>
            </div>
            <div className="dashboard-heading-actions">
              <span className="last-updated">Last updated: {new Date().toLocaleDateString()}</span>
              <button className="refresh-button" onClick={() => setRefreshKey((k) => k + 1)}>Refresh</button>
            </div>
          </div>

          <div className="stat-grid">
            {statCards.map(({ label, icon: Icon, tone, value }) => (
              <article className="stat-card" key={label}>
                <div className={`stat-icon stat-icon--${tone}`}><Icon size={18} /></div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value !== undefined ? value : "\u2014"}</div>
              </article>
            ))}
          </div>

          <section className="leads-section">
            <div className="filter-row">
              <div className="filter-search">
                <Search size={16} />
                <input placeholder="Search by business name, keyword, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select
                className="filter-select"
                aria-label="Filter by niche"
                value={niche}
                onChange={(e) => { setNiche(e.target.value); setPage(1); }}
              >
                <option value="">All niches</option>
                {niches.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <ComingSoonButton className="filter-select">All countries <ChevronDown size={14} /></ComingSoonButton>
              <ComingSoonButton className="filter-select">All ratings <ChevronDown size={14} /></ComingSoonButton>
              <ComingSoonButton className="filter-button"><Filter size={15} /> Filters</ComingSoonButton>
            </div>

            <div className="leads-card">
              <div className="leads-card-header">
                <div>
                  <h2>Crisis Leads ({pagination?.total ?? 0})</h2>
                  <p>Showing the latest businesses with 1-star or 2-star reviews</p>
                </div>
                <div className="lead-actions">
                  <ComingSoonButton className="secondary-button"><Download size={15} /> Export</ComingSoonButton>
                  <ComingSoonButton className="primary-button primary-button--small"><FileBarChart size={15} /> Generate Recovery Plan</ComingSoonButton>
                </div>
              </div>

              {loading ? (
                <div className="leads-loading">Loading crisis leads...</div>
              ) : error ? (
                <div className="leads-error">{error}</div>
              ) : visibleLeads.length === 0 ? (
                <div className="empty-leads">
                  <div className="empty-illustration">
                    <div className="empty-ring empty-ring--one" />
                    <div className="empty-ring empty-ring--two" />
                    <div className="empty-target"><Target size={25} /></div>
                  </div>
                  <h3>No connected leads yet</h3>
                  <p>Your scraper hasn't found a matching crisis review yet. This list fills in automatically as new leads are found - no sample records are shown.</p>
                </div>
              ) : (
                <div className="leads-table-wrap">
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th style={{ width: 32 }}>
                          <input type="checkbox" checked={selected.size === visibleLeads.length && visibleLeads.length > 0} onChange={toggleSelectAll} />
                        </th>
                        <th>Business</th>
                        <th>Rating</th>
                        <th>Latest Review</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Niche</th>
                        <th>Action</th>
                        <th>Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLeads.map((lead) => {
                        const { tag, place } = splitNiche(lead.niche);
                        const { flag, country } = countryForPlace(place);
                        const color = tagColor(tag);
                        return (
                          <tr key={lead._id}>
                            <td>
                              <input type="checkbox" checked={selected.has(lead._id)} onChange={() => toggleSelected(lead._id)} />
                            </td>
                            <td>
                              <div className="lead-business-name">{lead.business_name}</div>
                              <div className="lead-niche">{tag}</div>
                            </td>
                            <td>
                              <span className="lead-stars">{"*".repeat(lead.stars)} {lead.stars}.0</span>
                            </td>
                            <td>
                              <span className="lead-review-text" title={lead.review_text}>{lead.review_text || "\u2014"}</span>
                              <div className="lead-time">{lead.hours_ago < 1 ? "just now" : `${Math.round(lead.hours_ago)}h ago`}</div>
                            </td>
                            <td>
                              {lead.phone ? <span className="lead-time">{lead.phone}</span> : "\u2014"}
                            </td>
                            <td>
                              <div className="location-cell">
                                <span>{flag}</span>
                                <div>
                                  <div className="lead-business-name" style={{ fontSize: 10 }}>{place || "\u2014"}</div>
                                  {country && <div className="lead-niche">{country}</div>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="niche-tag" style={{ background: color.bg, color: color.fg }}>{tag}</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {lead.website ? (
                                  <a className="lead-link" href={lead.website} target="_blank" rel="noreferrer">
                                    View <ExternalLink size={10} style={{ display: "inline" }} />
                                  </a>
                                ) : (
                                  <a className="lead-link" href={lead.maps_url} target="_blank" rel="noreferrer">
                                    View <ExternalLink size={10} style={{ display: "inline" }} />
                                  </a>
                                )}
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
                              </div>
                            </td>
                            <td><span className="lead-time">{lead.hours_ago < 1 ? "just now" : `${Math.round(lead.hours_ago)}h ago`}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="table-footer">
                <span>Showing {visibleLeads.length} of {pagination?.total ?? 0} results</span>
                <div className="pagination">
                  <button disabled={!pagination || pagination.page <= 1} aria-label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft size={15} />
                  </button>
                  <button className="pagination-active">{pagination?.page ?? 1}</button>
                  <button
                    disabled={!pagination || pagination.page >= pagination.totalPages}
                    aria-label="Next page"
                    onClick={() => setPage((p) => (pagination ? Math.min(pagination.totalPages, p + 1) : p))}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}