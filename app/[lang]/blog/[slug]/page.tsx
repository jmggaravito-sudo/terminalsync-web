import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale, getDict } from "@/content";
import { getPost, listSlugs } from "@/lib/blog";
import { Footer } from "@/components/landing/Footer";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return slugs.flatMap((slug) =>
    ["en", "es"].map((lang) => ({ lang, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = await getPost(lang, slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — TerminalSync Blog`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/blog/${slug}`,
      languages: {
        es: `https://terminalsync.ai/es/blog/${slug}`,
        en: `https://terminalsync.ai/en/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = await getPost(lang, slug);
  if (!post) notFound();
  const isEs = lang === "es";
  const d = getDict(lang);

  const articleJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "TerminalSync" },
    publisher: { "@type": "Organization", name: "TerminalSync" },
    mainEntityOfPage: `https://terminalsync.ai/${lang}/blog/${slug}`,
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJson) }}
      />
      <article className="mx-auto max-w-2xl px-5 md:px-6 pt-20 pb-16">
        <Link
          href={`/${lang}/blog`}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Blog
        </Link>

        <header className="mb-10">
          {post.category && (
            <span className="mb-3 inline-block text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {post.category}
            </span>
          )}
          <h1 className="text-[clamp(1.8rem,4.5vw,3rem)] font-semibold leading-tight tracking-tight text-[var(--color-fg-strong)]">
            {post.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--color-fg-muted)]">
            {post.description}
          </p>
          <div className="mt-5 flex items-center gap-3 text-[12px] text-[var(--color-fg-dim)]">
            <span>{post.author}</span>
            <span>·</span>
            <time dateTime={post.date}>{post.date}</time>
          </div>
        </header>

        <div
          className="prose prose-sm md:prose-base max-w-none
            prose-headings:text-[var(--color-fg-strong)] prose-headings:font-semibold
            prose-p:text-[var(--color-fg)] prose-p:leading-relaxed
            prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[var(--color-fg-strong)]
            prose-code:text-[var(--color-accent)] prose-code:bg-[var(--color-panel)] prose-code:px-1 prose-code:rounded
            prose-ul:text-[var(--color-fg)] prose-ol:text-[var(--color-fg)]
            prose-blockquote:border-[var(--color-accent)] prose-blockquote:text-[var(--color-fg-muted)]"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 text-center">
          <p className="text-[15px] font-semibold text-[var(--color-fg-strong)]">
            {isEs ? "¿Listo para probarlo?" : "Ready to try it?"}
          </p>
          <p className="mt-1 text-[13px] text-[var(--color-fg-muted)]">
            {isEs
              ? "TerminalSync conecta tu IA con el trabajo real de tu empresa."
              : "TerminalSync connects your AI to your company's real work."}
          </p>
          <a
            href="/api/download"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {isEs ? "Descargar gratis" : "Download free"}
          </a>
        </div>
      </article>
      <Footer dict={d} />
    </div>
  );
}
