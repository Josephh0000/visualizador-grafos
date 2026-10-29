import type { Edge, NodeId } from './graph';

/**
 * Acciones que emite Bellman-Ford en cada `yield`.
 *
 *  - INICIO         → dist[origen] = 0 y el resto = ∞.
 *  - INICIO_RONDA   → comienza la ronda i (de V − 1).
 *  - EVALUAR        → se evalúa una arista y NO mejora la distancia.
 *  - ACTUALIZAR     → se evalúa una arista y SÍ mejora (relajación exitosa).
 *  - FIN_RONDA      → termina la ronda i (con su número de actualizaciones).
 *  - VERIFICAR      → ronda extra: la arista no mejora (no hay ciclo negativo por ahí).
 *  - CICLO_NEGATIVO → ronda extra: la arista aún mejora → existe un ciclo negativo.
 *  - FIN            → termina el algoritmo.
 */
export type BellmanFordActionType =
  | 'INICIO'
  | 'INICIO_RONDA'
  | 'EVALUAR'
  | 'ACTUALIZAR'
  | 'FIN_RONDA'
  | 'VERIFICAR'
  | 'CICLO_NEGATIVO'
  | 'FIN';

/** Fase del algoritmo. */
export type BellmanFordPhase = 'inicio' | 'relajacion' | 'verificacion' | 'fin';

/** Snapshot inmutable emitido por el generador en cada paso. */
export interface BellmanFordState {
  readonly step: number;
  readonly actionType: BellmanFordActionType;
  readonly action: string;
  readonly phase: BellmanFordPhase;
  /** Nodo origen. */
  readonly source: NodeId;
  /** Ronda actual (1..V−1). 0 antes de empezar. */
  readonly round: number;
  /** Total de rondas de relajación (V − 1). */
  readonly totalRounds: number;
  /** Arista (u → v, w) que se está evaluando. */
  readonly currentEdge: Edge | null;
  /** `true` si en este paso se actualizó dist[v]. */
  readonly updated: boolean;
  /** Valor candidato dist[u] + w calculado en este paso (null si no aplica). */
  readonly candidate: number | null;
  /** Distancias actuales (`Infinity` = inalcanzable por ahora). */
  readonly dist: Readonly<Record<NodeId, number>>;
  /** Predecesor de cada nodo en el camino mínimo. */
  readonly prev: Readonly<Record<NodeId, NodeId | null>>;
  /** Actualizaciones hechas en la ronda actual. */
  readonly changesInRound: number;
  /** Arista que delató un ciclo negativo (para pintarla de rojo). */
  readonly negativeCycleEdge: Edge | null;
  /** `null` mientras corre; `true`/`false` al terminar. */
  readonly hasNegativeCycle: boolean | null;
}
