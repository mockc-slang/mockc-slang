import { SourceLocation } from 'estree';
import createContext from './createContext';
import { Context, Error as ResultError, ExecutionMethod, Finished, ModuleContext, Result, SourceError, Variant } from './types';
export { SourceDocumentation } from './editors/ace/docTooltip';
export interface IOptions {
    scheduler: 'preemptive' | 'async';
    steps: number;
    stepLimit: number;
    executionMethod: ExecutionMethod;
    variant: Variant;
    originalMaxExecTime: number;
    useSubst: boolean;
    isPrelude: boolean;
    throwInfiniteLoops: boolean;
}
export declare function parseError(errors: SourceError[]): string;
export declare function findDeclaration(code: string, context: Context, loc: {
    line: number;
    column: number;
}): SourceLocation | null | undefined;
export declare function hasDeclaration(code: string, context: Context, loc: {
    line: number;
    column: number;
}): boolean;
export declare function runInContext(code: string, context: Context, options?: Partial<IOptions>): Promise<Result>;
export declare function runFilesInContext(files: Partial<Record<string, string>>, entrypointFilePath: string, context: Context, options?: Partial<IOptions>): Promise<Result>;
export declare function resume(result: Result): Finished | ResultError | Promise<Result>;
export declare function interrupt(context: Context): void;
export { createContext, Context, ModuleContext, Result };
