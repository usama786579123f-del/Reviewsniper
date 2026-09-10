/*
 * Analytics - real numbers from /api/analytics (leads per day, status
 * breakdown, top niches). The reference mockup showed a "Lead Sources" donut
 * (Google/Facebook/LinkedIn/etc.) - we only have one source (Google Maps),
 * so that chart is left out rather than inventing a breakdown.
 */
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, CheckCircle2, MapPin, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppShell from "@/components/AppShell";

type Analytics = {
  totalLeads: number;
  leadsByDay: { date: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  topNiches: { niche: string; count: number }[];
};

const STATUS_LABELS: Record<string, string> = { new: "New", contacted: "Contacted", saved: "Saved", converted: "Converted" };

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<Analytics>("/api/analytics")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load analytics. Check that your backend server and MONGODB_URI are set up."))
      .finally(() => setLoading(false));
  }, []);

  const statusChartData = (data?.leadsByStatus ?? []).map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    count: s.count,
  }));

  return (
    <AppShell activeLabel="Analytics">
      <div className="dashboard-heading-row">
        <div>
          <div className="crisis-title-row">
            <div className="crisis-title-icon" style={{ color: "#7a62df", background: "#eee9ff" }}>
              <BarChart3 size={20} />
            </div>
            <h1>Analytics</h1>
          </div>
          <p className="dashboard-subtitle">Real insights from your scraper's activity - no sample numbers.</p>
        </div>
      </div>

      {loading ? (
        <div className="leads-loading">Loading analytics...</div>
      ) : error ? (
        <div className="leads-error">{error}</div>
      ) : (
        <>
          <div className="stat-grid">
            <article className="stat-card">
              <div className="stat-icon stat-icon--blue"><Users size={18} /></div>
              <div className="stat-label">Total leads found</div>
              <div className="stat-value">{data?.totalLeads ?? "-"}</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon--green"><CheckCircle2 size={18} /></div>
              <div className="stat-label">Lead source</div>
              <div className="stat-value" style={{ fontSize: 16 }}>Google Maps</div>
              <div className="stat-helper">100% - our only source right now</div>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon--rose"><MapPin size={18} /></div>
              <div className="stat-label">Niches tracked</div>
              <div className="stat-value">{data?.topNiches.length ?? "-"}</div>
            </article>
          </div>

          <div className="analytics-grid">
            <div className="leads-card analytics-chart-card">
              <div className="leads-card-header">
                <div>
                  <h2>Leads found (last 7 days)</h2>
                  <p>Total crisis leads discovered per day</p>
                </div>
              </div>
              <div style={{ padding: "10px 20px 20px", height: 260 }}>
                {data && data.leadsByDay.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.leadsByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#edf1f6" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#a1adbd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#a1adbd" />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3268ee" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="leads-loading">No leads found in the last 7 days yet.</div>
                )}
              </div>
            </div>

            <div className="leads-card analytics-chart-card">
              <div className="leads-card-header">
                <div>
                  <h2>Leads by status</h2>
                  <p>Current status of all leads</p>
                </div>
              </div>
              <div style={{ padding: "10px 20px 20px", height: 260 }}>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#edf1f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#a1adbd" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#a1adbd" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3268ee" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="leads-loading">No leads yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="leads-card" style={{ marginTop: 18 }}>
            <div className="leads-card-header">
              <div>
                <h2>Top niches</h2>
                <p>Niches with the most crisis leads found so far</p>
              </div>
            </div>
            {data && data.topNiches.length > 0 ? (
              <div className="leads-table-wrap">
                <table className="leads-table">
                  <thead>
                    <tr><th>#</th><th>Niche</th><th>Leads found</th></tr>
                  </thead>
                  <tbody>
                    {data.topNiches.map((n, i) => (
                      <tr key={n.niche}>
                        <td>{i + 1}</td>
                        <td><span className="lead-niche">{n.niche}</span></td>
                        <td>{n.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="leads-loading">No niches tracked yet.</div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}