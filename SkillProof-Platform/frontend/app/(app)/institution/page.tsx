"use client";
import { RoleGate } from "@/components/AppShell";
import { Badge, CardSkeleton, ErrorState, PageHeader, ProgressBar, Reveal, initials } from "@/components/ui";
import { formatDate, useApi } from "@/lib/hooks";
import type { StudentsResponse } from "@/lib/types";

export default function InstitutionPage() {
  return <RoleGate roles={["institution"]}><Students /></RoleGate>;
}

function Students() {
  const { data, error, loading, reload } = useApi<StudentsResponse>("/api/students");
  return (
    <>
      <PageHeader eyebrow="Institution workspace" title="Student overview" sub="Activity and evidence for every learner in this demo cohort." action={<Badge tone="warn">Fictional roster</Badge>} />
      {loading && <CardSkeleton count={2} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <Reveal><div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Status</th><th>Avg score</th><th>Assessments</th><th>Skills</th><th>Credentials</th><th>Last active</th></tr></thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.id}>
                  <td><span className="row"><span className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{initials(s.name)}</span><span><b className="small">{s.name}</b><div className="tiny dim">{s.email}</div></span></span></td>
                  <td><Badge tone={s.assessments ? "ok" : "neutral"}>{s.status}</Badge></td>
                  <td style={{ minWidth: 130 }}>{s.assessments ? <div className="row"><b style={{ width: 38 }}>{s.average_score}%</b><div style={{ flex: 1 }}><ProgressBar value={s.average_score} label={`${s.name} average`} height={6} /></div></div> : <span className="dim">—</span>}</td>
                  <td>{s.assessments}</td><td>{s.competencies}</td><td>{s.credentials}</td><td className="muted">{formatDate(s.last_active)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></Reveal>
      )}
    </>
  );
}
