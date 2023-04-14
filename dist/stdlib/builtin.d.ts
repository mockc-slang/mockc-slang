import { InterpreterContext } from '../interpreter/interpreterContext';
export declare const builtinObject: {
    printf: {
        arity: number;
        func: (interpreterContext: InterpreterContext) => any;
    };
    printMemory: {
        arity: number;
        func: (interpreterContext: InterpreterContext) => any;
    };
    printCurrentEnvironment: {
        arity: number;
        func: (interpreterContext: InterpreterContext) => any;
    };
    malloc: {
        arity: number;
        func: (interpreterContext: InterpreterContext) => number;
        type: {
            tag: "Variable";
            type: string;
        };
    };
};
