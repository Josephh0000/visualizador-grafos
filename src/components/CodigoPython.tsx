import type { DfsActionType, DfsState } from '../types/dfs';

/**
 * Panel que muestra el DFS escrito en Python y resalta la línea
 * que corresponde al paso actual que emitió el generador.
 *
 * El código Python es solo para explicar: la ejecución real la hace
 * `dfsGenerator` (TypeScript). Cada `actionType` del estado se mapea
 * a las líneas equivalentes del pseudocódigo en Python.
 */

/** Código Python del DFS recursivo (una entrada por línea). */
const PYTHON_LINES: readonly string[] = [
  'def dfs(grafo, inicio):',
  '    visitados = []',
  '    dfs_visitar(grafo, inicio, visitados)',
  '    # componentes desconectados',
  '    for nodo in grafo:',
  '        if nodo not in visitados:',
  '            dfs_visitar(grafo, nodo, visitados)',
  '    return visitados',
  '',
  'def dfs_visitar(grafo, nodo, visitados):',
  '    visitados.append(nodo)',
  '    for vecino in grafo[nodo]:',
  '        if vecino not in visitados:',
  '            dfs_visitar(grafo, vecino, visitados)',
  '        else:',
  '            continue  # ya visitado, se omite',
  '    return  # retroceso (backtrack)',
];

/** Líneas (índice base 1) que se resaltan para cada tipo de acción. */
const LINEAS_POR_ACCION: Record<DfsActionType, readonly number[]> = {
  INICIO: [1, 2],
  VISITANDO: [10, 11],
  EXPLORANDO: [12, 13, 14],
  YA_VISITADO: [12, 13, 15, 16],
  RETROCEDIENDO: [17],
  FIN: [8],
};

/** Explicación corta de lo que hace la línea resaltada. */
const EXPLICACION: Record<DfsActionType, string> = {
  INICIO: 'Se crea la lista de visitados vacía y se llama a dfs_visitar con el nodo inicial.',
  VISITANDO: 'Entramos a la función recursiva: el nodo se agrega a visitados.',
  EXPLORANDO: 'El vecino NO está en visitados → llamada recursiva (se profundiza).',
  YA_VISITADO: 'El vecino YA está en visitados → se omite y seguimos con el siguiente.',
  RETROCEDIENDO: 'Ya no hay vecinos por revisar → la función regresa (backtrack).',
  FIN: 'Se terminó el recorrido: se regresa la lista de visitados.',
};

interface Props {
  readonly estado: DfsState | null;
  /** Nodo inicial (para mostrar la llamada raíz `dfs(grafo, inicio)`). */
  readonly inicio: string;
}

export default function CodigoPython({ estado, inicio }: Props) {
  const resaltadas = estado === null ? [] : LINEAS_POR_ACCION[estado.actionType];

  // Variables locales del marco actual de Python.
  const nodo = estado?.actionType === 'FIN' ? null : estado?.currentNode ?? null;
  const vecino =
    estado !== null &&
    (estado.actionType === 'EXPLORANDO' || estado.actionType === 'YA_VISITADO')
      ? estado.currentEdge?.to ?? null
      : null;

  return (
    <div className="py">
      <div className="py__titulo">
        <span className="py__punto" /> dfs.py
      </div>

      <pre className="py__codigo">
        {PYTHON_LINES.map((linea, i) => {
          const num = i + 1;
          const activa = resaltadas.includes(num);
          return (
            <div key={num} className={activa ? 'py__linea py__linea--activa' : 'py__linea'}>
              <span className="py__num">{num}</span>
              <span>{linea === '' ? ' ' : linea}</span>
            </div>
          );
        })}
      </pre>

      <div className="py__info">
        {estado === null ? (
          <p>Presiona “Siguiente Paso” para ver qué línea se ejecuta.</p>
        ) : (
          <>
            <p className="py__explicacion">{EXPLICACION[estado.actionType]}</p>
            <p><b>nodo</b> = {nodo === null ? 'None' : `'${nodo}'`}</p>
            <p><b>vecino</b> = {vecino === null ? '—' : `'${vecino}'`}</p>
            <p>
              <b>visitados</b> = [{estado.visited.map((v) => `'${v}'`).join(', ')}]
            </p>
            <p><b>Pila de llamadas:</b></p>
            <ul className="py__pila">
              {[...estado.stack].reverse().map((n, i) => (
                <li key={n} className={i === 0 ? 'py__pila--top' : ''}>
                  dfs_visitar(grafo, '{n}', visitados)
                </li>
              ))}
              <li className={estado.stack.length === 0 ? 'py__pila--top' : ''}>
                dfs(grafo, '{inicio}')
              </li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
