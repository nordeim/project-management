"use client";

// New Goal: a three-step conversational wizard like the reference app.
// Step 1 — the AI assistant bubble + goal details form (title, description,
// target date). Step 2 — the agent asks up to three clarifying questions
// (LLM-backed with deterministic fallback on the server) with optional
// answers. Step 3 — the agent generates the task plan, then hands off to
// the goal detail page.

import { useState } from "react";
import { ArrowLeft, CalendarDays, Loader2, Plus, Sparkles } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type Step = "details" | "questions" | "generating";

export function NewGoalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createGoal = useOrbital((s) => s.createGoal);
  const clarifyGoal = useOrbital((s) => s.clarifyGoal);
  const generateTasks = useOrbital((s) => s.generateTasks);
  const navigate = useOrbital((s) => s.navigate);

  const [step, setStep] = useState<Step>("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function reset() {
    setStep("details");
    setTitle("");
    setDescription("");
    setTargetDate("");
    setQuestions([]);
    setAnswers([]);
    setBusy(false);
  }

  // Step 1 -> Step 2: the agent analyzes the draft and asks clarifying
  // questions (server-side LLM with deterministic fallback).
  async function continueToQuestions(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    const qs = await clarifyGoal({ title: trimmed, description: description.trim() || undefined });
    setBusy(false);
    if (!qs) return; // toast already surfaced by call()
    setQuestions(qs);
    setAnswers(qs.map(() => ""));
    setStep("questions");
  }

  // Step 2 -> Step 3: create the goal, then generate its plan with the
  // clarifying answers folded into the prompt.
  async function generate() {
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
    const created = await generateTasks(
      goalId,
      answers.map((a) => a.trim()).filter(Boolean),
    );
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

  function backToDetails() {
    setStep("details");
    setQuestions([]);
    setAnswers([]);
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
                  Tell me about your goal. What do you want to achieve? I&apos;ll ask a few questions
                  before creating a plan.
                </p>
              </div>
            </div>

            <form onSubmit={continueToQuestions} className="mt-6 space-y-4">
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
        ) : null}

        {step === "questions" ? (
          <div className="p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orb-purple/15 text-orb-purple-deep" aria-hidden="true">
                <Sparkles size={18} />
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-orb-inset/80 px-4 py-3">
                <p className="text-[14px] leading-relaxed text-orb-body">
                  Before I draft the plan, a few questions — answer any you care about.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-[14px] font-medium leading-relaxed text-orb-body" id={`clarify-q-${index}`}>
                    {question}
                  </p>
                  <Textarea
                    aria-labelledby={`clarify-q-${index}`}
                    value={answers[index] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => prev.map((a, i) => (i === index ? e.target.value : a)))
                    }
                    placeholder="Your answer..."
                    rows={2}
                    maxLength={500}
                    className="rounded-2xl border-black/[0.08] bg-orb-inset/60"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-full px-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-orb-muted"
                  onClick={backToDetails}
                  disabled={busy}
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  Back
                </Button>
                <Button
                  type="button"
                  className="orb-pill"
                  onClick={() => void generate()}
                  disabled={busy}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} aria-hidden="true" />}
                  Generate Tasks
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {step === "generating" ? (
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
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
