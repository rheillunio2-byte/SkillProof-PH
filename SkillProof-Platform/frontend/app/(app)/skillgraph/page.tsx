"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RoleGate } from "@/components/AppShell";
import { CardSkeleton, ErrorState, PageHeader } from "@/components/ui";
import { useApi } from "@/lib/hooks";
import type { Skill, SkillsResponse } from "@/lib/types";

const COLORS: Record<string, string> = { Frontend: "#5b8cff", Data: "#22d3ee", Engineering: "#8b5cf6", Security: "#f472b6", Design: "#fbbf24", Other: "#94a3b8" };

export default function SkillGraphPage() {
  return <RoleGate roles={["learner"]}><Graph /></RoleGate>;
}

function Graph() {
  const { data, error, loading, reload } = useApi<SkillsResponse>("/api/skills");
  const [hover, setHover] = useState<Skill | null>(null);
  const layout = useMemo(() => {
    const groups = new Map<string, Skill[]>();
    (data?.skills ?? []).forEach((s) => groups.set(s.cluster, [...(groups.get(s.cluster) ?? []), s]));
    const names = Array.from(groups.keys());
    const W = 900, H = 560, cx = W / 2, cy = H / 2;
    return names.flatMap((name, gi) => {
      const ang = (gi / names.length) * Math.PI * 2 - Math.PI / 2;
      const hub = { x: cx + Math.cos(ang) * 210, y: cy + Math.sin(ang) * 150 };
      const list = groups.get(name) ?? [];
      return [{ type: "hub" as const, name, ...hub, count: list.length },
        ...list.map((s, i) => {
          const a = (i / list.length) * Math.PI * 2 + ang;
          return { type: "skill" as const, skill: s, hub: name, hx: hub.x, hy: hub.y, x: hub.x + Math.cos(a) * (56 + (i % 2) * 22), y: hub.y + Math.sin(a) * (56 + (i % 2) * 22) };
        })];
    });
  }, [data]);

  return (
    <>
      <PageHeader eyebrow="SkillGraph" title="A map of connected capabilities." sub="Each cluster groups related skills. Bright, larger nodes have more evidence; dim nodes are not yet evidenced." />
      {loading && <CardSkeleton count={1} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="card" style={{ padding: 12 }}>
          <svg viewBox="0 0 900 560" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Network graph of your skills grouped by cluster">
            <defs><radialGradient id="hubGlow"><stop offset="0" stopColor="#fff" stopOpacity=".25" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
            {layout.filter((n) => n.type === "skill").map((n) => n.type === "skill" && (
              <line key={`l-${n.skill.name}`} x1={n.hx} y1={n.hy} x2={n.x} y2={n.y} stroke={COLORS[n.hub] ?? COLORS.Other} strokeOpacity={n.skill.level ? 0.5 : 0.15} strokeWidth={1.5} />
            ))}
            {layout.map((n, i) => n.type === "hub" ? (
              <motion.g key={n.name} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
                <circle cx={n.x} cy={n.y} r={34} fill={COLORS[n.name] ?? COLORS.Other} fillOpacity={0.22} stroke={COLORS[n.name] ?? COLORS.Other} strokeWidth={2} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{n.name}</text>
              </motion.g>
            ) : (
              <motion.g key={n.skill.name} className="graph-node" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.015, type: "spring" }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                onMouseEnter={() => setHover(n.skill)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(n.skill)} onBlur={() => setHover(null)} tabIndex={0} role="img" aria-label={`${n.skill.name}, ${n.skill.level_name}`}>
                <circle cx={n.x} cy={n.y} r={7 + n.skill.level * 2.4} fill={COLORS[n.hub] ?? COLORS.Other} fillOpacity={n.skill.level ? 0.9 : 0.2} />
                <text x={n.x} y={n.y + 22 + n.skill.level * 1.6} textAnchor="middle" fontSize="10.5" fill={n.skill.level ? "#e5ebff" : "#7584a8"}>{n.skill.name}</text>
              </motion.g>
            ))}
          </svg>
          <div className="between wrap" style={{ padding: "6px 10px 10px" }}>
            <div className="row wrap tiny muted" style={{ gap: 14 }}>{Object.entries(COLORS).filter(([k]) => layout.some((n) => n.type === "hub" && n.name === k)).map(([k, c]) => <span key={k} className="row" style={{ gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 99, background: c }} />{k}</span>)}</div>
            <div className="small" aria-live="polite" style={{ minHeight: 20 }}>{hover ? <><b>{hover.name}</b> <span className="muted">· {hover.level_name} · {hover.evidence}</span></> : <span className="dim">Hover or focus a node for details</span>}</div>
          </div>
        </div>
      )}
    </>
  );
}
