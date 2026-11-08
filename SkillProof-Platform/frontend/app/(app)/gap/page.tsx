"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Target } from "lucide-react";
import { RoleGate } from "@/components/AppShell";
import { Badge, CardSkeleton, ErrorState, LevelDots, PageHeader, ProgressBar, Reveal, ScoreRing } from "@/components/ui";
import { useApi } from "@/lib/hooks";
import type { Challenge, SkillsResponse } from "@/lib/types";

// Sample role profiles: skill name -> target level (illustrative, not a validated career model).
const ROLES: Record<string, Record<string, number>> = {
  "Frontend Developer": { HTML: 4, CSS: 4, React: 3, Accessibility: 3, Debugging: 3 },
  "Data Analyst": { SQL: 3, Python: 3, Visualization: 3, Aggregation: 3, Communication: 2 },
  "Backend Engineer": { "API Design": 3, SQL: 3, Testing: 3, "Data Modeling": 3, Validation: 3, Security: 2 },
  "Security Analyst": { "Threat Modeling": 3, OWASP: 3, Security: 3, Validation: 3, Debugging: 2 },
};

export default function GapPage() {
  return <RoleGate roles={["learner"]}><Gap /></RoleGate>;
}

function Gap() {
  const skills = useApi<SkillsResponse>("/api/skills");
  const chal = useApi<Challenge[]>("/api/challenges");
  const [role, setRole] = useState("Frontend Developer");
  const levels = new Map((skills.data?.skills ?? []).map((s) => [s.name, s.level]));
  const rows = Object.entries(ROLES[role]).map(([name, target]) => ({ name, target, have: levels.get(name) ?? 0 }));
  const readiness = Math.round((rows.reduce((a, r) => a + Math.min(r.have, r.target), 0) / rows.reduce((a, r) => a + r.target, 0)) * 100);
  return (
    <>
      <PageHeader eyebrow="Skill gap analyzer" title="Turn a target role into a learning path." sub="Compare your evidenced skill levels with a sample role profile." />
      {skills.loading && <CardSkeleton count={2} />}
      {skills.error && <ErrorState message={skills.error} onRetry={skills.reload} />}
      {skills.data && (
        <div className="grid-wide" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
          <Reveal><div className="card">
            <label className="label" htmlFor="role">Target role</label>
            <select id="role" className="input" value={role} onChange={(e) => setRole(e.target.value)}>{Object.keys(ROLES).map((r) => <option key={r}>{r}</option>)}</select>
            <div className="stack" style={{ gap: 0, marginTop: 18 }}>
              {rows.map((r, i) => {
                const gap = Math.max(0, r.target - r.have);
                const next = (chal.data ?? []).find((c) => c.skills.includes(r.name));
                return (
                  <div key={r.name} className="between wrap" style={{ padding: "16px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <div style={{ minWidth: 180 }}><b className="small">{r.name}</b>
                      <div className="row tiny muted" style={{ marginTop: 6, gap: 8 }}><LevelDots level={r.have} /> {r.have} of {r.target} needed</div></div>
                    {gap === 0 ? <Badge tone="ok"><CheckCircle2 size={12} aria-hidden /> On target</Badge> : (
                      <div className="row"><Badge tone={gap >= 2 ? "warn" : "blue"}>{gap} level{gap > 1 ? "s" : ""} to go</Badge>
                        {next && <Link href={`/assessment/${next.id}`} className="btn btn-sm"><Target size={13} aria-hidden /> {next.title}</Link>}</div>)}
                  </div>
                );
              })}
            </div>
          </div></Reveal>
          <Reveal delay={0.08}><aside className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "grid", placeItems: "center" }}><ScoreRing value={readiness} size={130} label="Readiness" /></div>
            <div style={{ margin: "16px 0 4px" }}><ProgressBar value={readiness} label="Role readiness" /></div>
            <p className="tiny dim" style={{ lineHeight: 1.6 }}>Rule-based comparison against a sample profile. It is not an AI assessment or validated career advice.</p>
          </aside></Reveal>
        </div>
      )}
    </>
  );
}
