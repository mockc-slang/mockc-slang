import * as es from 'estree';
import { RuntimeSourceError } from './runtimeSourceError';
export declare class ModuleConnectionError extends RuntimeSourceError {
    private static message;
    private static elaboration;
    constructor(node?: es.Node);
    explain(): string;
    elaborate(): string;
}
export declare class ModuleNotFoundError extends RuntimeSourceError {
    moduleName: string;
    constructor(moduleName: string, node?: es.Node);
    explain(): string;
    elaborate(): string;
}
export declare class ModuleInternalError extends RuntimeSourceError {
    moduleName: string;
    constructor(moduleName: string, node?: es.Node);
    explain(): string;
    elaborate(): string;
}
