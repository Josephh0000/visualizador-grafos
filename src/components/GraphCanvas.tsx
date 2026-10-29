import type { Edge, Graph } from '../types/graph';
import type { Layout } from '../data/sampleGraphs';
import type { EdgeVisual, NodeVisual, VisualFrame } from '../types/visual';
import { edgeKey } from '../utils/edgeKey';
import { PALETTE } from '../visual/palette';

interface Props {
  readonly graph: Graph;
  readonly layout: Layout;
  readonly frame: VisualFrame | null;
}

const R = 20; // radio del nodo
const DEFAULT_EDGE: EdgeVisual = { color: PALETTE.edgeBase, width: 2 };
const DEFAULT_NODE: NodeVisual = { fill: PALETTE.nodeBase };

/** Geometría de una arista: recta, o curva si existe la arista inversa (A→B y B→A). */
function edgeGeometry(
  a: { x: number; y: number },
  b: { x: number; y: number },
  curved: boolean,
  directed: boolean,
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len; // normal unitaria
  const ny = dx / len;
  const offset = curved ? 26 : 0;
  // Punto de control (para la curva cuadrática).
  const cx = (a.x + b.x) / 2 + nx * offset;
  const cy = (a.y + b.y) / 2 + ny * offset;

  // Se recorta el inicio/fin para que la línea no entre al círculo.
  const dirStart = { x: cx - a.x, y: cy - a.y };
  const ls = Math.hypot(dirStart.x, dirStart.y) || 1;
  const sx = a.x + (dirStart.x / ls) * R;
  const sy = a.y + (dirStart.y / ls) * R;

  const dirEnd = { x: b.x - cx, y: b.y - cy };
  const le = Math.hypot(dirEnd.x, dirEnd.y) || 1;
  const ux = dirEnd.x / le;
  const uy = dirEnd.y / le;
  const gap = directed ? R + 3 : R;
  const ex = b.x - ux * gap;
  const ey = b.y - uy * gap;

  // Punta de flecha
  const ah = 11;
  const aw = 5.5;
  const arrow = `${ex},${ey} ${ex - ux * ah + uy * aw},${ey - uy * ah - ux * aw} ${ex - ux * ah - uy * aw},${ey - uy * ah + ux * aw}`;

  // Posición de la etiqueta de peso: al 40 % del recorrido (no al centro, para que
  // dos aristas que se cruzan justo a la mitad no encimen sus pesos).
  const t = curved ? 0.5 : 0.4;
  const k1 = (1 - t) * (1 - t);
  const k2 = 2 * t * (1 - t);
  const k3 = t * t;
  const mx = k1 * a.x + k2 * cx + k3 * b.x + nx * 11;
  const my = k1 * a.y + k2 * cy + k3 * b.y + ny * 11;

  const d = curved
    ? `M ${sx} ${sy} Q ${cx} ${cy} ${directed ? ex - ux * (ah - 2) : ex} ${directed ? ey - uy * (ah - 2) : ey}`
    : `M ${sx} ${sy} L ${directed ? ex - ux * (ah - 2) : ex} ${directed ? ey - uy * (ah - 2) : ey}`;

  return { d, arrow, mx, my };
}

/** Dibuja el grafo en SVG según el frame actual. Sin animaciones pregrabadas. */
export default function GraphCanvas({ graph, layout, frame }: Props) {
  const hasReverse = (e: Edge): boolean =>
    graph.directed && graph.edges.some((o) => o.from === e.to && o.to === e.from);

  return (
    <svg className="canvas" viewBox="0 0 400 330" role="img" aria-label="Grafo">
      {graph.edges.map((e) => {
        const a = layout[e.from];
        const b = layout[e.to];
        if (a === undefined || b === undefined) return null;
        const style = frame?.edges[edgeKey(e, graph.directed)] ?? DEFAULT_EDGE;
        const g = edgeGeometry(a, b, hasReverse(e), graph.directed);
        return (
          <g key={`${e.from}-${e.to}`}>
            <path
              d={g.d}
              fill="none"
              stroke={style.color}
              strokeWidth={style.width}
              strokeLinecap="round"
              {...(style.dashed === true ? { strokeDasharray: '6 5' } : {})}
            />
            {graph.directed && <polygon points={g.arrow} fill={style.color} />}
            {e.weight !== undefined && (
              <text
                x={g.mx}
                y={g.my + 4}
                textAnchor="middle"
                className="canvas__weight"
                fill={style.color === PALETTE.edgeBase ? '#cbd5e1' : style.color}
              >
                {e.weight}
              </text>
            )}
          </g>
        );
      })}

      {graph.nodes.map((n) => {
        const p = layout[n];
        if (p === undefined) return null;
        const v = frame?.nodes[n] ?? DEFAULT_NODE;
        return (
          <g key={n}>
            {v.ring !== undefined && (
              <circle cx={p.x} cy={p.y} r={R + 5} fill="none" stroke={v.ring} strokeWidth={2.5} />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={R}
              fill={v.fill}
              stroke={v.fill === PALETTE.nodeBase ? PALETTE.nodeStroke : v.fill}
              strokeWidth={2}
              className="canvas__node"
            />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              className="canvas__label"
              fill={v.text ?? PALETTE.nodeText}
            >
              {n}
            </text>
            {v.badge !== undefined && (
              <g>
                <rect
                  x={p.x + 12}
                  y={p.y - 32}
                  width={Math.max(20, v.badge.length * 8 + 8)}
                  height={17}
                  rx={8}
                  className="canvas__badge-bg"
                />
                <text
                  x={p.x + 12 + Math.max(20, v.badge.length * 8 + 8) / 2}
                  y={p.y - 19.5}
                  textAnchor="middle"
                  className="canvas__badge"
                >
                  {v.badge}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
