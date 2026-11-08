"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <h1 className="h2">Something went wrong</h1>
        <p className="muted" style={{ margin: "0 0 22px" }}>An unexpected error occurred. You can try again.</p>
        <button className="btn btn-primary" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
