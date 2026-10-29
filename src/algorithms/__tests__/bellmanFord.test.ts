import { describe, expect, it } from 'vitest';
import { bellmanFordGenerator } from '../bellmanFord';
import { bellmanFordGraph, negativeCycleGraph } from '../../data/sampleGraphs';
import type { BellmanFordState } from '../../types/bellmanFord';

function runAll(
  gen: Generator<BellmanFordState, BellmanFordState, undefined>,
): BellmanFordState[] {
  const states: BellmanFordState[] = [];
  for (const s of gen) states.push(s);
  return states;
}

describe('Bellman-Ford (generador)', () => {
  it('calcula las distancias mínimas con pesos negativos', () => {
    const states = runAll(bellmanFordGenerator(bellmanFordGraph, 'A'));
    const fin = states[states.length - 1];
    expect(fin?.hasNegativeCycle).toBe(false);
    expect(fin?.dist).toEqual({ A: 0, B: 2, C: 4, D: 7, E: -2 });
  });

  it('hace exactamente V − 1 rondas', () => {
    const states = runAll(bellmanFordGenerator(bellmanFordGraph, 'A'));
    const rondas = states.filter((s) => s.actionType === 'INICIO_RONDA');
    expect(rondas).toHaveLength(bellmanFordGraph.nodes.length - 1);
  });

  it('evalúa cada arista una vez por ronda', () => {
    const states = runAll(bellmanFordGenerator(bellmanFordGraph, 'A'));
    const evaluaciones = states.filter(
      (s) => s.actionType === 'EVALUAR' || s.actionType === 'ACTUALIZAR',
    );
    expect(evaluaciones).toHaveLength(
      (bellmanFordGraph.nodes.length - 1) * bellmanFordGraph.edges.length,
    );
  });

  it('detecta un ciclo negativo', () => {
    const states = runAll(bellmanFordGenerator(negativeCycleGraph, 'A'));
    const fin = states[states.length - 1];
    expect(fin?.hasNegativeCycle).toBe(true);
    expect(fin?.negativeCycleEdge).not.toBeNull();
  });
});
