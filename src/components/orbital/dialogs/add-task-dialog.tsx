"use client";

// Add Task: title, description, status, deadline, assignee, estimated hours.

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUS_META, type TaskStatus } from "@/lib/orbital";

const UNASSIGNED = "__unassigned__";

export function AddTaskDialog({
  goalId,
  open,
  onOpenChange,
}: {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createTask = useOrbital((s) => s.createTask);
  const people = useOrbital((s) => s.people);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState(UNASSIGNED);
  const [hours, setHours] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setStatus("pending");
    setDeadline("");
    setAssigneeId(UNASSIGNED);
    setHours("");
    setBusy(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    setBusy(true);
    const id = await createTask({
      goalId,
      title: trimmed,
      description: description.trim() || undefined,
      status,
      deadline: deadline || undefined,
      assigneeId: assigneeId === UNASSIGNED ? undefined : assigneeId,
      estimatedHours: hours ? Number.parseFloat(hours) : undefined,
    });
    setBusy(false);
    if (id) {
      onOpenChange(false);
      reset();
    }
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
      {/* v2.1 (measured): add-task scrim is 0.3 (form dialogs), not the
          0.25 default. v2.10 (measured): the form dialogs render the panel
          INSIDE the scrim — one fixed flex root at z-200 (pad 24/16, flex
          center) with this panel as its relative child. */}
      <DialogContent
        scrimFlex
        overlayClassName="z-[200] bg-[rgba(46,42,38,0.3)]"
      >
        {/* v2.10 (measured): the heading is a <p> 15/600 lh 22.5 with a 20px
            bottom margin (not an H2 — the panel carries no heading role). */}
        <DialogTitle asChild>
          <p className="mb-5 text-[15px] font-semibold leading-[22.5px] text-orb-heading">Add Task</p>
        </DialogTitle>

        {/* v2.10 (measured): the form is a flex column with a 14px gap (no
            per-row margins — field rows are label 16.5 + 6 + input 35.5). */}
        <form onSubmit={submit} className="flex flex-col gap-[14px]">
          <div>
            <Label htmlFor="task-title" className="orb-label-dlg">
              Title *
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              maxLength={200}
              className="h-[35.5px]"
            />
          </div>

          <div>
            <Label htmlFor="task-description" className="orb-label-dlg">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              maxLength={1000}
              className="min-h-[72px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-status" className="orb-label-dlg">
                Status
              </Label>
              {/* v2.9 (measured): the live's status control is a NATIVE
                  select (216×35, bg #EBE7E2, r10, 13px) — not a shadcn
                  button trigger. */}
              <select
                id="task-status"
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
              <Label htmlFor="task-deadline" className="orb-label-dlg">
                Deadline
              </Label>
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-[37.5px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-assignee" className="orb-label-dlg">
                Assignee
              </Label>
              {/* v2.9 (measured): a NATIVE select like the live's. */}
              <select
                id="task-assignee"
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
              <Label htmlFor="task-hours" className="orb-label-dlg">
                Estimated Hours
              </Label>
              <Input
                id="task-hours"
                type="number"
                min={0}
                max={200}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 3"
                className=""
              />
            </div>
          </div>

          {/* v2.10 (measured): the button row sits 4px under the form with a
              10px gap (goal-edit uses 6px) — 34px-tall flat pills. */}
          <div className="mt-[4px] flex items-center justify-end gap-[10px]">
            <Button
              type="button"
              className="orb-btn-cancel-std"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            {/* v2.1 (measured): the add-task submit pill is pad 8/22 (w 96.5)
                — one step wider than the Save pills (8/20). Inline style:
                the unlayered .orb-btn-submit padding beats Tailwind px
                utilities in the cascade. */}
            <Button
              type="submit"
              className="orb-btn-submit"
              style={{ paddingLeft: 22, paddingRight: 22 }}
              disabled={busy || !title.trim()}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
