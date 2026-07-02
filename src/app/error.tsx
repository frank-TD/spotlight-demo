"use client";
import { useEffect } from "react";
import Link from "next/link";

// Route-level error boundary. Client component per Next.js requirement. Styled to
// the dark + lime theme and self-contained (no AppShell / client nav dependency).
export default function Error({
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface px-6 py-24 text-center">
      <p className="font-label text-label-md uppercase tracking-[0.3em] text-primary mb-6">
        Something went wrong
      </p>
      <h1 className="font-headline text-headline-md text-on-surface max-w-lg">
        We hit an unexpected error
      </h1>
      <p className="mt-4 max-w-md font-body text-sm text-on-surface-variant leading-relaxed">
        An error interrupted this page. You can try again, or head back home and pick up where you
        left off.
      </p>
      {error.digest && (
        <p className="mt-3 font-label text-[11px] uppercase tracking-wider text-on-surface-variant/70">
          Ref: {error.digest}
        </p>
      )}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="font-label text-label-md uppercase tracking-wider bg-primary text-on-primary px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
        >
          Try again
        </button>
        <Link
          href="/"
          className="font-label text-label-md uppercase tracking-wider border border-outline-variant text-on-surface-variant px-6 py-3 rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
