"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error logged to monitoring service if configured
  }, [error]);

  return (
    <html lang="en">
      <body style={{ 
        backgroundColor: "#0a0a0a", 
        color: "#fafafa", 
        fontFamily: "system-ui, sans-serif",
        margin: 0,
        padding: 0,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong</h1>
          <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>
            We hit an unexpected error. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#fafafa",
              color: "#0a0a0a",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              marginRight: "0.5rem"
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid #27272a",
              color: "#fafafa",
              textDecoration: "none"
            }}
          >
            Go home
          </a>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#71717a" }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
