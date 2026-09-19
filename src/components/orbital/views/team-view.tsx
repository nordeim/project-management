"use client";

// Team: invited workspace members + AI agents. Both start empty in a fresh
// workspace (like the reference); INVITE MEMBER and NEW AGENT populate it.

import { useState } from "react";
import { Bot, Plus, Sparkles, Users } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { AvatarBubble } from "@/components/orbital/widgets";
import { InviteMemberDialog } from "@/components/orbital/dialogs/invite-member-dialog";

export function TeamView() {
  const members = useOrbital((s) => s.members);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteKind, setInviteKind] = useState<"human" | "agent">("human");

  const humans = members.filter((m) => m.kind === "human");
  const agents = members.filter((m) => m.kind === "agent");

  return (
    <div className="w-full">
      {/* v1.8 (measured): the Invite Member button aligns with the h1 top
          (y=48 on live) — items-start. */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">Team</h1>
          <p className="mt-1 text-[14px] text-orb-muted">
            {humans.length} team member{humans.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          className="orb-pill-round"
          onClick={() => {
            setInviteKind("human");
            setInviteOpen(true);
          }}
        >
          <Plus size={14} aria-hidden="true" />
          Invite Member
        </button>
      </header>

      {humans.length === 0 ? (
        // v1.9 (re-measured): the members empty state centers the 22px Users
        // glyph inside a 52px INSET-WELL CIRCLE — the circle top lands
        // 100px below the header block bottom (section mt-5 + inner top
        // space) — with the 15px title 16px below the circle, a 13px
        // #767676 caption, and the in-section Invite Member (py 9px) 20px
        // below the caption.
        <div className="mt-5 flex flex-col items-center pt-[80px]">
          <span
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-orb-well shadow-[inset_-4px_-4px_8px_rgba(255,250,244,0.68),inset_4px_4px_8px_rgba(160,143,126,0.28)]"
            aria-hidden="true"
          >
            <Users size={22} color="#B3B3B3" />
          </span>
          <p className="mt-4 text-[15px] font-normal text-orb-heading">No team members yet</p>
          <p className="mt-1.5 text-[13px] font-normal text-[#767676]">Invite your team to get started.</p>
          <button
            type="button"
            className="mt-5 flex items-center gap-2 rounded-[12px] bg-orb-raised px-[18px] py-[9px] text-[13px] font-medium text-orb-heading shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-body"
            onClick={() => {
              setInviteKind("human");
              setInviteOpen(true);
            }}
          >
            <Plus size={14} aria-hidden="true" /> Invite Member
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {humans.map((m) => (
            <li key={m.id} className="orb-card flex items-center gap-3.5 p-4">
              <AvatarBubble name={m.name} color={m.avatarColor} size={42} />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-orb-heading">{m.name}</p>
                <p className="truncate text-[13px] text-orb-muted">{m.email ?? m.role ?? "Team member"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-[35px]" aria-label="AI agents">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {/* v1.7 (measured): 16px/500 — quieter than the v1.6 18px/600.
                v1.9: the subtitle is 13px (measured). */}
            <h2 className="text-[16px] font-medium text-orb-heading">AI Agents</h2>
            <p className="mt-0.5 text-[13px] text-orb-muted">Autonomous assistants that help manage your project</p>
          </div>
          <button
            type="button"
            className="orb-pill-round"
            onClick={() => {
              setInviteKind("agent");
              setInviteOpen(true);
            }}
          >
            <Plus size={14} aria-hidden="true" />
            New Agent
          </button>
        </div>

        {agents.length === 0 ? (
          // v1.8 (re-measured): the AI-Agents empty state sits in an inset
          // well card (radius 16) holding the 22px SPARKLES glyph (#B3B3B3 —
          // not Bot) and two compact text lines — no action button (the
          // NEW AGENT action lives in the section header above).
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-orb-well px-6 py-8 shadow-[inset_-4px_-4px_8px_rgba(255,250,244,0.68),inset_4px_4px_8px_rgba(160,143,126,0.24)]">
            <Sparkles size={22} color="#B3B3B3" aria-hidden="true" />
            <p className="mt-2.5 text-[14px] font-normal text-orb-heading">No agents yet</p>
            <p className="mt-1 text-[12px] font-normal text-[#767676]">Create an AI agent to automate project tasks.</p>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {agents.map((m) => (
              <li key={m.id} className="orb-card flex items-center gap-3.5 p-4">
                <span
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-orb-purple/15 text-orb-purple-deep"
                  aria-hidden="true"
                >
                  <Bot size={19} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-orb-heading">{m.name}</p>
                  <p className="truncate text-[13px] text-orb-muted">{m.description ?? m.agentRole ?? "AI agent"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InviteMemberDialog kind={inviteKind} open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
