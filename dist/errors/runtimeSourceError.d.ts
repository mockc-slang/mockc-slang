import * as es from 'estree';
import { ErrorSeverity, ErrorType, SourceError } from '../types';
export declare class RuntimeSourceError implements SourceError {
    type: ErrorType;
    severity: ErrorSeverity;
    location: es.SourceLocation;
    constructor(node?: es.Node);
    explain(): string;
    elaborate(): string;
}
