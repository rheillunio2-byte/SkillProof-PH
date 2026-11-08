import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Award, BarChart3, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui";

const points = [[ShieldCheck, "Server-graded assessments", "Answers are never sent to your browser before you submit."], [Award, "Verifiable credentials", "Every credential gets a unique ID anyone can check."], [BarChart3, "Evidence you can explain", "ProofScore shows exactly what is behind each number."]] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", minHeight: "100vh" }} className="auth-split">
      <aside className="only-desktop-auth" style={{ position: "relative", padding: 48, display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundImage: "url(/assets/hero-mesh.svg)", backgroundSize: "cover", borderRight: "1px solid var(--line)" }}>
        <Logo />
        <div style={{ maxWidth: 420 }}>
          <h2 className="h2">Evidence beats <span className="grad-text">claims.</span></h2>
          <div className="stack" style={{ marginTop: 28, gap: 20 }}>
            {points.map(([Icon, t, d]) => (
              <div className="row" style={{ alignItems: "flex-start" }} key={t}><span className="icon-tile"><Icon size={19} aria-hidden /></span><div><b className="small">{t}</b><p className="muted small" style={{ margin: "3px 0 0", lineHeight: 1.55 }}>{d}</p></div></div>
            ))}
          </div>
        </div>
        <span className="tiny dim">Prototype · fictional demo data</span>
      </aside>
      <main id="main" style={{ display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: "min(440px,100%)" }}>
          <Link href="/" className="row muted small" style={{ marginBottom: 24 }}><ArrowLeft size={15} aria-hidden /> Back to home</Link>
          {children}
        </div>
      </main>
      <style>{`@media (max-width: 900px){.auth-split{grid-template-columns:1fr !important}.only-desktop-auth{display:none !important}}`}</style>
    </div>
  );
}
