import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Badge, Reveal } from "@/components/ui";
import { MarketingHero } from "@/components/marketing";

export const metadata: Metadata = { title: "Pricing" };
const plans = [
  { name: "Free", price: "₱0", note: "Build a foundation", items: ["Skill profile", "All demo challenges", "Portfolio projects", "Public credential verification"], featured: false },
  { name: "Pro", price: "₱299", note: "Go deeper with evidence", items: ["Advanced assessments", "Detailed skill analytics", "Expanded portfolio"], featured: true },
  { name: "Employer", price: "Custom", note: "Find demonstrated talent", items: ["Candidate discovery", "Persistent shortlists", "Competency challenges"], featured: false },
  { name: "Institution", price: "Custom", note: "Measure cohort capability", items: ["Student overview", "Assigned assessments", "Institutional reports"], featured: false },
];
export default function Pricing() {
  return (
    <>
      <MarketingHero eyebrow="Pricing" title="Simple plans for" accent="demonstrated capability." text="Illustrative pricing for product planning. Payments are not enabled in this prototype." />
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="container-x grid-4">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <div className="card card-hover" style={{ height: "100%", borderColor: p.featured ? "var(--blue)" : undefined, boxShadow: p.featured ? "0 24px 60px -24px rgba(91,140,255,.55)" : undefined }}>
                <div className="between"><b>{p.name}</b>{p.featured && <Badge tone="blue">Popular</Badge>}</div>
                <div style={{ fontSize: 34, fontWeight: 750, letterSpacing: "-.03em", margin: "14px 0 2px" }}>{p.price}{p.price !== "₱0" && p.price !== "Custom" && <span className="small muted"> /mo</span>}</div>
                <p className="muted small" style={{ margin: "0 0 18px" }}>{p.note}</p>
                <div className="stack" style={{ gap: 11 }}>{p.items.map((x) => <div key={x} className="row small" style={{ alignItems: "flex-start" }}><Check size={15} color="#34d399" style={{ marginTop: 2, flex: "none" }} aria-hidden />{x}</div>)}</div>
                <Link href="/register" className={`btn ${p.featured ? "btn-primary" : ""}`} style={{ width: "100%", marginTop: 22 }}>Get started</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
