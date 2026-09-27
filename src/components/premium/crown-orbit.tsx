import { Crown } from "lucide-react";

/**
 * PRO+ marker around an avatar: a small crown that circles it, with a lime
 * ring. The crown stays upright while it travels. With reduced motion it
 * simply sits on top. Wrap any round avatar; the ring follows the avatar's
 * own size, and `size` (its approximate width in px) only scales the crown.
 */
export function CrownOrbit({ size, children, title = "PRO+ member" }: { size: number; children: React.ReactNode; title?: string }) {
  const crown = Math.max(12, Math.round(size * 0.42));
  return (
    <span className="relative inline-flex shrink-0 rounded-full" title={title}>
      <span aria-hidden className="pointer-events-none absolute -inset-[3px] rounded-full ring-2 ring-[#a3e635]/80 shadow-[0_0_12px_rgba(163,230,53,0.45)]" />
      {children}
      <span aria-hidden className="pointer-events-none absolute -inset-[3px] animate-[spin_5s_linear_infinite] motion-reduce:animate-none">
        <span
          className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite_reverse] items-center justify-center rounded-full bg-[#a3e635] shadow-[0_0_8px_rgba(163,230,53,0.8)] motion-reduce:animate-none"
          style={{ width: crown, height: crown }}
        >
          <Crown className="text-black" style={{ width: crown * 0.64, height: crown * 0.64 }} strokeWidth={2.6} />
        </span>
      </span>
      <span className="sr-only">{title}</span>
    </span>
  );
}
