import { bipartiteGenerator } from '../algorithms/bipartite';
import { bipartiteGraph, hexLayout, nonBipartiteGraph } from '../data/sampleGraphs';
import type { BipartiteActionType, BipartiteState } from '../types/bipartite';
import type { Graph } from '../types/graph';
import type { AlgorithmDefinition, EdgeVisual, NodeVisual, VisualFrame } from '../types/visual';
import { edgeKey, mapGenerator } from '../utils/edgeKey';
import { PALETTE } from './palette';

const ACCENT = '#4ade80';
const COLOR_X = '#4ade80'; // color 0
const COLOR_Y = '#c084fc'; // color 1

const PYTHON: readonly string[] = [
  'def es_bipartito(grafo):',
  '    color = {}',
  '    for s in grafo:',
  '        if s in color: continue',
  '        color[s] = 0',
  '        cola = deque([s])',
  '        while cola:',
  '            u = cola.popleft()',
  '            for v in grafo[u]:',
  '                if v not in color:',
  '                    color[v] = 1 - color[u]',
  '                    cola.append(v)',
  '                elif color[v] == color[u]:',
  '                    return False  # conflicto',
  '    return True',
];

const LINES: Record<BipartiteActionType, readonly number[]> = {
  INICIO: [1, 2],
  NUEVA_COMPONENTE: [3, 5, 6],
  DESENCOLAR: [7, 8],
  COLOREAR: [9, 10, 11, 12],
  VECINO_OK: [9, 13],
  CONFLICTO: [13, 14],
  FIN: [15],
};

const EXPLAIN: Record<BipartiteActionType, string> = {
  INICIO: 'El diccionario de colores empieza vacío.',
  NUEVA_COMPONENTE: 'Un nodo sin color recibe color 0 (Partición X) y entra a la cola.',
  DESENCOLAR: 'BFS: se saca el primer nodo de la cola para revisar a sus vecinos.',
  COLOREAR: 'El vecino no tenía color → recibe el color opuesto (1 − color[u]) y se encola.',
  VECINO_OK: 'El vecino ya tiene color y es distinto → la arista respeta la regla.',
  CONFLICTO: 'Dos vecinos con el MISMO color → hay un ciclo impar.',
  FIN: '',
};

function toFrame(s: BipartiteState, graph: Graph): VisualFrame {
  const conflicto = s.conflictEdge;
  const enConflicto = (n: string): boolean =>
    conflicto !== null && (conflicto.from === n || conflicto.to === n);

  const nodes: Record<string, NodeVisual> = {};
  for (const n of graph.nodes) {
    const c = s.colors[n];
    const ring = enConflicto(n)
      ? { ring: PALETTE.error }
      : s.currentNode === n
        ? { ring: '#f0fdf4' }
        : {};
    const badge = c === undefined ? {} : { badge: String(c) };
    if (c === 0) nodes[n] = { fill: COLOR_X, text: PALETTE.darkText, ...ring, ...badge };
    else if (c === 1) nodes[n] = { fill: COLOR_Y, text: PALETTE.darkText, ...ring, ...badge };
    else nodes[n] = { fill: PALETTE.nodeBase, ...ring };
  }

  const edges: Record<string, EdgeVisual> = {};
  if (s.currentEdge !== null) {
    edges[edgeKey(s.currentEdge, false)] =
      s.actionType === 'VECINO_OK'
        ? { color: PALETTE.highlight, width: 3, dashed: true }
        : { color: PALETTE.highlight, width: 4 };
  }
  if (conflicto !== null) edges[edgeKey(conflicto, false)] = { color: PALETTE.error, width: 5 };

  const u = s.actionType === 'FIN' || s.actionType === 'INICIO' ? null : s.currentNode;
  const v = s.currentEdge?.to ?? null;
  const fmtC = (n: string | null): string => {
    if (n === null) return '—';
    const c = s.colors[n];
    return c === undefined ? 'sin color' : String(c);
  };

  const explanation =
    s.actionType === 'FIN'
      ? s.isBipartite === true
        ? 'Se revisaron todas las aristas sin conflicto → el grafo SÍ es bipartito.'
        : 'Se encontró una arista con ambos extremos del mismo color → NO es bipartito.'
      : EXPLAIN[s.actionType];

  return {
    step: s.step,
    action: s.action,
    explanation,
    lines: s.actionType === 'FIN' && s.isBipartite === false ? [14] : LINES[s.actionType],
    finished: s.actionType === 'FIN',
    nodes,
    edges,
    results: [
      {
        title: 'Partición X (color 0)',
        items: s.partitionX.map((n) => ({ label: n, color: COLOR_X, textColor: PALETTE.darkText })),
        slots: graph.nodes.length,
      },
      {
        title: 'Partición Y (color 1)',
        items: s.partitionY.map((n) => ({ label: n, color: COLOR_Y, textColor: PALETTE.darkText })),
        slots: graph.nodes.length,
      },
    ],
    vars: [
      { name: 'u', value: u === null ? '—' : `'${u}'  (color ${fmtC(u)})` },
      { name: 'v', value: v === null || s.actionType === 'FIN' ? '—' : `'${v}'  (color ${fmtC(v)})` },
      {
        name: 'color',
        value: `{${Object.entries(s.colors).map(([k, c]) => `'${k}': ${c}`).join(', ')}}`,
      },
    ],
    list: {
      title: 'Cola del BFS (frente → final)',
      items: s.queue.length === 0 ? ['(vacía)'] : s.queue.map((n) => `'${n}'`),
      highlight: s.queue.length === 0 ? null : 0,
    },
    status:
      s.actionType === 'FIN'
        ? s.isBipartite === true
          ? { text: '✔ El grafo SÍ es bipartito', tone: 'ok' }
          : { text: `✘ NO es bipartito: conflicto en ${conflicto?.from}–${conflicto?.to}`, tone: 'error' }
        : s.actionType === 'CONFLICTO'
          ? { text: `✘ Conflicto en la arista ${conflicto?.from}–${conflicto?.to}`, tone: 'error' }
          : null,
    raw: s,
  };
}

export const bipartiteAlgorithm: AlgorithmDefinition = {
  id: 'bipartito',
  tab: 'Bipartito',
  name: 'Coloreo Bipartito',
  subtitle: 'BFS · 2 colores',
  accent: ACCENT,
  time: 'O(V+E)',
  space: 'O(V)',
  fileName: 'bipartito.py',
  python: PYTHON,
  legend: [
    { color: PALETTE.nodeBase, label: 'Sin color' },
    { color: COLOR_X, label: 'Color 0 (X)' },
    { color: COLOR_Y, label: 'Color 1 (Y)' },
    { color: PALETTE.highlight, label: 'Arista evaluada' },
    { color: PALETTE.error, label: 'Conflicto' },
  ],
  graphs: [
    {
      id: 'bip-si',
      label: 'Bipartito (hexágono + cuerda A–D)',
      graph: bipartiteGraph,
      layout: hexLayout,
      start: 'A',
    },
    {
      id: 'bip-no',
      label: 'No bipartito (triángulo C–D–E)',
      graph: nonBipartiteGraph,
      layout: hexLayout,
      start: 'A',
    },
  ],
  run: (opt) => mapGenerator(bipartiteGenerator(opt.graph, opt.start), (s) => toFrame(s, opt.graph)),
};
