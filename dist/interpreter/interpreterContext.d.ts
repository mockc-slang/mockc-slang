import { ClosureExpression, Command, Context, Value } from '../types';
import { Memory } from './memory';
export declare type InterpreterContext = {
    agenda: Command[];
    stash: Value[];
    memory: Memory;
    env: number;
    variableLookupEnv: string[][];
    closurePool: ClosureExpression[];
    context: Context;
    builtinEnv: BuiltinEnv;
};
declare type BuiltinEnv = {
    builtinObject: object;
    builtinArray: string[];
};
export declare const setUpInterpreterContext: (context: Context, node: any) => InterpreterContext;
export declare const popStash: (interpreterContext: InterpreterContext, deref?: boolean) => any;
export declare const peekStash: (interpreterContext: InterpreterContext, deref?: boolean, index?: number) => any;
export declare const popAgenda: (agenda: Command[]) => Command;
export declare const peekAgenda: (agenda: Command[]) => Command;
export declare const derefStashVal: (val: any, interpreterContext: InterpreterContext) => any;
export {};
