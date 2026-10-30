import { describe, it, expect } from 'vitest';
import { dfsGenerador } from '../dfsIterativo';
import type { EstadoDFS } from '../../types/dfsIterativo';

describe('DFS Iterativo Generador', () => {
    it('debe visitar todos los nodos alcanzables en orden LIFO', () => {
        const grafo = { 'A': ['B', 'C'], 'B': [], 'C': [] };
        const gen = dfsGenerador(grafo, 'A');
        let ultimoEstado: EstadoDFS | undefined;
        for (const estado of gen) {
            ultimoEstado = estado;
        }
        expect(ultimoEstado?.visitados.has('A')).toBe(true);
        expect(ultimoEstado?.visitados.has('B')).toBe(true);
        expect(ultimoEstado?.visitados.has('C')).toBe(true);
        expect(ultimoEstado?.terminado).toBe(true);
    });
});
