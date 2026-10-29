import { useState } from 'react';
import { ALGORITHMS } from '../visual/algorithms';
import AlgorithmPlayer from './AlgorithmPlayer';
import './VisualizadorGrafos.css';

/**
 * Visualizador de algoritmos de grafos — Integrante 2.
 * Pestañas: DFS recursivo · Coloreo bipartito (BFS) · Bellman-Ford.
 *
 * Cada algoritmo es una función generadora (`function*`) que emite su estado
 * paso a paso; la UI solo dibuja lo que el generador emite.
 */
export default function VisualizadorGrafos() {
  const [activoId, setActivoId] = useState<string>(ALGORITHMS[0].id);
  const activo = ALGORITHMS.find((a) => a.id === activoId) ?? ALGORITHMS[0];

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Visualizador de Algoritmos de Grafos</h1>
        <p className="app__sub">Simulación paso a paso con funciones generadoras · Integrante 2</p>
      </header>

      <nav className="tabs" role="tablist">
        {ALGORITHMS.map((a, i) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={a.id === activo.id}
            className={a.id === activo.id ? 'tab tab--on' : 'tab'}
            style={{ ['--accent' as string]: a.accent }}
            onClick={() => setActivoId(a.id)}
          >
            <span className="tab__num">{i + 1}</span> {a.tab}
          </button>
        ))}
      </nav>

      {/* key → al cambiar de pestaña se crea un reproductor (y generador) nuevo */}
      <AlgorithmPlayer key={activo.id} algo={activo} />
    </div>
  );
}
