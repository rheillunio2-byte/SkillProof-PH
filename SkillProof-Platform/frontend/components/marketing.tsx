import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./ui";

export function MarketingHero({ eyebrow, title, accent, text, children }: { eyebrow: string; title: string; accent: string; text: string; children?: ReactNode }) {
  return (
    <section className="hero" style={{ paddingBottom: 40 }}>
      <div className="hero-bg" aria-hidden /><div className="orb a" aria-hidden /><div className="orb b" aria-hidden />
      <div className="container-x" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="h1" style={{ maxWidth: 820, margin: "14px auto 18px" }}>{title} <span className="grad-text">{accent}</span></h1>
        <p className="lead" style={{ margin: "0 auto" }}>{text}</p>
        {children && <div className="row wrap" style={{ justifyContent: "center", marginTop: 28 }}>{children}</div>}
      </div>
    </section>
  );
}

export function FeatureGrid({ items }: { items: { icon: LucideIcon; title: string; text: string }[] }) {
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="container-x grid-3">
        {items.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="card card-hover" style={{ height: "100%" }}>
              <span className="icon-tile"><f.icon size={20} aria-hidden /></span>
              <h3 className="h3" style={{ marginTop: 16, fontSize: 17 }}>{f.title}</h3>
              <p className="muted small" style={{ margin: 0, lineHeight: 1.65 }}>{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CtaLink({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return <Link href={href} className={`btn btn-lg ${primary ? "btn-primary" : ""}`}>{children} {primary && <ArrowRight size={17} aria-hidden />}</Link>;
}
