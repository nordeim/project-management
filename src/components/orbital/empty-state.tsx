"use client";

// Friendly empty state used by My Tasks, Team, Activity, Goals.

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
    <div className="orb-card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-orb-inset text-orb-muted" aria-hidden="true">
        {icon}
      </div>
      <p className="text-[15px] font-semibold text-orb-heading">{title}</p>
      <p className="max-w-sm text-sm text-orb-muted">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
