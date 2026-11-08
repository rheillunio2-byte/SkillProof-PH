"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="SkillProof home">
      <span className="brand-mark"><ShieldCheck size={19} color="#fff" aria-hidden /></span>
      <span>skillproof</span>
    </Link>
  );
}

/** Fade-up entrance. Honors prefers-reduced-motion via MotionConfig in <Providers>. */
export function Reveal({ children, delay = 0, y = 18, className, once = true }: {
  children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean;
}) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function CountUp({ value, suffix = "", duration = 1.1 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(value); return; }
    const controls = animate(0, value, { duration, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, reduce, duration]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export function ProgressBar({ value, max = 100, label, height = 8 }: { value: number; max?: number; label: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="track" style={{ height }} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}>
      <motion.i initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: "easeOut" }} />
    </div>
  );
}

export function ScoreRing({ value, size = 150, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 16) / 2, c = 2 * Math.PI * r;
  const color = value >= 70 ? "url(#ringGrad)" : "#fbbf24";
  return (
    <div style={{ position: "relative", width: size, height: size }} role="img" aria-label={`${label ?? "Score"}: ${value} out of 100`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5b8cff" /><stop offset=".6" stopColor="#8b5cf6" /><stop offset="1" stopColor="#22d3ee" /></linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={10} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div><div style={{ fontSize: size * 0.27, fontWeight: 750, letterSpacing: "-.03em", lineHeight: 1 }}><CountUp value={value} /></div>
          {label && <div className="tiny muted" style={{ marginTop: 4 }}>{label}</div>}</div>
      </div>
    </div>
  );
}

export function LevelDots({ level }: { level: number }) {
  return <span className="dots" role="img" aria-label={`Level ${level} of 5`}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= level ? "on" : ""} />)}</span>;
}

const toneClass = { ok: "badge-ok", warn: "badge-warn", blue: "badge-blue", violet: "badge-violet", bad: "badge-bad", neutral: "" };
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof toneClass }) {
  return <span className={`badge ${toneClass[tone]}`}>{children}</span>;
}
export const SampleBadge = () => <Badge tone="warn">Sample data</Badge>;
export const difficultyTone = (d: string) => (d === "Beginner" ? "ok" : d === "Intermediate" ? "blue" : "violet") as keyof typeof toneClass;

export function PageHeader({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <Reveal>
      <div className="page-head">
        <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{sub && <p>{sub}</p>}</div>
        {action}
      </div>
    </Reveal>
  );
}

export function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: number | string }) {
  return <div className="skeleton" style={{ height: h, width: w }} aria-hidden />;
}
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card stack" key={i}><Skeleton h={14} w="40%" /><Skeleton h={22} /><Skeleton h={14} w="80%" /><Skeleton h={34} w="50%" /></div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card" role="alert" style={{ textAlign: "center", padding: 36 }}>
      <AlertTriangle size={30} color="#fbbf24" aria-hidden />
      <h3 className="h3" style={{ marginTop: 12 }}>Something went wrong</h3>
      <p className="muted small" style={{ margin: "0 0 16px" }}>{message}</p>
      {onRetry && <button className="btn btn-sm" onClick={onRetry}><RefreshCw size={14} aria-hidden /> Try again</button>}
    </div>
  );
}

export function EmptyState({ art, title, text, action }: { art: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card empty">
      <img src={`/assets/${art}.svg`} alt="" loading="lazy" width={168} height={126} />
      <h3 className="h3">{title}</h3>
      <p className="muted small" style={{ margin: "0 auto 18px", maxWidth: 380, lineHeight: 1.6 }}>{text}</p>
      {action}
    </div>
  );
}

export function Spinner() { return <span className="spinner" aria-hidden />; }
export function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase(); }
