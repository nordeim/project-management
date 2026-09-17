"use client";

// Date picker for the goal wizard (reference pattern, v1.4): a well-style
// "Pick a deadline" trigger opening a popover calendar — white card, month
// header with circular chevrons, Su–Sa column headers, a 7x6 grid with
// adjacent-month days muted, today ringed, selected day filled. Grid math
// lives in the pure seam src/lib/calendar.ts (unit tested).

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isSameDay, monthGrid } from "@/lib/calendar";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export function DatePicker({
  value,
  onChange,
  disabled,
  ariaLabel = "Pick a deadline",
}: {
  /** ISO date (yyyy-mm-dd) or empty. */
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  // The month on display defaults to the selected date, else today.
  const [cursor, setCursor] = useState(() => {
    const base = value ? new Date(value + "T00:00:00") : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const grid = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : null;

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function pick(day: Date) {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  }

  const triggerLabel = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Pick a deadline";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className="flex h-11 w-full items-center gap-2.5 rounded-[10px] bg-orb-well px-3.5 text-left text-[14px] text-orb-heading shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)] transition-colors disabled:opacity-50"
        >
          <CalendarDays size={15} aria-hidden="true" className="shrink-0 text-orb-muted" />
          <span className={value ? "" : "text-orb-muted"}>{triggerLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[292px] rounded-2xl border-0 bg-white p-4 shadow-[0_18px_50px_-24px_rgba(47,40,35,0.4)]">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-orb-muted transition-colors hover:bg-black/[0.08] hover:text-orb-heading"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="text-[14px] font-semibold text-orb-heading">{monthLabel}</p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-orb-muted transition-colors hover:bg-black/[0.08] hover:text-orb-heading"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label={monthLabel}>
          {WEEKDAYS.map((wd) => (
            <div key={wd} role="columnheader" className="pb-1 text-center text-[11px] font-medium text-orb-muted">
              {wd}
            </div>
          ))}
          {grid.flat().map((cell) => {
            const cellDate = new Date(cell.year, cell.month, cell.day);
            const isSelected = selected ? isSameDay(cell, selected) : false;
            const isToday = isSameDay(cell, today);
            return (
              <button
                key={`${cell.year}-${cell.month}-${cell.day}`}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                onClick={() => pick(cellDate)}
                className={cn(
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors",
                  cell.inMonth ? "text-orb-heading" : "text-orb-muted/45",
                  cell.inMonth && !isSelected && !isToday && "hover:bg-black/[0.06]",
                  isToday && !isSelected && "ring-1 ring-inset ring-orb-purple/50",
                  isSelected && "bg-orb-heading font-semibold text-white hover:bg-orb-heading",
                )}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
