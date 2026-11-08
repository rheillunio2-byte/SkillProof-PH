import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <div className="grad-text" style={{ fontSize: 88, fontWeight: 800, letterSpacing: "-.05em", lineHeight: 1 }}>404</div>
        <h1 className="h2">This page doesn&apos;t exist</h1>
        <p className="muted" style={{ margin: "0 0 22px" }}>The link may be broken or the page may have moved.</p>
        <Link href="/" className="btn btn-primary">Return home</Link>
      </div>
    </main>
  );
}
