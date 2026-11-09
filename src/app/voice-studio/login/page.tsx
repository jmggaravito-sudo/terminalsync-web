import { VsLoginButtons } from "@/components/voice-studio/VsLoginButtons";

// Standalone client login for the Voice Studio dashboard. Google is the
// primary path (most reliable — same reason the admin login leads with
// it), with an email magic link as the fallback. Both land on
// /auth/callback?next=/voice-studio/orders, which bounces into the
// dashboard once the browser session exists. The HMAC emailed link still
// works without any login at all.
export const metadata = { title: "Voice Studio — Client sign in" };

export default function VsLoginPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
      <p className="font-mono text-xs tracking-wide text-zinc-400">
        VOICE STUDIO · CLIENT SIGN IN
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Your production dashboard
      </h1>
      <p className="mt-2 max-w-md text-zinc-600">
        Sign in with the same email you signed up with — your queue and
        deliveries are matched by email, nothing else to remember.
      </p>
      <div className="mt-10 flex w-full justify-center">
        <VsLoginButtons />
      </div>
      <p className="mt-10 text-sm text-zinc-500">
        No account yet?{" "}
        <a href="/voice-studio#sample" className="underline">
          Get your free 60-second sample
        </a>{" "}
        first.
      </p>
    </main>
  );
}
