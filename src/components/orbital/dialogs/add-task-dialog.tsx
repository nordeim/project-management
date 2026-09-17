"use client";

// Add Task: title, description, status, deadline, assignee, estimated hours.

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
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-orb-heading">Add Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="orb-label">
              Title *
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              maxLength={200}
              className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description" className="orb-label">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              maxLength={1000}
              className="rounded-2xl border-black/[0.08] bg-orb-inset/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="orb-label">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60">
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
              <Label htmlFor="task-deadline" className="orb-label">
                Deadline
              </Label>
              <Input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="orb-label">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60">
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
              <Label htmlFor="task-hours" className="orb-label">
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
                className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-full px-5 text-[13px] font-medium text-orb-muted"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" className="orb-pill" disabled={busy || !title.trim()}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
