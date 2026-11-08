"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award, BarChart3, Briefcase, ChevronDown, FolderKanban, GraduationCap, LayoutDashboard, LogOut, Menu, Network,
  Search, Settings, Target, Trophy, Users, X, Zap, ListChecks, Gauge,
} from "lucide-react";
import { Logo, initials } from "./ui";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

type NavItem = { label: string; href: string; icon: typeof Award };
const dash = { label: "Overview", href: "/dashboard", icon: LayoutDashboard };
const settings = { label: "Settings", href: "/settings", icon: Settings };
const NAV: Record<Role, NavItem[]> = {
  learner: [
    dash,
    { label: "Challenges", href: "/challenges", icon: Target },
    { label: "Results", href: "/results", icon: ListChecks },
    { label: "My skills", href: "/skills", icon: BarChart3 },
    { label: "SkillGraph", href: "/skillgraph", icon: Network },
    { label: "Skill gap", href: "/gap", icon: Gauge },
    { label: "Portfolio", href: "/portfolio", icon: FolderKanban },
    { label: "Credentials", href: "/credentials", icon: Award },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    settings,
  ],
  employer: [dash, { label: "Candidates", href: "/candidates", icon: Briefcase }, { label: "Challenges", href: "/challenges", icon: Target }, { label: "Leaderboard", href: "/leaderboard", icon: Trophy }, settings],
  institution: [dash, { label: "Students", href: "/institution", icon: GraduationCap }, { label: "Challenges", href: "/challenges", icon: Target }, { label: "Leaderboard", href: "/leaderboard", icon: Trophy }, settings],
};
const ROLE_LABEL: Record<Role, string> = { learner: "Learner", employer: "Employer", institution: "Institution" };

function CommandPalette({ items, onClose, onSignOut }: { items: NavItem[]; onClose: () => void; onSignOut: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const all = useMemo(() => [...items.map((i) => ({ ...i, run: () => router.push(i.href) })), { label: "Sign out", href: "", icon: LogOut, run: onSignOut }], [items, router, onSignOut]);
  const shown = all.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
  const choose = (i: number) => { shown[i]?.run(); onClose(); };
  return (
    <motion.div className="palette" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="palette-box" role="dialog" aria-modal="true" aria-label="Command palette" initial={{ y: -12, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -12, scale: 0.97 }} onClick={(e) => e.stopPropagation()}>
        <input className="input" autoFocus placeholder="Jump to a page or action…" aria-label="Search pages" value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, shown.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
            if (e.key === "Enter") choose(sel);
          }} />
        <div role="listbox" style={{ marginTop: 8 }}>
          {shown.map((i, idx) => (
            <button key={i.label} role="option" aria-selected={idx === sel} className="palette-item" onMouseEnter={() => setSel(idx)} onClick={() => choose(idx)}>
              <i.icon size={16} aria-hidden /> {i.label}
            </button>
          ))}
          {shown.length === 0 && <p className="muted small" style={{ padding: 12 }}>No matches.</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const items = NAV[user?.role ?? "learner"];
  const signOut = useCallback(() => { logout(); router.push("/"); }, [logout, router]);

  useEffect(() => setDrawer(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); }
      if (e.key === "Escape") { setPalette(false); setMenu(false); setDrawer(false); }
    };
    const onClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClick); };
  }, []);
  if (!user) return null;

  return (
    <div className="app">
      <aside className={`sidebar ${drawer ? "open" : ""}`} aria-label="Sidebar">
        <div className="between" style={{ padding: "4px 6px 16px" }}>
          <Logo href="/dashboard" />
          <button className="btn btn-ghost btn-sm only-mobile" aria-label="Close navigation" onClick={() => setDrawer(false)}><X size={18} /></button>
        </div>
        <nav className="stack" style={{ gap: 3 }} aria-label="App">
          {items.map((i) => {
            const active = path === i.href || (i.href !== "/dashboard" && path.startsWith(i.href + "/"));
            return (
              <Link key={i.href} href={i.href} className="side-link" aria-current={active ? "page" : undefined}>
                {active && <motion.span layoutId="nav-active" className="side-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <i.icon size={17} aria-hidden /> <span>{i.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto" }} className="card-flat">
          <div className="row" style={{ gap: 8 }}><Zap size={15} color="#a5b9ff" aria-hidden /><b className="tiny">Prototype environment</b></div>
          <p className="tiny muted" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>Credentials and scores here are for demonstration only.</p>
        </div>
      </aside>
      <AnimatePresence>{drawer && <motion.div className="scrim only-mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} aria-hidden />}</AnimatePresence>

      <div style={{ minWidth: 0 }}>
        <header className="app-top">
          <div className="row">
            <button className="btn btn-ghost btn-sm only-mobile" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu size={20} /></button>
            <button className="search-btn" onClick={() => setPalette(true)} aria-label="Open command palette (Ctrl+K)"><Search size={15} aria-hidden /><span>Search pages…</span><kbd>Ctrl K</kbd></button>
          </div>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button className="row btn btn-ghost" style={{ padding: "6px 8px" }} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              <span className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{initials(user.name)}</span>
              <span className="only-desktop small" style={{ textAlign: "left", lineHeight: 1.2 }}><b style={{ display: "block", color: "var(--text)" }}>{user.name}</b><span className="tiny dim">{ROLE_LABEL[user.role]}</span></span>
              <ChevronDown size={15} aria-hidden />
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div className="menu" role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}>
                  <div style={{ padding: "8px 12px 10px" }}><b className="small">{user.name}</b><div className="tiny dim" style={{ wordBreak: "break-all" }}>{user.email}</div></div>
                  <Link href="/settings" role="menuitem"><Settings size={15} aria-hidden /> Settings</Link>
                  <button role="menuitem" onClick={signOut}><LogOut size={15} aria-hidden /> Sign out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
        <main id="main" className="app-content">{children}</main>
      </div>
      <AnimatePresence>{palette && <CommandPalette items={items} onClose={() => setPalette(false)} onSignOut={signOut} />}</AnimatePresence>
    </div>
  );
}

/** Renders children only for the allowed roles; otherwise explains why. */
export function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (user && !roles.includes(user.role)) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <Users size={30} color="#a5b9ff" aria-hidden />
        <h2 className="h3" style={{ marginTop: 12 }}>Not available for your account type</h2>
        <p className="muted small">This page is for {roles.join(" / ")} accounts. You are signed in as {user.role}.</p>
        <Link href="/dashboard" className="btn btn-primary btn-sm">Back to overview</Link>
      </div>
    );
  }
  return <>{children}</>;
}
