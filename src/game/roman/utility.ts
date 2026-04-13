export type FixedArray<T, N extends number, A extends T[] = []> =
    (A['length'] extends N ? A : FixedArray<T, N, [...A, T]>) & T[];

export function fixedArray<T, N extends number>(count: N, factory: () => T): FixedArray<T, N> {
    return Array.from({ length: count }, factory) as FixedArray<T, N>;
}
