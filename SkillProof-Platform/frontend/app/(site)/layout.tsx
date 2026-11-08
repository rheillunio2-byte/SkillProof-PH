import type { ReactNode } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
