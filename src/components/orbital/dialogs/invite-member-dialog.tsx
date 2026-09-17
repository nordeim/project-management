"use client";

// Invite Member / New Agent dialog, matching the reference forms:
// humans — Email + Member/Lead role toggle; agents — NAME / DESCRIPTION /
// INSTRUCTIONS ("Create AI Agent"). Name derivation and bounds live in the
// pure seam src/lib/team.ts (unit tested there).

import { useState } from "react";
import { Bot, Loader2, Mail } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "lead">("member");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);

  const isAgent = kind === "agent";

  function reset() {
    setEmail("");
    setRole("member");
    setName("");
    setDescription("");
    setInstructions("");
    setBusy(false);
  }

  function close() {
    onOpenChange(false);
    reset();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const done = await inviteMember(
      isAgent
        ? { kind: "agent", name, description, instructions }
        : { kind: "human", email, role },
    );
    if (done) {
      onOpenChange(false);
      reset();
      toast({
        title: isAgent ? "Agent created" : "Invitation sent",
        description: isAgent
          ? `The AI agent "${name.trim()}" is now part of your workspace.`
          : `${email.trim()} can now be assigned to tasks.`,
      });
    } else {
      setBusy(false);
    }
  }

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = isAgent ? name.trim().length > 0 && !busy : emailValid && !busy;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy && !next) close(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[16px] text-orb-heading">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                isAgent ? "bg-orb-purple/15 text-orb-purple-deep" : "bg-black/[0.05] text-orb-muted",
              )}
              aria-hidden="true"
            >
              {isAgent ? <Bot size={15} /> : <Mail size={15} />}
            </span>
            {isAgent ? "Create AI Agent" : "Invite Team Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {isAgent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="agent-name" className="orb-label">
                  Name *
                </Label>
                <Input
                  id="agent-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Project Manager"
                  required
                  maxLength={100}
                  className=" h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-description" className="orb-label">
                  Description
                </Label>
                <Input
                  id="agent-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this agent do?"
                  maxLength={200}
                  className=" h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-instructions" className="orb-label">
                  Instructions
                </Label>
                <Textarea
                  id="agent-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe how the agent should behave and what it should focus on..."
                  rows={3}
                  maxLength={1000}
                  className=""
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="orb-label">
                  Email
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  maxLength={200}
                  className=" h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="orb-label">Role</Label>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Role">
                  {(["member", "lead"] as const).map((option) => {
                    const active = role === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRole(option)}
                        aria-pressed={active}
                        className={cn(
                          "h-11 rounded-2xl border text-[14px] font-medium capitalize transition-colors",
                          active
                            ? "border-orb-purple/50 bg-orb-purple/10 text-orb-purple-deep"
                            : " text-orb-muted hover:bg-black/[0.04]",
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
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
            <Button type="submit" className="orb-pill" disabled={!canSubmit}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              {isAgent ? "Create Agent" : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
