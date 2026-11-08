import type { Metadata } from "next";
import { BookmarkPlus, Search, Trophy } from "lucide-react";
import { CtaLink, FeatureGrid, MarketingHero } from "@/components/marketing";

export const metadata: Metadata = { title: "For employers" };
export default function Employers() {
  return (
    <>
      <MarketingHero eyebrow="For employers" title="Hire for what people" accent="can demonstrate." text="Explore candidate evidence, see assessment-backed skills, and keep a shortlist, as one input alongside human review.">
        <CtaLink href="/login" primary>Try the employer demo</CtaLink><CtaLink href="/pricing">See pricing</CtaLink>
      </MarketingHero>
      <FeatureGrid items={[
        { icon: Search, title: "Search by demonstrated skills", text: "Filter candidates by the skills they have actual assessment or project evidence for." },
        { icon: BookmarkPlus, title: "Shortlist candidates", text: "Save promising profiles to a persistent shortlist tied to your account." },
        { icon: Trophy, title: "Compare evidence", text: "ProofScore, assessments completed and credentials side by side. Not a hiring decision." },
      ]} />
      <div className="container-x"><p className="tiny dim" style={{ textAlign: "center" }}>Candidate data in the demo is fictional.</p></div>
    </>
  );
}
