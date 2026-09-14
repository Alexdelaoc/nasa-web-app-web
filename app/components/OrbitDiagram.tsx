/** Placeholder for the real map: the shape of what section 01 opens into. */
export function OrbitDiagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 740 180"
      className={className}
      role="img"
      aria-label="Diagrama del sistema solar interior con la órbita de un objeto próximo a la Tierra"
    >
      <ellipse cx="370" cy="92" rx="52" ry="19" fill="none" stroke="#4a443a" />
      <ellipse cx="370" cy="92" rx="96" ry="35" fill="none" stroke="#4a443a" />
      <ellipse cx="370" cy="92" rx="146" ry="53" fill="none" stroke="#6b655b" />
      <ellipse cx="370" cy="92" rx="212" ry="76" fill="none" stroke="#4a443a" />
      <ellipse
        cx="345"
        cy="86"
        rx="196"
        ry="94"
        fill="none"
        stroke="#d6301f"
        strokeWidth="1.3"
        transform="rotate(-13 345 86)"
      />
      <circle cx="370" cy="92" r="3.4" fill="#e8e2d5" />
      <circle cx="516" cy="92" r="3" fill="#1b3a6b" stroke="#8fa8cc" strokeWidth="1.2" />
      <circle cx="163" cy="48" r="3" fill="#d6301f" />
    </svg>
  );
}
