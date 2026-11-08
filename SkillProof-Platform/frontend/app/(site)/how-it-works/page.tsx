import type { Metadata } from "next";
import { Award, ClipboardCheck, FolderKanban, Gauge, Network, ShieldCheck } from "lucide-react";
import { CtaLink, FeatureGrid, MarketingHero } from "@/components/marketing";

export const metadata: Metadata = { title: "How it works" };
export default function HowItWorks() {
  return (
    <>
      <MarketingHero eyebrow="How it works" title="Evidence," accent="not just assertions." text="SkillProof connects practical assessment, project artifacts and credential records into a portable competency profile.">
        <CtaLink href="/register" primary>Create your profile</CtaLink><CtaLink href="/login">Try a demo account</CtaLink>
      </MarketingHero>
      <FeatureGrid items={[
        { icon: ClipboardCheck, title: "1 · Demonstrate", text: "Complete structured challenges with explicit skills. Answers are graded on the server so results can be trusted." },
        { icon: FolderKanban, title: "2 · Document", text: "Attach projects and explain the tools and decisions behind your work. Projects start unverified until reviewed." },
        { icon: Award, title: "3 · Earn", text: "Pass the 70% mark to receive a credential with a unique, publicly verifiable ID." },
        { icon: Network, title: "SkillGraph", text: "See how your skills cluster across frontend, data, engineering and security." },
        { icon: Gauge, title: "Skill gap analyzer", text: "Compare your evidence to a target role and get matching challenges for each gap." },
        { icon: ShieldCheck, title: "Transparent scoring", text: "ProofScore shows its weights and parts. It is an evidence summary, never a verdict on a person." },
      ]} />
    </>
  );
}
