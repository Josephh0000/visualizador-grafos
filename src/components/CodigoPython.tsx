import type { AlgorithmDefinition, VisualFrame } from '../types/visual';

interface Props {
  readonly algo: AlgorithmDefinition;
  readonly frame: VisualFrame | null;
}

/**
 * Panel derecho de la tarjeta: título, badges de complejidad, código Python
 * con la línea actual resaltada y las variables del paso.
 *
 * El código Python es explicativo: la ejecución real la hace el generador
 * en TypeScript; el adaptador de cada algoritmo decide qué líneas resaltar.
 */
export default function CodigoPython({ algo, frame }: Props) {
  const lines = frame?.lines ?? [];

  return (
    <div className="code">
      <header className="code__header">
        <h2 className="code__title">{algo.name}</h2>
        <span className="code__subtitle">{algo.subtitle}</span>
      </header>

      <div className="code__badges">
        <span className="badge">
          Time <b className="badge__time">{algo.time}</b>
        </span>
        <span className="badge">
          Space <b className="badge__space">{algo.space}</b>
        </span>
        <span className="code__file">{algo.fileName}</span>
      </div>

      <pre className="code__src">
        {algo.python.map((linea, i) => {
          const num = i + 1;
          const activa = lines.includes(num);
          return (
            <div key={num} className={activa ? 'code__line code__line--on' : 'code__line'}>
              <span className="code__num">{num}</span>
              <span>{linea === '' ? ' ' : linea}</span>
            </div>
          );
        })}
      </pre>

      <div className="code__info">
        {frame === null ? (
          <p className="code__hint">Presiona “Siguiente Paso” o “Reproducir”.</p>
        ) : (
          <>
            {frame.explanation !== '' && <p className="code__explain">{frame.explanation}</p>}
            {frame.vars.map((v) => (
              <p key={v.name} className="code__var">
                <b>{v.name}</b> = {v.value}
              </p>
            ))}
            {frame.list !== null && (
              <>
                <p className="code__var">
                  <b>{frame.list.title}</b>
                </p>
                <ul className="code__list">
                  {frame.list.items.map((it, i) => (
                    <li key={`${it}-${i}`} className={i === frame.list?.highlight ? 'on' : ''}>
                      {it}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
