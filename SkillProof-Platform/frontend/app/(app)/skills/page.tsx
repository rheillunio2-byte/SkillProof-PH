"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { RoleGate } from "@/components/AppShell";
import { Badge, CardSkeleton, EmptyState, ErrorState, LevelDots, PageHeader, ProgressBar, Reveal, ScoreRing } from "@/components/ui";
import { useApi } from "@/lib/hooks";
import type { SkillsResponse } from "@/lib/types";

export default function SkillsPage() {
  return <RoleGate roles={["learner"]}><Skills /></RoleGate>;
}

function Skills() {
  const { data, error, loading, reload } = useApi<SkillsResponse>("/api/skills");
  const [q, setQ] = useState("");
  const [cluster, setCluster] = useState("All");
  const [only, setOnly] = useState(false);
  const skills = data?.skills ?? [];
  const clusters = useMemo(() => ["All", ...Array.from(new Set(skills.map((s) => s.cluster))).sort()], [skills]);
  const shown = skills.filter((s) => (cluster === "All" || s.cluster === cluster) && (!only || s.level > 0) && s.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="Your skill inventory" title="Skills with evidence behind them." sub="Levels summarize demonstrated work: assessment results and portfolio projects, never self-reported labels." />
      {loading && <CardSkeleton count={6} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="grid-wide" style={{ gridTemplateColumns: "1fr 320px", alignItems: "start" }}>
          <div>
            <div className="card" style={{ padding: 14, marginBottom: 18 }}>
              <div className="row wrap">
                <div style={{ position: "relative", flex: "1 1 200px" }}>
                  <Search size={16} aria-hidden style={{ position: "absolute", left: 14, top: 14, color: "var(--dim)" }} />
                  <input className="input" style={{ paddingLeft: 40 }} placeholder="Search skills…" aria-label="Search skills" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <select className="input" style={{ width: "auto" }} aria-label="Filter by cluster" value={cluster} onChange={(e) => setCluster(e.target.value)}>{clusters.map((c) => <option key={c}>{c}</option>)}</select>
                <label className="row small muted" style={{ gap: 8 }}><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Evidenced only</label>
              </div>
            </div>
            {shown.length === 0 ? <EmptyState art="empty-projects" title="No skills match" text="Adjust the search or filters." /> : (
              <div className="grid-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
                {shown.map((s, i) => (
                  <Reveal key={s.name} delay={Math.min(i, 9) * 0.03}>
                    <div className="card card-hover" style={{ padding: 18, height: "100%", opacity: s.level ? 1 : 0.78 }}>
                      <div className="between"><b>{s.name}</b><Badge tone={s.level ? "blue" : "neutral"}>{s.cluster}</Badge></div>
                      <div className="row" style={{ margin: "14px 0 6px" }}><LevelDots level={s.level} /><span className="tiny muted">{s.level ? `L${s.level} · ${s.level_name}` : s.level_name}</span></div>
                      <p className="tiny dim" style={{ margin: "0 0 10px" }}>{s.evidence}</p>
                      {s.assessments_available > 0 && <Link href="/challenges" className="tiny" style={{ color: "#a5b9ff" }}>{s.assessments_available} assessment{s.assessments_available > 1 ? "s" : ""} available →</Link>}
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
          <Reveal><aside className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "grid", placeItems: "center" }}><ScoreRing value={data.proof_score} size={130} label="ProofScore" /></div>
            <div className="stack" style={{ gap: 12, margin: "20px 0 14px", textAlign: "left" }}>
              {([["Assessment outcomes", data.breakdown.assessments, data.weights.assessments], ["Project evidence", data.breakdown.projects, data.weights.projects], ["Credential records", data.breakdown.credentials, data.weights.credentials]] as const).map(([n, v, w]) => (
                <div key={n}><div className="between tiny" style={{ marginBottom: 5 }}><span>{n}</span><span className="dim">{v} · {w}% weight</span></div><ProgressBar value={v} label={n} height={6} /></div>
              ))}
            </div>
            <div className="notice tiny" style={{ textAlign: "left" }}>Weights are illustrative, not a validated psychometric model.</div>
            <Link href="/skillgraph" className="btn btn-sm" style={{ marginTop: 14 }}>Explore SkillGraph</Link>
          </aside></Reveal>
        </div>
      )}
    </>
  );
}
