"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Award, BadgeCheck, CheckCircle2, ChevronDown, ClipboardCheck, Code2, Medal, Play, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { Badge, CountUp, ProgressBar, Reveal, initials } from "./ui";
import { api } from "@/lib/api";
import type { LeaderRow } from "@/lib/types";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden />
      <div className="orb a" aria-hidden /><div className="orb b" aria-hidden /><div className="orb c" aria-hidden />
      <div className="container-x hero-grid">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge tone="blue"><Sparkles size={12} aria-hidden /> Evidence-based skills verification</Badge>
          </motion.div>
          <motion.h1 className="h1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
            Your skills deserve more than a <span className="grad-text">certificate.</span>
          </motion.h1>
          <motion.p className="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}>
            Take practical assessments, build a portfolio of evidence, and earn credentials that anyone can verify with a single link.
          </motion.p>
          <motion.div className="row wrap" style={{ marginTop: 30 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.24 }}>
            <Link href="/register" className="btn btn-primary btn-lg">Start proving your skills <ArrowRight size={17} aria-hidden /></Link>
            <Link href="/how-it-works" className="btn btn-lg"><Play size={15} aria-hidden /> See how it works</Link>
          </motion.div>
          <motion.div className="row wrap tiny muted" style={{ marginTop: 26, gap: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {["Server-graded assessments", "Verifiable credential IDs", "Transparent scoring"].map((t) => <span key={t} className="row" style={{ gap: 6 }}><CheckCircle2 size={14} color="#34d399" aria-hidden />{t}</span>)}
          </motion.div>
        </div>
        <motion.div style={{ position: "relative" }} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const skills: [string, number][] = [["Frontend engineering", 88], ["Accessibility", 82], ["JavaScript", 72], ["API design", 64]];
  const bars = [38, 52, 46, 70, 64, 86, 92];
  return (
    <div style={{ position: "relative" }}>
      <div className="mock" role="img" aria-label="Sample dashboard preview showing a ProofScore, skills and a progress chart">
        <div className="between">
          <div className="row"><span className="avatar">AM</span><div><b className="small">Alex Morgan</b><div className="tiny muted">Frontend developer</div></div></div>
          <Badge tone="warn">Sample preview</Badge>
        </div>
        <div className="grid-3" style={{ gap: 10, margin: "18px 0" }}>
          <div className="mini-stat"><strong><CountUp value={86} /></strong><span>ProofScore</span></div>
          <div className="mini-stat"><strong><CountUp value={9} /></strong><span>Skills evidenced</span></div>
          <div className="mini-stat"><strong><CountUp value={3} /></strong><span>Credentials</span></div>
        </div>
        <div className="between tiny muted" style={{ marginBottom: 8 }}><b style={{ color: "var(--text)" }}>Score trend</b><span>Last 7 attempts</span></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 78 }} aria-hidden>
          {bars.map((h, i) => <motion.div key={i} style={{ flex: 1, borderRadius: 6, background: "var(--grad)", opacity: 0.35 + i * 0.09 }} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.07, ease: "easeOut" }} />)}
        </div>
        <div className="stack" style={{ marginTop: 18, gap: 12 }}>
          {skills.map(([n, v]) => <div key={n}><div className="between tiny" style={{ marginBottom: 6 }}><span>{n}</span><span className="muted">{v}%</span></div><ProgressBar value={v} label={n} height={6} /></div>)}
        </div>
      </div>
      <div className="float-chip floaty" style={{ left: -26, top: 54 }}><BadgeCheck size={16} color="#34d399" aria-hidden /> Assessment passed · 100%</div>
      <div className="float-chip floaty" style={{ right: -18, top: -16, animationDelay: "-2s" }}><Trophy size={16} color="#fbbf24" aria-hidden /> Rank #1 this week</div>
      <div className="certificate floaty" style={{ position: "absolute", right: -22, bottom: -34, width: 220, padding: 16, animationDelay: "-3s" }} aria-hidden>
        <div className="tiny" style={{ color: "#5a6ccf", fontWeight: 700, letterSpacing: ".1em" }}>CREDENTIAL · SAMPLE</div>
        <b style={{ display: "block", margin: "6px 0 2px", fontSize: 14 }}>Responsive Web Development</b>
        <span className="tiny" style={{ color: "#5d6a8c" }}>Level 4 · SP-2026-8F2A91</span>
        <img className="seal" src="/assets/seal.svg" alt="" style={{ width: 46, height: 46, right: 10, bottom: 8 }} />
      </div>
    </div>
  );
}

export function StatsStrip() {
  const [s, setS] = useState<{ challenges: number; learners: number; assessments: number; credentials: number } | null>(null);
  useEffect(() => { api<typeof s>("/api/stats").then(setS).catch(() => setS(null)); }, []);
  const items: [string, keyof NonNullable<typeof s>][] = [["Practical challenges", "challenges"], ["Demo learners", "learners"], ["Assessments graded", "assessments"], ["Credentials issued", "credentials"]];
  return (
    <section className="container-x" aria-label="Platform statistics">
      <Reveal>
        <div className="stat-strip">
          {items.map(([label, key]) => (
            <div key={key}><strong className="grad-text">{s ? <CountUp value={s[key]} /> : "—"}</strong><span className="small muted">{label}</span></div>
          ))}
        </div>
        <p className="tiny dim" style={{ marginTop: 10 }}>Live counts from this demo instance{s ? "" : " (start the API to see them)"}.</p>
      </Reveal>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    [ClipboardCheck, "Take a challenge", "Pick a practical assessment in web, data, security or design. Questions are graded on the server, never in your browser."],
    [Code2, "Build evidence", "Add portfolio projects and let each result map to the skills it demonstrates, with the evidence listed next to every level."],
    [Award, "Earn a verifiable credential", "Pass the mark and receive a credential with a unique ID. Anyone can verify it on a public page."],
  ] as const;
  return (
    <section className="section" id="how">
      <div className="container-x">
        <Reveal><div className="section-head"><div className="eyebrow">How it works</div><h2 className="h2">From first attempt to trusted proof</h2><p>Three steps, each leaving a clear trail of evidence behind your score.</p></div></Reveal>
        <div className="grid-3">
          {steps.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 0.1}>
              <div className="card card-hover" style={{ height: "100%" }}>
                <div className="between"><span className="icon-tile"><Icon size={20} aria-hidden /></span><span className="step-num">STEP 0{i + 1}</span></div>
                <h3 className="h3" style={{ marginTop: 18, fontSize: 18 }}>{t}</h3>
                <p className="muted small" style={{ margin: 0, lineHeight: 1.65 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AssessmentShowcase() {
  const options = ["Validate inputs and explain trade-offs", "Skip edge cases to save time", "Hard-code the sample data", "Ignore accessibility"];
  const [sel, setSel] = useState(0);
  return (
    <section className="section">
      <div className="container-x grid-2" style={{ alignItems: "center", gap: 56 }}>
        <Reveal>
          <div className="eyebrow">Assessments</div>
          <h2 className="h2">A testing experience that feels professional</h2>
          <p className="muted" style={{ lineHeight: 1.7 }}>Clear progress, one question at a time, instant structured feedback, and a results breakdown that shows exactly where you stand.</p>
          <div className="stack" style={{ marginTop: 22, gap: 12 }}>
            {["Question counter and progress tracking", "Review answers before you submit", "Per-question feedback on your results"].map((t) => <div key={t} className="row small"><CheckCircle2 size={17} color="#34d399" aria-hidden />{t}</div>)}
          </div>
          <Link href="/challenges" className="btn btn-primary" style={{ marginTop: 26 }}>Browse challenges <ArrowRight size={16} aria-hidden /></Link>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="card">
            <div className="between"><Badge tone="blue">Interactive example</Badge><span className="tiny muted">Question 1 of 4</span></div>
            <div style={{ margin: "14px 0 18px" }}><ProgressBar value={25} label="Example progress" /></div>
            <p style={{ fontSize: 17, lineHeight: 1.5, margin: "0 0 16px", fontWeight: 600 }}>Which approach best demonstrates a reliable solution?</p>
            <div role="radiogroup" aria-label="Example answers" className="stack" style={{ gap: 9 }}>
              {options.map((o, i) => (
                <button key={o} role="radio" aria-checked={sel === i} className="option-card" onClick={() => setSel(i)}><span className="option-key">{String.fromCharCode(65 + i)}</span><span className="small">{o}</span></button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function CredentialShowcase() {
  return (
    <section className="section">
      <div className="container-x grid-2" style={{ alignItems: "center", gap: 56 }}>
        <Reveal>
          <motion.div className="certificate" whileHover={{ rotate: -1, scale: 1.015 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <div className="between"><span className="tiny" style={{ fontWeight: 700, letterSpacing: ".14em", color: "#5a6ccf" }}>SKILLPROOF CREDENTIAL</span><Badge tone="warn">Sample</Badge></div>
            <h3 style={{ fontSize: 24, margin: "22px 0 4px", letterSpacing: "-.02em" }}>Responsive Web Development</h3>
            <p style={{ margin: 0, color: "#5d6a8c" }}>Awarded to <b style={{ color: "#1a2340" }}>Alex Morgan</b></p>
            <div style={{ marginTop: 22, display: "grid", gap: 4, fontSize: 13, color: "#44527a" }}><span>Level 4 · Advanced</span><span>ID: SP-2026-8F2A91</span><span>Issuer: SkillProof Demo Lab</span></div>
            <img className="seal" src="/assets/seal.svg" alt="" loading="lazy" />
            <div style={{ height: 30 }} />
          </motion.div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="eyebrow">Verified credentials</div>
          <h2 className="h2">Proof anyone can check in seconds</h2>
          <p className="muted" style={{ lineHeight: 1.7 }}>Every credential has a unique identifier and a public verification page showing the recipient, skill, level, issuer and status.</p>
          <div className="notice" style={{ margin: "20px 0" }}>Prototype notice: credentials in this demo are not accredited. Sample credentials are clearly labeled.</div>
          <Link href="/verify/SP-2026-8F2A91" className="btn">Try the verification page <ShieldCheck size={16} aria-hidden /></Link>
        </Reveal>
      </div>
    </section>
  );
}

const SAMPLE_BOARD: LeaderRow[] = [
  { rank: 1, user_id: 0, name: "Sample Learner A", points: 275, assessments: 3, badge: "Data Analytics focus" },
  { rank: 2, user_id: 0, name: "Sample Learner B", points: 350, assessments: 4, badge: "Web Development focus" },
  { rank: 3, user_id: 0, name: "Sample Learner C", points: 200, assessments: 3, badge: "Software Engineering focus" },
];
export function LeaderboardShowcase() {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  useEffect(() => { api<LeaderRow[]>("/api/leaderboard").then(setRows).catch(() => setRows(null)); }, []);
  const data = (rows ?? SAMPLE_BOARD).slice(0, 4);
  return (
    <section className="section">
      <div className="container-x">
        <Reveal><div className="section-head"><div className="eyebrow">Achievements</div><h2 className="h2">Friendly competition, grounded in real scores</h2><p>Points are the sum of your best score on each challenge, so retaking improves your rank without inflating it.</p></div></Reveal>
        <Reveal>
          <div className="card">
            <div className="between" style={{ marginBottom: 12 }}><b>Leaderboard</b>{rows ? <Badge tone="ok">Live demo data</Badge> : <Badge tone="warn">Sample data</Badge>}</div>
            {data.map((r, i) => (
              <motion.div key={r.name + i} className="between" style={{ padding: "14px 4px", borderTop: i ? "1px solid var(--line)" : "none" }} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="row"><span style={{ width: 28, textAlign: "center", fontWeight: 700 }}>{r.rank <= 3 ? <Medal size={20} color={["#fbbf24", "#cbd5e1", "#d49a6a"][r.rank - 1]} aria-label={`Rank ${r.rank}`} /> : r.rank}</span>
                  <span className="avatar" style={{ width: 36, height: 36, fontSize: 12 }}>{initials(r.name)}</span><div><b className="small">{r.name}</b><div className="tiny muted">{r.badge}</div></div></div>
                <b>{r.points} pts</b>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Testimonials() {
  const items = [
    ["Jamie P.", "Junior developer", "Seeing which skills each result supported made my portfolio conversations so much easier."],
    ["Riley T.", "Hiring manager", "A verification link beats a PDF. I could check the credential in seconds and see the level."],
    ["Dr. Morgan R.", "Program coordinator", "Cohort-level views would help us spot competency gaps before the final term."],
  ];
  return (
    <section className="section">
      <div className="container-x">
        <Reveal><div className="section-head"><div className="eyebrow">Social proof</div><h2 className="h2">What people could say</h2><p>Illustrative feedback from fictional personas. SkillProof has no real customer testimonials yet.</p></div></Reveal>
        <div className="grid-3">
          {items.map(([n, r, q], i) => (
            <Reveal key={n} delay={i * 0.1}>
              <figure className="card card-hover" style={{ margin: 0, height: "100%" }}>
                <Badge tone="warn">Sample feedback</Badge>
                <blockquote style={{ margin: "14px 0 18px", lineHeight: 1.65, fontSize: 15 }}>“{q}”</blockquote>
                <figcaption className="row"><span className="avatar" style={{ width: 36, height: 36, fontSize: 12 }}>{initials(n)}</span><div><b className="small">{n}</b><div className="tiny muted">{r}</div></div></figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    ["Is SkillProof an accredited certification?", "No. This is a prototype. Assessments are objective questions graded on the server, and credentials are demonstration records, not accredited qualifications."],
    ["How is my score calculated?", "Each assessment score is the share of correct answers. ProofScore blends assessment results (50%), portfolio evidence (30%) and credentials (20%). The weights are illustrative."],
    ["Can answers be seen before I submit?", "No. The API never sends correct answers to the browser. They are revealed in your results after submission."],
    ["How does credential verification work?", "Passing an assessment issues a credential with a unique ID. The public verification page looks the ID up in the registry and shows its details."],
    ["Who is it for?", "Learners building evidence, employers exploring demonstrated skills, and institutions tracking cohort competency."],
  ];
  return (
    <section className="section">
      <div className="container-x" style={{ maxWidth: 820 }}>
        <Reveal><div className="section-head"><div className="eyebrow">FAQ</div><h2 className="h2">Questions, answered</h2></div></Reveal>
        <div className="stack" style={{ gap: 10 }}>
          {items.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.05}>
              <div className="faq-item">
                <button aria-expanded={open === i} aria-controls={`faq-${i}`} id={`faq-btn-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                  {q}<motion.span animate={{ rotate: open === i ? 180 : 0 }}><ChevronDown size={18} aria-hidden /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                      <p className="muted small" style={{ margin: 0, padding: "0 20px 20px", lineHeight: 1.7 }}>{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <div className="card" style={{ textAlign: "center", padding: "56px 24px", position: "relative", overflow: "hidden", backgroundImage: "url(/assets/hero-mesh.svg)", backgroundSize: "cover" }}>
            <h2 className="h2" style={{ maxWidth: 560, margin: "0 auto 12px" }}>Your next proof point is one challenge away</h2>
            <p className="muted" style={{ margin: "0 auto 26px", maxWidth: 480 }}>Create a free account, take an assessment, and see your evidence take shape.</p>
            <div className="row wrap" style={{ justifyContent: "center" }}>
              <Link href="/register" className="btn btn-primary btn-lg">Create free account <ArrowRight size={17} aria-hidden /></Link>
              <Link href="/login" className="btn btn-lg">Try a demo account</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
