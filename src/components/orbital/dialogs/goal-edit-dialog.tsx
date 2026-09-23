"use client";

// Edit Goal: title, description, status, target date.

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GOAL_STATUS_META, type GoalDTO, type GoalStatus } from "@/lib/orbital";

// v2.10 (measured on the live, F11): the status select's option order is
// Draft | Active | Paused | Completed — NOT the META's insertion order.
const GOAL_EDIT_OPTION_ORDER: GoalStatus[] = ["draft", "active", "paused", "done"];

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function GoalEditDialog({ goal, onClose }: { goal: GoalDTO; onClose: () => void }) {
  const updateGoal = useOrbital((s) => s.updateGoal);

  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? "");
  const [status, setStatus] = useState<GoalStatus>(goal.status);
  const [targetDate, setTargetDate] = useState(toDateInput(goal.targetDate));
  const [busy, setBusy] = useState(false);

  // The dialog mounts fresh per goal (conditional render in parents) —
  // state initializes from props on mount, no reset effect needed.

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    const done = await updateGoal(goal.id, {
      title: trimmed,
      description: description.trim(),
      status,
      targetDate: targetDate || null,
    });
    setBusy(false);
    if (done) onClose();
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      {/* v2.1 (measured): goal-edit scrim is 0.3 (form dialogs). */}
      {/* v2.9 (measured on the live): the Edit Goal dialog carries NO
          close square — its only controls are the status select, Cancel
          and Save (add-task/task-edit keep the 30px close). */}
      {/* v2.10 (measured): the form dialogs render the panel INSIDE the
          scrim — one fixed flex root at z-200 with this panel as its
          relative child. */}
      <DialogContent
        showCloseButton={false}
        scrimFlex
        className="sm:max-w-[480px]"
        overlayClassName="z-[200] bg-[rgba(46,42,38,0.3)]"
      >
        {/* v2.10 (measured): the heading is a <p> 15/600 lh 22.5 with a
            20px bottom margin (no heading semantics, no icon circle —
            the live's panel carries zero svgs). */}
        <DialogTitle asChild>
          <p className="mb-5 text-[15px] font-semibold leading-[22.5px] text-orb-heading">Edit Goal</p>
        </DialogTitle>

        {/* v2.10 (measured): the form is a flex column with a 14px gap. */}
        <form onSubmit={submit} className="flex flex-col gap-[14px]">
          <div>
            {/* v2.10 (measured, F11): the Title label carries NO
                asterisk on the live (add-task keeps its asterisk). */}
            <Label htmlFor="edit-goal-title" className="orb-label-dlg">
              Title
            </Label>
            <Input
              id="edit-goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="h-[35.5px]"
            />
          </div>

          <div>
            <Label htmlFor="edit-goal-description" className="orb-label-dlg">
              Description
            </Label>
            <Textarea
              id="edit-goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="min-h-[72px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-goal-status" className="orb-label-dlg">
                Status
              </Label>
              {/* v2.9 (measured): the live's status control is a NATIVE
                  select (216×35, bg #EBE7E2, r10, 13px, UA arrow) — not a
                  shadcn button trigger. v2.10 (F11): option order
                  Draft | Active | Paused | Completed. */}
              <select
                id="edit-goal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="orb-select"
              >
                {GOAL_EDIT_OPTION_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {GOAL_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-goal-target" className="orb-label-dlg">
                Target Date
              </Label>
              <Input
                id="edit-goal-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-[37.5px]"
              />
            </div>
          </div>

          {/* v2.10 (measured): the goal-edit button row sits 6px under
              the form with a 10px gap. */}
          <div className="mt-[6px] flex items-center justify-end gap-[10px]">
            <Button
              type="button"
              className="orb-btn-cancel-std"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            {/* v2.1 (measured): the live's goal-edit submit reads "Save"
                (w 67.5, pad 8/20). */}
            <Button type="submit" className="orb-btn-submit" disabled={busy || !title.trim()}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
