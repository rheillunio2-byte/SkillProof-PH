"use client";
import { useReducedMotion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tip = { background: "#0d1530", border: "1px solid rgba(148,163,255,.3)", borderRadius: 10, color: "#eef2ff", fontSize: 12 };
const axis = { fill: "#8a98ba", fontSize: 11 };

export function TrendChart({ data }: { data: { label: string; score: number }[] }) {
  const reduce = useReducedMotion();
  return (
    <div style={{ height: 240 }} role="img" aria-label={`Score trend across ${data.length} assessments`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b8cff" stopOpacity={0.55} /><stop offset="1" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke="rgba(148,163,255,.1)" vertical={false} />
          <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tip} formatter={(v) => [`${v}%`, "Score"]} />
          <Area type="monotone" dataKey="score" stroke="#7c9bff" strokeWidth={2.5} fill="url(#trendFill)" isAnimationActive={!reduce} animationDuration={1200} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillRadar({ data }: { data: { name: string; level: number }[] }) {
  const reduce = useReducedMotion();
  return (
    <div style={{ height: 260 }} role="img" aria-label="Radar chart of your top skill levels">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(148,163,255,.2)" />
          <PolarAngleAxis dataKey="name" tick={{ ...axis, fontSize: 10.5 }} />
          <Tooltip contentStyle={tip} formatter={(v) => [`Level ${v}`, "Skill"]} />
          <Radar dataKey="level" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} isAnimationActive={!reduce} animationDuration={1000} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreBars({ data }: { data: { name: string; score: number }[] }) {
  const reduce = useReducedMotion();
  return (
    <div style={{ height: 240 }} role="img" aria-label="Average score per learner">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs><linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b8cff" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
          <CartesianGrid stroke="rgba(148,163,255,.1)" vertical={false} />
          <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tip} cursor={{ fill: "rgba(255,255,255,.05)" }} formatter={(v) => [`${v}%`, "Average"]} />
          <Bar dataKey="score" fill="url(#barFill)" radius={[8, 8, 0, 0]} isAnimationActive={!reduce} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
