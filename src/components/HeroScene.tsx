/**
 * Decorative winter-market scene for the hero: old-town houses, a tree,
 * stalls and a garland of lights. Pure SVG, no images to download. Colours
 * come from CSS classes so each look can repaint it.
 */

const W = 1200;
const H = 320;

type House = { x: number; w: number; h: number; roof: "gable" | "step" | "flat" | "spire" };

const HOUSES: House[] = [
  { x: 0, w: 90, h: 150, roof: "gable" },
  { x: 90, w: 70, h: 185, roof: "step" },
  { x: 160, w: 95, h: 140, roof: "flat" },
  { x: 255, w: 75, h: 200, roof: "gable" },
  { x: 330, w: 60, h: 255, roof: "spire" },
  { x: 390, w: 85, h: 165, roof: "step" },
  { x: 475, w: 70, h: 145, roof: "gable" },
  { x: 700, w: 80, h: 160, roof: "gable" },
  { x: 780, w: 70, h: 195, roof: "step" },
  { x: 850, w: 95, h: 150, roof: "flat" },
  { x: 945, w: 60, h: 270, roof: "spire" },
  { x: 1005, w: 80, h: 175, roof: "gable" },
  { x: 1085, w: 115, h: 155, roof: "step" },
];

function roofPath({ x, w, h, roof }: House): string {
  const top = H - h;
  const r = x + w;
  switch (roof) {
    case "gable":
      return `M${x} ${top} L${x + w / 2} ${top - 34} L${r} ${top}`;
    case "step": {
      const s = w / 5;
      return `M${x} ${top} V${top - 12} H${x + s} V${top - 24} H${x + 2 * s} V${top - 36} H${r - 2 * s} V${top - 24} H${r - s} V${top - 12} H${r} V${top}`;
    }
    case "spire":
      return `M${x} ${top} L${x + w / 2} ${top - 70} L${r} ${top}`;
    default:
      return `M${x} ${top} V${top - 8} H${r} V${top}`;
  }
}

function windows({ x, w, h }: House, i: number) {
  const cols = Math.max(2, Math.floor(w / 26));
  const rows = Math.floor((h - 60) / 34);
  const gap = w / cols;
  const out = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      // A fixed pseudo-random pattern of lit windows.
      const lit = (i * 7 + r * 3 + c * 5) % 4 !== 0;
      out.push(
        <rect
          key={`${r}-${c}`}
          className={lit ? "hs-win" : "hs-win hs-win--off"}
          x={x + c * gap + gap / 2 - 6}
          y={H - h + 22 + r * 34}
          width={12}
          height={17}
          rx={2}
        />,
      );
    }
  return out;
}

/** Points on the sagging garland between two posts. */
function garland(x1: number, x2: number, y: number, sag: number, n: number) {
  const cx = (x1 + x2) / 2;
  const pts: [number, number][] = [];
  for (let k = 1; k < n; k++) {
    const t = k / n;
    const px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2;
    const py = (1 - t) ** 2 * y + 2 * (1 - t) * t * (y + sag * 2) + t ** 2 * y;
    pts.push([px, py]);
  }
  return { d: `M${x1} ${y} Q${cx} ${y + sag * 2} ${x2} ${y}`, pts };
}

const STALLS = [40, 210, 820, 990];

/** `id` keeps the SVG pattern/filter ids unique when the scene is used many times. */
export function HeroScene({ id = "hs", className }: { id?: string; className?: string }) {
  const stripes = `${id}-stripes`;
  const glow = `${id}-glow`;
  const loops = [garland(-20, 300, 70, 26, 9), garland(300, 620, 70, 30, 9)];
  const loops2 = [garland(580, 900, 70, 30, 9), garland(900, 1220, 70, 26, 9)];

  return (
    <svg
      className={className ? `hero-scene ${className}` : "hero-scene"}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={stripes} width="28" height="10" patternUnits="userSpaceOnUse">
          <rect className="hs-stripe-a" width="14" height="10" />
          <rect className="hs-stripe-b" x="14" width="14" height="10" />
        </pattern>
        <filter id={glow} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <circle className="hs-moon" cx="1080" cy="56" r="26" />

      {HOUSES.map((h, i) => (
        <g key={h.x} className={`hs-house hs-house--${(i % 5) + 1}`}>
          <path d={`${roofPath(h)} V${H} H${h.x} Z`} />
          <path className="hs-snow" d={roofPath(h)} />
          {windows(h, i)}
        </g>
      ))}

      {/* The tree in the square */}
      <g className="hs-tree">
        <polygon points="600,70 540,170 660,170" />
        <polygon points="600,115 520,230 680,230" />
        <polygon points="600,165 500,300 700,300" />
        <rect className="hs-trunk" x="590" y="300" width="20" height="20" />
      </g>
      <polygon
        className="hs-star"
        points="600,48 606,63 622,63 609,72 614,87 600,78 586,87 591,72 578,63 594,63"
      />
      {[
        [575, 150, 1],
        [628, 140, 2],
        [560, 210, 3],
        [640, 205, 4],
        [600, 190, 1],
        [545, 275, 2],
        [600, 260, 3],
        [660, 270, 1],
      ].map(([cx, cy, c]) => (
        <circle key={`${cx}-${cy}`} className={`hs-ball hs-bulb--${c}`} cx={cx} cy={cy} r={6} />
      ))}

      {/* Market stalls */}
      {STALLS.map((x) => (
        <g key={x} className="hs-stall">
          <rect className="hs-stall-body" x={x + 8} y={262} width={124} height={58} />
          <rect className="hs-stall-counter" x={x + 8} y={290} width={124} height={8} />
          <polygon
            points={`${x},262 ${x + 20},230 ${x + 120},230 ${x + 140},262`}
            fill={`url(#${stripes})`}
          />
          <path className="hs-snow" d={`M${x + 20} 230 H${x + 120}`} />
        </g>
      ))}

      {/* Garland of lights */}
      {[...loops, ...loops2].map((g, li) => (
        <g key={li}>
          <path className="hs-wire" d={g.d} />
          {g.pts.map(([px, py], k) => (
            <g key={k} className={`hs-bulb hs-bulb--${((k + li) % 4) + 1}`}>
              <circle className="hs-halo" cx={px} cy={py + 6} r={9} filter={`url(#${glow})`} />
              <circle cx={px} cy={py + 6} r={4.5} />
            </g>
          ))}
        </g>
      ))}

      <rect className="hs-ground" x="0" y={H - 6} width={W} height="6" />
    </svg>
  );
}
