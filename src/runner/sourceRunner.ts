import * as es from 'estree'

import { IOptions, Result } from '..'
import { CannotFindModuleError } from '../errors/localImportErrors'
import { evaluate } from '../interpreter/interpreter'
import { hoistAndMergeImports } from '../localImports/transformers/hoistAndMergeImports'
import { removeExports } from '../localImports/transformers/removeExports'
import { removeNonSourceModuleImports } from '../localImports/transformers/removeNonSourceModuleImports'
import { parse } from '../parser/parser'
import { PreemptiveScheduler } from '../schedulers'
import { Context, Scheduler, Variant } from '../types'
import { validateAndAnnotate } from '../validator/validator'
import { determineVariant, resolvedErrorPromise } from './utils'

const DEFAULT_SOURCE_OPTIONS: IOptions = {
  scheduler: 'async',
  steps: 1000,
  stepLimit: 1000,
  executionMethod: 'auto',
  variant: Variant.DEFAULT,
  originalMaxExecTime: 1000,
  useSubst: false,
  isPrelude: false,
  throwInfiniteLoops: true
}

function runInterpreter(program: es.Program, context: Context, options: IOptions): Promise<Result> {
  const it = evaluate(program, context)
  const scheduler: Scheduler = new PreemptiveScheduler(options.steps)
  return scheduler.run(it, context)
}

export async function sourceRunner(
  code: string,
  context: Context,
  options: Partial<IOptions> = {}
): Promise<Result> {
  const theOptions: IOptions = { ...DEFAULT_SOURCE_OPTIONS, ...options }
  context.variant = determineVariant(context, options)
  context.errors = []

  // Parse and validate
  const program: es.Program | undefined = parse(code, context)
  if (!program) {
    return resolvedErrorPromise
  }

  // TODO: Remove this after runners have been refactored.
  //       These should be done as part of the local imports
  //       preprocessing step.
  removeExports(program)
  removeNonSourceModuleImports(program)
  hoistAndMergeImports(program)

  validateAndAnnotate(program, context)
  context.unTypecheckedCode.push(code)

  if (context.errors.length > 0) {
    return resolvedErrorPromise
  }

  // Handle preludes
  if (context.prelude !== null) {
    const prelude = context.prelude
    context.prelude = null
    await sourceRunner(prelude, context, { ...options, isPrelude: true })
    return sourceRunner(code, context, options)
  }

  return runInterpreter(program, context, theOptions)
}

export async function sourceFilesRunner(
  files: Partial<Record<string, string>>,
  entrypointFilePath: string,
  context: Context,
  options: Partial<IOptions> = {}
): Promise<Result> {
  const entrypointCode = files[entrypointFilePath]
  if (entrypointCode === undefined) {
    context.errors.push(new CannotFindModuleError(entrypointFilePath))
    return resolvedErrorPromise
  }

  context.variant = determineVariant(context, options)
  // TODO: Make use of the preprocessed program AST after refactoring runners.
  // const preprocessedProgram = preprocessFileImports(files, entrypointFilePath, context)
  // if (!preprocessedProgram) {
  //   return resolvedErrorPromise
  // }

  return sourceRunner(entrypointCode, context, options)
}
