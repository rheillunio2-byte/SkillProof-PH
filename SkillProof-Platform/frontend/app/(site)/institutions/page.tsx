import type { Metadata } from "next";
import { BarChart3, GraduationCap, Users } from "lucide-react";
import { CtaLink, FeatureGrid, MarketingHero } from "@/components/marketing";

export const metadata: Metadata = { title: "For institutions" };
export default function Institutions() {
  return (
    <>
      <MarketingHero eyebrow="For institutions" title="Make student competency" accent="measurable." text="Monitor learner activity, average scores and earned credentials across a cohort in one overview.">
        <CtaLink href="/login" primary>Try the institution demo</CtaLink><CtaLink href="/pricing">See pricing</CtaLink>
      </MarketingHero>
      <FeatureGrid items={[
        { icon: Users, title: "Cohort roster", text: "See each learner's assessments completed, competencies evidenced and last activity." },
        { icon: BarChart3, title: "Performance at a glance", text: "Average scores and credentials earned, charted per learner." },
        { icon: GraduationCap, title: "Evidence-first", text: "Competency summaries come from graded work, not self-reported labels." },
      ]} />
    </>
  );
}
