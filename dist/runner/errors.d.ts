import { RawSourceMap } from 'source-map';
import { SourceError } from '../types';
/**
 * Converts native errors to SourceError
 *
 * @param error
 * @param sourceMap
 * @returns
 */
export declare function toSourceError(error: Error, sourceMap?: RawSourceMap): Promise<SourceError>;
