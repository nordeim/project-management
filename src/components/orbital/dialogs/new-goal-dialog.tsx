"use client";

// New Goal: a two-step conversational wizard like the reference app.
// Step 1 — the AI assistant bubble + goal details form (title, description,
// target date). Step 2 — the agent "thinks" and generates the task plan
// (LLM-backed with deterministic fallback on the server), then hands off
// to the goal detail page.

import { useState } from "react";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export function NewGoalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createGoal = useOrbital((s) => s.createGoal);
  const generateTasks = useOrbital((s) => s.generateTasks);
  const navigate = useOrbital((s) => s.navigate);

  const [step, setStep] = useState<"details" | "generating">("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    setStep("details");
    setTitle("");
    setDescription("");
    setTargetDate("");
    setBusy(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    const goalId = await createGoal({
      title: trimmed,
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
    });
    if (!goalId) {
      setBusy(false);
      return;
    }
    setStep("generating");
    const created = await generateTasks(goalId);
    setBusy(false);
    onOpenChange(false);
    reset();
    if (created != null) {
      toast({
        title: "Goal created",
        description: `The AI agent drafted ${created} tasks for "${trimmed}".`,
      });
    }
    navigate("goal-detail", goalId);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Create a new goal</DialogTitle>
        </DialogHeader>

        {step === "details" ? (
          <div className="p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orb-purple/15 text-orb-purple-deep" aria-hidden="true">
                <Plus size={18} />
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-orb-inset/80 px-4 py-3">
                <p className="text-[14px] leading-relaxed text-orb-body">
                  Tell me about your goal. What do you want to achieve? I&apos;ll draft a task plan for it right
                  after.
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <p className="orb-label">Goal Details</p>
              <div className="space-y-2">
                <Label htmlFor="goal-title" className="orb-label">
                  Goal Title
                </Label>
                <Input
                  id="goal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Launch new landing page by end of month"
                  required
                  maxLength={200}
                  className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-description" className="orb-label">
                  Description <span className="normal-case tracking-normal">(optional)</span>
                </Label>
                <Textarea
                  id="goal-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more context about what success looks like..."
                  rows={3}
                  maxLength={1000}
                  className="rounded-2xl border-black/[0.08] bg-orb-inset/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target" className="orb-label">
                  Target Date
                </Label>
                <div className="relative">
                  <Input
                    id="goal-target"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60 pr-10"
                  />
                  <CalendarDays
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-orb-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-full px-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-orb-muted"
                  onClick={() => onOpenChange(false)}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button type="submit" className="orb-pill" disabled={busy || !title.trim()}>
                  {busy ? <Loader2 size={14} className="animate-spin" /> : null}
                  Continue
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="relative flex h-14 w-14 items-center justify-center" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orb-purple/25" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-orb-purple/15 text-orb-purple-deep">
                <Loader2 size={22} className="animate-spin" />
              </span>
            </span>
            <p className="text-[15px] font-semibold text-orb-heading">Drafting your task plan…</p>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-orb-muted">
              The AI agent is breaking &quot;{title}&quot; into concrete tasks, assigning owners and deadlines.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
