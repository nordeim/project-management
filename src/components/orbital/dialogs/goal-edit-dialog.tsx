"use client";

// Edit Goal: title, description, status, target date.

import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOAL_STATUS_META, type GoalDTO, type GoalStatus } from "@/lib/orbital";

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
      <DialogContent className="sm:max-w-[480px]" overlayClassName="bg-[rgba(46,42,38,0.3)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-orb-heading">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05]" aria-hidden="true">
              <Pencil size={14} />
            </span>
            Edit Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-goal-title" className="orb-label">
              Title *
            </Label>
            <Input
              id="edit-goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className=""
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-goal-description" className="orb-label">
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
            <div className="space-y-2">
              <Label className="orb-label">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                <SelectTrigger className="">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(Object.keys(GOAL_STATUS_META) as GoalStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {GOAL_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-goal-target" className="orb-label">
                Target Date
              </Label>
              <Input
                id="edit-goal-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-[38px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
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
