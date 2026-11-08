import { AssessmentShowcase, CredentialShowcase, Faq, FinalCta, Hero, HowItWorks, LeaderboardShowcase, StatsStrip, Testimonials } from "@/components/landing";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <AssessmentShowcase />
      <CredentialShowcase />
      <LeaderboardShowcase />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
