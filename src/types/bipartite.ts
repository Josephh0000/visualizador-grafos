import type { Edge, NodeId } from './graph';

/**
 * Acciones que emite el Coloreo Bipartito (BFS) en cada `yield`.
 *
 *  - INICIO           → estado inicial (ningún nodo tiene color).
 *  - NUEVA_COMPONENTE → un nodo sin color recibe color 0 y entra a la cola.
 *  - DESENCOLAR       → se saca un nodo `u` de la cola para revisar sus vecinos.
 *  - COLOREAR         → el vecino `v` no tenía color: recibe el color opuesto a `u`.
 *  - VECINO_OK        → el vecino `v` ya tenía color y es distinto al de `u` (correcto).
 *  - CONFLICTO        → el vecino `v` tiene el MISMO color que `u` → no es bipartito.
 *  - FIN              → termina (con resultado bipartito sí/no).
 */
export type BipartiteActionType =
  | 'INICIO'
  | 'NUEVA_COMPONENTE'
  | 'DESENCOLAR'
  | 'COLOREAR'
  | 'VECINO_OK'
  | 'CONFLICTO'
  | 'FIN';

/** Los dos colores posibles: 0 → Partición X, 1 → Partición Y. */
export type BipartiteColor = 0 | 1;

/** Snapshot inmutable emitido por el generador en cada paso. */
export interface BipartiteState {
  readonly step: number;
  readonly actionType: BipartiteActionType;
  /** Descripción legible del paso. */
  readonly action: string;
  /** Nodo `u` que se está procesando. */
  readonly currentNode: NodeId | null;
  /** Arista (u, v) que se está evaluando. */
  readonly currentEdge: Edge | null;
  /** Mapa de colores asignados, ej. `{ A: 0, B: 1 }`. */
  readonly colors: Readonly<Record<NodeId, BipartiteColor>>;
  /** Nodos con color 0. */
  readonly partitionX: readonly NodeId[];
  /** Nodos con color 1. */
  readonly partitionY: readonly NodeId[];
  /** Cola del BFS (el primero es el siguiente en salir). */
  readonly queue: readonly NodeId[];
  /** Arista conflictiva (dos vecinos con el mismo color) para pintarla de rojo. */
  readonly conflictEdge: Edge | null;
  /** `null` mientras corre; `true`/`false` al terminar. */
  readonly isBipartite: boolean | null;
}
