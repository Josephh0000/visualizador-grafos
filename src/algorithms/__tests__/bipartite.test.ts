import { describe, expect, it } from 'vitest';
import { bipartiteGenerator } from '../bipartite';
import { bipartiteGraph, nonBipartiteGraph } from '../../data/sampleGraphs';
import { buildGraph } from '../../utils/graphBuilder';
import type { BipartiteState } from '../../types/bipartite';

function runAll(gen: Generator<BipartiteState, BipartiteState, undefined>): BipartiteState[] {
  const states: BipartiteState[] = [];
  for (const s of gen) states.push(s);
  return states;
}

describe('Coloreo bipartito (BFS)', () => {
  it('detecta un grafo bipartito y arma las particiones', () => {
    const states = runAll(bipartiteGenerator(bipartiteGraph, 'A'));
    const fin = states[states.length - 1];
    expect(fin?.isBipartite).toBe(true);
    expect(fin?.conflictEdge).toBeNull();
    expect([...(fin?.partitionX ?? [])].sort()).toEqual(['A', 'C', 'E']);
    expect([...(fin?.partitionY ?? [])].sort()).toEqual(['B', 'D', 'F']);
  });

  it('ninguna arista une nodos del mismo color', () => {
    const states = runAll(bipartiteGenerator(bipartiteGraph, 'A'));
    const colors = states[states.length - 1]?.colors ?? {};
    for (const e of bipartiteGraph.edges) {
      expect(colors[e.from]).not.toBe(colors[e.to]);
    }
  });

  it('detecta el conflicto en un ciclo impar y emite la arista', () => {
    const states = runAll(bipartiteGenerator(nonBipartiteGraph, 'A'));
    const fin = states[states.length - 1];
    expect(fin?.isBipartite).toBe(false);
    expect(states.some((s) => s.actionType === 'CONFLICTO')).toBe(true);
    const e = fin?.conflictEdge;
    expect(e).not.toBeNull();
    if (e) expect(fin?.colors[e.from]).toBe(fin?.colors[e.to]);
  });

  it('colorea también componentes desconectadas', () => {
    const g = buildGraph(['A', 'B', 'C', 'D'], [
      { from: 'A', to: 'B' },
      { from: 'C', to: 'D' },
    ]);
    const states = runAll(bipartiteGenerator(g, 'A'));
    expect(Object.keys(states[states.length - 1]?.colors ?? {})).toHaveLength(4);
  });
});
