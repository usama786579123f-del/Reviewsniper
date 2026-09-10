/*
 * Export Leads - fetches the real leads collection and lets you download a
 * CSV. Excel/PDF formats aren't built yet, so picking them shows an honest
 * "not available yet" message instead of silently doing nothing or faking it.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Download, FileSpreadsheet } from "lucide-react";
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
  status: string;
  scraped_at: string;
};

function toCsv(leads: Lead[]): string {
  const headers = ["Business Name", "Rating", "Latest Review", "Phone", "Website", "Niche", "Status", "Date Added"];
  const rows = leads.map((l) => [
    l.business_name,
    `${l.stars}.0`,
    l.review_text.replace(/"/g, '""'),
    l.phone || "",
    l.website || l.maps_url,
    l.niche,
    l.status,
    new Date(l.scraped_at).toLocaleDateString(),
  ]);
  const lines = [headers, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(","));
  return lines.join("\n");
}

export default function ExportLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"csv" | "xlsx" | "pdf">("csv");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get<{ leads: Lead[]; pagination: { total: number } }>("/api/leads", { params: { limit: 100, minStars: 1, maxStars: 2 } })
      .then((res) => {
        setLeads(res.data.leads);
        setSelected(new Set(res.data.leads.map((l) => l._id)));
      })
      .catch(() => setError("Could not load leads. Check that your backend server and MONGODB_URI are set up."))
      .finally(() => setLoading(false));
  }, []);

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === leads.length ? new Set() : new Set(leads.map((l) => l._id))));
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDownload() {
    const chosen = leads.filter((l) => selected.has(l._id));
    if (chosen.length === 0) {
      toast.error("Select at least one lead to export");
      return;
    }
    if (format !== "csv") {
      toast.info(`${format.toUpperCase()} export isn't built yet - CSV is available now`, {
        description: "Downloading as CSV instead.",
      });
    }
    const csv = toCsv(chosen);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviewsniper-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${chosen.length} lead(s)`);
  }

  return (
    <AppShell activeLabel="Export Leads">
      <div className="dashboard-heading-row">
        <div>
          <div className="crisis-title-row">
            <div className="crisis-title-icon" style={{ color: "#3268ee", background: "#e7efff" }}>
              <Download size={20} />
            </div>
            <h1>Export Leads</h1>
          </div>
          <p className="dashboard-subtitle">Download your leads as a CSV file, ready for outreach.</p>
        </div>
      </div>

      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-icon stat-icon--blue"><FileSpreadsheet size={18} /></div>
          <div className="stat-label">Available leads</div>
          <div className="stat-value">{leads.length || "-"}</div>
        </article>
        <article className="stat-card">
          <div className="stat-icon stat-icon--green"><Download size={18} /></div>
          <div className="stat-label">Selected for export</div>
          <div className="stat-value">{selected.size}</div>
        </article>
      </div>

      <section className="leads-section">
        <div className="leads-card">
          <div className="leads-card-header">
            <div>
              <h2>Export Leads ({leads.length})</h2>
              <p>Select leads, choose your format, and download your file</p>
            </div>
            <div className="lead-actions">
              <select
                aria-label="Export format"
                value={format}
                onChange={(e) => setFormat(e.target.value as "csv" | "xlsx" | "pdf")}
                className="filter-select"
              >
                <option value="csv">CSV (recommended)</option>
                <option value="xlsx">Excel (.xlsx) - not available yet</option>
                <option value="pdf">PDF - not available yet</option>
              </select>
              <button className="primary-button primary-button--small" onClick={handleDownload}>
                <Download size={15} /> Download File
              </button>
            </div>
          </div>

          {loading ? (
            <div className="leads-loading">Loading leads...</div>
          ) : error ? (
            <div className="leads-error">{error}</div>
          ) : leads.length === 0 ? (
            <div className="empty-leads">
              <h3>No leads to export yet</h3>
              <p>Once your scraper finds crisis leads, they will be available here to export.</p>
            </div>
          ) : (
            <div className="leads-table-wrap">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>
                      <input type="checkbox" checked={selected.size === leads.length} onChange={toggleSelectAll} />
                    </th>
                    <th>Business</th>
                    <th>Rating</th>
                    <th>Latest Review</th>
                    <th>Phone</th>
                    <th>Niche</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td><input type="checkbox" checked={selected.has(lead._id)} onChange={() => toggleSelected(lead._id)} /></td>
                      <td><div className="lead-business-name">{lead.business_name}</div></td>
                      <td><span className="lead-stars">{"*".repeat(lead.stars)} {lead.stars}.0</span></td>
                      <td><span className="lead-review-text" title={lead.review_text}>{lead.review_text || "-"}</span></td>
                      <td>{lead.phone || "-"}</td>
                      <td><span className="lead-niche">{lead.niche}</span></td>
                      <td><span className={`lead-status lead-status--${lead.status}`}>{lead.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}