import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="text-center">
        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)]">
          404
        </span>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          Page not found
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-fg-muted)] max-w-md">
          That link doesn&apos;t point anywhere. Take me{" "}
          <Link href="/" className="text-[var(--color-accent)] hover:underline">
            home
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
