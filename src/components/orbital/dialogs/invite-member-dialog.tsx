"use client";

// Invite Member / New Agent dialog.

import { useState } from "react";
import { Bot, Loader2, UserPlus } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export function InviteMemberDialog({
  kind,
  open,
  onOpenChange,
}: {
  kind: "human" | "agent";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inviteMember = useOrbital((s) => s.inviteMember);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);

  // Fields reset on close and after a successful invite — no effect needed.
  function reset() {
    setName("");
    setEmail("");
    setRole("");
    setBusy(false);
  }

  function close() {
    onOpenChange(false);
    reset();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    const done = await inviteMember({
      name: trimmed,
      email: email.trim() || undefined,
      role: kind === "human" ? role.trim() || undefined : undefined,
      kind,
      agentRole: kind === "agent" ? role.trim() || "Project Assistant" : undefined,
    });
    if (done) {
      onOpenChange(false);
      reset();
      toast({
        title: kind === "agent" ? "Agent created" : "Invitation sent",
        description:
          kind === "agent"
            ? `The AI agent "${trimmed}" is now part of your workspace.`
            : `${trimmed} can now be assigned to tasks.`,
      });
    } else {
      setBusy(false);
    }
  }

  const isAgent = kind === "agent";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy && !next) close(); }}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px] text-orb-heading">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ${isAgent ? "bg-orb-purple/15 text-orb-purple-deep" : "bg-black/[0.05]"}`}
              aria-hidden="true"
            >
              {isAgent ? <Bot size={15} /> : <UserPlus size={15} />}
            </span>
            {isAgent ? "New AI Agent" : "Invite Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name" className="orb-label">
              {isAgent ? "Agent Name" : "Full Name"} *
            </Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAgent ? "e.g. Research Assistant" : "e.g. Priya Sharma"}
              required
              maxLength={100}
              className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
            />
          </div>

          {isAgent ? (
            <div className="space-y-2">
              <Label htmlFor="member-agent-role" className="orb-label">
                Agent Role *
              </Label>
              <Input
                id="member-agent-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Project Assistant"
                required
                maxLength={100}
                className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="member-email" className="orb-label">
                  Email <span className="normal-case tracking-normal">(optional)</span>
                </Label>
                <Input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-role" className="orb-label">
                  Role <span className="normal-case tracking-normal">(optional)</span>
                </Label>
                <Input
                  id="member-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Designer"
                  maxLength={100}
                  className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-full px-5 text-[13px] font-medium text-orb-muted"
              onClick={close}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" className="orb-pill" disabled={busy || !name.trim() || (isAgent && !role.trim())}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              {isAgent ? "Create Agent" : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
