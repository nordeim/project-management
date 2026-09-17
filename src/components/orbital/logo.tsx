// ORBITAL brand marks. Pixel-measured against the live app (v1.3):
// - Sidebar mark: SIX purple dots in a hexagonal ring (12/2/4/6/8/10
//   o'clock — 60 degrees apart), no container.
// - Login mark: SIX purple dots stacked in a 1-2-3 pyramid inside a white
//   circle with a soft border.
// The dot positions are pure functions so the geometry is unit-tested.

export interface Dot {
  cx: number;
  cy: number;
}

/** Six points on a circle of r=14 centered at (20,20), starting at 12 o'clock. */
export function ringDotPositions(): Dot[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (-90 + i * 60) * (Math.PI / 180);
    return { cx: 20 + 14 * Math.cos(angle), cy: 20 + 14 * Math.sin(angle) };
  });
}

/** Six points stacked 1-2-3 (pyramid) centered on (20,20). */
export function pyramidDotPositions(): Dot[] {
  const rows = [
    { y: 8, xs: [20] },
    { y: 20, xs: [13, 27] },
    { y: 32, xs: [6, 20, 34] },
  ];
  const dots: Dot[] = [];
  for (const row of rows) {
    for (const cx of row.xs) dots.push({ cx, cy: row.y });
  }
  return dots;
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const dots = ringDotPositions();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={2.8} fill="#996CE4" />
      ))}
    </svg>
  );
}

/** Login-card mark: the 1-2-3 dot pyramid in a white circle. */
export function LogoPyramid({ size = 44, className }: { size?: number; className?: string }) {
  const dots = pyramidDotPositions();
  return (
    <span
      className={`flex items-center justify-center rounded-full border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(47,40,35,0.08)] ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40" fill="none">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={3.1} fill="#996CE4" />
        ))}
      </svg>
    </span>
  );
}

export function LogoWordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={30} />
      <span className="text-[15px] font-bold uppercase tracking-[0.18em] text-orb-heading">Orbital</span>
    </span>
  );
}
