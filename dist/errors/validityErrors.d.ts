import * as es from 'estree';
import { ErrorSeverity, ErrorType, SourceError } from '../types';
export declare class NoAssignmentToForVariable implements SourceError {
    node: es.AssignmentExpression;
    type: ErrorType;
    severity: ErrorSeverity;
    constructor(node: es.AssignmentExpression);
    get location(): es.SourceLocation;
    explain(): string;
    elaborate(): string;
}
