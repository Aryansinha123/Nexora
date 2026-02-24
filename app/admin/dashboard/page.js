"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

// ─── Styles ────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .dash-page *, .dash-page *::before, .dash-page *::after { box-sizing: border-box; }
  .dash-page {
    font-family: 'Syne', sans-serif;
    color: var(--text-primary, #e8ecf8);
  }

  :root {
    --bg-void: #050810;
    --bg-surface: #080d1a;
    --bg-raised: #0d1526;
    --bg-hover: #111c32;
    --border-subtle: rgba(99,130,255,0.08);
    --border-mid: rgba(99,130,255,0.15);
    --border-glow: rgba(99,130,255,0.35);
    --text-primary: #e8ecf8;
    --text-secondary: #8892b0;
    --text-muted: #4a5578;
    --accent-blue: #6382ff;
    --accent-cyan: #22d3ee;
    --accent-green: #34d399;
    --accent-amber: #fbbf24;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  /* ── Metric cards ── */
  .metric-card {
    position: relative;
    background: var(--bg-surface);
    border-radius: 16px;
    padding: 22px 24px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid var(--border-subtle);
  }

  .metric-card::before {
    content: '';
    position: absolute; inset: 0; border-radius: 16px;
    padding: 1px;
    background: linear-gradient(135deg, var(--border-mid) 0%, transparent 60%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }

  .metric-glow {
    position: absolute; width: 140px; height: 140px;
    border-radius: 50%; right: -30px; top: -30px;
    filter: blur(50px); opacity: 0.12; pointer-events: none;
  }

  .metric-label {
    font-size: 11px; font-family: var(--font-mono);
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }

  .metric-dot {
    width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
  }

  .live-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 9px; font-family: var(--font-mono);
    font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 8px; border-radius: 20px;
    color: var(--accent-green);
    background: rgba(52,211,153,0.08);
    border: 1px solid rgba(52,211,153,0.2);
    margin-left: auto;
  }

  .live-badge::before {
    content: ''; width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent-green);
    animation: pulse-dot 1.8s ease-in-out infinite;
    display: inline-block;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }

  .metric-value {
    font-family: var(--font-display); font-size: 32px; font-weight: 800;
    letter-spacing: -0.04em; line-height: 1; margin-bottom: 8px;
  }

  .metric-helper {
    font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);
  }

  /* ── Skeleton ── */
  .shimmer {
    background: linear-gradient(90deg, var(--bg-raised) 0%, var(--bg-hover) 50%, var(--bg-raised) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Chart card ── */
  .chart-card {
    background: var(--bg-surface);
    border-radius: 16px; overflow: hidden; position: relative;
    border: 1px solid var(--border-subtle);
  }

  .chart-card::before {
    content: '';
    position: absolute; inset: 0; border-radius: 16px;
    padding: 1px;
    background: linear-gradient(135deg, var(--border-mid) 0%, transparent 70%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none;
  }

  .chart-header {
    padding: 22px 24px 0;
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 16px;
  }

  .chart-title {
    font-size: 15px; font-weight: 700;
    letter-spacing: -0.02em; color: var(--text-primary); margin-bottom: 4px;
  }

  .chart-desc {
    font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);
  }

  .realtime-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 9px; font-family: var(--font-mono);
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px;
    color: var(--accent-blue);
    background: rgba(99,130,255,0.08);
    border: 1px solid var(--border-mid);
    white-space: nowrap; flex-shrink: 0;
  }

  .realtime-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent-cyan);
    animation: pulse-dot 1.8s ease-in-out infinite;
    display: inline-block;
  }

  /* ── Error banner ── */
  .error-banner {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 12px; padding: 14px 18px;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: #fca5a5;
    margin-bottom: 24px; font-family: var(--font-mono);
  }

  /* ── Chart empty ── */
  .chart-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: 280px; color: var(--text-muted);
    gap: 12px; font-family: var(--font-mono); font-size: 12px;
  }

  /* ── Grid ── */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px; margin-bottom: 24px;
  }

  @media (min-width: 1200px) {
    .metrics-grid { grid-template-columns: repeat(4, 1fr); }
  }
`;

// ─── Card themes ──────────────────────────────────────────────────────────
const THEMES = [
  { accent: "#6382ff", glow: "#6382ff" },
  { accent: "#34d399", glow: "#34d399" },
  { accent: "#fbbf24", glow: "#fbbf24" },
  { accent: "#22d3ee", glow: "#22d3ee" },
];

// ─── MetricCard ───────────────────────────────────────────────────────────
function MetricCard({ label, value, helper, themeIndex = 0 }) {
  const t = THEMES[themeIndex % THEMES.length];
  return (
    <div className="metric-card">
      <div className="metric-glow" style={{ background: t.glow }} />
      <div className="metric-label">
        <span className="metric-dot" style={{ background: t.accent, boxShadow: `0 0 6px ${t.accent}` }} />
        {label}
        <span className="live-badge">Live</span>
      </div>
      <div className="metric-value" style={{ color: t.accent }}>{value}</div>
      {helper && <div className="metric-helper">{helper}</div>}
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="metric-card" style={{ height: 120 }}>
      <div className="shimmer" style={{ width: "60%", height: 10, marginBottom: 16 }} />
      <div className="shimmer" style={{ width: "80%", height: 32, marginBottom: 12 }} />
      <div className="shimmer" style={{ width: "40%", height: 10 }} />
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-raised)",
      border: "1px solid var(--border-mid)",
      borderRadius: 10, padding: "10px 14px",
      fontFamily: "var(--font-mono)", fontSize: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: 10, letterSpacing: "0.05em" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: p.color, marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span>{p.name === "revenue" ? "Actual" : "Forecast"}: {currencyFormatter.format(typeof p.value === "number" ? p.value : 0)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ChartCard ────────────────────────────────────────────────────────────
function ChartCard({ title, description, children, isLoading }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">{title}</div>
          {description && <div className="chart-desc">{description}</div>}
        </div>
        <span className="realtime-badge">
          <span className="realtime-dot" />
          Realtime
        </span>
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        {isLoading ? (
          <div style={{ height: 280 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 10, marginBottom: 16, width: `${60 + i * 9}%`, opacity: 0.5 }} />
            ))}
            <div className="shimmer" style={{ width: "100%", height: 180, marginTop: 16 }} />
          </div>
        ) : children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/orders/analytics", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load analytics data.");
        }

        const data = await response.json();
        if (!isMounted) return;

        const overview = data.overview || {
          totalRevenue: 0,
          totalOrders: 0,
        };

        // ✅ FIXED: Read correct ML field
        const predictionArray =
          data.prediction?.next_7_days_prediction || [];

        const forecastTotal = Array.isArray(predictionArray)
          ? predictionArray.reduce(
              (sum, val) => sum + Number(val || 0),
              0
            )
          : 0;

        setMetrics({
          totalRevenue: overview.totalRevenue || 0,
          totalOrders: overview.totalOrders || 0,
          forecastTotal,
          riskAlertCount: data.topProducts?.length || 0,
        });

        const series = data.revenuePerDay || [];

        setRevenueSeries(
          Array.isArray(series)
            ? series.map((item, index) => ({
                label: `${item._id.day}/${item._id.month}`,
                revenue: Number(item.dailyRevenue || 0),
                forecast:
                  predictionArray[index] !== undefined
                    ? Number(predictionArray[index])
                    : 0,
              }))
            : []
        );

        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics data."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { isMounted = false; };
  }, []);

  const totalRevenueDisplay = metrics ? currencyFormatter.format(metrics.totalRevenue) : "—";
  const totalOrdersDisplay = metrics ? numberFormatter.format(metrics.totalOrders) : "—";
  const forecastDisplay = metrics ? currencyFormatter.format(metrics.forecastTotal) : "—";
  const riskDisplay = metrics ? numberFormatter.format(metrics.riskAlertCount) : "—";

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-page">

        {/* Error */}
        {error && (
          <div className="error-banner">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5" />
              <path d="M8 5v3.5M8 11v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <span style={{ color: "#f87171", fontWeight: 600 }}>Analytics unavailable</span>
              <span style={{ marginLeft: 8, color: "#fca5a5" }}>{error}</span>
            </div>
          </div>
        )}

        {/* Metric cards */}
        <div className="metrics-grid">
          {loading && !metrics ? (
            <>{[0,1,2,3].map(i => <MetricCardSkeleton key={i} />)}</>
          ) : (
            <>
              <MetricCard label="Total Revenue"      value={totalRevenueDisplay} helper="All-time gross revenue"    themeIndex={0} />
              <MetricCard label="Total Orders"       value={totalOrdersDisplay}  helper="Confirmed orders"          themeIndex={1} />
              <MetricCard label="Next 7 Day Forecast" value={forecastDisplay}    helper="Projected next period"     themeIndex={3} />
              <MetricCard label="Risk Alerts"        value={riskDisplay}         helper="Products flagged"          themeIndex={2} />
            </>
          )}
        </div>

        {/* Chart */}
        <ChartCard
          title="Revenue – Actual vs Forecast"
          description="Daily revenue alongside next-7-day ML prediction"
          isLoading={loading}
        >
          {revenueSeries.length === 0 ? (
            <div className="chart-empty">
              <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                <rect x="4" y="4" width="40" height="40" rx="8" stroke="var(--border-mid)" strokeWidth="1.5" />
                <path d="M14 32l6-8 5 5 8-12 5 4" stroke="var(--border-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              No revenue data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6382ff" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  axisLine={{ stroke: "var(--border-subtle)" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v.toString()}
                  tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(name) => (
                    <span style={{ color: "var(--text-secondary)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                      {name === "revenue" ? "Actual" : "Forecast"}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: 16 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="url(#revGrad)"
                  strokeWidth={2.5}
                  dot={{ fill: "#6382ff", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#6382ff", stroke: "rgba(99,130,255,0.3)", strokeWidth: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="forecast"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 5, fill: "#fbbf24", stroke: "rgba(251,191,36,0.3)", strokeWidth: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>
    </>
  );
}