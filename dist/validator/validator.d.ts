import * as es from 'estree';
import { Context, NodeWithInferredType } from '../types';
export declare function validateAndAnnotate(program: es.Program, context: Context): NodeWithInferredType<es.Program>;
