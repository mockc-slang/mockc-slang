import * as es from 'estree';
import { ErrorSeverity, ErrorType, SourceError, Value } from '../types';
import { RuntimeSourceError } from './runtimeSourceError';
export declare class InterruptedError extends RuntimeSourceError {
    constructor(node: es.Node);
    explain(): string;
    elaborate(): string;
}
export declare class ExceptionError implements SourceError {
    error: Error;
    location: es.SourceLocation;
    type: ErrorType;
    severity: ErrorSeverity;
    constructor(error: Error, location: es.SourceLocation);
    explain(): string;
    elaborate(): string;
}
export declare class MaximumStackLimitExceeded extends RuntimeSourceError {
    private calls;
    static MAX_CALLS_TO_SHOW: number;
    private customGenerator;
    constructor(node: es.Node, calls: es.CallExpression[]);
    explain(): string;
    elaborate(): string;
}
export declare class CallingNonFunctionValue extends RuntimeSourceError {
    private callee;
    private node;
    constructor(callee: Value, node: es.Node);
    explain(): string;
    elaborate(): string;
}
export declare class UndefinedVariable extends RuntimeSourceError {
    name: string;
    constructor(name: string, node: es.Node);
    explain(): string;
    elaborate(): string;
}
export declare class UnassignedVariable extends RuntimeSourceError {
    name: string;
    constructor(name: string, node: es.Node);
    explain(): string;
    elaborate(): string;
}
export declare class InvalidNumberOfArguments extends RuntimeSourceError {
    private expected;
    private got;
    private hasVarArgs;
    private calleeStr;
    constructor(node: es.Node, expected: number, got: number, hasVarArgs?: boolean);
    explain(): string;
    elaborate(): string;
}
export declare class VariableRedeclaration extends RuntimeSourceError {
    private node;
    private name;
    private writable?;
    constructor(node: es.Node, name: string, writable?: boolean | undefined);
    explain(): string;
    elaborate(): string;
}
export declare class ConstAssignment extends RuntimeSourceError {
    private name;
    constructor(node: es.Node, name: string);
    explain(): string;
    elaborate(): string;
}
export declare class GetPropertyError extends RuntimeSourceError {
    private obj;
    private prop;
    constructor(node: es.Node, obj: Value, prop: string);
    explain(): string;
    elaborate(): string;
}
export declare class GetInheritedPropertyError extends RuntimeSourceError {
    private obj;
    private prop;
    type: ErrorType;
    severity: ErrorSeverity;
    location: es.SourceLocation;
    constructor(node: es.Node, obj: Value, prop: string);
    explain(): string;
    elaborate(): string;
}
export declare class SetPropertyError extends RuntimeSourceError {
    private obj;
    private prop;
    constructor(node: es.Node, obj: Value, prop: string);
    explain(): string;
    elaborate(): string;
}
