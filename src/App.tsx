import { useState } from 'react';
import VisualizadorGrafos from './components/VisualizadorGrafos';
import DfsIterativo from './components/DfsIterativo';

export default function App() {
    const [vistaActiva, setVistaActiva] = useState<'integrante2' | 'dfsIterativo'>('integrante2');

    return (
        <div style={{ backgroundColor: '#07090f', minHeight: '100vh', color: '#e2e8f0' }}>
            {/* Barra superior de selección de módulo sin alterar los componentes de Integrante 2 */}
            <div
                style={{
                    borderBottom: '1px solid #1f2937',
                    backgroundColor: '#0d121c',
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}
            >
                <span
                    style={{
                        fontSize: '12px',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        color: '#94a3b8',
                        marginRight: '4px'
                    }}
                >
                    Módulo de Algoritmos:
                </span>

                <button
                    type="button"
                    onClick={() => setVistaActiva('integrante2')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '14px',
                        backgroundColor: vistaActiva === 'integrante2' ? '#0ea5e9' : 'transparent',
                        color: vistaActiva === 'integrante2' ? '#04111d' : '#94a3b8',
                        border:
                            vistaActiva === 'integrante2'
                                ? '1px solid #0ea5e9'
                                : '1px solid #1f2937',
                        boxShadow:
                            vistaActiva === 'integrante2'
                                ? '0 0 16px rgba(14, 165, 233, 0.4)'
                                : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    DFS Recursivo · Bipartito · Bellman-Ford
                </button>

                <button
                    type="button"
                    onClick={() => setVistaActiva('dfsIterativo')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '14px',
                        backgroundColor:
                            vistaActiva === 'dfsIterativo' ? '#f43f5e' : 'transparent',
                        color: vistaActiva === 'dfsIterativo' ? '#090d16' : '#94a3b8',
                        border:
                            vistaActiva === 'dfsIterativo'
                                ? '1px solid #f43f5e'
                                : '1px solid #1f2937',
                        boxShadow:
                            vistaActiva === 'dfsIterativo'
                                ? '0 0 16px rgba(244, 63, 94, 0.4)'
                                : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Algoritmo 7: DFS Iterativo (Pila LIFO)
                </button>
            </div>

            {vistaActiva === 'integrante2' ? (
                <VisualizadorGrafos />
            ) : (
                <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '24px 16px 48px' }}>
                    <DfsIterativo />
                </div>
            )}
        </div>
    );
}
