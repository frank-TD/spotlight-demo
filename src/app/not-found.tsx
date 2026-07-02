import Link from "next/link";

// Self-contained 404 — does not use AppShell / client nav so it can render for
// any unmatched URL or thrown notFound(), including for signed-out visitors.
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface px-6 py-24 text-center">
      <p className="font-label text-label-md uppercase tracking-[0.3em] text-primary mb-6">
        Error 404
      </p>
      <h1 className="font-headline font-extrabold leading-none text-primary text-[96px] md:text-[140px]">
        404
      </h1>
      <h2 className="mt-6 font-headline text-headline-md text-on-surface">
        This scene is not in the reel
      </h2>
      <p className="mt-4 max-w-md font-body text-sm text-on-surface-variant leading-relaxed">
        The page you are looking for may have been moved, removed, or never made it past the cutting
        room floor.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="font-label text-label-md uppercase tracking-wider bg-primary text-on-primary px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
        >
          Back to home
        </Link>
        <Link
          href="/market"
          className="font-label text-label-md uppercase tracking-wider border border-outline-variant text-on-surface-variant px-6 py-3 rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors"
        >
          Explore the marketplace
        </Link>
      </div>
    </main>
  );
}
