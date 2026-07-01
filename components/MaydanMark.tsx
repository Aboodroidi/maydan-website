/** The Maydan "M" mark in a rounded electric tile — matches the app icon. */
export function MaydanMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-[26%] font-extrabold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.56,
        background: "linear-gradient(160deg, var(--color-electric-bright), var(--color-electric))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px rgba(47,107,255,0.4)",
      }}
      aria-hidden
    >
      M
    </span>
  );
}
