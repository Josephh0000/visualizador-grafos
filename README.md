# Visualizador de Grafos — Integrante 2

Aplicación web (React + TypeScript) para visualizar algoritmos de grafos como
**simulaciones matemáticas reales paso a paso** (sin animaciones CSS pregrabadas).
Cada algoritmo está implementado como **función generadora** (`function*`) que hace
`yield` de un snapshot del estado en cada evaluación importante; la UI avanza con
`generador.next()`.

## Avance

| # | Algoritmo | Estado |
|---|-----------|--------|
| 1 | Búsqueda en Profundidad (DFS recursivo) | ✅ Implementado + pruebas |
| 2 | Coloreo Bipartito (BFS, 2 colores) | ✅ Implementado + pruebas |
| 3 | Bellman-Ford (pesos negativos + detección de ciclo negativo) | ✅ Implementado + pruebas |

Cada algoritmo tiene su pestaña, con el grafo, el **código Python con la línea actual
resaltada**, las variables del paso, cajitas con el resultado acumulado, y botones
**Siguiente Paso / Reproducir / Reiniciar**.

## Cómo ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas unitarias del generador (Vitest)
npm run build      # typecheck estricto + build de producción
```

## Estructura

```
src/
├── types/          # graph.ts, dfs.ts, bipartite.ts, bellmanFord.ts, visual.ts
├── algorithms/     # LÓGICA PURA (generadores function*)
│   ├── dfs.ts
│   ├── bipartite.ts
│   ├── bellmanFord.ts
│   └── __tests__/
├── visual/         # Adaptadores: estado del algoritmo → frame visual (+ código Python)
│   ├── dfsView.ts, bipartiteView.ts, bellmanFordView.ts
│   └── algorithms.ts   # registro de pestañas
├── components/
│   ├── VisualizadorGrafos.tsx   # pestañas
│   ├── AlgorithmPlayer.tsx      # useRef(generador) + useState(frame) + botones
│   ├── GraphCanvas.tsx          # dibujo SVG
│   ├── CodigoPython.tsx         # código con línea resaltada + variables
│   └── ResultadoCajas.tsx
├── data/sampleGraphs.ts
└── utils/
```

## DFS: qué emite cada `yield`

| Acción | Cuándo |
|--------|--------|
| `INICIO` | Antes de visitar cualquier nodo |
| `VISITANDO` | Se entra a un nodo (se marca visitado y entra a la pila) |
| `EXPLORANDO` | Se evalúa una arista hacia un vecino NO visitado → se profundiza |
| `YA_VISITADO` | Se evalúa una arista hacia un vecino ya visitado → se omite |
| `RETROCEDIENDO` | Se agotaron los vecinos → backtrack |
| `FIN` | Termina el recorrido |

Cada `DfsState` incluye: `step`, `action`, `currentNode`, `currentEdge`,
`visited[]`, `stack[]` (pila de recursión), `nodeStatus`, `treeEdges[]` y `finishOrder[]`.
Los snapshots son **copias inmutables**, por lo que React detecta el cambio y el
historial no se altera.

La recursión se delega con `yield*`:

```ts
function* dfsVisit(node, ctx, parent) {
  // ...marcar visitado...
  yield snapshot(ctx, 'VISITANDO', `Visitando ${node}`, node);
  for (const vecino of ctx.graph.adjacency[node] ?? []) {
    if (!ctx.visitedSet.has(vecino)) {
      yield* dfsVisit(vecino, ctx, node);   // ← recursión dentro del generador
    }
  }
  yield snapshot(ctx, 'RETROCEDIENDO', `Retrocediendo de ${node}`, node);
}
```

## Integración con React

- El generador vive en `useRef` (persiste entre renders, no provoca re-render).
- El último `yield` vive en `useState`.
- El botón **Siguiente Paso** ejecuta `generador.current.next()` y guarda `value`.
- **Reiniciar** crea un generador nuevo.

## Coloreo Bipartito: qué emite cada `yield`

`INICIO`, `NUEVA_COMPONENTE`, `DESENCOLAR`, `COLOREAR`, `VECINO_OK`, `CONFLICTO`, `FIN`.
Cada `BipartiteState` incluye `colors` (`{ A: 0, B: 1 }`), `partitionX`, `partitionY`,
`queue`, `currentEdge`, `conflictEdge` (se pinta de rojo) e `isBipartite`.

## Bellman-Ford: qué emite cada `yield`

`INICIO`, `INICIO_RONDA`, `EVALUAR`, `ACTUALIZAR`, `FIN_RONDA`, `VERIFICAR`, `CICLO_NEGATIVO`, `FIN`.
Cada `BellmanFordState` incluye `round` / `totalRounds` (V − 1), `currentEdge`, `updated`,
`dist` (mapa de distancias), `prev`, `negativeCycleEdge` y `hasNegativeCycle`.
