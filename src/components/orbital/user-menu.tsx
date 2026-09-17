"use client";

// User menu: the avatar pill in the dashboard header opens a small popover
// with the signed-in identity and a Log Out action — mirroring the
// reference app (sign-out lives here, not in Settings).

import { LogOut } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { AvatarBubble } from "@/components/orbital/widgets";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function UserMenu() {
  const user = useOrbital((s) => s.user);
  const signOut = useOrbital((s) => s.signOut);
  const emailPrefix = user.email.split("@")[0] ?? "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-full bg-orb-pink/60 pl-1.5 pr-4 text-[13px] font-medium text-orb-heading transition-transform hover:-translate-y-0.5"
          aria-label={`Account menu for ${user.name || emailPrefix}`}
        >
          <AvatarBubble name={user.name || emailPrefix} color={user.avatarColor} size={30} />
          <span className="max-w-[140px] truncate">{emailPrefix}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 rounded-2xl p-3">
        <div className="flex items-center gap-2.5 px-1 pb-3">
          <AvatarBubble name={user.name || emailPrefix} color={user.avatarColor} size={34} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-orb-heading">{user.name || emailPrefix}</p>
            <p className="truncate text-[12px] text-orb-muted">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13.5px] font-medium text-orb-muted transition-colors hover:bg-black/[0.04] hover:text-orb-heading"
        >
          <LogOut size={15} aria-hidden="true" />
          Log Out
        </button>
      </PopoverContent>
    </Popover>
  );
}
