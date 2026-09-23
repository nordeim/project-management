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
      <DialogContent className="sm:max-w-[384px] p-6">
        {/* v2.10 (measured, F2): the live's invite H2 carries NO icon
            circle — plain 16px/500 lh 16 ls -0.4. */}
        <DialogHeader>
          <DialogTitle className="text-[16px] font-medium leading-[16px] tracking-[-0.4px] text-orb-heading">
            {isAgent ? "Create AI Agent" : "Invite Team Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {isAgent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="agent-name" className="block text-[12px] font-medium leading-[12px] mb-[6px] text-orb-muted">
                  Name *
                </Label>
                <Input
                  id="agent-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Project Manager"
                  required
                  maxLength={100}
                  className="h-[37.5px] px-[14px] py-[9px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-description" className="block text-[12px] font-medium leading-[12px] mb-[6px] text-orb-muted">
                  Description
                </Label>
                <Input
                  id="agent-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this agent do?"
                  maxLength={200}
                  className="h-[37.5px] px-[14px] py-[9px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-instructions" className="block text-[12px] font-medium leading-[12px] mb-[6px] text-orb-muted">
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
                <Label htmlFor="invite-email" className="block text-[12px] font-medium leading-[12px] mb-[6px] text-orb-muted">
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
                  className="h-[37.5px] px-[14px] py-[9px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-[12px] font-medium leading-[12px] mb-[6px] text-orb-muted">Role</Label>
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
                          "h-[36px] rounded-[10px] bg-orb-well px-0 py-2 text-[13px] capitalize transition-colors",
                          active ? "font-medium text-orb-heading" : "font-normal text-[#767676] hover:text-orb-heading",
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

          {/* v2.10 (measured, F2): the invite button row sits 8px under
              the form. */}
          <div className="mt-[8px] flex items-center justify-end gap-[10px]">
            <Button
              type="button"
              className="h-[36px] rounded-[10px] bg-orb-well px-4 py-2 text-[13px] font-normal text-orb-muted shadow-[inset_-2px_-2px_5px_rgba(255,250,244,0.68),inset_2px_2px_5px_rgba(160,143,126,0.24)] transition-colors hover:text-orb-heading"
              onClick={close}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-[36px] rounded-[10px] bg-orb-heading px-[18px] py-2 text-[13px] font-medium text-[#F1F1F0] transition-colors hover:bg-[#2F2823]" disabled={!canSubmit}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              {isAgent ? "Create Agent" : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
