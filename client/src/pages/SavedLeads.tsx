/*
 * Saved Leads - same leads collection as Crisis Leads, filtered to
 * status="saved". No separate "priority" field exists in our data, so
 * unlike the reference mockup we don't show a fabricated priority column.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Bookmark, ChevronLeft, ChevronRight, ExternalLink, Search, Target } from "lucide-react";
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
  status: string;
  scraped_at: string;
  updated_at?: string;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

function splitNiche(niche: string): { tag: string; place: string } {
  const match = niche.match(/^(.*?)\s+in\s+(.+)$/i);
  if (match) return { tag: match[1], place: match[2] };
  return { tag: niche, place: "" };
}

export default function SavedLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get<{ leads: Lead[]; pagination: Pagination }>("/api/leads", {
        params: { status: "saved", page, limit: 20, minStars: 1, maxStars: 2 },
      })
      .then((res) => {
        if (cancelled) return;
        setLeads(res.data.leads);
        setPagination(res.data.pagination);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load saved leads. Check that your backend server and MONGODB_URI are set up.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  async function unsaveLead(id: string) {
    try {
      await axios.patch(`/api/leads/${id}`, { status: "new" });
      setLeads((prev) => prev.filter((l) => l._id !== id));
      toast.success("Removed from saved leads");
    } catch {
      toast.error("Could not update this lead");
    }
  }

  const visibleLeads = searchTerm
    ? leads.filter((l) => l.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
    : leads;

  return (
    <AppShell activeLabel="Saved Leads" badges={{ "Saved Leads": pagination?.total ?? 0 }}>
      <div className="dashboard-heading-row">
        <div>
          <div className="crisis-title-row">
            <div className="crisis-title-icon" style={{ color: "#3268ee", background: "#e7efff" }}>
              <Bookmark size={20} />
            </div>
            <h1>Saved Leads</h1>
          </div>
          <p className="dashboard-subtitle">Your bookmarked crisis leads. Keep track of the businesses you want to revisit.</p>
        </div>
      </div>

      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-icon stat-icon--blue"><Bookmark size={18} /></div>
          <div className="stat-label">Total saved</div>
          <div className="stat-value">{pagination?.total ?? "-"}</div>
        </article>
      </div>

      <section className="leads-section">
        <div className="filter-row">
          <div className="filter-search">
            <Search size={16} />
            <input
              placeholder="Search saved leads by business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="leads-card">
          <div className="leads-card-header">
            <div>
              <h2>Saved Leads ({pagination?.total ?? 0})</h2>
              <p>Businesses you marked as saved from the Crisis Leads list</p>
            </div>
          </div>

          {loading ? (
            <div className="leads-loading">Loading saved leads...</div>
          ) : error ? (
            <div className="leads-error">{error}</div>
          ) : visibleLeads.length === 0 ? (
            <div className="empty-leads">
              <div className="empty-illustration">
                <div className="empty-ring empty-ring--one" />
                <div className="empty-ring empty-ring--two" />
                <div className="empty-target"><Bookmark size={25} /></div>
              </div>
              <h3>No saved leads yet</h3>
              <p>Mark a lead as "Saved" from the Crisis Leads page and it will show up here.</p>
            </div>
          ) : (
            <div className="leads-table-wrap">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Rating</th>
                    <th>Latest Review</th>
                    <th>Phone</th>
                    <th>Niche</th>
                    <th>Links</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.map((lead) => {
                    const { tag } = splitNiche(lead.niche);
                    return (
                      <tr key={lead._id}>
                        <td>
                          <div className="lead-business-name">{lead.business_name}</div>
                          <div className="lead-niche">{tag}</div>
                        </td>
                        <td><span className="lead-stars">{"*".repeat(lead.stars)} {lead.stars}.0</span></td>
                        <td><span className="lead-review-text" title={lead.review_text}>{lead.review_text || "-"}</span></td>
                        <td>{lead.phone || "-"}</td>
                        <td><span className="lead-niche">{tag}</span></td>
                        <td>
                          {lead.website ? (
                            <a className="lead-link" href={lead.website} target="_blank" rel="noreferrer">
                              Website <ExternalLink size={10} style={{ display: "inline" }} />
                            </a>
                          ) : (
                            <a className="lead-link" href={lead.maps_url} target="_blank" rel="noreferrer">
                              Maps <ExternalLink size={10} style={{ display: "inline" }} />
                            </a>
                          )}
                        </td>
                        <td>
                          <button className="secondary-button" onClick={() => unsaveLead(lead._id)}>Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            <span>Showing {visibleLeads.length} of {pagination?.total ?? 0} saved leads</span>
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