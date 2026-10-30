import type { EstadoDFS } from '../types/dfsIterativo';

export function* dfsGenerador(grafo: Record<string, string[]>, inicio: string): Generator<EstadoDFS> {
    const visitados = new Set<string>();
    const pila: string[] = [inicio];
    
    yield { nodoActual: null, visitados: new Set(visitados), pila: [...pila], lineaActiva: 3, terminado: false };

    while (pila.length > 0) {
        yield { nodoActual: null, visitados: new Set(visitados), pila: [...pila], lineaActiva: 4, terminado: false };

        const u = pila.pop()!;
        yield { nodoActual: u, visitados: new Set(visitados), pila: [...pila], lineaActiva: 5, terminado: false };

        if (!visitados.has(u)) {
            visitados.add(u);
            yield { nodoActual: u, visitados: new Set(visitados), pila: [...pila], lineaActiva: 7, terminado: false };
            yield { nodoActual: u, visitados: new Set(visitados), pila: [...pila], lineaActiva: 8, terminado: false };

            const vecinos = [...(grafo[u] ?? [])].reverse();
            for (const v of vecinos) {
                pila.push(v);
                yield { nodoActual: u, visitados: new Set(visitados), pila: [...pila], lineaActiva: 10, terminado: false };
            }
        }
    }
    
    yield { nodoActual: null, visitados: new Set(visitados), pila: [], lineaActiva: 0, terminado: true };
}
