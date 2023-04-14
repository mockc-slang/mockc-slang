declare global {
    interface ArrayBufferConstructor {
        transfer(source: ArrayBuffer, length: number): ArrayBuffer;
    }
}
/**
 * A little-endian byte buffer class.
 */
export default class Buffer {
    private _capacity;
    cursor: number;
    private _written;
    private _buffer;
    private _view;
    constructor();
    private maybeExpand;
    private updateWritten;
    get(signed: boolean, s: 8 | 16 | 32): number;
    getI(s: 8 | 16 | 32): number;
    getU(s: 8 | 16 | 32): number;
    getF(s: 32 | 64): number;
    put(n: number, signed: boolean, s: 8 | 16 | 32): void;
    putI(s: 8 | 16 | 32, n: number): void;
    putU(s: 8 | 16 | 32, n: number): void;
    putF(s: 32 | 64, n: number): void;
    putA(a: Uint8Array): void;
    align(n: number): void;
    asArray(): Uint8Array;
    get written(): number;
}
