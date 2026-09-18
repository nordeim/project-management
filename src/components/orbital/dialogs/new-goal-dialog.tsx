"use client";

// New Goal: a three-step conversational wizard like the reference app.
// v1.8 (re-measured): the dialog is 624px at radius 16 with 22/24 padding.
// Step 1 opens DIRECTLY on the "Goal Details" form (13px/600 #3A3A3A section
// heading, 12px/600 #6E6E6E Title-Case field labels) — no bot intro on this
// step — with CANCEL + CONTINUE (dark pill + 13px sparkles icon) grouped on
// the LEFT. Step 2 shows the agent bubble ("Great! Before I break this into
// tasks, I have a few questions:") beside the bot avatar, the clarifying
// questions, and BACK + GENERATE TASKS grouped left. Step 3 — generation.

import { useState } from "react";
import { ArrowLeft, Bot, Loader2, Sparkles } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
      {/* v1.8 (measured): 624px / radius 16 / pad 22px 24px — the wizard is
          wider than the 500px form-dialog base. */}
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-[22px_24px] sm:max-w-[624px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Create a new goal</DialogTitle>
        </DialogHeader>

        {step === "details" ? (
          // v1.8 (measured): step 1 opens directly on the form — no bot
          // intro bubble, no visible title. Section heading 13px/600
          // #3A3A3A; field labels 12px/600 #6E6E6E in Title Case.
          <form onSubmit={continueToQuestions} className="space-y-4">
            <p className="text-[13px] font-semibold text-orb-heading">Goal Details</p>
            <div className="space-y-2">
              <Label htmlFor="goal-title" className="text-[12px] font-semibold text-orb-muted">
                Goal Title
              </Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Launch new landing page by end of month"
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description" className="text-[12px] font-semibold text-orb-muted">
                Description <span className="font-normal">(optional)</span>
              </Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context about what success looks like..."
                rows={3}
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target" className="text-[12px] font-semibold text-orb-muted">
                Target Date
              </Label>
              <DatePicker value={targetDate} onChange={setTargetDate} disabled={busy} ariaLabel="Pick a deadline" />
            </div>

            {/* v1.8 (measured): CANCEL + CONTINUE grouped LEFT with a 10px
                gap; CONTINUE carries a 13px sparkles glyph and keeps the
                dark fill while disabled. */}
            <div className="flex items-center gap-2.5 pt-2">
              <Button
                type="button"
                className="orb-btn-cancel"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" className="orb-btn-dark" disabled={busy || !title.trim()}>
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} aria-hidden="true" />}
                Continue
              </Button>
            </div>
          </form>
        ) : null}

        {step === "questions" ? (
          <div className="space-y-5">
            {/* v1.8 (measured): the agent speaks in a rounded bubble beside
                the bot avatar — the conversational chrome starts at step 2. */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(47,40,35,0.10)]" aria-hidden="true">
                <Bot size={18} className="text-orb-purple-deep" />
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-orb-inset/80 px-4 py-3">
                <p className="text-[14px] leading-relaxed text-orb-body">
                  Great! Before I break this into tasks, I have a few questions:
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* v1.8 (measured): Title Case 13px/600 #3A3A3A — not the
                  uppercase label tier. */}
              <p className="text-[13px] font-semibold text-orb-heading">Clarifying Questions</p>
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
                  />
                </div>
              ))}

              <div className="flex items-center gap-2.5 pt-2">
                <Button
                  type="button"
                  className="orb-btn-cancel"
                  onClick={backToDetails}
                  disabled={busy}
                >
                  <ArrowLeft size={13} aria-hidden="true" />
                  Back
                </Button>
                <Button
                  type="button"
                  className="orb-btn-dark"
                  onClick={() => void generate()}
                  disabled={busy}
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} aria-hidden="true" />}
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
