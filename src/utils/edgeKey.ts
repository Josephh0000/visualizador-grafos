import type { Edge } from '../types/graph';

/**
 * Clave única de una arista.
 * - Dirigido:    "A->B" (A→B y B→A son distintas).
 * - No dirigido: "A--B" con los extremos ordenados (A–B == B–A).
 */
export function edgeKey(e: Pick<Edge, 'from' | 'to'>, directed: boolean): string {
  if (directed) return `${e.from}->${e.to}`;
  return e.from < e.to ? `${e.from}--${e.to}` : `${e.to}--${e.from}`;
}

/** Recorre un generador de estados y traduce cada uno a otro tipo (frames visuales). */
export function* mapGenerator<S, F>(
  gen: Generator<S, unknown, undefined>,
  toFrame: (state: S) => F,
): Generator<F, void, undefined> {
  for (const state of gen) {
    yield toFrame(state);
  }
}
