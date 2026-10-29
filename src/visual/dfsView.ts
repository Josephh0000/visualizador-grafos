import { dfsGenerator } from '../algorithms/dfs';
import { dfsSampleGraph, dfsSampleLayout } from '../data/sampleGraphs';
import type { DfsActionType, DfsState } from '../types/dfs';
import type { Graph } from '../types/graph';
import type { AlgorithmDefinition, EdgeVisual, NodeVisual, VisualFrame } from '../types/visual';
import { edgeKey, mapGenerator } from '../utils/edgeKey';
import { PALETTE } from './palette';

const ACCENT = '#38bdf8';
const FINISHED = '#1d4ed8';

/** El DFS escrito en Python (solo para explicar; la ejecución real es el generador TS). */
const PYTHON: readonly string[] = [
  'def dfs(grafo, inicio):',
  '    visitados = []',
  '    dfs_visitar(grafo, inicio, visitados)',
  '    # componentes desconectados',
  '    for nodo in grafo:',
  '        if nodo not in visitados:',
  '            dfs_visitar(grafo, nodo, visitados)',
  '    return visitados',
  '',
  'def dfs_visitar(grafo, nodo, visitados):',
  '    visitados.append(nodo)',
  '    for vecino in grafo[nodo]:',
  '        if vecino not in visitados:',
  '            dfs_visitar(grafo, vecino, visitados)',
  '        else:',
  '            continue  # ya visitado, se omite',
  '    return  # retroceso (backtrack)',
];

/** Líneas resaltadas por acción. */
const LINES: Record<DfsActionType, readonly number[]> = {
  INICIO: [1, 2],
  VISITANDO: [10, 11],
  EXPLORANDO: [12, 13, 14],
  YA_VISITADO: [12, 13, 15, 16],
  RETROCEDIENDO: [17],
  FIN: [8],
};

const EXPLAIN: Record<DfsActionType, string> = {
  INICIO: 'Se crea la lista de visitados vacía y se llama a dfs_visitar con el nodo inicial.',
  VISITANDO: 'Entramos a la función recursiva: el nodo se agrega a visitados.',
  EXPLORANDO: 'El vecino NO está en visitados → llamada recursiva (se profundiza).',
  YA_VISITADO: 'El vecino YA está en visitados → se omite y seguimos con el siguiente.',
  RETROCEDIENDO: 'Ya no hay vecinos por revisar → la función regresa (backtrack).',
  FIN: 'Se terminó el recorrido: se regresa la lista de visitados.',
};

/** Traduce un `DfsState` a lo que la UI dibuja. */
function toFrame(s: DfsState, graph: Graph, start: string): VisualFrame {
  const nodes: Record<string, NodeVisual> = {};
  for (const n of graph.nodes) {
    const st = s.nodeStatus[n];
    const ring = s.currentNode === n ? { ring: '#e0f2fe' } : {};
    if (st === 'en-pila') nodes[n] = { fill: ACCENT, text: PALETTE.darkText, ...ring };
    else if (st === 'terminado') nodes[n] = { fill: FINISHED, text: '#ffffff', ...ring };
    else nodes[n] = { fill: PALETTE.nodeBase, ...ring };
  }

  const edges: Record<string, EdgeVisual> = {};
  for (const t of s.treeEdges) edges[edgeKey(t, false)] = { color: ACCENT, width: 3 };
  if (s.currentEdge !== null) {
    edges[edgeKey(s.currentEdge, false)] =
      s.actionType === 'YA_VISITADO'
        ? { color: PALETTE.highlight, width: 3, dashed: true }
        : { color: PALETTE.highlight, width: 4 };
  }

  const vecino =
    s.actionType === 'EXPLORANDO' || s.actionType === 'YA_VISITADO'
      ? s.currentEdge?.to ?? null
      : null;
  const nodo = s.actionType === 'FIN' ? null : s.currentNode;

  return {
    step: s.step,
    action: s.action,
    explanation: EXPLAIN[s.actionType],
    lines: LINES[s.actionType],
    finished: s.actionType === 'FIN',
    nodes,
    edges,
    results: [
      {
        title: 'Orden de visita',
        items: s.visited.map((v) => ({ label: v, color: ACCENT, textColor: PALETTE.darkText })),
        slots: graph.nodes.length,
      },
      {
        title: 'Orden de finalización (backtrack)',
        items: s.finishOrder.map((v) => ({ label: v, color: FINISHED, textColor: '#ffffff' })),
        slots: graph.nodes.length,
      },
    ],
    vars: [
      { name: 'nodo', value: nodo === null ? 'None' : `'${nodo}'` },
      { name: 'vecino', value: vecino === null ? '—' : `'${vecino}'` },
      { name: 'visitados', value: `[${s.visited.map((v) => `'${v}'`).join(', ')}]` },
    ],
    list: {
      title: 'Pila de llamadas (recursión)',
      items: [
        ...[...s.stack].reverse().map((n) => `dfs_visitar(grafo, '${n}', visitados)`),
        `dfs(grafo, '${start}')`,
      ],
      highlight: 0,
    },
    status:
      s.actionType === 'FIN'
        ? { text: `✔ Recorrido completo: ${s.visited.length} nodos visitados`, tone: 'ok' }
        : null,
    raw: s,
  };
}

export const dfsAlgorithm: AlgorithmDefinition = {
  id: 'dfs',
  tab: 'DFS',
  name: 'DFS Recursivo',
  subtitle: 'Profundidad → Retroceso',
  accent: ACCENT,
  time: 'O(V+E)',
  space: 'O(V)',
  fileName: 'dfs.py',
  python: PYTHON,
  legend: [
    { color: PALETTE.nodeBase, label: 'No visitado' },
    { color: ACCENT, label: 'En pila (explorando)' },
    { color: FINISHED, label: 'Terminado' },
    { color: PALETTE.highlight, label: 'Arista evaluada' },
  ],
  graphs: [
    {
      id: 'dfs-ejemplo',
      label: 'Grafo de ejemplo (con nodo aislado H)',
      graph: dfsSampleGraph,
      layout: dfsSampleLayout,
      start: 'A',
    },
  ],
  run: (opt) =>
    mapGenerator(dfsGenerator(opt.graph, opt.start, { exploreAll: true }), (s) =>
      toFrame(s, opt.graph, opt.start),
    ),
};
