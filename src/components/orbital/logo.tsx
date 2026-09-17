// ORBITAL logo mark: four orbiting dots around a core, echoing the
// reference brand without copying assets.

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="#3A3A3A" />
      <circle cx="20" cy="20" r="4.2" fill="#2ECC8A" />
      <ellipse cx="20" cy="20" rx="12.5" ry="5.5" stroke="#F8F5F1" strokeWidth="1.6" opacity="0.9" transform="rotate(-24 20 20)" />
      <ellipse cx="20" cy="20" rx="12.5" ry="5.5" stroke="#996CE4" strokeWidth="1.6" opacity="0.9" transform="rotate(52 20 20)" />
      <circle cx="30.6" cy="15.2" r="2.1" fill="#FF8077" />
      <circle cx="10.4" cy="25.8" r="2.1" fill="#C4996A" />
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
