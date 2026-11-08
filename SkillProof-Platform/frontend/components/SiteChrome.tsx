"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./ui";
import { useAuth } from "@/lib/auth";

const links: [string, string][] = [["How it works", "/how-it-works"], ["For employers", "/employers"], ["For institutions", "/institutions"], ["Pricing", "/pricing"]];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { user } = useAuth();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [path]);
  return (
    <header className={`site-nav ${scrolled || open ? "scrolled" : ""}`}>
      <div className="container-x inner">
        <Logo />
        <nav className="nav-links" aria-label="Main">
          {links.map(([n, u]) => <Link key={u} href={u} aria-current={path === u ? "page" : undefined}>{n}</Link>)}
        </nav>
        <div className="row">
          {user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm only-desktop">Sign in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
          <button className="btn btn-ghost btn-sm only-mobile" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className="mobile-sheet" aria-label="Mobile" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {links.map(([n, u]) => <Link key={u} href={u}>{n}</Link>)}
            {!user && <Link href="/login">Sign in</Link>}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-x">
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="muted small" style={{ maxWidth: 300, lineHeight: 1.7, marginTop: 14 }}>
              Practical assessments and evidence-based credentials. This is a prototype: all seeded people, scores and credentials are fictional.
            </p>
          </div>
          <div><b className="small">Product</b><Link href="/how-it-works">How it works</Link><Link href="/pricing">Pricing</Link><Link href="/verify/SP-2026-8F2A91">Verify a credential</Link></div>
          <div><b className="small">Audiences</b><Link href="/register">For learners</Link><Link href="/employers">For employers</Link><Link href="/institutions">For institutions</Link></div>
          <div><b className="small">Account</b><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></div>
        </div>
        <div className="between wrap tiny dim" style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <span>© 2026 SkillProof · Prototype, not an accredited certification body</span>
          <span>Built with Next.js and FastAPI</span>
        </div>
      </div>
    </footer>
  );
}
