import { List, Pair } from './list';
declare type Stream = null | Pair<any, () => Stream>;
export declare function stream_tail(xs: any): any;
export declare function stream(...elements: any[]): Stream;
export declare function list_to_stream(xs: List): Stream;
export {};
