"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Award, Briefcase, CheckCircle2, FolderKanban, GraduationCap, Lock, Target, Trophy, Users } from "lucide-react";
import { Badge, CardSkeleton, CountUp, ErrorState, EmptyState, PageHeader, ProgressBar, Reveal, SampleBadge, ScoreRing, Skeleton, difficultyTone } from "./ui";
import { ScoreBars, SkillRadar, TrendChart } from "./charts";
import { useApi, formatDate } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import type { Candidate, Dashboard, StudentsResponse } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function StatCard({ icon: Icon, label, value, suffix, hint, i }: { icon: typeof Activity; label: string; value: number; suffix?: string; hint: string; i: number }) {
  return (
    <Reveal delay={i * 0.07}>
      <div className="card card-hover">
        <div className="between"><span className="small muted">{label}</span><span className="icon-tile" style={{ width: 34, height: 34 }}><Icon size={16} aria-hidden /></span></div>
        <div style={{ fontSize: 34, fontWeight: 750, letterSpacing: "-.03em", margin: "10px 0 2px" }}><CountUp value={value} suffix={suffix} /></div>
        <span className="tiny dim">{hint}</span>
      </div>
    </Reveal>
  );
}

export function LearnerDashboard() {
  const { data, error, loading, reload } = useApi<Dashboard>("/api/dashboard");
  const { user } = useAuth();
  const [hello, setHello] = useState("Welcome");
  useEffect(() => setHello(greeting()), []);
  const first = user?.name.split(" ")[0] ?? "";
  return (
    <>
      <PageHeader eyebrow="Overview" title={`${hello}, ${first}.`} sub="A clear view of your skill evidence, progress and next steps."
        action={<Link href="/challenges" className="btn btn-primary">Find a challenge <ArrowRight size={16} aria-hidden /></Link>} />
      {loading && <div className="stack"><CardSkeleton count={3} /><Skeleton h={260} /></div>}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="stack" style={{ gap: 18 }}>
          {data.has_sample_data && <div className="notice notice-info">Your account includes <b>sample activity</b> (labeled “Sample data”) so the dashboard has something to show. Anything you complete now is saved as live data.</div>}
          <div className="grid-4">
            <Reveal>
              <div className="card" style={{ display: "grid", placeItems: "center", textAlign: "center", gap: 6 }}>
                <ScoreRing value={data.proof_score} size={118} label="ProofScore" />
                <Badge tone="blue">{data.proof_label}</Badge>
              </div>
            </Reveal>
            <StatCard i={1} icon={Target} label="Assessments" value={data.stats.assessments} hint={`Average ${data.stats.average_score}%`} />
            <StatCard i={2} icon={Activity} label="Skills evidenced" value={data.stats.skills} hint="Across assessments and projects" />
            <StatCard i={3} icon={Award} label="Credentials" value={data.stats.credentials} hint={`${data.stats.projects} portfolio project${data.stats.projects === 1 ? "" : "s"}`} />
          </div>

          <div className="grid-wide">
            <Reveal><div className="card"><div className="between"><h2 className="h3">Score trend</h2><span className="tiny dim">Every attempt, oldest to newest</span></div>
              {data.trend.length ? <TrendChart data={data.trend} /> : <p className="muted small">Complete an assessment to see your trend.</p>}</div></Reveal>
            <Reveal delay={0.08}><div className="card"><h2 className="h3">Skill profile</h2>
              {data.skills.length >= 3 ? <SkillRadar data={data.skills.slice(0, 6).map((s) => ({ name: s.name, level: s.level }))} /> : <p className="muted small">Evidence in three or more skills unlocks the radar.</p>}</div></Reveal>
          </div>

          <div className="grid-2">
            <Reveal><div className="card">
              <div className="between"><h2 className="h3">Recommended next</h2><Link href="/challenges" className="small muted">View all →</Link></div>
              <div className="stack" style={{ gap: 0, marginTop: 8 }}>
                {data.recommended.map((c, i) => (
                  <Link href={`/assessment/${c.id}`} key={c.id} className="between" style={{ padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <div><b className="small">{c.title}</b><div className="tiny muted" style={{ marginTop: 4 }}>{c.category} · {c.duration} min</div></div>
                    <div className="row"><Badge tone={difficultyTone(c.difficulty)}>{c.difficulty}</Badge><ArrowRight size={15} className="muted" aria-hidden /></div>
                  </Link>
                ))}
              </div>
            </div></Reveal>
            <Reveal delay={0.08}><div className="card">
              <h2 className="h3">Recent activity</h2>
              <div className="stack" style={{ gap: 0, marginTop: 8 }}>
                {data.events.length === 0 && <p className="muted small">No activity yet.</p>}
                {data.events.map((e, i) => (
                  <div key={e.at + e.title} className="between" style={{ padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none", alignItems: "flex-start" }}>
                    <div><div className="small">{e.title}</div><div className="tiny dim" style={{ marginTop: 3 }}>{e.detail} · {formatDate(e.at)}</div></div>
                    {e.source === "seed" && <SampleBadge />}
                  </div>
                ))}
              </div>
            </div></Reveal>
          </div>

          <div className="grid-2">
            <Reveal><div className="card"><h2 className="h3">Achievements</h2>
              <div className="stack" style={{ gap: 14, marginTop: 14 }}>
                {data.achievements.map((a, i) => (
                  <motion.div key={a.id} className="row" style={{ alignItems: "flex-start" }} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <span className="icon-tile" style={{ width: 36, height: 36, opacity: a.earned ? 1 : 0.55 }}>{a.earned ? <CheckCircle2 size={17} color="#34d399" aria-hidden /> : <Lock size={15} aria-hidden />}</span>
                    <div style={{ flex: 1 }}>
                      <div className="between"><b className="small">{a.title}</b><span className="tiny dim">{a.progress}/{a.target}</span></div>
                      <div className="tiny muted" style={{ margin: "2px 0 7px" }}>{a.description}</div>
                      <ProgressBar value={a.progress} max={a.target} label={`${a.title} progress`} height={5} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div></Reveal>
            <Reveal delay={0.08}><div className="card">
              <div className="between"><h2 className="h3">Credentials</h2><Link href="/credentials" className="small muted">Manage →</Link></div>
              {data.credentials.length === 0 ? <p className="muted small">Pass an assessment with 70% or more to earn your first credential.</p> : (
                <div className="stack" style={{ marginTop: 10 }}>
                  {data.credentials.map((c) => (
                    <Link href={`/verify/${c.credential_id}`} key={c.credential_id} className="card-flat between card-hover">
                      <div className="row"><span className="icon-tile" style={{ width: 36, height: 36 }}><Award size={17} aria-hidden /></span><div><b className="small">{c.skill}</b><div className="tiny dim">{c.credential_id} · Level {c.level}</div></div></div>
                      {c.source === "seed" ? <SampleBadge /> : <Badge tone="ok">Valid</Badge>}
                    </Link>
                  ))}
                </div>
              )}
              <hr className="divider" />
              <div className="between small"><span className="muted">ProofScore breakdown</span></div>
              <div className="stack" style={{ gap: 10, marginTop: 10 }}>
                {([["Assessments", data.breakdown.assessments, "50%"], ["Projects", data.breakdown.projects, "30%"], ["Credentials", data.breakdown.credentials, "20%"]] as const).map(([n, v, w]) => (
                  <div key={n}><div className="between tiny" style={{ marginBottom: 5 }}><span>{n} <span className="dim">· weight {w}</span></span><b>{v}</b></div><ProgressBar value={v} label={`${n} component`} height={5} /></div>
                ))}
              </div>
            </div></Reveal>
          </div>
          <p className="tiny dim">{"Prototype scoring: objective questions only. ProofScore weights are illustrative, not a validated model."}</p>
        </div>
      )}
    </>
  );
}

export function EmployerDashboard() {
  const cands = useApi<Candidate[]>("/api/candidates");
  const short = useApi<number[]>("/api/shortlists");
  const list = cands.data ?? [];
  const avg = list.length ? Math.round(list.reduce((a, c) => a + c.proof_score, 0) / list.length) : 0;
  return (
    <>
      <PageHeader eyebrow="Employer workspace" title="Find demonstrated talent." sub="Explore candidates by the evidence behind their skills."
        action={<Link href="/candidates" className="btn btn-primary">Browse candidates <ArrowRight size={16} aria-hidden /></Link>} />
      {cands.loading && <CardSkeleton />}
      {cands.error && <ErrorState message={cands.error} onRetry={cands.reload} />}
      {cands.data && (
        <div className="stack" style={{ gap: 18 }}>
          <div className="grid-3">
            <StatCard i={0} icon={Users} label="Candidates with evidence" value={list.length} hint="Demo profiles" />
            <StatCard i={1} icon={Briefcase} label="On your shortlist" value={short.data?.length ?? 0} hint="Saved to your account" />
            <StatCard i={2} icon={Activity} label="Average ProofScore" value={avg} hint="Across candidates" />
          </div>
          <Reveal><div className="card"><h2 className="h3">Top candidates</h2>
            {list.length === 0 ? <p className="muted small">No candidates have assessment evidence yet.</p> : list.slice(0, 4).map((c, i) => (
              <div key={c.id} className="between" style={{ padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div><b className="small">{c.name}</b><div className="tiny muted">{c.headline}</div></div>
                <div className="row"><div className="row only-desktop" style={{ gap: 6 }}>{c.skills.slice(0, 3).map((s) => <span className="chip" key={s}>{s}</span>)}</div><b>{c.proof_score}</b></div>
              </div>
            ))}
          </div></Reveal>
          <p className="tiny dim">Candidate profiles are fictional. Evidence summaries must not be used for real hiring decisions.</p>
        </div>
      )}
    </>
  );
}

export function InstitutionDashboard() {
  const { data, error, loading, reload } = useApi<StudentsResponse>("/api/students");
  return (
    <>
      <PageHeader eyebrow="Institution workspace" title="Competency, cohort by cohort." sub="A live overview of learner activity and evidence."
        action={<Link href="/institution" className="btn btn-primary">Open roster <ArrowRight size={16} aria-hidden /></Link>} />
      {loading && <CardSkeleton count={3} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="stack" style={{ gap: 18 }}>
          <div className="grid-4">
            <StatCard i={0} icon={GraduationCap} label="Learners" value={data.summary.learners} hint={`${data.summary.active} active`} />
            <StatCard i={1} icon={Target} label="Assessments" value={data.summary.assessments} hint="Graded attempts" />
            <StatCard i={2} icon={Trophy} label="Average score" value={data.summary.average_score} suffix="%" hint="Active learners" />
            <StatCard i={3} icon={FolderKanban} label="Credentials" value={data.summary.credentials} hint="Issued in this demo" />
          </div>
          <Reveal><div className="card"><h2 className="h3">Average score per learner</h2>
            {data.students.some((s) => s.assessments) ? <ScoreBars data={data.students.filter((s) => s.assessments).map((s) => ({ name: s.name.split(" ")[0], score: s.average_score }))} /> :
              <EmptyState art="empty-results" title="No assessment data yet" text="Charts appear once learners complete assessments." />}</div></Reveal>
        </div>
      )}
    </>
  );
}
