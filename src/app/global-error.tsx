"use client";
import { useEffect } from "react";

// Minimal top-level fallback used only when the root layout itself fails. It
// replaces the root layout, so it must render its own <html>/<body>. Inline
// styles keep it working even if global CSS never loaded — near-black bg + lime.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          padding: "24px",
          textAlign: "center",
          backgroundColor: "#08080a",
          color: "#ffffff",
          fontFamily:
            "Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c6ff34",
          }}
        >
          Something went wrong
        </p>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700, maxWidth: "32rem" }}>
          The application ran into a problem
        </h1>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            backgroundColor: "#c6ff34",
            color: "#08080a",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
