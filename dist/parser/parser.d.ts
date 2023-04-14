import * as es from 'estree';
import { Context, ErrorSeverity, ErrorType, Node, SourceError } from '../types';
export declare class FatalSyntaxError implements SourceError {
    location: es.SourceLocation;
    message: string;
    type: ErrorType;
    severity: ErrorSeverity;
    constructor(location: es.SourceLocation, message: string);
    explain(): string;
    elaborate(): string;
}
export declare function parse(source: string, context: Context): Node | undefined;
