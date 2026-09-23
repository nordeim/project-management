"use client";

// Edit Task: same fields as Add Task, prefilled.

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUS_META, type TaskDTO, type TaskStatus } from "@/lib/orbital";

const UNASSIGNED = "__unassigned__";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function TaskEditDialog({ task, onClose }: { task: TaskDTO; onClose: () => void }) {
  const updateTask = useOrbital((s) => s.updateTask);
  const people = useOrbital((s) => s.people);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [deadline, setDeadline] = useState(toDateInput(task.deadline));
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id ?? UNASSIGNED);
  const [hours, setHours] = useState(task.estimatedHours != null ? String(task.estimatedHours) : "");
  const [busy, setBusy] = useState(false);

  // The dialog mounts fresh per task (conditional render in parents) —
  // state initializes from props on mount, no reset effect needed.

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    const done = await updateTask(task.id, task.goalId, {
      title: trimmed,
      description: description.trim(),
      status,
      deadline: deadline || null,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
      estimatedHours: hours ? Number.parseFloat(hours) : null,
    });
    setBusy(false);
    if (done) onClose();
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      {/* v2.1 (measured): task-edit scrim is 0.3 (form dialogs).
          v2.10 (measured): the form dialogs render the panel INSIDE the
          scrim — one fixed flex root at z-200 with this panel as its
          relative child. */}
      <DialogContent scrimFlex overlayClassName="z-[200] bg-[rgba(46,42,38,0.3)]">
        {/* v2.10 (measured): the heading is a <p> 15/600 lh 22.5 with a
            20px bottom margin (not an H2 — the panel carries no heading
            role). */}
        <DialogTitle asChild>
          <p className="mb-5 text-[15px] font-semibold leading-[22.5px] text-orb-heading">Edit Task</p>
        </DialogTitle>

        {/* v2.10 (measured): the form is a flex column with a 14px gap. */}
        <form onSubmit={submit} className="flex flex-col gap-[14px]">
          <div>
            <Label htmlFor="edit-title" className="orb-label-dlg">
              Title *
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="h-[35.5px]"
            />
          </div>

          <div>
            <Label htmlFor="edit-description" className="orb-label-dlg">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="min-h-[72px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-status" className="orb-label-dlg">
                Status
              </Label>
              {/* v2.9 (measured): the live's status control is a NATIVE
                  select (216×35, bg #EBE7E2, r10, 13px) — not a shadcn
                  button trigger. */}
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="orb-select"
              >
                {(Object.keys(TASK_STATUS_META) as TaskStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-deadline" className="orb-label-dlg">
                Deadline
              </Label>
              <Input
                id="edit-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-[37.5px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-assignee" className="orb-label-dlg">
                Assignee
              </Label>
              {/* v2.9 (measured): a NATIVE select like the live's. */}
              <select
                id="edit-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="orb-select"
              >
                <option value={UNASSIGNED}>— Unassigned —</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-hours" className="orb-label-dlg">
                Estimated Hours
              </Label>
              <Input
                id="edit-hours"
                type="number"
                min={0}
                max={200}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="h-[35.5px]"
              />
            </div>
          </div>

          {/* v2.10 (measured): the button row sits 4px under the form
              with a 10px gap (goal-edit uses 6px). */}
          <div className="mt-[4px] flex items-center justify-end gap-[10px]">
            <Button
              type="button"
              className="orb-btn-cancel-std"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            {/* v2.1 (measured): the live's task-edit submit reads "Save
                Changes" at pad 8/22 (w 124.9) — wider than goal-edit's
                "Save" (8/20). Inline style: unlayered .orb-btn-submit
                padding beats Tailwind px utilities. */}
            <Button
              type="submit"
              className="orb-btn-submit"
              style={{ paddingLeft: 22, paddingRight: 22 }}
              disabled={busy || !title.trim()}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
