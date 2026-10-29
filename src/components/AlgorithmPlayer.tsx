import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AlgorithmDefinition, GraphOption, VisualFrame } from '../types/visual';
import CodigoPython from './CodigoPython';
import GraphCanvas from './GraphCanvas';
import ResultadoCajas from './ResultadoCajas';

type FrameGen = Generator<VisualFrame, void, undefined>;

interface Props {
  readonly algo: AlgorithmDefinition;
}

/** Convierte Infinity a "∞" en el JSON (JSON.stringify lo volvería null). */
const jsonReplacer = (_k: string, v: unknown): unknown =>
  v === Infinity ? '∞' : v === -Infinity ? '-∞' : v;

/**
 * Reproductor genérico de un algoritmo:
 *  1. El generador vive en `useRef` (persiste entre renders, no provoca re-render).
 *  2. El último `yield` vive en `useState`.
 *  3. "Siguiente Paso" ejecuta `generador.current.next()`.
 *  4. "Reproducir" hace lo mismo con un temporizador (simulación real, no CSS).
 */
export default function AlgorithmPlayer({ algo }: Props) {
  const [option, setOption] = useState<GraphOption>(algo.graphs[0]);

  // (1) Generador en un ref, creado de forma perezosa.
  const generador = useRef<FrameGen | null>(null);
  if (generador.current === null) generador.current = algo.run(option);

  // (2) Estado de React con el último frame emitido.
  const [frame, setFrame] = useState<VisualFrame | null>(null);
  const [historial, setHistorial] = useState<string[]>([]);
  const [terminado, setTerminado] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [velocidadMs, setVelocidadMs] = useState(800);

  // Filas de resultado vacías (para mostrar las casillas antes del primer paso).
  const filasVacias = useMemo(() => {
    const primero = algo.run(option).next();
    return primero.done === true ? [] : primero.value.results.map((r) => ({ ...r, items: [] }));
  }, [algo, option]);

  // (3) Un paso de la simulación.
  const siguientePaso = useCallback((): void => {
    const gen = generador.current;
    if (gen === null || terminado) return;
    const r = gen.next();
    if (r.done === true) {
      setTerminado(true);
      return;
    }
    const f = r.value;
    setFrame(f);
    setHistorial((prev) => [...prev, `#${f.step} ${f.action}`]);
    if (f.finished) setTerminado(true);
  }, [terminado]);

  const reiniciar = useCallback(
    (opt: GraphOption = option): void => {
      generador.current = algo.run(opt);
      setFrame(null);
      setHistorial([]);
      setTerminado(false);
      setReproduciendo(false);
    },
    [algo, option],
  );

  const cambiarGrafo = (id: string): void => {
    const opt = algo.graphs.find((g) => g.id === id) ?? algo.graphs[0];
    setOption(opt);
    reiniciar(opt);
  };

  // (4) Reproducción automática.
  useEffect(() => {
    if (!reproduciendo || terminado) return undefined;
    const id = window.setInterval(siguientePaso, velocidadMs);
    return () => window.clearInterval(id);
  }, [reproduciendo, terminado, velocidadMs, siguientePaso]);

  useEffect(() => {
    if (terminado) setReproduciendo(false);
  }, [terminado]);

  return (
    <div className="player" style={{ ['--accent' as string]: algo.accent }}>
      {/* ---------- Controles ---------- */}
      <div className="toolbar">
        <button type="button" className="btn btn--accent" onClick={siguientePaso} disabled={terminado}>
          Siguiente Paso ▶
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setReproduciendo((r) => !r)}
          disabled={terminado}
        >
          {reproduciendo ? 'Pausar ⏸' : 'Reproducir ⏵'}
        </button>
        <button type="button" className="btn" onClick={() => reiniciar()}>
          Reiniciar ⟲
        </button>
        <label className="toolbar__speed">
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
        {algo.graphs.length > 1 && (
          <select
            className="toolbar__select"
            value={option.id}
            onChange={(e) => cambiarGrafo(e.target.value)}
          >
            {algo.graphs.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ---------- Tarjeta principal (estilo de referencia) ---------- */}
      <section className="card">
        <div className="card__left">
          <GraphCanvas graph={option.graph} layout={option.layout} frame={frame} />
          <ResultadoCajas rows={frame?.results ?? filasVacias} />
          <div className="legend">
            {algo.legend.map((l) => (
              <span key={l.label}>
                <i style={{ background: l.color }} /> {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="card__right">
          <CodigoPython algo={algo} frame={frame} />
        </div>
      </section>

      {/* ---------- Paso actual ---------- */}
      <section className={`step ${frame?.status ? `step--${frame.status.tone}` : ''}`}>
        <span className="step__num">Paso {frame?.step ?? '—'}</span>
        <span className="step__action">{frame?.action ?? 'Listo para comenzar'}</span>
        {frame?.status && <span className="step__status">{frame.status.text}</span>}
      </section>

      <div className="bottom">
        <section className="panel">
          <h3>Historial</h3>
          <ol className="history">
            {historial.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ol>
        </section>
        <section className="panel">
          <details>
            <summary>JSON del último yield</summary>
            <pre className="json">{JSON.stringify(frame?.raw ?? null, jsonReplacer, 2)}</pre>
          </details>
        </section>
      </div>
    </div>
  );
}
