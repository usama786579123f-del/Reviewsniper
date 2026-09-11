/*
 * Crisis Leads - dedicated list page, now using the shared AppShell so
 * sidebar navigation is identical (and actually works) on every page.
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileBarChart,
  Filter,
  Inbox,
  Search,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import AppShell from "@/components/AppShell";

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
    <AppShell activeLabel="Crisis Leads" badges={{ "Crisis Leads": pagination?.total ?? 0 }}>
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
            <div className="stat-value">{value !== undefined ? value : "-"}</div>
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
                          <span className="lead-review-text" title={lead.review_text}>{lead.review_text || "-"}</span>
                          <div className="lead-time">{lead.hours_ago < 1 ? "just now" : `${Math.round(lead.hours_ago)}h ago`}</div>
                        </td>
                        <td>
                          {lead.phone ? <span className="lead-time">{lead.phone}</span> : "-"}
                        </td>
                        <td>
                          <div className="location-cell">
                            <span>{flag}</span>
                            <div>
                              <div className="lead-business-name" style={{ fontSize: 10 }}>{place || "-"}</div>
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
    </AppShell>
  );
}