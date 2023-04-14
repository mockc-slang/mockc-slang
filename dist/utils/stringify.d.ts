import { Type, Value } from '../types';
export interface ArrayLike {
    replPrefix: string;
    replSuffix: string;
    replArrayContents: () => Value[];
}
export declare const stringify: (value: Value, indent?: number | string, splitlineThreshold?: number) => string;
export declare function typeToString(type: Type): string;
/**
 *
 * stringify problem overview
 *
 * We need a fast stringify function so that display calls are fast.
 * However, we also want features like nice formatting so that it's easy to read the output.
 *
 * Here's a sample of the kind of output we want:
 *
 *     > build_list(10, x => build_list(10, x=>x));
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [ [0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]],
 *     [[0, [1, [2, [3, [4, [5, [6, [7, [8, [9, null]]]]]]]]]], null]]]]]]]]]]
 *
 * Notice that relatively short lists that can fit on a single line
 * are simply placed on the same line.
 * Pairs have the first element indented, but the second element on the same level.
 * This allows lists to be displayed vertically.
 *
 *     > x => { return x; };
 *     x => {
 *       return x;
 *     }
 *
 * Functions simply have .toString() called on them.
 * However, notice that this sometimes creates a multiline string.
 * This means that when we have a pair that contains a multiline function,
 * we should put the two elements on different lines, even if the total number of characters is small:
 *
 *     > pair(x => { return x; }, 0);
 *     [ x => {
 *         return x;
 *       },
 *     0]
 *
 * Notice that the multiline string needs two spaces added to the start of every line, not just the first line.
 * Also notice that the opening bracket '[' takes up residence inside the indentation area,
 * so that the element itself is fully on the same indentation level.
 *
 * Furthermore, deeper indentation levels should just work:
 *
 *     > pair(pair(x => { return x; }, 0), 0);
 *     [ [ x => {
 *           return x;
 *         },
 *       0],
 *     0]
 *
 * Importantly, note we have to be able to do this indentation quickly, with a linear time algorithm.
 * Thus, simply doing the indentation every time we need to would be too slow,
 * as it may take O(n) time per indentation, and so O(n^2) time overall.
 *
 * Arrays are not the same as pairs, and they indent every element to the same level:
 *     > [1, 2, x => { return x; }];
 *     [ 1,
 *       2,
 *       x => {
 *         return x;
 *       }]
 *
 * Some data structures are "array-like",
 * so we can re-use the same logic for arrays, objects, and lists.
 *
 *     > display_list(list(1, list(2, 3), x => { return x; }));
 *     list(1,
 *          list(2, 3),
 *          x => {
 *            return x;
 *          })
 *
 *     > { a: 1, b: true, c: () => 1, d: { e: 5, f: 6 }, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0, m: 0, n: 0};
 *     { "a": 1,
 *       "b": true,
 *       "c": () => 1,
 *       "d": {"e": 5, "f": 6},
 *       "g": 0,
 *       "h": 0,
 *       "i": 0,
 *       "j": 0,
 *       "k": 0,
 *       "l": 0,
 *       "m": 0,
 *       "n": 0}
 *
 * Notice the way that just like pairs,
 * short lists/objects are placed on the same line,
 * while longer lists/objects, or ones that are necessarily multiline,
 * are split into multiple lines, with one element per line.
 *
 * It is also possible to create data structures with large amounts of sharing
 * as well as cycles. Here is an example of a cyclic data structure with sharing:
 *
 *     > const x = pair(1, 'y');
 *     > const y = pair(2, 'z');
 *     > const z = pair(3, 'x');
 *     > set_tail(x, y);
 *     > set_tail(y, z);
 *     > set_tail(z, x);
 *     > display_list(list(x, y, z));
 *      list([1, [2, [3, ...<circular>]]],
 *           [2, [3, [1, ...<circular>]]],
 *           [3, [1, [2, ...<circular>]]])
 *
 * It might be difficult to maximise sharing in the face of cycles,
 * because when we cut a cycle, we have to replace a node somewhere with "...<circular>"
 * However, doing this means that a second pointer into this cyclic data structure
 * might have the "...<circular>" placed too early,
 * so we need to re-generate a different representation of the cyclic data structure for every possible root.
 * Otherwise, a naive memoization approach might generate the following output:
 *
 *      list([1, [2, [3, ...<circular>]]],
 *           [2, [3, ...<circular>]],
 *           [3, ...<circular>])
 *
 * which might be confusing if we interpret this to mean that the cycles have different lengths,
 * while in fact they each have length 3.
 *
 * It would be good if we can maximise sharing so that as much of the workload
 * scales with respect to the size of the input as opposed to the output.
 *
 * In summary, here are the list of challenges:
 *
 *  1) Avoid repeated string concatenation.
 *  2) Also avoid repeated multiline string indenting.
 *  3) Intelligently format values as either single line or multiline,
 *     depending on whether it contains any multiline elements,
 *     or whether it's too long and should be broken up.
 *  4) Indentation columns have to expand to fit array-like prefix strings,
 *     when they are longer than the indentation size (see display_list examples).
 *  5) Correctly handle cyclic data structures.
 *  6) Ideally, maximise re-use of shared data structures.
 *
 */
/**
 *
 * stringify notes on other implementations
 *
 * Python's pretty printer (pprint) has a strategy of stringifying each value at most twice.
 * The first time, it will assume that the value fits on a single line and simply calls repr.
 * If the repr is too long, then it'll format the value with pretty print rules
 * in multiple lines and with nice indentation.
 *
 * Theoretically, the repr can be memoized and so repr is called at most once on every value.
 * (In practice, I don't know if they actually do this)
 *
 * This gives us a nice bound of every value being repr'd at most once,
 * and every position in the output is pretty printed at most once.
 * With the string builder pattern, each can individually be done in O(n) time,
 * and so the algorithm as a whole runs in O(n) time.
 *
 */
/**
 *
 * stringify high level algorithm overview
 *
 * The algorithm we'll use is not quite the same as Python's algorithm but should work better or just as well.
 *
 * First we solve the problem of memoizing cyclic data structures by not solving the problem.
 * We keep a flag that indicates whether a particular value is cyclic, and only memoize values that are acyclic.
 * It is possible to use a strongly connected components style algorithm to speed this up,
 * but I haven't implemented it yet to keep the algorithm simple,
 * and it's still fast enough even in the cyclic case.
 *
 * This first step converts the value graph into a printable DAG.
 * To assemble this DAG into a single string, we have a second memo table
 * mapping each node of the printable DAG to its corresponding string representation,
 * but where lines are split and indentation is represented with a wrapper object that reifies
 * the action of incrementing the indentation level.
 * By handling the actual calculation of indentation levels outside this representation,
 * we can re-use string representations that are shared among different parts of the graph,
 * which may be on different indentation levels.
 *
 * With this data structure, we can easily build the partial string representations bottom up,
 * deferring the final calculation and printing of indentation levels to a straightforward final pass.
 *
 * In summary, here are the passes we have to make:
 *
 * - value graph -> string dag (resolves cycles, stringifies terminal nodes, leaves nonterminals abstract, computes lengths)
 * - string dag -> line based representation (pretty prints "main" content to lines, while leaving indentation / prefixes in general abstract)
 * - line based representation -> final string (basically assemble all the indentation strings together with the content strings)
 *
 * Memoization is added at every level so printing of extremely shared data structures
 * approaches the speed of string concatenation/substring in the limit.
 *
 */
interface TerminalStringDag {
    type: 'terminal';
    str: string;
    length: number;
}
interface MultilineStringDag {
    type: 'multiline';
    lines: string[];
    length: number;
}
interface PairStringDag {
    type: 'pair';
    head: StringDag;
    tail: StringDag;
    length: number;
}
interface ArrayLikeStringDag {
    type: 'arraylike';
    prefix: string;
    elems: StringDag[];
    suffix: string;
    length: number;
}
interface KvPairStringDag {
    type: 'kvpair';
    key: string;
    value: StringDag;
    length: number;
}
declare type StringDag = TerminalStringDag | MultilineStringDag | PairStringDag | ArrayLikeStringDag | KvPairStringDag;
export declare function valueToStringDag(value: Value): StringDag;
interface BlockLineTree {
    type: 'block';
    prefixFirst: string;
    prefixRest: string;
    block: LineTree[];
    suffixRest: string;
    suffixLast: string;
}
interface LineLineTree {
    type: 'line';
    line: StringDag;
}
declare type LineTree = BlockLineTree | LineLineTree;
export declare function stringDagToLineTree(dag: StringDag, indent: number, splitlineThreshold: number): LineTree;
export declare function stringDagToSingleLine(dag: StringDag): string;
export declare function lineTreeToString(tree: LineTree): string;
export {};
