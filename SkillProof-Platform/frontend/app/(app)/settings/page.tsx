"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Badge, PageHeader, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: user?.name ?? "", headline: user?.headline ?? "", location: user?.location ?? "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!user) return null;
  async function save(e: FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2) return setMsg({ ok: false, text: "Name must be at least 2 characters." });
    setBusy(true); setMsg(null);
    try { setUser(await api<User>("/api/auth/me", { method: "PATCH", body: f })); setMsg({ ok: true, text: "Profile saved." }); }
    catch (err) { setMsg({ ok: false, text: (err as Error).message }); }
    setBusy(false);
  }
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" sub="Update how you appear across SkillProof." />
      <form className="card stack" style={{ maxWidth: 640 }} onSubmit={save} noValidate>
        <div className="between"><h2 className="h3">Profile</h2><Badge tone="blue">{user.role}</Badge></div>
        <div><label className="label" htmlFor="s-name">Display name</label><input id="s-name" className="input" value={f.name} maxLength={120} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-head">Headline</label><input id="s-head" className="input" value={f.headline} maxLength={180} onChange={(e) => setF({ ...f, headline: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-loc">Location</label><input id="s-loc" className="input" value={f.location} maxLength={120} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
        <div><label className="label" htmlFor="s-mail">Email</label><input id="s-mail" className="input" value={user.email} readOnly aria-readonly /></div>
        {msg && <div className={`notice ${msg.ok ? "notice-info" : "notice-bad"}`} role={msg.ok ? "status" : "alert"}>{msg.text}</div>}
        <div className="between"><button className="btn btn-primary" disabled={busy}>{busy ? <Spinner /> : "Save changes"}</button>
          <button type="button" className="btn btn-danger" onClick={() => { logout(); router.push("/"); }}><LogOut size={15} aria-hidden /> Sign out</button></div>
      </form>
    </>
  );
}
