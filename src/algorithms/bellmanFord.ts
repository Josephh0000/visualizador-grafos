import type { Edge, Graph, NodeId } from '../types/graph';
import type {
  BellmanFordActionType,
  BellmanFordPhase,
  BellmanFordState,
} from '../types/bellmanFord';

/**
 * ============================================================================
 *  ALGORITMO 3: BELLMAN-FORD (CAMINOS MÍNIMOS CON PESOS NEGATIVOS)
 * ============================================================================
 *
 * 1. dist[origen] = 0, dist[resto] = ∞.
 * 2. Repetir V − 1 rondas: para cada arista (u → v, w), si
 *    dist[u] + w < dist[v] → dist[v] = dist[u] + w  (relajación).
 * 3. Ronda extra de verificación: si alguna arista TODAVÍA mejora,
 *    existe un ciclo de peso negativo alcanzable desde el origen.
 *
 * ¿Por qué V − 1? Un camino mínimo simple tiene como máximo V − 1 aristas;
 * en la ronda i ya quedan correctos todos los caminos de ≤ i aristas.
 *
 * Complejidad: O(V · E) tiempo, O(V) espacio.
 */

/** Formatea una distancia (∞ para Infinity). */
export const fmtDist = (d: number): string =>
  d === Infinity ? '∞' : d === -Infinity ? '−∞' : String(d);

export function* bellmanFordGenerator(
  graph: Graph,
  source: NodeId,
): Generator<BellmanFordState, BellmanFordState, undefined> {
  if (!graph.nodes.includes(source)) {
    throw new Error(`El nodo origen "${source}" no existe en el grafo`);
  }

  // Lista de aristas con peso obligatorio. En grafos no dirigidos se usan ambos sentidos.
  const aristas: Edge[] = [];
  for (const e of graph.edges) {
    if (e.weight === undefined) {
      throw new Error(`La arista ${e.from}→${e.to} no tiene peso`);
    }
    aristas.push(e);
    if (!graph.directed) aristas.push({ from: e.to, to: e.from, weight: e.weight });
  }

  // ----- Estado mutable interno -----
  const dist: Record<NodeId, number> = {};
  const prev: Record<NodeId, NodeId | null> = {};
  for (const n of graph.nodes) {
    dist[n] = Infinity;
    prev[n] = null;
  }
  dist[source] = 0;

  const totalRounds = graph.nodes.length - 1;
  let round = 0;
  let phase: BellmanFordPhase = 'inicio';
  let changesInRound = 0;
  let negativeCycleEdge: Edge | null = null;
  let hasNegativeCycle: boolean | null = null;
  let step = 0;

  const snap = (
    actionType: BellmanFordActionType,
    action: string,
    currentEdge: Edge | null = null,
    updated = false,
    candidate: number | null = null,
  ): BellmanFordState => ({
    step: step++,
    actionType,
    action,
    phase,
    source,
    round,
    totalRounds,
    currentEdge,
    updated,
    candidate,
    dist: { ...dist },
    prev: { ...prev },
    changesInRound,
    negativeCycleEdge,
    hasNegativeCycle,
  });

  const distDe = (n: NodeId): number => dist[n] ?? Infinity;

  yield snap('INICIO', `dist[${source}] = 0 y todos los demás = ∞`);

  // ----- V − 1 rondas de relajación -----
  phase = 'relajacion';
  for (round = 1; round <= totalRounds; round++) {
    changesInRound = 0;
    yield snap('INICIO_RONDA', `Ronda ${round} de ${totalRounds}`);

    for (const e of aristas) {
      const w = e.weight ?? 0;
      const du = distDe(e.from);
      const dv = distDe(e.to);
      const cand = du + w;

      if (du !== Infinity && cand < dv) {
        dist[e.to] = cand;
        prev[e.to] = e.from;
        changesInRound++;
        yield snap(
          'ACTUALIZAR',
          `${e.from}→${e.to} (w=${w}): ${fmtDist(du)} + ${w} = ${cand} < ${fmtDist(dv)} → dist[${e.to}] = ${cand}`,
          e,
          true,
          cand,
        );
      } else {
        yield snap(
          'EVALUAR',
          du === Infinity
            ? `${e.from}→${e.to} (w=${w}): dist[${e.from}] = ∞ → no se puede relajar`
            : `${e.from}→${e.to} (w=${w}): ${fmtDist(du)} + ${w} = ${cand} ≥ ${fmtDist(dv)} → sin cambio`,
          e,
          false,
          du === Infinity ? null : cand,
        );
      }
    }

    yield snap(
      'FIN_RONDA',
      `Fin de la ronda ${round}: ${changesInRound} actualización(es)`,
    );
  }
  round = totalRounds;

  // ----- Ronda extra: detección de ciclos negativos -----
  phase = 'verificacion';
  for (const e of aristas) {
    const w = e.weight ?? 0;
    const du = distDe(e.from);
    const dv = distDe(e.to);
    const cand = du + w;

    if (du !== Infinity && cand < dv) {
      negativeCycleEdge = e;
      hasNegativeCycle = true;
      yield snap(
        'CICLO_NEGATIVO',
        `¡${e.from}→${e.to} todavía mejora (${cand} < ${fmtDist(dv)})! Hay un ciclo negativo`,
        e,
        false,
        cand,
      );
      phase = 'fin';
      const fin = snap(
        'FIN',
        'Hay un ciclo de peso negativo: las distancias mínimas no están definidas',
        e,
      );
      yield fin;
      return fin;
    }
    yield snap(
      'VERIFICAR',
      `Verificando ${e.from}→${e.to}: ya no mejora ✓`,
      e,
      false,
      du === Infinity ? null : cand,
    );
  }

  hasNegativeCycle = false;
  phase = 'fin';
  const resumen = graph.nodes.map((n) => `${n}=${fmtDist(distDe(n))}`).join(', ');
  const fin = snap('FIN', `Sin ciclos negativos. Distancias: ${resumen}`);
  yield fin;
  return fin;
}
