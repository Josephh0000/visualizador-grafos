import type { Graph, NodeId } from './graph';
import type { Layout } from '../data/sampleGraphs';

/**
 * Capa de presentación genérica.
 *
 * Cada algoritmo emite su PROPIO estado (DfsState, BipartiteState, BellmanFordState).
 * Un "adaptador" traduce ese estado a un `VisualFrame`, que es lo único que la UI
 * sabe dibujar. Así la UI es la misma para los 3 algoritmos y la lógica
 * matemática queda separada de React.
 */

/** Cómo pintar un nodo. */
export interface NodeVisual {
  readonly fill: string;
  readonly text?: string;
  /** Anillo exterior (nodo "actual"), como en el diseño de referencia. */
  readonly ring?: string;
  /** Texto pequeño junto al nodo (ej. la distancia en Bellman-Ford). */
  readonly badge?: string;
}

/** Cómo pintar una arista. */
export interface EdgeVisual {
  readonly color: string;
  readonly width: number;
  readonly dashed?: boolean;
}

/** Una cajita de resultado (como la fila de cuadros del diseño). */
export interface ResultBox {
  readonly label: string;
  readonly color: string;
  readonly textColor?: string;
}

export interface ResultRow {
  readonly title: string;
  readonly items: readonly ResultBox[];
  /** Total de casillas a mostrar (las vacías se pintan como huecos). */
  readonly slots: number;
}

/** Variable mostrada debajo del código (ej. `nodo = 'B'`). */
export interface VarView {
  readonly name: string;
  readonly value: string;
}

/** Lista auxiliar: pila de llamadas (DFS), cola (BFS), predecesores (B-F). */
export interface ListView {
  readonly title: string;
  readonly items: readonly string[];
  /** Índice del elemento a resaltar (tope de pila / frente de cola). */
  readonly highlight: number | null;
}

export type StatusTone = 'ok' | 'error' | 'info';

/** Todo lo que la UI necesita para dibujar UN paso. */
export interface VisualFrame {
  readonly step: number;
  readonly action: string;
  readonly explanation: string;
  /** Líneas del código Python a resaltar (base 1). */
  readonly lines: readonly number[];
  readonly finished: boolean;
  readonly nodes: Readonly<Record<NodeId, NodeVisual>>;
  /** Clave = `edgeKey(arista, dirigido)`. Las que falten se pintan por defecto. */
  readonly edges: Readonly<Record<string, EdgeVisual>>;
  readonly results: readonly ResultRow[];
  readonly vars: readonly VarView[];
  readonly list: ListView | null;
  readonly status: { readonly text: string; readonly tone: StatusTone } | null;
  /** Estado original emitido por el generador (se muestra como JSON). */
  readonly raw: unknown;
}

/** Un grafo de ejemplo seleccionable. */
export interface GraphOption {
  readonly id: string;
  readonly label: string;
  readonly graph: Graph;
  readonly layout: Layout;
  readonly start: NodeId;
}

export interface LegendItem {
  readonly color: string;
  readonly label: string;
}

/** Definición completa de un algoritmo para el visualizador. */
export interface AlgorithmDefinition {
  readonly id: string;
  readonly tab: string;
  readonly name: string;
  readonly subtitle: string;
  /** Color principal de la tarjeta. */
  readonly accent: string;
  readonly time: string;
  readonly space: string;
  readonly fileName: string;
  readonly python: readonly string[];
  readonly legend: readonly LegendItem[];
  readonly graphs: readonly [GraphOption, ...GraphOption[]];
  /** Crea el generador del algoritmo ya traducido a frames visuales. */
  run(option: GraphOption): Generator<VisualFrame, void, undefined>;
}
