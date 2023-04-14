import { IOptions } from '..';
import { Context, Variant } from '../types';
/**
 * Small function to determine the variant to be used
 * by a program, as both context and options can have
 * a variant. The variant provided in options will
 * have precedence over the variant provided in context.
 *
 * @param context The context of the program.
 * @param options Options to be used when
 *                running the program.
 *
 * @returns The variant that the program is to be run in
 */
export declare function determineVariant(context: Context, options: Partial<IOptions>): Variant;
export declare const resolvedErrorPromise: Promise<import("../types").Error | import("../types").Finished | import("../types").Suspended | import("../types").SuspendedNonDet>;
