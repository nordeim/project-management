"use client";

// User menu (dashboard header): authenticated visitors get a neumorphic
// inset trigger (avatar + email prefix) that opens a small raised card with
// a single red "Log Out" action — the reference pattern (v1.4). Signed-out
// visitors get a raised "LOG IN" button that routes to /login and back
// (from_url). The identity row (name/email) the v1.3 popover carried was
// removed: the reference popover shows only the Log Out action.

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrbital } from "@/components/orbital/store";
import { AvatarBubble } from "@/components/orbital/widgets";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function UserMenuOrLogin({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const user = useOrbital((s) => s.user);
  const signOut = useOrbital((s) => s.signOut);

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          const from = window.location.pathname + window.location.search;
          router.push(`/login?from_url=${encodeURIComponent(from)}`);
        }}
        className={
          compact
            ? "inline-flex h-[34px] items-center justify-center rounded-xl bg-orb-raised px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-orb-heading shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-body"
            : "inline-flex h-10 items-center justify-center rounded-xl bg-orb-raised px-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-orb-heading shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-body"
        }
        aria-label="Log in"
      >
        Log In
      </button>
    );
  }

  const emailPrefix = user.email.split("@")[0] ?? "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={
            compact
              ? "flex items-center gap-[7px] rounded-[10px] bg-orb-well px-3 py-[7px] shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)] transition-transform hover:-translate-y-0.5"
              : "flex h-11 items-center gap-2.5 rounded-xl bg-orb-well px-4 py-2.5 shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)] transition-transform hover:-translate-y-0.5"
          }
          aria-label={`Account menu for ${user.name || emailPrefix}`}
        >
          <AvatarBubble name={user.name || emailPrefix} color={user.avatarColor} size={compact ? 20 : 22} />
          <span className={compact ? "max-w-[110px] truncate text-[11px] font-medium text-[#6E6E6E]" : "max-w-[140px] truncate text-[13px] font-medium text-orb-heading"}>
            {emailPrefix}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[160px] rounded-xl border-0 bg-orb-raised p-0 shadow-[-6px_-6px_12px_rgba(255,250,244,0.78),6px_6px_14px_rgba(160,143,126,0.31)]">
        <button
          type="button"
          onClick={async () => {
            await signOut();
            // Re-resolve the session server-side: the shell stays mounted
            // and the header swaps to LOG IN without a full page reload.
            router.refresh();
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-medium text-[#bd3228] transition-colors hover:bg-black/[0.03]"
        >
          <LogOut size={24} strokeWidth={2} aria-hidden="true" />
          Log Out
        </button>
      </PopoverContent>
    </Popover>
  );
}
