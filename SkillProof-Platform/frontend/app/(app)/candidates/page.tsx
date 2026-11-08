"use client";
import { useState } from "react";
import { BookmarkCheck, BookmarkPlus, Search } from "lucide-react";
import { RoleGate } from "@/components/AppShell";
import { Badge, CardSkeleton, EmptyState, ErrorState, PageHeader, Reveal, SampleBadge, initials } from "@/components/ui";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Candidate } from "@/lib/types";

export default function CandidatesPage() {
  return <RoleGate roles={["employer"]}><Candidates /></RoleGate>;
}

function Candidates() {
  const cands = useApi<Candidate[]>("/api/candidates");
  const short = useApi<number[]>("/api/shortlists");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "short">("all");
  const [err, setErr] = useState<string | null>(null);
  const saved = short.data ?? [];
  const visible = (cands.data ?? []).filter((c) => (tab === "all" || saved.includes(c.id)) && `${c.name} ${c.headline} ${c.skills.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()));

  async function toggle(c: Candidate) {
    const has = saved.includes(c.id);
    const prev = saved;
    short.setData(has ? saved.filter((x) => x !== c.id) : [...saved, c.id]); // optimistic
    try {
      if (has) await api(`/api/shortlists/${c.id}`, { method: "DELETE" });
      else await api("/api/shortlists", { method: "POST", body: { candidate_id: c.id } });
      setErr(null);
    } catch (e) { short.setData(prev); setErr((e as Error).message); }
  }
  return (
    <>
      <PageHeader eyebrow="Employer workspace" title="Candidates with demonstrated skills." sub="Fictional demo profiles with evidence summaries. Do not use these rankings for real hiring decisions." />
      <div className="card row wrap" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={16} aria-hidden style={{ position: "absolute", left: 14, top: 14, color: "var(--dim)" }} />
          <input className="input" style={{ paddingLeft: 40 }} placeholder="Search by name or skill…" aria-label="Search candidates" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="row" role="tablist" aria-label="Candidate list">
          <button role="tab" aria-selected={tab === "all"} className={`btn btn-sm ${tab === "all" ? "btn-primary" : ""}`} onClick={() => setTab("all")}>All ({cands.data?.length ?? 0})</button>
          <button role="tab" aria-selected={tab === "short"} className={`btn btn-sm ${tab === "short" ? "btn-primary" : ""}`} onClick={() => setTab("short")}>Shortlist ({saved.length})</button>
        </div>
      </div>
      {err && <div className="notice notice-bad" role="alert" style={{ marginBottom: 14 }}>{err}</div>}
      {cands.loading && <CardSkeleton />}
      {cands.error && <ErrorState message={cands.error} onRetry={cands.reload} />}
      {cands.data && visible.length === 0 && <EmptyState art="empty-results" title={tab === "short" ? "Your shortlist is empty" : "No candidates match"} text={tab === "short" ? "Save candidates from the All tab to keep them here." : "Try a different search."} />}
      <div className="grid-3">
        {visible.map((c, i) => {
          const isSaved = saved.includes(c.id);
          return (
            <Reveal key={c.id} delay={i * 0.06}>
              <div className="card card-hover" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <div className="between"><span className="avatar">{initials(c.name)}</span>{c.sample && <SampleBadge />}</div>
                <h2 className="h3" style={{ marginTop: 14, fontSize: 17 }}>{c.name}</h2>
                <p className="muted small" style={{ margin: "0 0 14px", lineHeight: 1.55 }}>{c.headline}<br /><span className="dim">{c.location}</span></p>
                <div className="between small" style={{ marginBottom: 12 }}><span className="muted">ProofScore</span><span className="row"><Badge tone="blue">{c.level}</Badge><b>{c.proof_score}</b></span></div>
                <div className="row wrap" style={{ gap: 6, flex: 1, alignContent: "flex-start" }}>{c.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
                <div className="tiny dim" style={{ margin: "14px 0" }}>{c.assessments} assessments · {c.credentials} credentials</div>
                <button className={`btn btn-sm ${isSaved ? "btn-primary" : ""}`} aria-pressed={isSaved} onClick={() => toggle(c)}>{isSaved ? <><BookmarkCheck size={14} aria-hidden /> Shortlisted</> : <><BookmarkPlus size={14} aria-hidden /> Add to shortlist</>}</button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
