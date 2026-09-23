"use client";

// Date picker for the goal wizard (reference pattern, v1.4/v1.5): a
// well-style "Pick a deadline" trigger opening a popover calendar — a
// raised #EEEAE6 card (260px, radius 16), month header with circular
// chevrons, Su–Sa column headers, a 7x6 grid with adjacent-month days
// muted, today in bold purple, selected day filled. Grid math and the
// long trigger date format live in the pure seam src/lib/calendar.ts
// (unit tested).

import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatLongDate, isSameDay, monthGrid } from "@/lib/calendar";

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
    ? formatLongDate(new Date(value + "T00:00:00"))
    : "Pick a deadline";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          className="flex h-auto w-full items-center gap-2.5 rounded-[10px] bg-orb-well px-3.5 py-[9px] text-left text-[13px] text-orb-heading orb-inset transition-colors disabled:opacity-50"
        >
          <Calendar size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-[#9A9A9A]" />
          <span className={value ? "" : "text-orb-muted"}>{triggerLabel}</span>
        </button>
      </PopoverTrigger>
      {/* Reference (v1.5; re-measured v2.0/v2.1): the calendar popover opens
          CENTERED under the trigger and grows downward (overflowing the
          dialog like the live), and renders only the weeks the month needs.
          v2.1 (measured): it is a TWO-LAYER card — an outer 262px r14
          #ECEBE9 card (1px #D8D4CF border + a Material-style drop shadow)
          wrapping an inner r16 #EEEAE6 card (pad 16/18) that carries the
          neumorphic -8px pair. */}
      <PopoverContent
        align="center"
        avoidCollisions={false}
        className="w-[262px] rounded-[14px] border border-[#D8D4CF] bg-[#ECEBE9] p-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
      >
        <div className="rounded-[16px] bg-[#EEEAE6] p-[16px_18px] shadow-[-8px_-8px_16px_rgba(255,250,244,0.78),8px_8px_18px_rgba(160,143,126,0.31)]">
        {/* v2.6 (measured live): the month row is a 20px line box (the
            28px chevrons overflow it vertically — h-5 with items-center
            centers them exactly like the live) with a 12px bottom margin;
            the weekday row starts 12px below the label's row bottom. */}
        <div className="mb-3 flex h-5 items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-orb-raised text-orb-muted shadow-[-3px_-3px_6px_rgba(255,250,244,0.82),3px_3px_6px_rgba(160,143,126,0.28)] transition-colors hover:text-orb-heading"
          >
            <ChevronLeft size={14} />
          </button>
          <p className="text-[14px] font-semibold leading-5 text-orb-heading">{monthLabel}</p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-orb-raised text-orb-muted shadow-[-3px_-3px_6px_rgba(255,250,244,0.82),3px_3px_6px_rgba(160,143,126,0.28)] transition-colors hover:text-orb-heading"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label={monthLabel}>
          {WEEKDAYS.map((wd) => (
            /* v2.6 (measured live): weekday headers are 11px/700 #9A9A9A
                on a 25px row (the clone's old 500/#6E6E6E 21px row read
                as 4px shorter overall). */
            <div key={wd} role="columnheader" className="text-center text-[11px] font-bold leading-[25px] text-[#9A9A9A]">
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
                  /* v2.1 (measured): day cells are 32px squares with
                      radius 16, not full-round. */
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-[16px] text-[13px] transition-colors",
                  cell.inMonth ? "text-orb-heading" : "text-orb-muted/45",
                  cell.inMonth && !isSelected && !isToday && "hover:bg-black/[0.06]",
                  /* Reference (v1.5): today renders as bold purple text. */
                  isToday && !isSelected && "font-bold text-orb-purple",
                  isSelected && "bg-orb-heading font-semibold text-white hover:bg-orb-heading",
                )}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
