"use client";

// Edit Task: same fields as Add Task, prefilled.

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
      {/* v2.1 (measured): task-edit scrim is 0.3 (form dialogs). */}
      <DialogContent overlayClassName="bg-[rgba(46,42,38,0.3)]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-orb-heading">Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="orb-label">
              Title *
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className=""
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="orb-label">
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
            <div className="space-y-2">
              <Label className="orb-label">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(Object.keys(TASK_STATUS_META) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deadline" className="orb-label">
                Deadline
              </Label>
              <Input
                id="edit-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-[38px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="orb-label">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56 rounded-xl">
                  <SelectItem value={UNASSIGNED}>— Unassigned —</SelectItem>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hours" className="orb-label">
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
                className=""
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
