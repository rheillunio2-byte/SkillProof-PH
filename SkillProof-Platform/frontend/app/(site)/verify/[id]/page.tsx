"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge, ErrorState, LevelDots, Skeleton } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { formatDate } from "@/lib/hooks";
import type { VerifyResult } from "@/lib/types";

type State = { kind: "loading" } | { kind: "ok"; data: VerifyResult } | { kind: "missing" } | { kind: "error"; message: string };

export default function Verify() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tick, setTick] = useState(0);
  const [lookup, setLookup] = useState("");
  useEffect(() => {
    setState({ kind: "loading" });
    api<VerifyResult>(`/api/credentials/${encodeURIComponent(id)}/verify`)
      .then((data) => setState({ kind: "ok", data }))
      .catch((e: ApiError) => setState(e.status === 404 ? { kind: "missing" } : { kind: "error", message: e.message }));
  }, [id, tick]);

  return (
    <section className="container-x" style={{ minHeight: "72vh", display: "grid", placeItems: "center", padding: "56px 24px" }}>
      <div style={{ width: "min(620px,100%)" }}>
        <div className="eyebrow" style={{ textAlign: "center", marginBottom: 14 }}>Public credential registry</div>
        {state.kind === "loading" && <div className="card stack" role="status" aria-label="Checking credential"><Skeleton h={40} w={40} /><Skeleton h={28} w="70%" /><Skeleton h={80} /></div>}
        {state.kind === "error" && <ErrorState message={state.message} onRetry={() => setTick((t) => t + 1)} />}
        {state.kind === "missing" && (
          <motion.div className="card" style={{ textAlign: "center", padding: 36 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <ShieldAlert size={44} color="#fbbf24" aria-hidden />
            <h1 className="h2" style={{ marginTop: 14 }}>Credential not found</h1>
            <p className="muted small">No record matches <code>{id}</code>. Check the ID for typos.</p>
          </motion.div>
        )}
        {state.kind === "ok" && (
          <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="between">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                {state.data.valid ? <ShieldCheck size={46} color="#34d399" aria-hidden /> : <ShieldAlert size={46} color="#fbbf24" aria-hidden />}
              </motion.span>
              <div className="row">{state.data.valid ? <Badge tone="ok">Record valid</Badge> : <Badge tone="bad">{state.data.status}</Badge>}<Badge tone="warn">{state.data.source === "seed" ? "Sample · demo data" : "Demo credential"}</Badge></div>
            </div>
            <h1 className="h2" style={{ marginTop: 16 }}>{state.data.skill}</h1>
            <p className="muted small" style={{ marginTop: 0 }}>{state.data.message}</p>
            <div className="stack" style={{ marginTop: 18, gap: 0 }}>
              {([["Credential ID", <b key="a">{state.data.credential_id}</b>], ["Recipient", <b key="b">{state.data.recipient}</b>], ["Level", <span key="c" className="row"><LevelDots level={state.data.level} /><b>{state.data.level_name}</b></span>], ["Issuer", <b key="d">{state.data.issuer}</b>], ["Issued", <b key="e">{formatDate(state.data.issued_at)}</b>]] as [string, ReactNode][]).map(([k, v], i) => (
                <div key={k} className="between small" style={{ padding: "13px 0", borderTop: i ? "1px solid var(--line)" : "none" }}><span className="muted">{k}</span>{v}</div>
              ))}
            </div>
          </motion.div>
        )}
        <form className="row" style={{ marginTop: 22 }} onSubmit={(e) => { e.preventDefault(); if (lookup.trim()) window.location.href = `/verify/${encodeURIComponent(lookup.trim())}`; }}>
          <input className="input" aria-label="Credential ID" placeholder="Verify another ID, e.g. SP-2026-8F2A91" value={lookup} onChange={(e) => setLookup(e.target.value)} />
          <button className="btn" aria-label="Verify"><Search size={16} /></button>
        </form>
        <p className="tiny dim" style={{ textAlign: "center", marginTop: 14 }}>Verification confirms a matching record in the prototype registry only. <Link href="/" className="muted">Back to SkillProof</Link></p>
      </div>
    </section>
  );
}
