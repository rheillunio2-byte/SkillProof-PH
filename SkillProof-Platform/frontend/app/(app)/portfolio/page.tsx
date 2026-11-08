"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { RoleGate } from "@/components/AppShell";
import { Badge, CardSkeleton, EmptyState, ErrorState, PageHeader, Reveal, SampleBadge, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Project } from "@/lib/types";

export default function PortfolioPage() {
  return <RoleGate roles={["learner"]}><Portfolio /></RoleGate>;
}

function AddProject({ onClose, onAdded }: { onClose: () => void; onAdded: (p: Project) => void }) {
  const [f, setF] = useState({ title: "", description: "", technologies: "", repository_url: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (f.title.trim().length < 2) return setError("Give the project a title.");
    if (f.description.trim().length < 10) return setError("Describe the project in at least 10 characters.");
    if (f.repository_url && !/^https?:\/\/\S+$/.test(f.repository_url)) return setError("The repository link must start with http:// or https://");
    setBusy(true); setError(null);
    try {
      const p = await api<Project>("/api/portfolio", { method: "POST", body: { ...f, technologies: f.technologies.split(",").map((t) => t.trim()).filter(Boolean) } });
      onAdded(p); onClose();
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="modal-box stack" role="dialog" aria-modal="true" aria-labelledby="add-title" onSubmit={submit} noValidate onClick={(e) => e.stopPropagation()}
        initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.97 }}>
        <div className="between"><h2 className="h3" id="add-title" style={{ fontSize: 19 }}>Add a project</h2><button type="button" className="btn btn-ghost btn-sm" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        <div><label className="label" htmlFor="p-title">Title</label><input id="p-title" className="input" autoFocus value={f.title} onChange={(e) => set("title")(e.target.value)} maxLength={180} /></div>
        <div><label className="label" htmlFor="p-desc">Description</label><textarea id="p-desc" className="input" rows={4} value={f.description} onChange={(e) => set("description")(e.target.value)} maxLength={2000} /></div>
        <div><label className="label" htmlFor="p-tech">Technologies <span className="dim">(comma separated)</span></label><input id="p-tech" className="input" placeholder="React, TypeScript, CSS" value={f.technologies} onChange={(e) => set("technologies")(e.target.value)} /></div>
        <div><label className="label" htmlFor="p-url">Repository URL <span className="dim">(optional)</span></label><input id="p-url" className="input" placeholder="https://github.com/you/project" value={f.repository_url} onChange={(e) => set("repository_url")(e.target.value)} /></div>
        {error && <div className="notice notice-bad" role="alert">{error}</div>}
        <div className="notice notice-info tiny">New projects start as unverified. Verification requires review, which is not part of this prototype.</div>
        <div className="row" style={{ justifyContent: "flex-end" }}><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? <Spinner /> : "Save project"}</button></div>
      </motion.form>
    </motion.div>
  );
}

function Portfolio() {
  const { data, setData, error, loading, reload } = useApi<Project[]>("/api/portfolio");
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  async function remove(p: Project) {
    if (!window.confirm(`Delete “${p.title}”?`)) return;
    try { await api(`/api/portfolio/${p.id}`, { method: "DELETE" }); setData((data ?? []).filter((x) => x.id !== p.id)); setActionError(null); }
    catch (e) { setActionError((e as Error).message); }
  }
  return (
    <>
      <PageHeader eyebrow="Project evidence" title="Work worth showing." sub="Connect real projects to the skills they demonstrate. Technologies you list raise the matching skill evidence."
        action={<button className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={16} aria-hidden /> Add project</button>} />
      {actionError && <div className="notice notice-bad" role="alert" style={{ marginBottom: 14 }}>{actionError}</div>}
      {loading && <CardSkeleton count={2} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState art="empty-projects" title="No projects yet" text="Add a project to build evidence beyond assessments." action={<button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>Add your first project</button>} />}
      {data && data.length > 0 && (
        <div className="grid-3">
          {data.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <article className="card card-hover" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 96, borderRadius: 12, marginBottom: 16, background: `linear-gradient(135deg, hsl(${(p.id * 57) % 360} 70% 38% / .55), rgba(10,18,38,.9))`, border: "1px solid var(--line)", display: "grid", placeItems: "center", fontWeight: 750, fontSize: 28, color: "#dfe7ff" }} aria-hidden>{p.title.slice(0, 2).toUpperCase()}</div>
                <div className="between" style={{ alignItems: "flex-start" }}><h2 className="h3">{p.title}</h2>{p.verified ? <Badge tone="ok"><ShieldCheck size={11} aria-hidden /> Verified</Badge> : <Badge>Unverified</Badge>}</div>
                <p className="muted small" style={{ lineHeight: 1.6, flex: 1 }}>{p.description}</p>
                <div className="row wrap" style={{ gap: 6, marginBottom: 14 }}>{p.technologies.map((t) => <span className="chip" key={t}>{t}</span>)}{p.source === "seed" && <SampleBadge />}</div>
                <div className="between">
                  {p.repository_url ? <a className="row small muted" style={{ gap: 6 }} href={p.repository_url} target="_blank" rel="noopener noreferrer"><Github size={14} aria-hidden /> Repository <ExternalLink size={12} aria-hidden /></a> : <span className="tiny dim">No repository linked</span>}
                  <button className="btn btn-ghost btn-sm btn-danger" aria-label={`Delete ${p.title}`} onClick={() => remove(p)}><Trash2 size={15} /></button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
      <AnimatePresence>{adding && <AddProject onClose={() => setAdding(false)} onAdded={(p) => setData([p, ...(data ?? [])])} />}</AnimatePresence>
    </>
  );
}
