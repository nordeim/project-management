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
          panel — smaller than the 500px form dialogs. v2.10 (measured):
          below sm the panel anchors at 5% of the viewport height (y 42.2
          at 844 — the live's mobile spec); from sm it centers vertically
          like before (y 246 at 900). The check-in keeps the classic
          overlay+content split at z-50 (the live measured z 50, not the
          form dialogs' 200). */}
      <DialogContent
        className="top-[5%] translate-y-0 sm:max-w-[448px] sm:top-1/2 sm:-translate-y-1/2 rounded-[16px] p-6"
        closeClassName="bg-orb-raised"
      >
        <DialogHeader>
          {/* v1.7 (measured): 16px/500 — quieter than 17px/600. */}
          <DialogTitle className="text-left text-[16px] font-medium leading-[16px] tracking-[-0.4px] text-orb-heading">{task.title}</DialogTitle>
        </DialogHeader>

        {/* v1.8 (measured): 12px #767676 — a hairline smaller and lighter
            than the v1.7 reading (13.5px #6E6E6E). */}
        <div className="space-y-1 text-[12px] text-[#767676]">
          {task.assignee ? <p>Assigned to: {task.assignee.name}</p> : <p>Unassigned</p>}
        </div>

        {task.description ? (
          <p className="rounded-2xl bg-orb-inset/60 p-4 text-[13px] leading-relaxed text-orb-muted">
            {task.description}
          </p>
        ) : null}

        {/* v2.6 (measured live): the form block carries pt 16 and 16px
            gaps between the radio grid, the note, and the submit (the
            clone's old space-y-2 read 8px; the live's panel is 353 tall
            vs 322). */}
        <div className="pt-4">
          {/* v2.0 (measured): 12px/600/ls 0.96/lh 18 — one tier up from the
              11px .orb-label, with a 12px gap to the radios. */}
          <p className="mb-[12px] text-[12px] font-semibold uppercase tracking-[0.96px] leading-[18px] text-orb-muted">Post Status Update</p>
          {/* Reference (v1.5): plain radio labels in a 2-col grid — no card
              wrappers, no borders; 14px fw 500 charcoal text. v2.6: lh 20
              (the live's radio block is 48px = 2 rows of 24). v2.10
              (measured): the labels are CONTENT-WIDTH blocks (w-max —
              59/52/69/34px on the live), and the 16px circles pin the
              literal 9999px radius with #2F2823 (v4's rounded-full
              serializes as 33554432px). */}
          <RadioGroup
            value={status ?? undefined}
            onValueChange={(v) => setStatus(v as UpdateStatus)}
            className="grid grid-cols-2 gap-2"
          >
            {OPTIONS.map((option) => (
              /* v2.10 (measured on the live, F3): the labels are
                 content-width TEXT-ONLY <label> elements (58/51/69/34
                 wide at 14/500/20) with the radio as a SIBLING — not
                 wrappers around the button. The htmlFor wiring keeps
                 text-click activation (buttons are labelable). */
              <div
                key={option}
                className="flex w-max cursor-pointer items-center gap-2.5"
              >
                <RadioGroupItem
                  id={`update-${option}`}
                  value={option}
                  className="rounded-[9999px] border-black/25 text-[16px] font-normal text-[#2F2823]"
                />
                <Label
                  htmlFor={`update-${option}`}
                  className={cn(
                    "cursor-pointer text-[14px] font-medium leading-5 transition-colors",
                    status === option ? "text-orb-heading" : "text-orb-body",
                  )}
                >
                  {UPDATE_STATUS_META[option].label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Reference (v1.5): bordered transparent textarea — 1px
              #D8D4CF, radius 14, 80px tall (not a well). v2.10
              (measured): the note text renders at 16px (was 14). */}
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            rows={3}
            maxLength={1000}
            className="mt-4 h-20 rounded-[14px] border border-[#D8D4CF] bg-transparent px-3 py-2 text-[16px] text-orb-body placeholder:text-orb-muted focus-visible:border-orb-purple/60 focus-visible:ring-0"
            aria-label="Status update note"
          />

          {/* Reference (v1.5): dark primary pill — #2F2823 bg, white text,
              radius 14, 32px tall, 16px Send icon (v1.7), literal Title Case
              label (.orb-btn-post is the dedicated class). */}
          <button
            type="button"
            className="orb-btn-post mt-4"
            disabled={!status || busy}
            onClick={() => void submit()}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} aria-hidden="true" className="mr-[4px]" />}
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
