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
            ? // v2.5 (measured live at 390): the mobile app-bar pill — r10,
              // pad 6px 14px (content-driven h≈28.5 = 6 + lh16.5 + 6), the
              // SMALL raised pair (-3px/-3px 6px 0.78 / 3px 3px 6px 0.22).
              "inline-flex items-center justify-center rounded-[10px] bg-orb-raised px-[14px] py-[6px] text-[11px] font-semibold uppercase tracking-[0.08em] text-orb-heading shadow-[-3px_-3px_6px_rgba(255,250,244,0.78),3px_3px_6px_rgba(160,143,126,0.22)] transition-colors hover:text-orb-body"
            : // v2.5 (measured live at 768+): the desktop pill — r12, pad
              // 11px 20px (content-driven h40 = 11 + lh18 + 11), the
              // STANDARD raised pair. rounded-xl is a trap here: the shadcn
              // --radius: 1rem override resolves it to 20px.
              "inline-flex items-center justify-center rounded-[12px] bg-orb-raised px-5 py-[11px] text-[12px] font-semibold uppercase tracking-[0.08em] text-orb-heading shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-body"
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
              ? "flex items-center gap-[7px] rounded-[10px] bg-orb-well px-3 py-[7px] orb-inset transition-transform hover:-translate-y-0.5"
              : // v2.9 (measured): the desktop pill is radius 12 (NOT
                // rounded-xl — the shadcn --radius trap resolves it to
                // 20px), pad 11/16, with the 12px/500 #6E6E6E name the
                // live renders.
                "flex items-center gap-2.5 rounded-[12px] bg-orb-well px-4 py-[11px] orb-inset transition-transform hover:-translate-y-0.5"
          }
          aria-label={`Account menu for ${user.name || emailPrefix}`}
        >
          <AvatarBubble name={user.name || emailPrefix} color={user.avatarColor} size={compact ? 20 : 22} />
          <span className={compact ? "max-w-[110px] truncate text-[11px] font-medium text-[#6E6E6E]" : "max-w-[140px] truncate text-[12px] font-medium text-[#6E6E6E]"}>
            {emailPrefix}
          </span>
        </button>
      </PopoverTrigger>
      {/* v2.10 (F12, re-measured on the live): the popover panel's top sits
          EXACTLY 8px below the pill's bottom edge (the live measures
          pill-bottom 92 → popover-top 100; its CSS computes
          top: calc(100% + 8px)). Radix's sideOffset IS that gap in px —
          the v2.9 default 4 rendered it 4px too high. */}
      <PopoverContent align="end" sideOffset={8} className="orb-pop-shadow w-[160px] rounded-[12px] border-0 bg-orb-raised p-0">
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
          <LogOut size={14} strokeWidth={2} aria-hidden="true" />
          Log Out
        </button>
      </PopoverContent>
    </Popover>
  );
}
