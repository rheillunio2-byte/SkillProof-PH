"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Eye, EyeOff, GraduationCap, User as UserIcon } from "lucide-react";
import { Spinner } from "./ui";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

const DEMO_PASSWORD = "SkillProof!2026";
const DEMOS: { role: Role; label: string; email: string }[] = [
  { role: "learner", label: "Learner", email: "learner@skillproof.demo" },
  { role: "employer", label: "Employer", email: "recruiter@skillproof.demo" },
  { role: "institution", label: "Institution", email: "admin@northstar.demo" },
];
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

function PasswordField({ value, onChange, id = "password", autoComplete }: { value: string; onChange: (v: string) => void; id?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input id={id} className="input" type={show ? "text" : "password"} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} required style={{ paddingRight: 44 }} />
      <button type="button" className="btn btn-ghost btn-sm" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} style={{ position: "absolute", right: 4, top: 4 }}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) router.replace(next); }, [user, next, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await login(email, password); router.replace(next); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="eyebrow">Welcome back</div>
      <h1 className="h2" style={{ marginTop: 8 }}>Sign in to SkillProof</h1>
      <form onSubmit={submit} className="stack" style={{ marginTop: 22 }} noValidate>
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} required aria-invalid={!!error} /></div>
        <div><label className="label" htmlFor="password">Password</label>
          <PasswordField value={password} onChange={setPassword} autoComplete="current-password" /></div>
        {error && <div className="notice notice-bad" role="alert">{error}</div>}
        <button className="btn btn-primary btn-lg" disabled={busy || !email || !password}>{busy ? <Spinner /> : <>Sign in <ArrowRight size={16} aria-hidden /></>}</button>
      </form>
      <div className="card-flat" style={{ marginTop: 22 }}>
        <b className="small">Try a demo account</b>
        <p className="tiny muted" style={{ margin: "4px 0 12px" }}>Fictional accounts for exploring each role. Password: <code>{DEMO_PASSWORD}</code></p>
        <div className="row wrap" style={{ gap: 8 }}>
          {DEMOS.map((d) => <button type="button" key={d.role} className="btn btn-sm" onClick={() => { setEmail(d.email); setPassword(DEMO_PASSWORD); setError(null); }}>{d.label}</button>)}
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 20 }}>New here? <Link href="/register" className="grad-text" style={{ fontWeight: 600 }}>Create an account</Link></p>
    </motion.div>
  );
}

export function RegisterForm() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "learner" as Role });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const problems = [
    form.name.trim().length < 2 && "Enter your name.",
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) && "Enter a valid email address.",
    form.password.length < 8 && "Use at least 8 characters for your password.",
  ].filter(Boolean) as string[];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (problems.length) { setError(problems[0]); return; }
    setBusy(true); setError(null);
    try { await register({ ...form, name: form.name.trim() }); router.replace("/dashboard"); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  const roles: { role: Role; label: string; icon: typeof UserIcon }[] = [{ role: "learner", label: "Learner", icon: UserIcon }, { role: "employer", label: "Employer", icon: Briefcase }, { role: "institution", label: "Institution", icon: GraduationCap }];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="eyebrow">Join SkillProof</div>
      <h1 className="h2" style={{ marginTop: 8 }}>Create your account</h1>
      <form onSubmit={submit} className="stack" style={{ marginTop: 22 }} noValidate>
        <div role="radiogroup" aria-label="Account type" className="grid-3" style={{ gap: 8 }}>
          {roles.map((r) => (
            <button type="button" key={r.role} role="radio" aria-checked={form.role === r.role} className="option-card" style={{ flexDirection: "column", padding: 12, gap: 6, textAlign: "center" }} onClick={() => set("role")(r.role)}>
              <r.icon size={18} aria-hidden /><span className="tiny">{r.label}</span>
            </button>
          ))}
        </div>
        <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" value={form.name} autoComplete="name" onChange={(e) => set("name")(e.target.value)} required /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" className="input" type="email" value={form.email} autoComplete="email" onChange={(e) => set("email")(e.target.value)} required /></div>
        <div><label className="label" htmlFor="password">Password</label><PasswordField value={form.password} onChange={set("password")} autoComplete="new-password" />
          <div className="tiny dim" style={{ marginTop: 6 }}>At least 8 characters.</div></div>
        {error && <div className="notice notice-bad" role="alert">{error}</div>}
        <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? <Spinner /> : <>Create account <ArrowRight size={16} aria-hidden /></>}</button>
      </form>
      <p className="tiny dim" style={{ marginTop: 14, lineHeight: 1.5 }}>Prototype: employer and institution accounts are not identity-verified.</p>
      <p className="small muted" style={{ marginTop: 14 }}>Already registered? <Link href="/login" className="grad-text" style={{ fontWeight: 600 }}>Sign in</Link></p>
    </motion.div>
  );
}
