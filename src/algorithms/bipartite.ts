import type { Edge, Graph, NodeId } from '../types/graph';
import type {
  BipartiteActionType,
  BipartiteColor,
  BipartiteState,
} from '../types/bipartite';

/**
 * ============================================================================
 *  ALGORITMO 2: COLOREO BIPARTITO (VALIDACIÓN 2-COLORES CON BFS)
 * ============================================================================
 *
 * Idea: un grafo es bipartito si se pueden pintar sus nodos con 2 colores
 * de modo que NINGUNA arista una dos nodos del mismo color.
 *
 * Con BFS: el nodo inicial recibe color 0; cada vecino sin color recibe el
 * color opuesto (1 − color[u]). Si encontramos un vecino que YA tiene el mismo
 * color que `u`, hay un ciclo de longitud impar → NO es bipartito.
 *
 * Se recorren todas las componentes (por si el grafo está desconectado),
 * empezando por `startNode`.
 *
 * Complejidad: O(V + E) tiempo, O(V) espacio (cola + mapa de colores).
 */
export function* bipartiteGenerator(
  graph: Graph,
  startNode: NodeId,
): Generator<BipartiteState, BipartiteState, undefined> {
  if (!graph.nodes.includes(startNode)) {
    throw new Error(`El nodo inicial "${startNode}" no existe en el grafo`);
  }

  // ----- Estado mutable interno -----
  const colors: Record<NodeId, BipartiteColor> = {};
  const partitionX: NodeId[] = [];
  const partitionY: NodeId[] = [];
  const queue: NodeId[] = [];
  let conflictEdge: Edge | null = null;
  let isBipartite: boolean | null = null;
  let step = 0;

  /** Copia inmutable del estado actual (para React y para el historial). */
  const snap = (
    actionType: BipartiteActionType,
    action: string,
    currentNode: NodeId | null,
    currentEdge: Edge | null = null,
  ): BipartiteState => ({
    step: step++,
    actionType,
    action,
    currentNode,
    currentEdge,
    colors: { ...colors },
    partitionX: [...partitionX],
    partitionY: [...partitionY],
    queue: [...queue],
    conflictEdge,
    isBipartite,
  });

  const nombre = (c: BipartiteColor): string => (c === 0 ? 'X' : 'Y');

  yield snap('INICIO', 'Inicio: ningún nodo tiene color todavía', null);

  // El nodo inicial va primero; luego el resto (componentes desconectadas).
  const orden = [startNode, ...graph.nodes.filter((n) => n !== startNode)];

  for (const s of orden) {
    if (colors[s] !== undefined) continue;

    colors[s] = 0;
    partitionX.push(s);
    queue.push(s);
    yield snap(
      'NUEVA_COMPONENTE',
      `${s} recibe color 0 (Partición X) y entra a la cola`,
      s,
    );

    // ----- BFS -----
    while (queue.length > 0) {
      const u = queue.shift();
      if (u === undefined) break;
      const cu = colors[u];
      if (cu === undefined) continue; // no ocurre: todo nodo encolado tiene color

      yield snap('DESENCOLAR', `Sacando ${u} de la cola (color ${cu})`, u);

      for (const v of graph.adjacency[u] ?? []) {
        const edge: Edge = { from: u, to: v };
        const cv = colors[v];

        if (cv === undefined) {
          // Vecino sin color → color opuesto.
          const nuevo: BipartiteColor = cu === 0 ? 1 : 0;
          colors[v] = nuevo;
          (nuevo === 0 ? partitionX : partitionY).push(v);
          queue.push(v);
          yield snap(
            'COLOREAR',
            `Arista ${u}–${v}: ${v} no tiene color → recibe ${nuevo} (Partición ${nombre(nuevo)})`,
            u,
            edge,
          );
        } else if (cv === cu) {
          // ¡Dos vecinos con el mismo color!
          conflictEdge = edge;
          isBipartite = false;
          yield snap(
            'CONFLICTO',
            `¡Conflicto! ${u} y ${v} son vecinos y ambos tienen color ${cu}`,
            u,
            edge,
          );
          const fin = snap(
            'FIN',
            `El grafo NO es bipartito: la arista ${u}–${v} une dos nodos del mismo color`,
            null,
            edge,
          );
          yield fin;
          return fin;
        } else {
          yield snap(
            'VECINO_OK',
            `Arista ${u}–${v}: ${v} ya tiene color ${cv} ≠ ${cu} → correcto`,
            u,
            edge,
          );
        }
      }
    }
  }

  isBipartite = true;
  const fin = snap(
    'FIN',
    `El grafo SÍ es bipartito. X = {${partitionX.join(', ')}}, Y = {${partitionY.join(', ')}}`,
    null,
  );
  yield fin;
  return fin;
}
