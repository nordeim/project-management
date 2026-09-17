"use client";

// Login / sign-up screen. Mirrors the reference app: centered card, the
// 1-2-3 pyramid dot mark, "Continue with Google" (demo notice), email +
// password form with in-field icons, Title Case labels and submit button.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogoPyramid } from "@/components/orbital/logo";

export function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const url = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "signin" ? { email, password } : { name, email, password };
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
      // Re-resolve the session server-side: page.tsx (force-dynamic) swaps
      // this login screen for the app shell without a full page reload.
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
    <main className="flex min-h-screen items-center justify-center bg-orb-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <div className="orb-card p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <LogoPyramid size={48} />
            <h1 className="text-2xl font-normal tracking-tight text-orb-heading">
              Welcome to <span className="font-bold">Project Management App</span>
            </h1>
            <p className="text-sm text-orb-muted">Sign in to continue</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full border-black/10 bg-transparent text-sm font-medium text-orb-heading hover:bg-black/[0.04]"
            onClick={() =>
              toast({
                title: "Demo build",
                description: "Google sign-in is not wired up in this clone — use the demo account below.",
              })
            }
          >
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
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-black/[0.08]" />
            <span className="text-xs font-medium text-orb-muted">OR</span>
            <span className="h-px flex-1 bg-black/[0.08]" />
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13.5px] font-medium text-orb-body">
                  Name
                </Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60 text-sm"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13.5px] font-medium text-orb-body">
                Email
              </Label>
              <div className="relative">
                <Mail size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-orb-muted" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60 pl-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13.5px] font-medium text-orb-body">
                Password
              </Label>
              <div className="relative">
                <Lock size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-orb-muted" />
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60 pl-10 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-black disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-[13px]">
            <button
              type="button"
              className="text-orb-muted underline-offset-4 hover:text-orb-heading hover:underline"
              onClick={() =>
                toast({
                  title: "Password reset",
                  description: "Password reset emails are not part of this demo clone.",
                })
              }
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="font-medium text-orb-purple-deep underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-[13px] text-orb-muted">
          Demo account — <span className="font-medium text-orb-heading">demo@orbital.app</span> / Demo1234!
        </p>
      </div>
    </main>
  );
}
