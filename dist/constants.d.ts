import { Options } from 'acorn';
import * as es from 'estree';
import { Language } from './types';
export declare const CUT = "cut";
export declare const TRY_AGAIN = "retry";
export declare const GLOBAL: typeof globalThis;
export declare const NATIVE_STORAGE_ID = "nativeStorage";
export declare const MODULE_PARAMS_ID = "moduleParams";
export declare const MODULE_CONTEXTS_ID = "moduleContexts";
export declare const MAX_LIST_DISPLAY_LENGTH = 100;
export declare const UNKNOWN_LOCATION: es.SourceLocation;
export declare const JSSLANG_PROPERTIES: {
    maxExecTime: number;
    factorToIncreaseBy: number;
};
export declare const sourceLanguages: Language[];
export declare const ACORN_PARSE_OPTIONS: Options;
