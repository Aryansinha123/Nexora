"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
        <path d="M3 6.5L10 3l7 3.5v7L10 17l-7-3.5v-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 3v14M3 6.5l7 3.5 7-3.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
        <path d="M3 15l4-5 3 3 4-6 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="3" cy="15" r="1.2" fill="currentColor"/>
        <circle cx="7" cy="10" r="1.2" fill="currentColor"/>
        <circle cx="10" cy="13" r="1.2" fill="currentColor"/>
        <circle cx="14" cy="7" r="1.2" fill="currentColor"/>
        <circle cx="17" cy="9" r="1.2" fill="currentColor"/>
      </svg>
    ),
  },
];

function getPageTitle(pathname) {
  if (!pathname) return "Admin";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  if (pathname === "/admin/login") return "Login";
  return "Admin";
}

const SIDEBAR_W = 240;

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Drive everything from JS — zero Tailwind breakpoint classes for sidebar logic
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    sync(mq);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pageTitle = getPageTitle(pathname);

  const handleLogout = async () => {
    try { await fetch("/api/admin/logout", { method: "POST" }); } catch (_) {}
    finally { router.push("/admin/login"); }
  };

  const sidebarStyle = isMobile
    ? {
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: SIDEBAR_W,
        transform: sidebarOpen ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }
    : { position: "relative", width: SIDEBAR_W, flexShrink: 0 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

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
          --font-display: 'Syne', sans-serif;
          --font-mono: 'DM Mono', monospace;
        }

        .admin-root {
          font-family: var(--font-display);
          min-height: 100vh;
          background: var(--bg-void);
          color: var(--text-primary);
          display: flex;
        }

        .admin-sidebar {
          background: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-glow-bg {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 120% 80% at 50% 0%, rgba(99,130,255,0.06) 0%, transparent 70%);
        }

        .nav-item {
          position: relative;
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          border: 1px solid transparent;
          text-decoration: none; font-size: 14px; font-weight: 500;
          color: var(--text-secondary);
          transition: background 0.15s, color 0.15s;
          letter-spacing: -0.01em;
        }
        .nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
        .nav-item.is-active {
          background: linear-gradient(135deg, rgba(99,130,255,0.12) 0%, rgba(34,211,238,0.06) 100%);
          border-color: var(--border-glow);
          color: var(--text-primary); font-weight: 600;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(99,130,255,0.08);
        }
        .nav-active-bar {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 60%;
          background: linear-gradient(180deg, var(--accent-blue), var(--accent-cyan));
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px var(--accent-blue);
        }

        .logo-text {
          font-size: 16px; font-weight: 800; letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-cyan) 100%);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-glass {
          position: sticky; top: 0; z-index: 30;
          background: rgba(5,8,16,0.88);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--border-subtle);
        }

        .page-title-area {
          border-left: 2px solid var(--border-glow);
          padding-left: 12px;
        }

        .breadcrumb-label {
          font-family: var(--font-mono); font-size: 10px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--text-muted);
        }

        .page-h1 {
          font-size: 18px; font-weight: 700; letter-spacing: -0.02em;
          line-height: 1.2; color: var(--text-primary);
        }

        .status-pill {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg-raised);
          border: 1px solid var(--border-subtle);
          border-radius: 100px; padding: 6px 12px;
          font-size: 12px; color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent-green); flex-shrink: 0;
          animation: pulse-glow 2.5s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50% { box-shadow: 0 0 0 4px rgba(52,211,153,0); }
        }

        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 7px; border-radius: 8px;
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary);
          transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

        .logout-btn {
          display: flex; align-items: center; gap: 6px;
          background: var(--bg-raised);
          border: 1px solid var(--border-subtle);
          border-radius: 10px; padding: 7px 14px;
          font-size: 12px; font-weight: 600;
          color: var(--text-secondary); cursor: pointer;
          transition: all 0.15s ease;
          font-family: var(--font-display); letter-spacing: -0.01em;
        }
        .logout-btn:hover {
          background: rgba(99,130,255,0.08);
          border-color: var(--border-glow);
          color: var(--accent-blue);
        }

        .admin-main {
          flex: 1; display: flex; flex-direction: column;
          min-height: 100vh; min-width: 0;
        }

        .admin-page-content {
          flex: 1; padding: 28px 24px;
          background: var(--bg-void);
        }
      `}</style>

      <div className="admin-root">

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* Sidebar */}
        <aside className="admin-sidebar" style={sidebarStyle}>
          <div className="sidebar-glow-bg" />

          {/* Logo */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border-subtle)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 28, height: 28,
                    background: "linear-gradient(135deg, #6382ff 0%, #22d3ee 100%)",
                    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <path d="M2 7L7 2L12 7L7 12L2 7Z" fill="rgba(255,255,255,0.9)" />
                      <path d="M7 4.5L9.5 7L7 9.5L4.5 7L7 4.5Z" fill="rgba(5,8,16,0.6)" />
                    </svg>
                  </div>
                  <span className="logo-text">NEXORA</span>
                </div>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Admin Console
                </span>
              </div>

              {/* ✅ Close button — only when mobile */}
              {isMobile && (
                <button className="icon-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                  <svg viewBox="0 0 16 16" fill="none" width="18" height="18">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ marginBottom: 8, paddingLeft: 8 }}>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Navigation
              </span>
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${isActive ? " is-active" : ""}`}
                  onClick={() => { if (isMobile) setSidebarOpen(false); }}
                >
                  {isActive && <span className="nav-active-bar" />}
                  <span style={{ opacity: isActive ? 1 : 0.6, display: "flex" }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span style={{
                      marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                      background: "var(--accent-blue)", boxShadow: "0 0 8px var(--accent-blue)",
                      flexShrink: 0,
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>Dark SaaS Dashboard</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em",
              color: "var(--accent-blue)", background: "rgba(99,130,255,0.08)",
              border: "1px solid var(--border-mid)", padding: "2px 8px", borderRadius: 20,
            }}>v1.0</span>
          </div>
        </aside>

        {/* Main */}
        <div className="admin-main">
          <header className="header-glass">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* ✅ Hamburger — only when mobile */}
                {isMobile && (
                  <button className="icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                    <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
                      <path d="M3 5H17M3 10H17M3 15H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                <div className="page-title-area">
                  <div className="breadcrumb-label">NEXORA Admin</div>
                  <h1 className="page-h1">{pageTitle}</h1>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="status-pill">
                  <span className="status-dot" />
                  <span>Operational</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                    <path d="M10 8H3M3 8L5.5 5.5M3 8L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 4.5V3.5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1H8a1 1 0 01-1-1V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="admin-page-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}