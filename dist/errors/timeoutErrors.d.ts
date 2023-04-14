import * as es from 'estree';
import { ErrorSeverity, ErrorType } from '../types';
import { RuntimeSourceError } from './runtimeSourceError';
export declare class TimeoutError extends RuntimeSourceError {
}
export declare class PotentialInfiniteLoopError extends TimeoutError {
    private maxExecTime;
    type: ErrorType;
    severity: ErrorSeverity;
    constructor(node: es.Node, maxExecTime: number);
    explain(): string;
    elaborate(): string;
}
export declare class PotentialInfiniteRecursionError extends TimeoutError {
    private calls;
    private maxExecTime;
    type: ErrorType;
    severity: ErrorSeverity;
    constructor(node: es.Node, calls: [string, any[]][], maxExecTime: number);
    explain(): string;
    elaborate(): string;
}
