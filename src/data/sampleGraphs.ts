import { buildGraph } from '../utils/graphBuilder';
import type { Graph, NodeId } from '../types/graph';

/** Posiciones (en px, dentro de un viewBox de 400×330) para dibujar cada nodo. */
export type Layout = Readonly<Record<NodeId, { readonly x: number; readonly y: number }>>;

/* ============================================================================
 *  DFS — grafo NO dirigido con un nodo aislado (H)
 *
 *        A
 *       / \
 *      B   C
 *     / \   \
 *    D   E---F
 *            |
 *            G          H (aislado)
 * ========================================================================== */
export const dfsSampleGraph: Graph = buildGraph(
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'B', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'E', to: 'F' },
    { from: 'F', to: 'G' },
  ],
  false,
);

export const dfsSampleLayout: Layout = {
  A: { x: 220, y: 40 },
  B: { x: 130, y: 120 },
  C: { x: 310, y: 120 },
  D: { x: 70, y: 210 },
  E: { x: 190, y: 210 },
  F: { x: 330, y: 210 },
  G: { x: 330, y: 290 },
  H: { x: 70, y: 290 },
};

/* ============================================================================
 *  BIPARTITO — hexágono A..F con la cuerda A–D (todos los ciclos son pares)
 *  Variante "no bipartita": se agrega C–E, que forma el triángulo C–D–E (impar).
 * ========================================================================== */
const hexNodes = ['A', 'B', 'C', 'D', 'E', 'F'];
const hexEdges = [
  { from: 'A', to: 'B' },
  { from: 'B', to: 'C' },
  { from: 'C', to: 'D' },
  { from: 'D', to: 'E' },
  { from: 'E', to: 'F' },
  { from: 'F', to: 'A' },
  { from: 'A', to: 'D' },
];

export const bipartiteGraph: Graph = buildGraph(hexNodes, hexEdges, false);

export const nonBipartiteGraph: Graph = buildGraph(
  hexNodes,
  [...hexEdges, { from: 'C', to: 'E' }],
  false,
);

export const hexLayout: Layout = {
  A: { x: 200, y: 40 },
  B: { x: 310, y: 102 },
  C: { x: 310, y: 228 },
  D: { x: 200, y: 290 },
  E: { x: 90, y: 228 },
  F: { x: 90, y: 102 },
};

/* ============================================================================
 *  BELLMAN-FORD — grafo DIRIGIDO con pesos negativos (ejemplo clásico de CLRS)
 *  Resultado esperado desde A: A=0, B=2, C=4, D=7, E=−2
 * ========================================================================== */
export const bellmanFordGraph: Graph = buildGraph(
  ['A', 'B', 'C', 'D', 'E'],
  [
    { from: 'A', to: 'B', weight: 6 },
    { from: 'A', to: 'D', weight: 7 },
    { from: 'B', to: 'C', weight: 5 },
    { from: 'B', to: 'D', weight: 8 },
    { from: 'B', to: 'E', weight: -4 },
    { from: 'C', to: 'B', weight: -2 },
    { from: 'D', to: 'C', weight: -3 },
    { from: 'D', to: 'E', weight: 9 },
    { from: 'E', to: 'A', weight: 2 },
    { from: 'E', to: 'C', weight: 7 },
  ],
  true,
);

export const bellmanFordLayout: Layout = {
  A: { x: 45, y: 165 },
  B: { x: 165, y: 60 },
  C: { x: 330, y: 60 },
  D: { x: 165, y: 270 },
  E: { x: 330, y: 270 },
};

/**
 * Variante con CICLO NEGATIVO: B → D → E → B pesa 2 + (−3) + (−1) = −2.
 */
export const negativeCycleGraph: Graph = buildGraph(
  ['A', 'B', 'C', 'D', 'E'],
  [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 3 },
    { from: 'C', to: 'E', weight: 2 },
    { from: 'B', to: 'D', weight: 2 },
    { from: 'D', to: 'E', weight: -3 },
    { from: 'E', to: 'B', weight: -1 },
  ],
  true,
);

export const negativeCycleLayout: Layout = {
  A: { x: 45, y: 165 },
  B: { x: 175, y: 60 },
  C: { x: 175, y: 270 },
  D: { x: 340, y: 60 },
  E: { x: 340, y: 270 },
};
