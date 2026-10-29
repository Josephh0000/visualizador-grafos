import type { ResultRow } from '../types/visual';

interface Props {
  readonly rows: readonly ResultRow[];
}

/** Fila(s) de cajitas con el resultado acumulado (como en el diseño de referencia). */
export default function ResultadoCajas({ rows }: Props) {
  return (
    <div className="boxes">
      {rows.map((row) => {
        const vacias = Math.max(0, row.slots - row.items.length);
        return (
          <div key={row.title} className="boxes__row">
            <span className="boxes__title">{row.title}</span>
            <div className="boxes__cells">
              {row.items.map((b, i) => (
                <span
                  key={`${b.label}-${i}`}
                  className="boxes__cell"
                  style={{ background: b.color, color: b.textColor ?? '#0b1220' }}
                >
                  {b.label}
                </span>
              ))}
              {Array.from({ length: vacias }, (_, i) => (
                <span key={`v${i}`} className="boxes__cell boxes__cell--empty" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
