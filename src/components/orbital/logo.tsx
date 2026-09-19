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

/** Six points on a circle of r=24.8 centered at (20,20), starting at 12
 * o'clock. v1.8: re-measured on the live app — the 11px mark carries
 * ~3.5px dots on a 6.82px ring that OVERFLOWS the box (proportions
 * 0.62 ring / 0.16 dot radius), not the v1.3 in-box ring. */
export function ringDotPositions(): Dot[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (-90 + i * 60) * (Math.PI / 180);
    return { cx: 20 + 24.8 * Math.cos(angle), cy: 20 + 24.8 * Math.sin(angle) };
  });
}

/** Dot radius for the login pyramid, scaled from the live app's logo SVG
 * (Frame24.svg: r=82.6552 on a 1200-unit canvas → 2.7552 on 40). */
export const PYRAMID_DOT_R = 2.7552;

/** Ring-mark dot radius: 0.16 of the 40-unit box (measured 1.76px on the
 * live app's 11px mark → 3.52px dots, clearly visible at small sizes). */
export const RING_DOT_R = 6.4;

/** Six points stacked 1-2-3 (pyramid) centered on (20,20). v1.8: the
 * coordinates are scaled 1:30 from the live app's actual logo SVG
 * (media.base44.com Frame24.svg, fetched 2026-09-18) — row 1 at y≈10.09,
 * rows ~9.27 apart, row-2 dots ±11.01 from the axis, row-3 ±22.01. */
export function pyramidDotPositions(): Dot[] {
  const rows = [
    { y: 10.0892, xs: [19.9837] },
    { y: 19.3576, xs: [14.4733, 25.494] },
    { y: 28.3254, xs: [8.9715, 19.9837, 30.9959] },
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
    // v1.8: overflow-visible so the out-of-box ring renders like the live
    // mark (the dots extend past the nominal 40-unit square).
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`overflow-visible ${className ?? ""}`}
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={RING_DOT_R} fill="#996CE4" />
      ))}
    </svg>
  );
}

/** Login-card mark (v1.9, measured from the live app's actual Frame24.svg:
 * a WHITE ROUNDED SQUARE — rx 98 on a 1200-unit canvas ≈ 8.2% — not a
 * circle) carrying the 1-2-3 dot pyramid at the reference's proportions
 * (dots ≈ 13.75% of the mark). No shadow — the reference logo is a flat
 * white chip. */
export function LogoPyramid({ size = 96, className }: { size?: number; className?: string }) {
  const dots = pyramidDotPositions();
  const corner = Math.round((98 / 1200) * size * 10) / 10;
  return (
    <span
      className={`flex items-center justify-center bg-white ${className ?? ""}`}
      style={{ width: size, height: size, borderRadius: corner }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={PYRAMID_DOT_R} fill="#996CE4" />
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
