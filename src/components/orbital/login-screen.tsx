"use client";

// Login page card — mirrors the reference app's /login route (v1.8,
// re-measured): a WHITE page with a centered white card (448px, radius 16,
// 95% opacity), a 96px white-circle logo (the 1-2-3 dot pyramid), a
// 30px/700 slate title, slate-styled controls — Google button + inputs with
// 1px #E2E8F0 borders at radius 12, a #0F172A Sign in button — and slate
// footer links. Three states: sign-in, sign-up, forgot-password.
// "Continue with Google" degrades to an explanatory toast: this self-hosted
// clone carries no OAuth credentials (same doctrine as the AI fallbacks).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogoPyramid } from "@/components/orbital/logo";

type Mode = "signin" | "signup" | "forgot";

// v1.8 (measured on the live app): slate control styling — 48px fields with
// 1px #E2E8F0 borders at radius 12 over a translucent #F8FAFC fill.
const INPUT_CLASS =
  "h-12 rounded-xl border border-[#E2E8F0] bg-[rgba(248,250,252,0.5)] pl-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:ring-1 focus-visible:ring-[#0F172A]/20 focus-visible:border-[#94A3B8]";

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function LoginCard({ fromUrl }: { fromUrl: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  function backToSignIn() {
    setMode("signin");
    setPassword("");
    setConfirm("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (mode === "signup" && password !== confirm) {
      toast({
        title: "Sign up failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      if (mode === "forgot") {
        // No mail transport ships with this self-hosted clone; the request
        // is acknowledged the same way the reference acknowledges it.
        toast({
          title: "Reset link requested",
          description: `If an account exists for ${email.trim()}, a reset link has been sent.`,
        });
        return;
      }
      const url = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "signin" ? { email, password } : { email, password };
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok: boolean; error?: { message: string } }
        | null;
      if (!response.ok || !payload?.ok) {
        toast({
          title: mode === "signin" ? "Sign in failed" : "Sign up failed",
          description: payload?.error?.message ?? "Please check your details and try again.",
          variant: "destructive",
        });
        return;
      }
      // Return to the workspace the visitor came from. router.replace runs a
      // client-side navigation; the fresh session cookie makes the server
      // page resolve OrbitalApp instead of the unauthenticated shell.
      router.replace(fromUrl);
      router.refresh();
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the server. Check your connection and retry.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    // v1.8 (measured): the live login page renders on a WHITE canvas.
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-[448px]">
        {/* v1.8 (measured): card at 95% white, radius 16, with the 96px
            logo circle above a 30px/700 slate title. */}
        <div className="rounded-2xl bg-[rgba(255,255,255,0.95)] p-8 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
          {mode === "signin" ? (
            <>
              <div className="mb-7 flex flex-col items-center gap-5 text-center">
                <LogoPyramid size={96} />
                <h1 className="text-[30px] font-bold leading-tight tracking-[-0.01em] text-[#0F172A]">
                  Welcome to Project Management App
                </h1>
                <p className="text-sm text-[#64748B]">Sign in to continue</p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-[54px] w-full rounded-xl border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                onClick={() =>
                  toast({
                    title: "Google sign-in unavailable",
                    description:
                      "This self-hosted clone carries no OAuth credentials — sign in with your email and password.",
                  })
                }
              >
                <GoogleGlyph />
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-[#E2E8F0]" />
                <span className="text-xs font-medium text-[#94A3B8]">OR</span>
                <span className="h-px flex-1 bg-[#E2E8F0]" />
              </div>
            </>
          ) : (
            <div className="mb-7 space-y-4">
              <button
                type="button"
                onClick={backToSignIn}
                className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Back to sign in
              </button>
              <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-[#0F172A]">
                {mode === "signup" ? "Create your account" : "Reset your password"}
              </h1>
              {mode === "forgot" ? (
                <p className="text-sm leading-relaxed text-[#64748B]">
                  Enter your email and we&apos;ll send you a link to reset your password
                </p>
              ) : null}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium text-[#334155]">
                Email
              </Label>
              <div className="relative">
                <Mail size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {mode === "forgot" ? null : (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] font-medium text-[#334155]">
                  Password
                </Label>
                <div className="relative">
                  <Lock size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            )}

            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-[13px] font-medium text-[#334155]">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-xl bg-[#0F172A] text-sm font-semibold text-white hover:bg-[#1E293B] disabled:opacity-50"
            >
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </Button>
          </form>

          {mode === "signin" ? (
            <div className="mt-5 flex items-center justify-between text-[13px]">
              <button
                type="button"
                className="text-[#64748B] underline-offset-4 hover:text-[#0F172A] hover:underline"
                onClick={() => setMode("forgot")}
              >
                Forgot password?
              </button>
              {/* v1.8 (measured): the sign-up link is slate #334155 (the
                  v1.4 purple link is gone on the live page). */}
              <button
                type="button"
                className="font-medium text-[#334155] underline-offset-4 hover:underline"
                onClick={() => setMode("signup")}
              >
                Need an account? Sign up
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
