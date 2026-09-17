"use client";

// Task detail dialog: task info + POST STATUS UPDATE check-in (On Track /
// Blocked / Need Help / Done + optional note) and the update history.

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
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
      {/* Reference spec (v1.5): the check-in modal is a 448px / radius-16
          panel — smaller than the 500px form dialogs. */}
      <DialogContent className="sm:max-w-[448px] rounded-[16px]">
        <DialogHeader>
          <DialogTitle className="text-left text-[17px] leading-snug text-orb-heading">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 text-[13.5px] text-orb-muted">
          {task.assignee ? <p>Assigned to: {task.assignee.name}</p> : <p>Unassigned</p>}
        </div>

        {task.description ? (
          <p className="rounded-2xl bg-orb-inset/60 p-4 text-[13.5px] leading-relaxed text-orb-body">
            {task.description}
          </p>
        ) : null}

        <div className="space-y-3">
          <p className="orb-label">Post Status Update</p>
          {/* Reference (v1.5): plain radio labels in a 2-col grid — no card
              wrappers, no borders; 14px fw 500 charcoal text. */}
          <RadioGroup
            value={status ?? undefined}
            onValueChange={(v) => setStatus(v as UpdateStatus)}
            className="grid grid-cols-2 gap-x-3 gap-y-2"
          >
            {OPTIONS.map((option) => (
              <Label
                key={option}
                htmlFor={`update-${option}`}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 text-[14px] font-medium transition-colors",
                  status === option ? "text-orb-heading" : "text-orb-body",
                )}
              >
                <RadioGroupItem id={`update-${option}`} value={option} className="border-black/25" />
                {UPDATE_STATUS_META[option].label}
              </Label>
            ))}
          </RadioGroup>

          {/* Reference (v1.5): bordered transparent textarea — 1px
              #D8D4CF, radius 14, 80px tall (not a well). */}
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            rows={3}
            maxLength={1000}
            className="h-20 rounded-[14px] border border-[#D8D4CF] bg-transparent px-3 py-2 text-[14px] text-orb-body placeholder:text-orb-muted focus-visible:border-orb-purple/60 focus-visible:ring-0"
            aria-label="Status update note"
          />

          {/* Reference (v1.5): dark primary pill — #2F2823 bg, white text,
              radius 14, 32px tall, Send icon, literal Title Case label
              (.orb-btn-post is the dedicated class for this variant). */}
          <button
            type="button"
            className="orb-btn-post"
            disabled={!status || busy}
            onClick={() => void submit()}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} aria-hidden="true" />}
            Post Update
          </button>
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
