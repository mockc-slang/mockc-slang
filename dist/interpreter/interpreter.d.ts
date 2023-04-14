import { SourceLocation } from 'estree';
import { Context, ErrorSeverity, ErrorType, Node, SourceError } from '../types';
export declare class FatalRuntimeError implements SourceError {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    location: SourceLocation;
    constructor(message: string);
    explain(): string;
    elaborate(): string;
}
export declare function evaluate(node: Node, context: Context): Generator<never, any, unknown>;
