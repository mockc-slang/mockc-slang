import * as es from 'estree';
import { ErrorSeverity, ErrorType, Node, SourceError } from '../types';
export declare class FatalTypeError implements SourceError {
    location: es.SourceLocation;
    message: string;
    type: ErrorType;
    severity: ErrorSeverity;
    constructor(location: es.SourceLocation, message: string);
    explain(): string;
    elaborate(): string;
}
export declare const VOID_POINTER_TYPE: VariableTypeAssignment;
declare type VariableTypeAssignment = {
    tag: 'Variable';
    type: string;
};
export declare const checkTyping: (program: Node) => void;
export {};
