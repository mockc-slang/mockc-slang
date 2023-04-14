import { Context, Value } from '../types';
/**
 * A function that displays to console.log by default (for a REPL).
 *
 * @param value the value to be represented and displayed.
 * @param externalContext a property of Context that can hold
 *   any information required for external use (optional).
 */
export declare function rawDisplay(value: Value, str: string, _externalContext: any): any;
export declare function error_message(value: Value, ...strs: string[]): void;
export declare function timed(context: Context, f: Function, externalContext: any, displayBuiltin: (value: Value, str: string, externalContext: any) => Value): (...args: any[]) => any;
export declare function is_number(v: Value): boolean;
export declare function is_undefined(xs: Value): boolean;
export declare function is_string(xs: Value): boolean;
export declare function is_boolean(xs: Value): boolean;
export declare function is_object(xs: Value): boolean;
export declare function is_function(xs: Value): boolean;
export declare function is_NaN(x: Value): boolean;
export declare function has_own_property(obj: Value, p: Value): any;
export declare function is_array(a: Value): boolean;
export declare function array_length(xs: Value[]): number;
/**
 * Source version of parseInt. Both arguments are required.
 *
 * @param str String representation of the integer to be parsed. Required.
 * @param radix Base to parse the given `str`. Required.
 *
 * An error is thrown if `str` is not of type string, or `radix` is not an
 * integer within the range 2, 36 inclusive.
 */
export declare function parse_int(str: string, radix: number): number;
export declare function char_at(str: string, index: number): string;
/**
 * arity returns the number of parameters a given function `f` expects.
 *
 * @param f Function whose arity is to be found. Required.
 *
 * An error is thrown if `f` is not a function.
 */
export declare function arity(f: Function): number;
export declare function get_time(): number;
