"use client";

// Team: invited workspace members + AI agents. Both start empty in a fresh
// workspace (like the reference); INVITE MEMBER and NEW AGENT populate it.

import { useState } from "react";
import { Bot, Plus, Users } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { EmptyState } from "@/components/orbital/empty-state";
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-orb-heading">Team</h1>
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
        <div className="mt-6">
          <EmptyState
            icon={<Users size={22} />}
            title="No team members yet"
            description="Invite your team to get started."
            action={
              <button
                type="button"
                className="flex h-[38px] items-center gap-2 rounded-[12px] bg-orb-raised px-[18px] text-[13px] font-medium text-orb-heading shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-body"
                onClick={() => {
                  setInviteKind("human");
                  setInviteOpen(true);
                }}
              >
                <Plus size={14} aria-hidden="true" /> Invite Member
              </button>
            }
          />
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

      <section className="mt-10" aria-label="AI agents">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-orb-heading">AI Agents</h2>
            <p className="mt-0.5 text-[13.5px] text-orb-muted">Autonomous assistants that help manage your project</p>
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
          // Reference (v1.6, measured): the AI-Agents empty state sits in an
          // inset well card (radius 16, p 32px 24px) — unlike the members
          // empty state, which renders directly on the canvas.
          <div className="mt-4 flex items-center justify-center rounded-2xl bg-orb-well px-6 py-8 shadow-[inset_-4px_-4px_8px_rgba(255,250,244,0.68),inset_4px_4px_8px_rgba(160,143,126,0.24)]">
            <EmptyState
              icon={<Bot size={22} />}
              title="No agents yet"
              description="Create an AI agent to automate project tasks."
              action={
                <button
                  type="button"
                  className="flex h-[38px] items-center gap-2 rounded-[12px] bg-orb-raised px-[18px] text-[13px] font-medium text-orb-heading shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-body"
                  onClick={() => {
                    setInviteKind("agent");
                    setInviteOpen(true);
                  }}
                >
                  <Plus size={14} aria-hidden="true" /> New Agent
                </button>
              }
            />
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
