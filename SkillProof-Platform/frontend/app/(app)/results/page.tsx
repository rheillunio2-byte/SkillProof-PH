"use client";
import Link from "next/link";
import { RoleGate } from "@/components/AppShell";
import { Badge, CardSkeleton, EmptyState, ErrorState, PageHeader, ProgressBar, Reveal, SampleBadge } from "@/components/ui";
import { formatDate, formatDuration, useApi } from "@/lib/hooks";
import type { Attempt } from "@/lib/types";

export default function ResultsPage() {
  return <RoleGate roles={["learner"]}><Results /></RoleGate>;
}

function Results() {
  const { data, error, loading, reload } = useApi<Attempt[]>("/api/attempts");
  return (
    <>
      <PageHeader eyebrow="Assessment history" title="Your results, with context." sub="Every graded attempt, newest first. Retakes are kept; your best score per challenge counts toward skills." />
      {loading && <CardSkeleton count={2} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState art="empty-results" title="No attempts yet" text="Your graded assessments will appear here." action={<Link href="/challenges" className="btn btn-primary btn-sm">Browse challenges</Link>} />}
      {data && data.length > 0 && (
        <Reveal><div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Assessment</th><th>Score</th><th>Correct</th><th>Time</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td><b className="small">{a.title}</b><div className="tiny dim">{a.category}</div></td>
                  <td style={{ minWidth: 150 }}><div className="row"><b style={{ width: 42 }}>{a.score}%</b><div style={{ flex: 1 }}><ProgressBar value={a.score} label={`${a.title} score`} height={6} /></div></div></td>
                  <td>{a.correct}/{a.total}</td>
                  <td>{a.seconds ? formatDuration(a.seconds) : "—"}</td>
                  <td>{formatDate(a.created_at)} {a.source === "seed" && <SampleBadge />}</td>
                  <td><Link href={`/assessment/${a.challenge_id}`} className="btn btn-sm">Retake</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></Reveal>
      )}
      {data && <p className="tiny dim" style={{ marginTop: 14 }}><Badge tone="warn">Note</Badge> Sample rows come from seeded demo data; rows without a label are your live attempts.</p>}
    </>
  );
}
