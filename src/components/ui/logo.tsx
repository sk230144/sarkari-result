/**
 * jobalert24 logo marks.
 *
 * Drawn as vector paths rather than an image so the mark stays sharp at
 * every size, recolours with the theme, and costs no extra request.
 *
 * All three are original work for this product. They take cues from the
 * job-board category (a figure in motion, a briefcase, a forward arc) but
 * deliberately share no geometry with any existing company's mark.
 */

type MarkProps = {
  className?: string;
  /** Falls back to the lime brand colour when no class sets a colour. */
  title?: string;
};

/* ------------------------------------------------------------------ A */
/**
 * "Career Climb" — a figure striding up an ascending arc, briefcase in
 * hand. The arc doubles as a rising progress curve, which is the promise
 * of the product: you move up.
 */
export function LogoClimb({
  className = "h-8 w-8",
  title,
  animate = "hover",
}: MarkProps & {
  /**
   * "hover"  — still until pointed at, then the figure strides (navbar).
   * "always" — continuous walk cycle, for the loading screen.
   * "none"   — static, for a favicon or print.
   */
  animate?: "hover" | "always" | "none";
}) {
  const mode =
    animate === "always"
      ? "logo-anim-always"
      : animate === "hover"
        ? "logo-anim-hover"
        : "";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={`${className} ${mode}`}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* Ascending arc — the swoosh the figure travels along. The dash
          length matches the path length so it can draw itself in. */}
      <path
        className="logo-arc"
        d="M4 38C10 38 14 33 19 26C24 19 29 12 40 10"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.28"
      />
      {/* Arrowhead closing the arc, so the curve reads as upward motion. */}
      <path
        className="logo-arrow"
        d="M34 9.5L41 9.5L40 16.5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The whole figure bobs as one, so limbs never detach from the body. */}
      <g className="logo-walker">
        {/* Head */}
        <circle cx="21.5" cy="13" r="4.2" fill="currentColor" />
        {/* Torso */}
        <path
          d="M21 19.5L19.5 28"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Back leg — pivots at the hip through the stride. */}
        <path
          className="logo-leg-back"
          d="M19.5 28L15 38"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Front leg, counter-phase to the back one. */}
        <path
          className="logo-leg-front"
          d="M19.5 28L26 33.5L28.5 40"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Trailing arm swings opposite the leading leg. */}
        <path
          className="logo-arm-back"
          d="M21 22L14.5 25.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Leading arm and briefcase move together as one group. */}
        <g className="logo-arm-front">
          <path
            d="M21.5 21.5L29 19"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <rect
            x="28.5"
            y="17.5"
            width="9.5"
            height="7"
            rx="1.6"
            fill="currentColor"
          />
          <path
            d="M31.2 17.5V16.2C31.2 15.6 31.7 15.1 32.3 15.1H34.2C34.8 15.1 35.3 15.6 35.3 16.2V17.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ B */
/**
 * "Alert Badge" — a briefcase with a notification dot, inside a rounded
 * shield. Closest to the product's literal promise: job alerts. Holds up
 * best at favicon size because the silhouette is a simple solid block.
 */
export function LogoBadge({ className = "h-8 w-8", title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        fill="currentColor"
        opacity="0.14"
      />
      {/* Briefcase body */}
      <rect
        x="11"
        y="18"
        width="26"
        height="18"
        rx="3.2"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Handle */}
      <path
        d="M18.5 18V15C18.5 13.6 19.6 12.5 21 12.5H27C28.4 12.5 29.5 13.6 29.5 15V18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Latch line across the case */}
      <path
        d="M11 26.5H37"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* The alert: a filled dot with a ring, top-right. */}
      <circle cx="36" cy="14" r="6.5" fill="var(--color-c-canvas-deep)" />
      <circle cx="36" cy="14" r="4.2" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ C */
/**
 * "Signal 24" — a briefcase emitting two signal arcs, the alert metaphor
 * without a separate badge. The arcs echo the loader's rings, so the
 * loading state and the logo feel like one family.
 */
export function LogoSignal({ className = "h-8 w-8", title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* Broadcast arcs */}
      <path
        d="M31 10.5C34.6 12.2 37.2 15.4 38.2 19.2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M33.5 5C39.2 7.4 43.3 12.3 44.7 18.2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.2"
      />
      {/* Briefcase */}
      <rect
        x="5"
        y="19"
        width="28"
        height="20"
        rx="3.5"
        fill="currentColor"
      />
      <path
        d="M13.5 19V15.6C13.5 14.2 14.6 13 16 13H22C23.4 13 24.5 14.2 24.5 15.6V19"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Knocked-out latch, so the case reads as a case at small sizes. */}
      <rect
        x="16.5"
        y="26.5"
        width="5"
        height="5"
        rx="1.2"
        fill="var(--color-c-canvas-deep)"
      />
    </svg>
  );
}

/* --------------------------------------------------------- wordmark */
/**
 * Mark plus wordmark, the lockup used in the navbar, footer and loader.
 *
 * "24" is weighted differently from "jobalert" so the name has a shape a
 * reader can recognise at a glance, the way the reference logo sets its
 * numerals apart.
 */
export function Logo({
  variant = "climb",
  className = "",
  markClassName = "h-8 w-8",
  showWordmark = true,
  size = "md",
  animate = "hover",
}: {
  variant?: "climb" | "badge" | "signal";
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  /** Only the climb mark animates; the others ignore this. */
  animate?: "hover" | "always" | "none";
}) {
  const text =
    size === "lg" ? "text-[26px]" : size === "sm" ? "text-[15px]" : "text-xl";
  const markClass = `${markClassName} text-[var(--color-c-lime)]`;

  const mark =
    variant === "badge" ? (
      <LogoBadge className={markClass} />
    ) : variant === "signal" ? (
      <LogoSignal className={markClass} />
    ) : (
      <LogoClimb className={markClass} animate={animate} />
    );

  return (
    // group so the mark can react to a hover anywhere on the lockup.
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      {showWordmark && (
        <span
          className={`${text} font-bold lowercase leading-none tracking-tight text-[var(--color-c-text)]`}
        >
          jobalert
          <span className="text-[var(--color-c-lime)]">24</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
