"use client";

// Task detail dialog: task info + POST STATUS UPDATE check-in (On Track /
// Blocked / Need Help / Done + optional note) and the update history.

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { UPDATE_STATUS_META, relativeTime, type TaskDTO, type UpdateStatus } from "@/lib/orbital";
import { cn } from "@/lib/utils";

const OPTIONS: UpdateStatus[] = ["on_track", "blocked", "need_help", "done"];

export function TaskDetailDialog({ task, onClose }: { task: TaskDTO; onClose: () => void }) {
  const postUpdate = useOrbital((s) => s.postUpdate);

  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // The dialog mounts fresh per task (conditional render in parents), so
  // state initializes cleanly — no reset effect needed.

  async function submit() {
    if (!status || busy) return;
    setBusy(true);
    const done = await postUpdate(task.id, task.goalId, status, note.trim() || undefined);
    setBusy(false);
    if (done) onClose();
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-left text-[17px] leading-snug text-orb-heading">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 text-[13.5px] text-orb-muted">
          {task.assignee ? <p>Assigned to: {task.assignee.name}</p> : <p>Unassigned</p>}
          {task.goalTitle ? <p>Goal: {task.goalTitle}</p> : null}
          {task.deadline ? (
            <p>
              Deadline:{" "}
              {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          ) : null}
        </div>

        {task.description ? (
          <p className="rounded-2xl bg-orb-inset/60 p-4 text-[13.5px] leading-relaxed text-orb-body">
            {task.description}
          </p>
        ) : null}

        <div className="space-y-3">
          <p className="orb-label">Post status update</p>
          <RadioGroup
            value={status ?? undefined}
            onValueChange={(v) => setStatus(v as UpdateStatus)}
            className="grid grid-cols-2 gap-2"
          >
            {OPTIONS.map((option) => (
              <Label
                key={option}
                htmlFor={`update-${option}`}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-2xl border px-4 text-[13.5px] font-medium transition-colors",
                  status === option
                    ? "border-orb-purple/50 bg-orb-purple/10 text-orb-heading"
                    : "border-black/[0.07] bg-orb-inset/40 text-orb-muted hover:bg-orb-inset/70",
                )}
              >
                <RadioGroupItem id={`update-${option}`} value={option} className="border-black/20" />
                {UPDATE_STATUS_META[option].label}
              </Label>
            ))}
          </RadioGroup>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            rows={2}
            maxLength={1000}
            className="rounded-2xl border-black/[0.08] bg-orb-inset/60"
            aria-label="Status update note"
          />

          <Button
            type="button"
            className="orb-pill w-full"
            disabled={!status || busy}
            onClick={() => void submit()}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
            Post Update
          </Button>
        </div>

        {task.updates.length > 0 ? (
          <div className="space-y-2 border-t border-black/[0.06] pt-4">
            <p className="orb-label">Update history</p>
            <ul className="orb-scroll max-h-40 space-y-2.5 overflow-y-auto pr-1">
              {task.updates.map((u) => (
                <li key={u.id} className="text-[13px]">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-orb-heading">{UPDATE_STATUS_META[u.status].label}</span>
                    <span className="shrink-0 text-[12px] text-orb-muted">{relativeTime(u.createdAt)}</span>
                  </p>
                  {u.note ? <p className="mt-0.5 leading-relaxed text-orb-muted">{u.note}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
