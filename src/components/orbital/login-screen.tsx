"use client";

// Login page card — mirrors the reference app's /login route (v2.9,
// re-measured after the live's redesign): a SLATE GRADIENT page
// (from-slate-50 to-slate-100) with a centered white card (448px,
// radius 16, 95% white, backdrop blur, overflow hidden) carrying a 4px
// top gradient bar, a centered content column, the 80/96px white-circle
// logo (the 1-2-3 dot pyramid) in a group wrapper with a blurred
// gradient halo, a 24/30px/700 slate title, slate-styled controls —
// Google button (20px glyph in a -ml-4 wrapper) + inputs with 1px
// #E2E8F0 borders at radius 12 and 16px leading glyphs, a #0F172A Sign
// in button — and slate footer links in a sm:flex-row strip. Three
// states: sign-in, sign-up, forgot-password. "Continue with Google"
// degrades to an explanatory toast: this self-hosted clone carries no
// OAuth credentials (same doctrine as the AI fallbacks).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogoPyramid } from "@/components/orbital/logo";

type Mode = "signin" | "signup" | "forgot";

// v1.9 (measured): slate control styling — 48px fields with 1px #E2E8F0
// borders at radius 12 (explicit — the theme's rounded-xl is 20px) over a
// translucent #F8FAFC fill (pad 8px 12px with a 40px leading icon offset).
const INPUT_CLASS =
  "h-12 rounded-[12px] border border-[#E2E8F0] bg-[rgba(248,250,252,0.5)] px-3 py-2 pl-10 text-sm text-[#09090B] placeholder:text-[#94A3B8] focus-visible:ring-1 focus-visible:ring-[#0F172A]/20 focus-visible:border-[#94A3B8]";

function GoogleGlyph() {
  // v2.9 (measured): the live's Google glyph renders at 20px (h-5 w-5)
  // inside a -ml-4 transition-transform wrapper.
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true" className="size-5">
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
    // v2.9 (measured): the live login page renders on a SLATE GRADIENT
    // canvas (from-slate-50 #F8FAFC to-slate-100 #F1F5F9, diagonal), p-4.
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* v2.9 (measured): the card is relative + overflow-hidden (the
            4px top gradient bar is absolutely positioned), 95% white
            over a 4px backdrop blur, shadow-2xl
            (0 25px 50px -12px 25%), radius 16. */}
        <div className="relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.95)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-[4px]">
          {/* the 4px top gradient strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" aria-hidden="true" />
          {/* responsive padding: 32px below sm, 40px from sm, 48/40/40 at md */}
          <div className="p-8 sm:p-10 md:px-10 md:pb-10 md:pt-12">
            {/* v2.9 (measured): the content column is CENTERED — items
                center + text-center, 24/32px vertical rhythm. */}
            <div className="flex flex-col items-center space-y-6 text-center sm:space-y-8">
              {mode === "signin" ? (
                <>
                  {/* v2.9 (measured): the logo sits in a relative group
                      wrapper with a BLURRED GRADIENT HALO behind the
                      80/96px chip (the chip itself keeps the v2.3 spec:
                      rounded-full + ring-4 ring-white/50 + shadow-lg). */}
                  <div className="group relative">
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-40"
                      aria-hidden="true"
                    />
                    <div className="flex justify-center">
                      <LogoPyramid className="h-20 w-20 sm:h-24 sm:w-24" />
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                      Welcome to Project Management App
                    </h1>
                    <p className="text-[16px] font-medium text-[#64748B]">Sign in to continue</p>
                  </div>
                </>
              ) : (
                <div className="w-full space-y-4 text-left">
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

              <div className="w-full">
                <div className="space-y-3">
                  {mode === "signin" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-[54px] w-full rounded-[12px] border-[#E2E8F0] bg-white px-5 py-3.5 text-[16px] font-medium text-[#334155] hover:bg-[#F8FAFC]"
                      onClick={() =>
                        toast({
                          title: "Google sign-in unavailable",
                          description:
                            "This self-hosted clone carries no OAuth credentials — sign in with your email and password.",
                        })
                      }
                    >
                      {/* v2.9 (measured): the 20px Google glyph sits in a
                          -ml-4 transition-transform wrapper (the live's
                          hover lift). */}
                      <span className="-ml-4 transition-transform duration-200" aria-hidden="true">
                        <GoogleGlyph />
                      </span>
                      Continue with Google
                    </Button>
                  ) : null}

                  {/* v2.9 (measured): the "or" divider is an absolute
                      1px line with the centered uppercase label on a
                      white chip. */}
                  {mode === "signin" ? (
                    <div className="relative my-6" aria-hidden="true">
                      <div className="absolute inset-0 flex items-center">
                        <span className="h-px w-full bg-[#E2E8F0]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 font-medium tracking-wider text-[#94A3B8]">or</span>
                      </div>
                    </div>
                  ) : null}

                  {/* v2.10 (re-probed on the live): the form mirrors the
                      live's DOM exactly — `space-y-4 sm:space-y-5` (no pt),
                      a FIELDS WRAPPER `space-y-3 sm:space-y-4` holding
                      `space-y-1.5` field blocks (the 6px label→input gap is
                      the input wrapper's mt from space-y-1.5 — the label
                      itself carries no margin), and a `space-y-3` BOTTOM
                      BLOCK (submit + footer strip, mt 12). */}
                  <form onSubmit={submit} className="space-y-4 sm:space-y-5" noValidate>
                    <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-left text-[14px] font-medium leading-4 text-[#334155]">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
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
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-left text-[14px] font-medium leading-4 text-[#334155]">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
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
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm" className="text-left text-[14px] font-medium leading-4 text-[#334155]">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
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
                    </div>

                    {/* v2.10 (re-probed, F10): the form's BOTTOM BLOCK —
                        `space-y-3` holding the submit button and the footer
                        strip (its mt 12 comes from the block's space-y-3,
                        exactly the live's DOM; the footer moved INSIDE the
                        form — it was a 32px column sibling below the form
                        wrapper). */}
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={busy}
                        className="h-12 w-full rounded-[12px] bg-[#0F172A] text-sm font-medium text-white hover:bg-[#1E293B] disabled:opacity-50"
                      >
                        {busy
                          ? "Please wait…"
                          : mode === "signin"
                            ? "Sign in"
                            : mode === "signup"
                              ? "Create account"
                              : "Send reset link"}
                      </Button>

                      {mode === "signin" ? (
                        /* v2.9 (measured): the footer strip is column-below-sm /
                            row from sm — "Forgot password?" left, a single "Need
                            an account? Sign up" button right (the label text
                            14px/400 #64748B, the action 14px/500 #334155).
                            v2.10 (F10): inside the form's space-y-3 bottom
                            block (mt 12). */
                        <div className="flex w-full flex-col items-center justify-between gap-2 text-[14px] leading-5 sm:flex-row sm:gap-0">
                          <button
                            type="button"
                            className="font-medium text-[#64748B] underline-offset-4 transition-colors hover:text-[#0F172A] hover:underline"
                            onClick={() => setMode("forgot")}
                          >
                            Forgot password?
                          </button>
                          <button
                            type="button"
                            className="text-[#64748B] underline-offset-4 transition-colors hover:text-[#0F172A]"
                            onClick={() => setMode("signup")}
                          >
                            Need an account?{" "}
                            <span className="font-medium text-[#334155] hover:underline">Sign up</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
