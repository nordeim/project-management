"use client";

// New Goal: a three-step conversational wizard like the reference app.
// v1.9 (re-measured): the wizard is a CONVERSATIONAL WRAPPER — a 680px
// radius-24 panel (pad 28/28/24) holding the bot avatar + intro bubble
// above the form panel (624px, radius 16, pad 22/24). The avatar is a 32px
// circle with a purple-tinted light shadow; the bubble is a 400px speech
// chip (radius 0 14 14 14 — square on the avatar side) carrying 13px/400
// #3A3A3A copy. A 32px radius-9 close square sits top-right. Step 1 form:
// "Goal Details" (13px/600) with 12px/600 #6E6E6E ls-0.48 labels, CANCEL
// (raised) + ✨ CONTINUE (dark pill) grouped LEFT. Step 2: the agent bubble
// ("Great! Before I break this into tasks…") + clarifying questions.

import { useState } from "react";
import { Bot, Loader2, Sparkles, X } from "lucide-react";
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
      {/* v1.9 (measured): the wizard wrapper — 680px, radius 24, pad
          28/28/24 — carrying the conversational chrome (avatar + bubble)
          above the 624px form panel; the scrim is the wizard's own 0.3
          alpha (standard dialogs use 0.25). */}
      <DialogContent
        className="max-h-[90vh] gap-0 overflow-y-auto p-[28px_28px_24px] sm:max-w-[680px] sm:rounded-[24px]"
        overlayClassName="bg-[rgba(46,42,38,0.3)]"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Create a new goal</DialogTitle>
        </DialogHeader>

        {/* v1.9 (measured): the 32px radius-9 close square, top-right of
            the wrapper (10px inside the 28px pad), raised pair. */}
        <button
          type="button"
          onClick={() => {
            if (busy) return;
            onOpenChange(false);
            reset();
          }}
          className="absolute top-[18px] right-[18px] flex h-8 w-8 items-center justify-center rounded-[9px] bg-orb-well text-[#5A5A5A] shadow-[-4px_-4px_8px_rgba(255,250,244,0.82),4px_4px_10px_rgba(160,143,126,0.28)] transition-colors hover:text-orb-heading"
          aria-label="Close"
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
        </button>

        {/* v1.9 (measured): the conversational chrome — 32px bot avatar
            (purple-tinted light shadow, 16px glyph) + 12px gap + the intro
            bubble (radius 0 14 14 14 — square on the avatar side, pad
            10/16, 13px/400 #3A3A3A). */}
        <div className="flex items-start gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orb-raised text-[#7C6FA0] shadow-[-4px_-4px_12px_rgba(202,181,245,0.56),4px_4px_13px_rgba(160,143,126,0.29)]"
            aria-hidden="true"
          >
            <Bot size={16} strokeWidth={2} />
          </span>
          <div className="max-w-[400px] rounded-[0px_14px_14px_14px] bg-orb-raised px-4 py-[10px] shadow-[-4px_-4px_8px_rgba(255,250,244,0.82),4px_4px_8px_rgba(160,143,126,0.28)]">
            <p className="text-[13px] font-normal leading-[19.5px] text-orb-heading">
              {step === "details"
                ? "Tell me about your goal. What do you want to achieve? I'll ask a few questions before creating a plan."
                : "Great! Before I break this into tasks, I have a few questions:"}
            </p>
          </div>
        </div>

        {step === "details" ? (
          // v1.9 (measured): the form panel — 624px (the wrapper's content
          // width), radius 16, pad 22/24, the -8px panel pair — directly
          // below the bubble. Section heading 13px/600 #3A3A3A; field labels
          // 12px/600 #6E6E6E ls 0.48px in Title Case.
          <form onSubmit={continueToQuestions} className="mt-6 rounded-[16px] bg-orb-raised p-[22px_24px] shadow-[-8px_-8px_16px_rgba(255,250,244,0.78),8px_8px_18px_rgba(160,143,126,0.31)]">
            <p className="text-[13px] font-semibold text-orb-heading">Goal Details</p>
            <div className="mt-5 space-y-[7px]">
              <Label htmlFor="goal-title" className="text-[12px] font-semibold tracking-[0.04em] text-orb-muted">
                Goal Title
              </Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Launch new landing page by end of month"
                required
                maxLength={200}
                className="h-auto py-[9px]"
              />
            </div>
            <div className="mt-[15px] space-y-[7px]">
              <Label htmlFor="goal-description" className="text-[12px] font-semibold tracking-[0.04em] text-orb-muted">
                Description <span className="font-normal">(optional)</span>
              </Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context about what success looks like..."
                className="h-[88px] rounded-[10px] px-[14px] py-[10px] text-[13px] shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.22)]"
                maxLength={1000}
              />
            </div>
            <div className="mt-[23px] space-y-[7px]">
              <Label htmlFor="goal-target" className="text-[12px] font-semibold tracking-[0.04em] text-orb-muted">
                Target Date
              </Label>
              <DatePicker value={targetDate} onChange={setTargetDate} disabled={busy} ariaLabel="Pick a deadline" />
            </div>

            {/* v1.8 (measured): CANCEL + CONTINUE grouped LEFT with a 10px
                gap; CANCEL is RAISED (bg #EEEAE6, text #3A3A3A — not an
                inset well); CONTINUE carries a 13px sparkles glyph and
                keeps the dark fill while disabled. v2.0: 22px below the
                date block (measured). */}
            <div className="flex items-center gap-2.5 mt-[22px]">
              <Button
                type="button"
                className="orb-btn-raised-cancel"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              {/* v2.0: px-[18px]! — the Button base's has-[>svg]:px-3 carries
                  a :has() specificity bump that beats the custom class. */}
              <Button type="submit" className="orb-btn-dark px-[18px]!" disabled={busy || !title.trim()}>
                {busy ? <Loader2 size={13} className="size-[13px] animate-spin" /> : <Sparkles size={13} className="size-[13px]" aria-hidden="true" />}
                Continue
              </Button>
            </div>
          </form>
        ) : null}

        {step === "questions" ? (
          <div className="space-y-5">
            {/* v1.9 (measured): the step-2 chrome is the SAME avatar +
                bubble (the bubble copy is rendered by the shared header
                above); the questions list follows below. */}
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
                  className="orb-btn-raised-cancel"
                  onClick={backToDetails}
                  disabled={busy}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="orb-btn-dark px-[18px]!"
                  onClick={() => void generate()}
                  disabled={busy}
                >
                  {busy ? <Loader2 size={13} className="size-[13px] animate-spin" /> : <Sparkles size={13} className="size-[13px]" aria-hidden="true" />}
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
