"use client";

// Friendly empty state used by My Tasks, Team, Activity, Goals.
// Reference (v1.5): empty states render directly on the canvas — no card
// wrapper, no border or shadow. v1.7 (measured): the icon renders PLAIN
// (no circle, #B3B3B3), the title is 15px/400 and the sub 13px/400 #767676.

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-2 flex items-center justify-center text-[#B3B3B3]" aria-hidden="true">
        {icon}
      </div>
      <p className="text-[15px] font-normal text-orb-heading">{title}</p>
      <p className="max-w-sm text-[13px] font-normal text-[#767676]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
