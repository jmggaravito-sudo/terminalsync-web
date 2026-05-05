import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Iniciar sesión · TerminalSync" : "Sign in · TerminalSync",
    robots: { index: false },
  };
}

export default async function LoginPage({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-md px-6 pt-20 pb-16">
        <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight">
          {isEs ? "Iniciá sesión" : "Sign in"}
        </h1>
        <p className="mt-2 text-[13.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {isEs
            ? "Te mandamos un enlace mágico al correo. Sin contraseñas."
            : "We'll email you a magic link. No passwords."}
        </p>
        <div className="mt-7">
          <Suspense fallback={null}>
            <LoginForm lang={lang} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
