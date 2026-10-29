import type { AlgorithmDefinition } from '../types/visual';
import { bellmanFordAlgorithm } from './bellmanFordView';
import { bipartiteAlgorithm } from './bipartiteView';
import { dfsAlgorithm } from './dfsView';

/** Registro de algoritmos que aparecen como pestañas. */
export const ALGORITHMS: readonly [AlgorithmDefinition, ...AlgorithmDefinition[]] = [
  dfsAlgorithm,
  bipartiteAlgorithm,
  bellmanFordAlgorithm,
];
