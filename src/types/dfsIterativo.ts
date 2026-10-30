export interface NodoDFS {
    id: string;
    x: number;
    y: number;
}

export interface AristaDFS {
    origen: string;
    destino: string;
}

export interface EstadoDFS {
    nodoActual: string | null;
    visitados: Set<string>;
    pila: string[];
    lineaActiva: number;
    terminado: boolean;
}
