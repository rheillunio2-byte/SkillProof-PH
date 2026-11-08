"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, ListChecks, Search, SearchX } from "lucide-react";
import { Badge, CardSkeleton, EmptyState, ErrorState, PageHeader, Reveal, difficultyTone } from "@/components/ui";
import { useApi } from "@/lib/hooks";
import type { Challenge } from "@/lib/types";

export default function ChallengesPage() {
  const { data, error, loading, reload } = useApi<Challenge[]>("/api/challenges");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [diff, setDiff] = useState("All");
  const items = data ?? [];
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((c) => c.category)))], [items]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((c) => (cat === "All" || c.category === cat) && (diff === "All" || c.difficulty === diff) &&
      `${c.title} ${c.description} ${c.skills.join(" ")}`.toLowerCase().includes(needle));
  }, [items, q, cat, diff]);
  const reset = () => { setQ(""); setCat("All"); setDiff("All"); };

  return (
    <>
      <PageHeader eyebrow="Challenge arena" title="Find your next proof point." sub="Practical assessments with clear skills and server-graded results." action={data && <Badge tone="blue">{items.length} challenges</Badge>} />
      <div className="card" style={{ padding: 14, marginBottom: 22 }}>
        <div className="row wrap">
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={16} aria-hidden style={{ position: "absolute", left: 14, top: 14, color: "var(--dim)" }} />
            <input className="input" style={{ paddingLeft: 40 }} placeholder="Search challenges, skills or topics…" aria-label="Search challenges" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input" style={{ width: "auto", flex: "0 1 200px" }} aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="input" style={{ width: "auto", flex: "0 1 170px" }} aria-label="Filter by difficulty" value={diff} onChange={(e) => setDiff(e.target.value)}>{["All", "Beginner", "Intermediate", "Advanced"].map((d) => <option key={d}>{d}</option>)}</select>
        </div>
      </div>
      {loading && <CardSkeleton count={6} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && filtered.length === 0 && <EmptyState art="empty-results" title="No challenges match" text="Try a different search term or clear the filters." action={<button className="btn btn-sm" onClick={reset}><SearchX size={14} aria-hidden /> Clear filters</button>} />}
      {data && filtered.length > 0 && (
        <>
          <p className="tiny dim" aria-live="polite" style={{ margin: "0 0 12px" }}>{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
          <div className="grid-3">
            {filtered.map((c, i) => (
              <Reveal key={c.id} delay={Math.min(i, 8) * 0.04}>
                <Link href={`/assessment/${c.id}`} className="card card-hover" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="between"><Badge>{c.category}</Badge><Badge tone={difficultyTone(c.difficulty)}>{c.difficulty}</Badge></div>
                  <h2 className="h3" style={{ marginTop: 16, fontSize: 17 }}>{c.title}</h2>
                  <p className="muted small" style={{ margin: "0 0 14px", lineHeight: 1.6, flex: 1 }}>{c.description}</p>
                  <div className="row wrap" style={{ gap: 6 }}>{c.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
                  <div className="between tiny muted" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                    <span className="row" style={{ gap: 12 }}><span className="row" style={{ gap: 5 }}><Clock3 size={13} aria-hidden />{c.duration} min</span><span className="row" style={{ gap: 5 }}><ListChecks size={13} aria-hidden />{c.question_count} questions</span></span>
                    <span style={{ color: "#a5b9ff", fontWeight: 600 }}>Open →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </>
  );
}
