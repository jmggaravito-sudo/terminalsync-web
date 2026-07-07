import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isLocale, getDict } from "@/content";
import { listPosts } from "@/lib/blog";
import { Footer } from "@/components/landing/Footer";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const isEs = lang === "es";
  const description = isEs
    ? "Cómo usar IA para trabajar mejor. Guías, casos de uso y novedades del producto."
    : "How to use AI to work better. Guides, use cases, and product updates.";
  return {
    title: "Blog — TerminalSync",
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/blog`,
      languages: {
        es: "https://terminalsync.ai/es/blog",
        en: "https://terminalsync.ai/en/blog",
      },
    },
  };
}

export default async function BlogIndex({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const isEs = lang === "es";
  const posts = await listPosts(lang);
  const d = getDict(lang);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <section className="mx-auto max-w-3xl px-5 md:px-6 pt-20 pb-16">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          Blog
        </h1>
        <p className="mt-3 text-[17px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Cómo usar IA para trabajar mejor. Guías, casos de uso y novedades del producto."
            : "How to use AI to work better. Guides, use cases, and product updates."}
        </p>

        {posts.length === 0 ? (
          <p className="mt-12 text-[var(--color-fg-muted)]">
            {isEs ? "Próximamente..." : "Coming soon..."}
          </p>
        ) : (
          <div className="mt-12 space-y-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${lang}/blog/${post.slug}`}
                className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 transition-colors hover:border-[var(--color-accent)]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {post.category && (
                      <span className="mb-2 inline-block text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)]">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-[18px] font-semibold leading-snug text-[var(--color-fg-strong)] group-hover:text-[var(--color-accent)] transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-fg-muted)] line-clamp-2">
                      {post.description}
                    </p>
                    <p className="mt-3 text-[12px] text-[var(--color-fg-dim)]">
                      {post.date}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="mt-1 shrink-0 text-[var(--color-fg-dim)] group-hover:text-[var(--color-accent)] transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer dict={d} />
    </div>
  );
}
