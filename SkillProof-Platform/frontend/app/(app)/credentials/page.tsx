"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { RoleGate } from "@/components/AppShell";
import { Badge, CardSkeleton, EmptyState, ErrorState, LevelDots, PageHeader, Reveal, SampleBadge } from "@/components/ui";
import { formatDate, useApi } from "@/lib/hooks";
import type { Credential } from "@/lib/types";

export default function CredentialsPage() {
  return <RoleGate roles={["learner"]}><Credentials /></RoleGate>;
}

function CopyLink({ id }: { id: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  async function copy() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/verify/${id}`); setState("ok"); }
    catch { setState("fail"); }
    setTimeout(() => setState("idle"), 2000);
  }
  return <button className="btn btn-sm" style={{ color: "#1a2340", background: "#fff", borderColor: "#c9d3f5" }} onClick={copy}>{state === "ok" ? <><Check size={13} aria-hidden /> Copied</> : state === "fail" ? "Copy failed" : <><Copy size={13} aria-hidden /> Copy link</>}</button>;
}

function Credentials() {
  const { data, error, loading, reload } = useApi<Credential[]>("/api/credentials");
  return (
    <>
      <PageHeader eyebrow="Digital credentials" title="Proof that can be checked." sub="Each credential has a unique ID and a public verification page. These are demonstration records, not accredited qualifications." />
      {loading && <CardSkeleton count={2} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState art="empty-credentials" title="No credentials yet" text="Score 70% or more on an assessment to earn your first credential." action={<Link href="/challenges" className="btn btn-primary btn-sm">Find a challenge</Link>} />}
      {data && data.length > 0 && (
        <div className="grid-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {data.map((c, i) => (
            <Reveal key={c.credential_id} delay={i * 0.08}>
              <article className="certificate" style={{ minHeight: 250 }}>
                <div className="between"><span className="tiny" style={{ fontWeight: 700, letterSpacing: ".14em", color: "#5a6ccf" }}>SKILLPROOF CREDENTIAL</span>{c.source === "seed" ? <SampleBadge /> : <Badge tone="blue">Demo · live</Badge>}</div>
                <h2 style={{ fontSize: 21, margin: "18px 0 4px", letterSpacing: "-.02em" }}>{c.skill}</h2>
                <p style={{ margin: "0 0 12px", color: "#5d6a8c", fontSize: 14 }}>Awarded to <b style={{ color: "#1a2340" }}>{c.recipient}</b></p>
                <div className="row" style={{ color: "#44527a", fontSize: 13, gap: 10 }}><LevelDots level={c.level} /> {c.level_name}</div>
                <div style={{ fontSize: 12, color: "#5d6a8c", margin: "10px 0 16px", lineHeight: 1.7 }}>{c.credential_id}<br />Issued {formatDate(c.issued_at)} · {c.issuer}<br />Status: <b style={{ color: c.status === "valid" ? "#12805c" : "#b45309" }}>{c.status}</b></div>
                <div className="row" style={{ gap: 8, position: "relative", zIndex: 1 }}>
                  <Link href={`/verify/${c.credential_id}`} className="btn btn-sm" style={{ color: "#1a2340", background: "#fff", borderColor: "#c9d3f5" }}>Verify <ExternalLink size={12} aria-hidden /></Link>
                  <CopyLink id={c.credential_id} />
                </div>
                <img className="seal" src="/assets/seal.svg" alt="" loading="lazy" />
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
