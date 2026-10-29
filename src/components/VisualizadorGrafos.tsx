import { useCallback, useEffect, useRef, useState } from 'react';
import { dfsGenerator } from '../algorithms/dfs';
import { dfsSampleGraph, dfsSampleLayout } from '../data/sampleGraphs';
import type { DfsNodeStatus, DfsState } from '../types/dfs';
import type { Edge, Graph, NodeId } from '../types/graph';
import CodigoPython from './CodigoPython';
import './VisualizadorGrafos.css';

/** Tipo exacto del generador del DFS. */
type DfsGen = Generator<DfsState, DfsState, undefined>;

interface Props {
  /** Grafo a recorrer (por defecto, el grafo de ejemplo). */
  readonly graph?: Graph;
  /** Nodo de inicio (por defecto, "A"). */
  readonly startNode?: NodeId;
  /** Posiciones de los nodos para el SVG. */
  readonly layout?: Readonly<Record<NodeId, { x: number; y: number }>>;
}

/** Color de cada nodo según su estado en el DFS. */
const STATUS_COLOR: Record<DfsNodeStatus, string> = {
  'no-visitado': '#cbd5e1',
  'en-pila': '#facc15',
  terminado: '#22c55e',
};

/** Compara aristas ignorando la dirección (grafo no dirigido). */
const sameEdge = (a: Edge, b: Edge | null): boolean =>
  b !== null &&
  ((a.from === b.from && a.to === b.to) || (a.from === b.to && a.to === b.from));

/**
 * Componente base que demuestra la integración generador ↔ React:
 *  1. El generador vive en un `useRef` (no provoca re-render y persiste entre renders).
 *  2. El último estado emitido (`yield`) vive en `useState`.
 *  3. "Siguiente Paso" llama a `generador.current.next()` y guarda el resultado.
 */
export default function VisualizadorGrafos({
  graph = dfsSampleGraph,
  startNode = 'A',
  layout = dfsSampleLayout,
}: Props) {
  // (1) Referencia al generador. Se crea de forma perezosa en el primer render.
  const generador = useRef<DfsGen | null>(null);
  if (generador.current === null) {
    generador.current = dfsGenerator(graph, startNode, { exploreAll: true });
  }

  // (2) Estado actual emitido por el generador + historial de acciones.
  const [estado, setEstado] = useState<DfsState | null>(null);
  const [historial, setHistorial] = useState<string[]>([]);
  const [terminado, setTerminado] = useState(false);
  // Reproducción automática: llama a .next() cada `velocidadMs` milisegundos.
  const [reproduciendo, setReproduciendo] = useState(false);
  const [velocidadMs, setVelocidadMs] = useState(800);

  // (3) Avanzar un paso de la simulación.
  const siguientePaso = useCallback((): void => {
    const gen = generador.current;
    if (gen === null || terminado) return;

    const resultado = gen.next();
    if (resultado.done === true) {
      setTerminado(true);
      return;
    }

    const nuevo = resultado.value;
    setEstado(nuevo);
    setHistorial((prev) => [...prev, `#${nuevo.step} ${nuevo.action}`]);
    if (nuevo.actionType === 'FIN') setTerminado(true);
  }, [terminado]);

  // Reinicia la simulación creando un generador nuevo.
  const reiniciar = useCallback((): void => {
    generador.current = dfsGenerator(graph, startNode, { exploreAll: true });
    setEstado(null);
    setHistorial([]);
    setTerminado(false);
    setReproduciendo(false);
  }, [graph, startNode]);

  // Modo "Reproducir": el mismo generador avanza solo con un temporizador.
  // No es una animación pregrabada: cada tick ejecuta un paso real del DFS.
  useEffect(() => {
    if (!reproduciendo || terminado) return undefined;
    const id = window.setInterval(siguientePaso, velocidadMs);
    return () => window.clearInterval(id);
  }, [reproduciendo, terminado, velocidadMs, siguientePaso]);

  useEffect(() => {
    if (terminado) setReproduciendo(false);
  }, [terminado]);

  const statusDe = (n: NodeId): DfsNodeStatus => estado?.nodeStatus[n] ?? 'no-visitado';

  return (
    <div className="viz">
      <h1>Visualizador de Grafos — DFS Recursivo</h1>

      <div className="viz__controles">
        <button type="button" onClick={siguientePaso} disabled={terminado}>
          Siguiente Paso ▶
        </button>
        <button
          type="button"
          onClick={() => setReproduciendo((r) => !r)}
          disabled={terminado}
        >
          {reproduciendo ? 'Pausar ⏸' : 'Reproducir ⏵'}
        </button>
        <button type="button" onClick={reiniciar}>
          Reiniciar ⟲
        </button>
        <label className="viz__velocidad">
          Velocidad
          <input
            type="range"
            min={150}
            max={2000}
            step={50}
            value={2150 - velocidadMs}
            onChange={(e) => setVelocidadMs(2150 - Number(e.target.value))}
          />
        </label>
      </div>

      {/* --- Grafo (izquierda) + código Python sincronizado (derecha) --- */}
      <div className="viz__panel">
      <svg className="viz__svg" viewBox="0 0 400 330" role="img" aria-label="Grafo">
        {graph.edges.map((e) => {
          const a = layout[e.from];
          const b = layout[e.to];
          if (a === undefined || b === undefined) return null;
          const activa = sameEdge(e, estado?.currentEdge ?? null);
          const deArbol = estado?.treeEdges.some((t) => sameEdge(e, t)) ?? false;
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={activa ? '#ef4444' : deArbol ? '#2563eb' : '#94a3b8'}
              strokeWidth={activa ? 5 : deArbol ? 4 : 2}
            />
          );
        })}
        {graph.nodes.map((n) => {
          const p = layout[n];
          if (p === undefined) return null;
          const actual = estado?.currentNode === n;
          return (
            <g key={n}>
              <circle
                cx={p.x}
                cy={p.y}
                r={20}
                fill={STATUS_COLOR[statusDe(n)]}
                stroke={actual ? '#ef4444' : '#334155'}
                strokeWidth={actual ? 4 : 2}
              />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontWeight="bold">
                {n}
              </text>
            </g>
          );
        })}
      </svg>
      <CodigoPython estado={estado} inicio={startNode} />
      </div>

      <div className="viz__leyenda">
        <span><i style={{ background: STATUS_COLOR['no-visitado'] }} /> No visitado</span>
        <span><i style={{ background: STATUS_COLOR['en-pila'] }} /> En pila (explorando)</span>
        <span><i style={{ background: STATUS_COLOR.terminado }} /> Terminado</span>
        <span><i style={{ background: '#2563eb' }} /> Arista de árbol</span>
        <span><i style={{ background: '#ef4444' }} /> Arista evaluada</span>
      </div>

      {/* --- (4) Estado crudo para demostrar que la simulación funciona --- */}
      <section className="viz__estado">
        <h2>Estado actual</h2>
        {estado === null ? (
          <p>Presiona “Siguiente Paso” para comenzar.</p>
        ) : (
          <>
            <p><b>Paso:</b> {estado.step}</p>
            <p><b>Acción:</b> {estado.action}</p>
            <p><b>Nodo actual:</b> {estado.currentNode ?? '—'}</p>
            <p><b>Visitados:</b> [{estado.visited.join(', ')}]</p>
            <p><b>Pila de recursión:</b> [{estado.stack.join(' → ')}]</p>
            <p><b>Orden de finalización:</b> [{estado.finishOrder.join(', ')}]</p>
          </>
        )}
        {terminado && <p className="viz__fin">✔ Simulación terminada</p>}
      </section>

      <section className="viz__historial">
        <h2>Historial</h2>
        <ol>
          {historial.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ol>
      </section>

      <details>
        <summary>JSON del último yield</summary>
        <pre>{JSON.stringify(estado, null, 2)}</pre>
      </details>
    </div>
  );
}
