import { useState, useRef, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { NodoDFS, AristaDFS, EstadoDFS } from '../types/dfsIterativo';
import { dfsGenerador } from '../algorithms/dfsIterativo';

// ==========================================
// DATOS ESTÁTICOS DEL GRAFO
// ==========================================
const nodosGrafo: NodoDFS[] = [
    { id: 'A', x: 260, y: 55 },
    { id: 'B', x: 145, y: 160 },
    { id: 'C', x: 375, y: 160 },
    { id: 'D', x: 90, y: 270 },
    { id: 'E', x: 205, y: 270 }
];

const aristasGrafo: AristaDFS[] = [
    { origen: 'A', destino: 'B' },
    { origen: 'A', destino: 'C' },
    { origen: 'B', destino: 'D' },
    { origen: 'B', destino: 'E' }
];

const listaAdyacencia: Record<string, string[]> = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': [],
    'D': [],
    'E': []
};

const CODIGO_DFS: readonly string[] = [
    `def dfs_iterativo(grafo, inicio):`,
    `    visitados = set()`,
    `    pila = [inicio]`,
    `    while pila:`,
    `        u = pila.pop()`,
    `        if u not in visitados:`,
    `            visitados.add(u)`,
    `            visit(u)`,
    `            for v in reversed(grafo[u]):`,
    `                pila.append(v)`
];

// ==========================================
// COMPONENTE REACT DE INTEGRACIÓN
// ==========================================
export default function DfsIterativo() {
    const generadorRef = useRef<Generator<EstadoDFS> | null>(null);
    const [estadoSimulacion, setEstadoSimulacion] = useState<EstadoDFS>({
        nodoActual: null,
        visitados: new Set(),
        pila: [],
        lineaActiva: 0,
        terminado: false
    });
    const [reproduciendo, setReproduciendo] = useState<boolean>(false);
    const [velocidadMs, setVelocidadMs] = useState<number>(650);
    const [pasosEjecutados, setPasosEjecutados] = useState<number>(0);

    const iniciarSimulacion = useCallback(() => {
        setReproduciendo(false);
        generadorRef.current = dfsGenerador(listaAdyacencia, 'A');
        const pasoInicial = generadorRef.current.next();
        if (!pasoInicial.done) {
            setEstadoSimulacion(pasoInicial.value);
            setPasosEjecutados(1);
        }
    }, []);

    const siguientePaso = useCallback(() => {
        if (!generadorRef.current) {
            generadorRef.current = dfsGenerador(listaAdyacencia, 'A');
        }
        const paso = generadorRef.current.next();
        if (!paso.done) {
            setEstadoSimulacion(paso.value);
            setPasosEjecutados(prev => prev + 1);
            if (paso.value.terminado) {
                setReproduciendo(false);
            }
        } else {
            setReproduciendo(false);
        }
    }, []);

    const toggleAutoPlay = () => {
        if (estadoSimulacion.terminado) return;
        if (!generadorRef.current) {
            generadorRef.current = dfsGenerador(listaAdyacencia, 'A');
            const pasoInicial = generadorRef.current.next();
            if (!pasoInicial.done) {
                setEstadoSimulacion(pasoInicial.value);
                setPasosEjecutados(1);
            }
        }
        setReproduciendo(prev => !prev);
    };

    // Control de Reproducción Automática gobernado estrictamente por llamadas a siguientePaso() (.next())
    useEffect(() => {
        if (!reproduciendo || estadoSimulacion.terminado) return undefined;
        const intervalId = window.setInterval(() => {
            siguientePaso();
        }, velocidadMs);
        return () => window.clearInterval(intervalId);
    }, [reproduciendo, estadoSimulacion.terminado, velocidadMs, siguientePaso]);

    const getColorNodo = (id: string) => {
        if (estadoSimulacion.nodoActual === id) return '#f43f5e';
        if (estadoSimulacion.visitados.has(id)) return '#1d4ed8';
        if (estadoSimulacion.pila.includes(id)) return '#f59e0b';
        return '#161b22';
    };

    const getBordeNodo = (id: string) => {
        if (estadoSimulacion.nodoActual === id) return '#fda4af';
        if (estadoSimulacion.visitados.has(id)) return '#60a5fa';
        if (estadoSimulacion.pila.includes(id)) return '#fcd34d';
        return '#30363d';
    };

    const getDescripcionLinea = (linea: number): string => {
        switch (linea) {
            case 3:
                return 'Inicializando la Pila (LIFO) con el nodo raíz "A".';
            case 4:
                return 'Verificando condición del bucle: ¿la pila contiene elementos?';
            case 5:
                return `pila.pop() → Extrayendo el nodo "${estadoSimulacion.nodoActual ?? ''}" desde el TOPE de la pila.`;
            case 7:
                return `Marcando el nodo "${estadoSimulacion.nodoActual ?? ''}" como visitado en el conjunto.`;
            case 8:
                return `Procesando nodo actual "${estadoSimulacion.nodoActual ?? ''}".`;
            case 10:
                return `pila.append(v) → Insertando vecino en el TOPE de la pila.`;
            default:
                return estadoSimulacion.terminado
                    ? 'Recorrido DFS Iterativo finalizado exitosamente (Pila vacía).'
                    : 'Listo para iniciar la simulación paso a paso.';
        }
    };

    const topeActual =
        estadoSimulacion.pila.length > 0
            ? estadoSimulacion.pila[estadoSimulacion.pila.length - 1]
            : null;

    const btnBase: CSSProperties = {
        padding: '9px 16px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '13px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return (
        <div style={{ color: '#e6edf3', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Barra de Control y Estado */}
            <header
                style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #21262d',
                    borderRadius: '12px',
                    padding: '18px 22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#f43f5e',
                                boxShadow: '0 0 10px #f43f5e'
                            }}
                        />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f0f6fc' }}>
                            DFS Iterativo — Control Explícito con Pila (LIFO)
                        </h2>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#8b949e' }}>
                        {getDescripcionLinea(estadoSimulacion.lineaActiva)}
                    </p>
                </div>

                {/* Controles de Ejecución + Auto-Play */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={iniciarSimulacion}
                        style={{
                            ...btnBase,
                            backgroundColor: '#161b22',
                            color: '#c9d1d9',
                            border: '1px solid #30363d'
                        }}
                    >
                        ⟲ Reiniciar
                    </button>

                    <button
                        type="button"
                        onClick={siguientePaso}
                        disabled={estadoSimulacion.terminado || reproduciendo}
                        style={{
                            ...btnBase,
                            backgroundColor:
                                estadoSimulacion.terminado || reproduciendo ? '#161b22' : '#238636',
                            color:
                                estadoSimulacion.terminado || reproduciendo ? '#484f58' : '#ffffff',
                            border: `1px solid ${
                                estadoSimulacion.terminado || reproduciendo ? '#21262d' : '#2ea043'
                            }`,
                            cursor:
                                estadoSimulacion.terminado || reproduciendo
                                    ? 'not-allowed'
                                    : 'pointer'
                        }}
                    >
                        Siguiente Paso ▶
                    </button>

                    <button
                        type="button"
                        onClick={toggleAutoPlay}
                        disabled={estadoSimulacion.terminado}
                        style={{
                            ...btnBase,
                            backgroundColor: estadoSimulacion.terminado
                                ? '#161b22'
                                : reproduciendo
                                  ? '#da3633'
                                  : '#f43f5e',
                            color: estadoSimulacion.terminado ? '#484f58' : '#ffffff',
                            border: `1px solid ${
                                estadoSimulacion.terminado
                                    ? '#21262d'
                                    : reproduciendo
                                      ? '#f85149'
                                      : '#fb7185'
                            }`,
                            boxShadow: reproduciendo
                                ? '0 0 16px rgba(244, 63, 94, 0.5)'
                                : 'none',
                            cursor: estadoSimulacion.terminado ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {reproduciendo ? '⏸ Pausar Auto-Play' : '⏵ Reproducción Automática'}
                    </button>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#161b22',
                            border: '1px solid #30363d',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#8b949e'
                        }}
                    >
                        <span>Velocidad:</span>
                        <input
                            type="range"
                            min={200}
                            max={1400}
                            step={100}
                            value={1600 - velocidadMs}
                            onChange={e => setVelocidadMs(1600 - Number(e.target.value))}
                            style={{ width: '80px', accentColor: '#f43f5e', cursor: 'pointer' }}
                        />
                        <span
                            style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                color: '#e6edf3',
                                minWidth: '46px'
                            }}
                        >
                            {velocidadMs}ms
                        </span>
                    </div>
                </div>
            </header>

            {/* Panel Central: Lienzo SVG + Pseudocódigo con Trazado de Línea */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                    gap: '20px'
                }}
            >
                {/* Lienzo del Grafo SVG */}
                <section
                    style={{
                        backgroundColor: '#0d1117',
                        borderRadius: '12px',
                        border: '1px solid #21262d',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '340px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                        }}
                    >
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: '#8b949e'
                            }}
                        >
                            Topología del Grafo
                        </span>
                        <span
                            style={{
                                fontSize: '12px',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                color: '#8b949e'
                            }}
                        >
                            Pasos: <strong style={{ color: '#f0f6fc' }}>{pasosEjecutados}</strong>
                        </span>
                    </div>

                    <svg
                        viewBox="0 0 500 320"
                        width="100%"
                        height="270"
                        style={{
                            backgroundColor: '#090d16',
                            borderRadius: '8px',
                            border: '1px solid #161b22'
                        }}
                    >
                        <defs>
                            <pattern
                                id="dfs-grid"
                                width="24"
                                height="24"
                                patternUnits="userSpaceOnUse"
                            >
                                <circle cx="2" cy="2" r="1" fill="#21262d" />
                            </pattern>
                            <filter id="dfs-glow" x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <rect width="100%" height="100%" fill="url(#dfs-grid)" />

                        {aristasGrafo.map((arista, index) => {
                            const nO = nodosGrafo.find(n => n.id === arista.origen)!;
                            const nD = nodosGrafo.find(n => n.id === arista.destino)!;
                            const aristaVisitada =
                                estadoSimulacion.visitados.has(arista.origen) &&
                                (estadoSimulacion.visitados.has(arista.destino) ||
                                    estadoSimulacion.pila.includes(arista.destino));
                            const aristaActiva = estadoSimulacion.nodoActual === arista.origen;

                            return (
                                <line
                                    key={index}
                                    x1={nO.x}
                                    y1={nO.y}
                                    x2={nD.x}
                                    y2={nD.y}
                                    stroke={
                                        aristaActiva
                                            ? '#f43f5e'
                                            : aristaVisitada
                                              ? '#3b82f6'
                                              : '#30363d'
                                    }
                                    strokeWidth={aristaActiva ? '4' : '3'}
                                    style={{
                                        transition:
                                            'stroke 0.35s ease, stroke-width 0.35s ease'
                                    }}
                                />
                            );
                        })}

                        {nodosGrafo.map(nodo => {
                            const esActual = estadoSimulacion.nodoActual === nodo.id;
                            const esTope = topeActual === nodo.id;
                            return (
                                <g key={nodo.id}>
                                    {esActual && (
                                        <circle
                                            cx={nodo.x}
                                            cy={nodo.y}
                                            r="29"
                                            fill="none"
                                            stroke="#f43f5e"
                                            strokeWidth="2"
                                            strokeDasharray="4 3"
                                            opacity={0.85}
                                        />
                                    )}
                                    <circle
                                        cx={nodo.x}
                                        cy={nodo.y}
                                        r={esActual ? 23 : 21}
                                        fill={getColorNodo(nodo.id)}
                                        stroke={getBordeNodo(nodo.id)}
                                        strokeWidth={esActual || esTope ? '3' : '2'}
                                        filter={esActual ? 'url(#dfs-glow)' : undefined}
                                        style={{
                                            transition:
                                                'fill 0.3s ease, stroke 0.3s ease, r 0.25s ease'
                                        }}
                                    />
                                    <text
                                        x={nodo.x}
                                        y={nodo.y}
                                        fill="#ffffff"
                                        fontSize="15px"
                                        fontWeight="700"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                    >
                                        {nodo.id}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Leyenda de Estados */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                            flexWrap: 'wrap',
                            marginTop: '12px',
                            fontSize: '12px',
                            color: '#8b949e'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f43f5e',
                                    display: 'inline-block'
                                }}
                            />
                            Nodo Actual (u)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f59e0b',
                                    display: 'inline-block'
                                }}
                            />
                            En Pila (LIFO)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: '#1d4ed8',
                                    display: 'inline-block'
                                }}
                            />
                            Visitado
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: '#161b22',
                                    border: '1px solid #30363d',
                                    display: 'inline-block'
                                }}
                            />
                            No descubiertos
                        </span>
                    </div>
                </section>

                {/* Panel de Pseudocódigo */}
                <section
                    style={{
                        backgroundColor: '#0d1117',
                        padding: '18px 20px',
                        borderRadius: '12px',
                        border: '1px solid #21262d',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                            paddingBottom: '10px',
                            borderBottom: '1px solid #21262d'
                        }}
                    >
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: '#8b949e'
                            }}
                        >
                            Seguimiento de Ejecución (Python)
                        </span>
                        <span
                            style={{
                                fontSize: '11px',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#161b22',
                                color:
                                    estadoSimulacion.lineaActiva > 0 ? '#f43f5e' : '#8b949e',
                                border: '1px solid #30363d'
                            }}
                        >
                            {estadoSimulacion.lineaActiva > 0
                                ? `Línea activa: #${estadoSimulacion.lineaActiva}`
                                : estadoSimulacion.terminado
                                  ? 'Completado'
                                  : 'En espera'}
                        </span>
                    </div>

                    <pre
                        style={{
                            margin: 0,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            fontSize: '13.5px',
                            lineHeight: '1.7',
                            backgroundColor: '#090d16',
                            padding: '14px 12px',
                            borderRadius: '8px',
                            border: '1px solid #161b22',
                            overflowX: 'auto'
                        }}
                    >
                        <code>
                            {CODIGO_DFS.map((texto, index) => {
                                const numLinea = index + 1;
                                const resaltada = estadoSimulacion.lineaActiva === numLinea;
                                return (
                                    <div
                                        key={numLinea}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: resaltada
                                                ? 'rgba(244, 63, 94, 0.16)'
                                                : 'transparent',
                                            borderLeft: resaltada
                                                ? '3px solid #f43f5e'
                                                : '3px solid transparent',
                                            padding: '1px 10px',
                                            borderRadius: '0 6px 6px 0',
                                            color: resaltada ? '#ffffff' : '#8b949e',
                                            fontWeight: resaltada ? 600 : 400,
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '26px',
                                                color: resaltada ? '#f43f5e' : '#484f58',
                                                userSelect: 'none',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {numLinea}
                                        </span>
                                        <span>{texto}</span>
                                    </div>
                                );
                            })}
                        </code>
                    </pre>

                    {/* Resumen de Variables Locales */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px',
                            marginTop: '14px'
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#161b22',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #21262d'
                            }}
                        >
                            <div style={{ fontSize: '11px', color: '#8b949e' }}>Nodo Actual (u)</div>
                            <div
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#f43f5e',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
                                }}
                            >
                                {estadoSimulacion.nodoActual ?? 'None'}
                            </div>
                        </div>
                        <div
                            style={{
                                backgroundColor: '#161b22',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #21262d'
                            }}
                        >
                            <div style={{ fontSize: '11px', color: '#8b949e' }}>Tope de Pila</div>
                            <div
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#f59e0b',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
                                }}
                            >
                                {topeActual ?? 'Vacío'}
                            </div>
                        </div>
                        <div
                            style={{
                                backgroundColor: '#161b22',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #21262d'
                            }}
                        >
                            <div style={{ fontSize: '11px', color: '#8b949e' }}>Visitados (|V|)</div>
                            <div
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#60a5fa',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
                                }}
                            >
                                {estadoSimulacion.visitados.size} / {nodosGrafo.length}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer: Visualización Avanzada de la Estructura de Datos Pila (LIFO) */}
            <footer
                style={{
                    backgroundColor: '#0d1117',
                    padding: '22px',
                    borderRadius: '12px',
                    border: '1px solid #21262d',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '18px'
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#f0f6fc' }}>
                            Estructura de Datos: Pila Explícita (LIFO — Last-In, First-Out)
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#8b949e' }}>
                            Tanto <code style={{ color: '#f59e0b' }}>pila.append(v)</code> como{' '}
                            <code style={{ color: '#f43f5e' }}>pila.pop()</code> operan exclusivamente
                            sobre el <strong>TOPE (Top)</strong> superior de la estructura.
                        </p>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '12px'
                        }}
                    >
                        <span
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}
                        >
                            Tamaño: {estadoSimulacion.pila.length}
                        </span>
                        <span
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                                color: '#fb7185',
                                border: '1px solid rgba(244, 63, 94, 0.3)'
                            }}
                        >
                            Tope (Top): {topeActual ?? '—'}
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px',
                        alignItems: 'stretch'
                    }}
                >
                    {/* Contenedor físico de la Pila Vertical */}
                    <div
                        style={{
                            backgroundColor: '#090d16',
                            borderRadius: '10px',
                            border: '1px solid #21262d',
                            padding: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div
                            style={{
                                fontSize: '11px',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                color: '#f59e0b',
                                marginBottom: '10px',
                                letterSpacing: '0.05em'
                            }}
                        >
                            ▼ ENTRADA (push) / ▲ SALIDA (pop) — ZONA DEL TOPE
                        </div>

                        {/* Cubeta de Pila abierta arriba y cerrada abajo */}
                        <div
                            style={{
                                width: '100%',
                                maxWidth: '340px',
                                minHeight: '190px',
                                borderLeft: '3px solid #30363d',
                                borderRight: '3px solid #30363d',
                                borderBottom: '4px solid #484f58',
                                borderRadius: '0 0 10px 10px',
                                padding: '14px 16px',
                                display: 'flex',
                                flexDirection: 'column-reverse',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(22, 27, 34, 0.45)'
                            }}
                        >
                            {estadoSimulacion.pila.map((nodo, index) => {
                                const esTope = index === estadoSimulacion.pila.length - 1;
                                const esBase = index === 0;
                                return (
                                    <div
                                        key={`${nodo}-${index}`}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            backgroundColor: esTope
                                                ? 'rgba(245, 158, 11, 0.2)'
                                                : '#161b22',
                                            border: esTope
                                                ? '2px solid #f59e0b'
                                                : '1px solid #30363d',
                                            boxShadow: esTope
                                                ? '0 0 16px rgba(245, 158, 11, 0.35)'
                                                : 'none',
                                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontFamily:
                                                    'ui-monospace, SFMono-Regular, Menlo, monospace',
                                                color: esTope ? '#fcd34d' : '#8b949e'
                                            }}
                                        >
                                            índice [{index}]
                                        </span>

                                        <span
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 800,
                                                color: esTope ? '#fef3c7' : '#e6edf3',
                                                fontFamily:
                                                    'ui-monospace, SFMono-Regular, Menlo, monospace'
                                            }}
                                        >
                                            Nodo {nodo}
                                        </span>

                                        {esTope ? (
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    padding: '3px 8px',
                                                    borderRadius: '999px',
                                                    backgroundColor: '#f59e0b',
                                                    color: '#090d16',
                                                    fontFamily:
                                                        'ui-monospace, SFMono-Regular, Menlo, monospace'
                                                }}
                                            >
                                                ◀ TOPE (TOP)
                                            </span>
                                        ) : esBase ? (
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#8b949e',
                                                    fontFamily:
                                                        'ui-monospace, SFMono-Regular, Menlo, monospace'
                                                }}
                                            >
                                                Fondo (Base)
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: '#484f58' }}>
                                                En espera
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {estadoSimulacion.pila.length === 0 && (
                                <div
                                    style={{
                                        margin: 'auto',
                                        textAlign: 'center',
                                        color: '#484f58',
                                        fontFamily:
                                            'ui-monospace, SFMono-Regular, Menlo, monospace',
                                        fontSize: '13px'
                                    }}
                                >
                                    [ Pila LIFO vacía ]
                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                color: '#8b949e'
                            }}
                        >
                            ═══ BASE DE LA PILA (Índice [0]) ═══
                        </div>
                    </div>

                    {/* Panel lateral: Conjunto de Visitados y Explicación LIFO */}
                    <div
                        style={{
                            backgroundColor: '#090d16',
                            borderRadius: '10px',
                            border: '1px solid #21262d',
                            padding: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '14px'
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#8b949e',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '10px'
                                }}
                            >
                                Conjunto de Nodos Visitados (Set)
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {Array.from(estadoSimulacion.visitados).map((nodo, idx) => (
                                    <div
                                        key={nodo}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(29, 78, 216, 0.2)',
                                            border: '1px solid #3b82f6',
                                            color: '#93c5fd',
                                            fontFamily:
                                                'ui-monospace, SFMono-Regular, Menlo, monospace',
                                            fontWeight: 700,
                                            fontSize: '13px'
                                        }}
                                    >
                                        <span style={{ fontSize: '10px', color: '#60a5fa' }}>
                                            #{idx + 1}
                                        </span>
                                        {nodo}
                                    </div>
                                ))}
                                {estadoSimulacion.visitados.size === 0 && (
                                    <span
                                        style={{
                                            fontSize: '13px',
                                            color: '#484f58',
                                            fontFamily:
                                                'ui-monospace, SFMono-Regular, Menlo, monospace'
                                        }}
                                    >
                                        set() vacío
                                    </span>
                                )}
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#161b22',
                                border: '1px solid #21262d',
                                borderRadius: '8px',
                                padding: '12px 14px',
                                fontSize: '12.5px',
                                color: '#8b949e',
                                lineHeight: 1.5
                            }}
                        >
                            <div
                                style={{
                                    color: '#e6edf3',
                                    fontWeight: 600,
                                    marginBottom: '4px'
                                }}
                            >
                                ¿Por qué invertimos los vecinos al apilar?
                            </div>
                            Al iterar <code style={{ color: '#f59e0b' }}>reversed(grafo[u])</code>, el
                            primer vecino queda en el <strong>TOPE (Top)</strong> de la pila para ser
                            explorado inmediatamente en la siguiente iteración, preservando el mismo
                            orden que el DFS recursivo.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
