/*
 * Agencies - now backed by a real "agencies" MongoDB collection via
 * /api/agencies. You can add, view, and update agencies you're pitching
 * leads to. No fake sample agencies - starts empty until you add your own.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Building2, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import AppShell from "@/components/AppShell";

type Agency = {
  _id: string;
  name: string;
  country: string;
  city: string;
  niches: string[];
  contact_person: string;
  email: string;
  phone: string;
  status: string;
  leads_sent: number;
  created_at: string;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

const emptyForm = {
  name: "",
  country: "",
  city: "",
  niches: "",
  contact_person: "",
  email: "",
  phone: "",
};

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    axios
      .get<{ agencies: Agency[]; pagination: Pagination }>("/api/agencies", { params: { page, limit: 20 } })
      .then((res) => {
        setAgencies(res.data.agencies);
        setPagination(res.data.pagination);
      })
      .catch(() => setError("Could not load agencies. Check that your backend server and MONGODB_URI are set up."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function addAgency(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Agency name is required");
      return;
    }
    setSaving(true);
    try {
      await axios.post("/api/agencies", {
        ...form,
        niches: form.niches.split(",").map((n) => n.trim()).filter(Boolean),
      });
      toast.success("Agency added");
      setForm(emptyForm);
      setShowForm(false);
      setPage(1);
      load();
    } catch {
      toast.error("Could not add agency");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await axios.patch(`/api/agencies/${id}`, { status });
      setAgencies((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Could not update agency");
    }
  }

  const activeCount = agencies.filter((a) => a.status === "active").length;
  const contactedCount = agencies.filter((a) => a.status !== "pending").length;

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
        <button className="primary-button primary-button--small" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? "Cancel" : "Add Agency"}
        </button>
      </div>

      <div className="stat-grid">
        <article className="stat-card"><div className="stat-label">Total agencies</div><div className="stat-value">{pagination?.total ?? "-"}</div></article>
        <article className="stat-card"><div className="stat-label">Active (this page)</div><div className="stat-value">{activeCount}</div></article>
        <article className="stat-card"><div className="stat-label">Contacted (this page)</div><div className="stat-value">{contactedCount}</div></article>
      </div>

      {showForm && (
        <form className="leads-card" style={{ padding: 20, marginBottom: 18 }} onSubmit={addAgency}>
          <h2 style={{ marginBottom: 14 }}>Add a new agency</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input className="filter-select" placeholder="Agency name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="filter-select" placeholder="Contact person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
            <input className="filter-select" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <input className="filter-select" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="filter-select" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="filter-select" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="filter-select" style={{ gridColumn: "span 2" }} placeholder="Niches (comma-separated, e.g. Dental, Restaurants)" value={form.niches} onChange={(e) => setForm({ ...form, niches: e.target.value })} />
          </div>
          <button className="primary-button primary-button--small" style={{ marginTop: 14 }} disabled={saving}>
            {saving ? "Saving..." : "Save agency"}
          </button>
        </form>
      )}

      <section className="leads-section">
        <div className="leads-card">
          <div className="leads-card-header">
            <div>
              <h2>Agencies ({pagination?.total ?? 0})</h2>
              <p>Marketing agencies you're pitching crisis leads to</p>
            </div>
          </div>

          {loading ? (
            <div className="leads-loading">Loading agencies...</div>
          ) : error ? (
            <div className="leads-error">{error}</div>
          ) : agencies.length === 0 ? (
            <div className="empty-leads">
              <div className="empty-illustration">
                <div className="empty-ring empty-ring--one" />
                <div className="empty-ring empty-ring--two" />
                <div className="empty-target"><Building2 size={25} /></div>
              </div>
              <h3>No agencies added yet</h3>
              <p>Add the reputation-management agencies you plan to sell leads to - no sample agencies are shown.</p>
              <button className="primary-button primary-button--small" onClick={() => setShowForm(true)}>
                <Plus size={15} /> Add your first agency
              </button>
            </div>
          ) : (
            <div className="leads-table-wrap">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Agency</th>
                    <th>Location</th>
                    <th>Niches</th>
                    <th>Contact</th>
                    <th>Leads Sent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((a) => (
                    <tr key={a._id}>
                      <td><div className="lead-business-name">{a.name}</div></td>
                      <td>{[a.city, a.country].filter(Boolean).join(", ") || "-"}</td>
                      <td>{a.niches.length > 0 ? a.niches.join(", ") : "-"}</td>
                      <td>
                        <div className="lead-business-name" style={{ fontSize: 11 }}>{a.contact_person || "-"}</div>
                        <div className="lead-niche">{a.email}</div>
                      </td>
                      <td>{a.leads_sent}</td>
                      <td>
                        <select
                          aria-label={`Status for ${a.name}`}
                          value={a.status}
                          onChange={(e) => updateStatus(a._id, e.target.value)}
                          className={`lead-status lead-status--${a.status === "active" ? "contacted" : a.status === "inactive" ? "new" : "saved"}`}
                          style={{ border: 0, appearance: "none" }}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            <span>Showing {agencies.length} of {pagination?.total ?? 0} agencies</span>
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
