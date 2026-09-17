// ORBITAL logo mark: eight dots in a ring (the reference brand mark — a
// constellation circle), purple on the app surface. The wordmark pairs it
// with the ORBITAL label.

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  // 8 points on a circle of r=14 centered at (20,20), starting at -90°.
  const dots = Array.from({ length: 8 }, (_, i) => {
    const angle = (-90 + i * 45) * (Math.PI / 180);
    return { cx: 20 + 14 * Math.cos(angle), cy: 20 + 14 * Math.sin(angle) };
  });
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
        <circle key={i} cx={d.cx} cy={d.cy} r={2.7} fill="#996CE4" />
      ))}
    </svg>
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
