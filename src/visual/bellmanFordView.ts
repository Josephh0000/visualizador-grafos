import { bellmanFordGenerator, fmtDist } from '../algorithms/bellmanFord';
import {
  bellmanFordGraph,
  bellmanFordLayout,
  negativeCycleGraph,
  negativeCycleLayout,
} from '../data/sampleGraphs';
import type { BellmanFordActionType, BellmanFordState } from '../types/bellmanFord';
import type { Graph } from '../types/graph';
import type { AlgorithmDefinition, EdgeVisual, NodeVisual, VisualFrame } from '../types/visual';
import { edgeKey, mapGenerator } from '../utils/edgeKey';
import { PALETTE } from './palette';

const ACCENT = '#fb923c';

const PYTHON: readonly string[] = [
  'def bellman_ford(grafo, aristas, origen):',
  '    dist = {v: inf for v in grafo}',
  '    prev = {v: None for v in grafo}',
  '    dist[origen] = 0',
  '    for i in range(1, len(grafo)):  # V-1 rondas',
  '        for (u, v, w) in aristas:',
  '            if dist[u] + w < dist[v]:',
  '                dist[v] = dist[u] + w',
  '                prev[v] = u',
  '    for (u, v, w) in aristas:  # ronda extra',
  '        if dist[u] + w < dist[v]:',
  '            return None  # ciclo negativo',
  '    return dist, prev',
];

const LINES: Record<BellmanFordActionType, readonly number[]> = {
  INICIO: [2, 3, 4],
  INICIO_RONDA: [5],
  EVALUAR: [6, 7],
  ACTUALIZAR: [6, 7, 8, 9],
  FIN_RONDA: [5],
  VERIFICAR: [10, 11],
  CICLO_NEGATIVO: [10, 11, 12],
  FIN: [13],
};

const EXPLAIN: Record<BellmanFordActionType, string> = {
  INICIO: 'El origen tiene distancia 0; todos los demás empiezan en infinito.',
  INICIO_RONDA: 'En cada ronda se intenta relajar TODAS las aristas, en el mismo orden.',
  EVALUAR: 'dist[u] + w no es menor que dist[v] → no se mejora el camino.',
  ACTUALIZAR: '¡Relajación! Pasar por u da un camino más corto a v → se actualiza dist[v].',
  FIN_RONDA: 'Al terminar la ronda i ya son correctos todos los caminos de hasta i aristas.',
  VERIFICAR: 'Ronda extra: si nada mejora, no existen ciclos negativos.',
  CICLO_NEGATIVO: 'Si después de V−1 rondas algo aún mejora, hay un ciclo de peso negativo.',
  FIN: '',
};

function toFrame(s: BellmanFordState, graph: Graph): VisualFrame {
  const e = s.currentEdge;
  const neg = s.negativeCycleEdge;

  const nodes: Record<string, NodeVisual> = {};
  for (const n of graph.nodes) {
    const d = s.dist[n] ?? Infinity;
    const isNeg = neg !== null && (neg.from === n || neg.to === n);
    const ring = isNeg
      ? { ring: PALETTE.error }
      : e !== null && e.to === n
        ? { ring: s.updated ? PALETTE.ok : '#fff7ed' }
        : n === s.source
          ? { ring: ACCENT }
          : {};
    const fill =
      d === Infinity
        ? { fill: PALETTE.nodeBase }
        : { fill: ACCENT, text: PALETTE.darkText };
    nodes[n] = { ...fill, ...ring, badge: fmtDist(d) };
  }

  const edges: Record<string, EdgeVisual> = {};
  // Árbol de caminos mínimos: prev[v] = u  →  arista u → v
  for (const [v, u] of Object.entries(s.prev)) {
    if (u !== null) edges[edgeKey({ from: u, to: v }, true)] = { color: ACCENT, width: 3 };
  }
  if (e !== null && s.actionType !== 'FIN') {
    edges[edgeKey(e, true)] = s.updated
      ? { color: PALETTE.ok, width: 5 }
      : s.actionType === 'VERIFICAR'
        ? { color: PALETTE.highlight, width: 3, dashed: true }
        : { color: PALETTE.highlight, width: 4 };
  }
  if (neg !== null) edges[edgeKey(neg, true)] = { color: PALETTE.error, width: 5 };

  const ronda =
    s.phase === 'inicio'
      ? '0 (inicialización)'
      : s.phase === 'relajacion'
        ? `${s.round} / ${s.totalRounds}`
        : 'extra (verificación)';

  const du = e === null ? null : s.dist[e.from] ?? Infinity;

  const explanation =
    s.actionType === 'FIN'
      ? s.hasNegativeCycle === true
        ? 'Hay un ciclo negativo alcanzable: los caminos mínimos no están definidos.'
        : 'dist[] contiene los caminos mínimos desde el origen; prev[] permite reconstruirlos.'
      : EXPLAIN[s.actionType];

  return {
    step: s.step,
    action: s.action,
    explanation,
    lines: s.actionType === 'FIN' && s.hasNegativeCycle === true ? [12] : LINES[s.actionType],
    finished: s.actionType === 'FIN',
    nodes,
    edges,
    results: [
      {
        title: 'dist[] (distancia desde el origen)',
        items: graph.nodes.map((n) => {
          const d = s.dist[n] ?? Infinity;
          return d === Infinity
            ? { label: `${n}:∞`, color: PALETTE.muted, textColor: PALETTE.mutedText }
            : { label: `${n}:${fmtDist(d)}`, color: ACCENT, textColor: PALETTE.darkText };
        }),
        slots: graph.nodes.length,
      },
    ],
    vars: [
      { name: 'ronda', value: ronda },
      {
        name: '(u, v, w)',
        value: e === null || s.actionType === 'FIN' ? '—' : `('${e.from}', '${e.to}', ${e.weight ?? 0})`,
      },
      {
        name: 'dist[u] + w',
        value:
          e === null || s.actionType === 'FIN' || du === null
            ? '—'
            : du === Infinity
              ? '∞ + w = ∞'
              : `${fmtDist(du)} + ${e.weight ?? 0} = ${fmtDist(du + (e.weight ?? 0))}`,
      },
      {
        name: 'dist[v]',
        value:
          e === null || s.actionType === 'FIN'
            ? '—'
            : `${fmtDist(s.dist[e.to] ?? Infinity)}${s.updated ? '  (actualizado ✔)' : ''}`,
      },
      { name: 'cambios en la ronda', value: String(s.changesInRound) },
    ],
    list: {
      title: 'prev[] (predecesor en el camino mínimo)',
      items: graph.nodes.map((n) => `prev['${n}'] = ${s.prev[n] === null || s.prev[n] === undefined ? 'None' : `'${s.prev[n]}'`}`),
      highlight: e === null ? null : graph.nodes.indexOf(e.to),
    },
    status:
      s.actionType === 'FIN'
        ? s.hasNegativeCycle === true
          ? { text: `✘ Ciclo negativo detectado en ${neg?.from}→${neg?.to}`, tone: 'error' }
          : { text: '✔ Sin ciclos negativos: distancias mínimas calculadas', tone: 'ok' }
        : s.actionType === 'CICLO_NEGATIVO'
          ? { text: '✘ Ciclo negativo detectado', tone: 'error' }
          : null,
    raw: s,
  };
}

export const bellmanFordAlgorithm: AlgorithmDefinition = {
  id: 'bellman-ford',
  tab: 'Bellman-Ford',
  name: 'Bellman-Ford',
  subtitle: 'V − 1 rondas de relajación',
  accent: ACCENT,
  time: 'O(V·E)',
  space: 'O(V)',
  fileName: 'bellman_ford.py',
  python: PYTHON,
  legend: [
    { color: PALETTE.nodeBase, label: 'dist = ∞' },
    { color: ACCENT, label: 'Alcanzado / árbol de caminos' },
    { color: PALETTE.highlight, label: 'Arista evaluada' },
    { color: PALETTE.ok, label: 'Relajación exitosa' },
    { color: PALETTE.error, label: 'Ciclo negativo' },
  ],
  graphs: [
    {
      id: 'bf-clrs',
      label: 'Pesos negativos (sin ciclo negativo)',
      graph: bellmanFordGraph,
      layout: bellmanFordLayout,
      start: 'A',
    },
    {
      id: 'bf-ciclo',
      label: 'Con ciclo negativo (B → D → E → B)',
      graph: negativeCycleGraph,
      layout: negativeCycleLayout,
      start: 'A',
    },
  ],
  run: (opt) => mapGenerator(bellmanFordGenerator(opt.graph, opt.start), (s) => toFrame(s, opt.graph)),
};
