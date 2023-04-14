import { Node } from 'estree';
export declare type FullWalkerCallback<TState> = (node: Node, state: TState, type: string) => void;
declare type FullAncestorWalkerCallback<TState> = (node: Node, state: TState | Node[], ancestors: Node[], type: string) => void;
export declare type WalkerCallback<TState> = (node: Node, state: TState, type?: string) => void;
declare type SimpleWalkerFn<TState> = (node: Node, state: TState) => void;
export declare type AncestorWalkerFn<TState> = (node: Node, state: TState | Node[], ancestors: Node[]) => void;
declare type RecursiveWalkerFn<TState> = (node: Node, state: TState, callback: WalkerCallback<TState>) => void;
interface SimpleVisitors<TState> {
    [type: string]: SimpleWalkerFn<TState>;
}
interface AncestorVisitors<TState> {
    [type: string]: AncestorWalkerFn<TState>;
}
interface RecursiveVisitors<TState> {
    [type: string]: RecursiveWalkerFn<TState>;
}
declare type FindPredicate = (type: string, node: Node) => boolean;
interface Found<TState> {
    node: Node;
    state: TState;
}
export declare const simple: <TState>(node: Node, visitors: SimpleVisitors<TState>, base?: RecursiveVisitors<TState>, state?: TState) => void;
export declare const ancestor: <TState>(node: Node, visitors: AncestorVisitors<TState>, base?: RecursiveVisitors<TState>, state?: TState) => void;
export declare const recursive: <TState>(node: Node, state: TState, functions: RecursiveVisitors<TState>, base?: RecursiveVisitors<TState>) => void;
export declare const full: <TState>(node: Node, callback: FullWalkerCallback<TState>, base?: RecursiveVisitors<TState>, state?: TState) => void;
export declare const fullAncestor: <TState>(node: Node, callback: FullAncestorWalkerCallback<TState>, base?: RecursiveVisitors<TState>, state?: TState) => void;
export declare const make: <TState>(functions: RecursiveVisitors<TState>, base?: RecursiveVisitors<TState>) => RecursiveVisitors<TState>;
export declare const findNodeAt: <TState>(node: Node, start: number | undefined, end: number | undefined, type?: FindPredicate, base?: RecursiveVisitors<TState>, state?: TState) => Found<TState> | undefined;
export declare const findNodeAround: typeof findNodeAt;
export declare const findNodeAfter: typeof findNodeAt;
export declare const base: AncestorVisitors<never>;
export {};
