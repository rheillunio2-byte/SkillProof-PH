import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: { default: "SkillProof — Prove what you can do", template: "%s · SkillProof" },
  description: "Demonstrate your abilities through practical assessments, build verified evidence, and share credentials anyone can check.",
};
export const viewport: Viewport = { themeColor: "#060b1a" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
