"use client";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { Badge, CardSkeleton, EmptyState, ErrorState, PageHeader, Reveal, initials } from "@/components/ui";
import { useApi } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import type { LeaderRow } from "@/lib/types";

const MEDAL = ["#fbbf24", "#cbd5e1", "#d49a6a"];

export default function LeaderboardPage() {
  const { data, error, loading, reload } = useApi<LeaderRow[]>("/api/leaderboard");
  const { user } = useAuth();
  const top = data?.slice(0, 3) ?? [];
  const order = top.length === 3 ? [top[1], top[0], top[2]] : top;
  return (
    <>
      <PageHeader eyebrow="Achievements" title="Leaderboard" sub="Points are the sum of each learner's best score per challenge, so retakes can only help." action={<Badge tone="warn">Demo data</Badge>} />
      {loading && <CardSkeleton count={3} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState art="empty-results" title="No scores yet" text="Complete an assessment to appear on the leaderboard." />}
      {data && data.length > 0 && (
        <div className="stack" style={{ gap: 20 }}>
          <div className="podium">
            {order.map((r, i) => (
              <motion.div key={r.user_id} className="card" style={{ textAlign: "center", paddingTop: r.rank === 1 ? 34 : 24, paddingBottom: r.rank === 1 ? 34 : 24, borderColor: r.rank === 1 ? "rgba(251,191,36,.45)" : undefined }}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 140 }}>
                {r.rank === 1 ? <Trophy size={26} color={MEDAL[0]} aria-hidden /> : <Medal size={24} color={MEDAL[r.rank - 1]} aria-hidden />}
                <div className="avatar" style={{ margin: "12px auto", width: 52, height: 52 }}>{initials(r.name)}</div>
                <b>{r.name}{user?.id === r.user_id && " (you)"}</b><div className="tiny muted" style={{ margin: "4px 0 10px" }}>{r.badge}</div>
                <div style={{ fontSize: 26, fontWeight: 750 }} className="grad-text">{r.points}</div><div className="tiny dim">points · rank {r.rank}</div>
              </motion.div>
            ))}
          </div>
          <Reveal><div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Rank</th><th>Learner</th><th>Focus</th><th>Assessments</th><th>Points</th></tr></thead>
              <tbody>{data.map((r) => (
                <tr key={r.user_id} style={user?.id === r.user_id ? { background: "rgba(91,140,255,.1)" } : undefined}>
                  <td><b>#{r.rank}</b></td><td><span className="row"><span className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(r.name)}</span>{r.name}{user?.id === r.user_id && <Badge tone="blue">You</Badge>}</span></td>
                  <td className="muted">{r.badge}</td><td>{r.assessments}</td><td><b>{r.points}</b></td>
                </tr>))}</tbody>
            </table>
          </div></Reveal>
        </div>
      )}
    </>
  );
}
