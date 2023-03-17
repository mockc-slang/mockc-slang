import { SourceLocation } from 'estree'
import { SourceMapConsumer } from 'source-map'

import createContext from './createContext'
import { InterruptedError } from './errors/errors'
import { findDeclarationNode, findIdentifierNode } from './finder'
import { parse } from './parser/parser'
import {
  Context,
  Error as ResultError,
  ExecutionMethod,
  Finished,
  ModuleContext,
  Result,
  SourceError,
  Variant
} from './types'
export { SourceDocumentation } from './editors/ace/docTooltip'

import { CannotFindModuleError } from './errors/localImportErrors'
import { validateFilePath } from './localImports/filePaths'
import { resolvedErrorPromise, sourceFilesRunner } from './runner'

export interface IOptions {
  scheduler: 'preemptive' | 'async'
  steps: number
  stepLimit: number
  executionMethod: ExecutionMethod
  variant: Variant
  originalMaxExecTime: number
  useSubst: boolean
  isPrelude: boolean
  throwInfiniteLoops: boolean
}

// needed to work on browsers
if (typeof window !== 'undefined') {
  // @ts-ignore
  SourceMapConsumer.initialize({
    'lib/mappings.wasm': 'https://unpkg.com/source-map@0.7.3/lib/mappings.wasm'
  })
}

export function parseError(errors: SourceError[]): string {
  const errorMessagesArr = errors.map(error => {
    const line = error.location ? error.location.start.line : '<unknown>'
    const explanation = error.explain()
    return line < 1 ? explanation : `Line ${line}: ${explanation}`
  })
  return errorMessagesArr.join('\n')
}

export function findDeclaration(
  code: string,
  context: Context,
  loc: { line: number; column: number }
): SourceLocation | null | undefined {
  const program = parse(code, context)
  if (!program) {
    return null
  }
  const identifierNode = findIdentifierNode(program, context, loc)
  if (!identifierNode) {
    return null
  }
  const declarationNode = findDeclarationNode(program, identifierNode)
  if (!declarationNode || identifierNode === declarationNode) {
    return null
  }
  return declarationNode.loc
}

export function hasDeclaration(
  code: string,
  context: Context,
  loc: { line: number; column: number }
): boolean {
  const program = parse(code, context)
  if (!program) {
    return false
  }
  const identifierNode = findIdentifierNode(program, context, loc)
  if (!identifierNode) {
    return false
  }
  const declarationNode = findDeclarationNode(program, identifierNode)
  if (declarationNode == null || declarationNode.loc == null) {
    return false
  }

  return true
}

export async function runInContext(
  code: string,
  context: Context,
  options: Partial<IOptions> = {}
): Promise<Result> {
  const defaultFilePath = '/default.js'
  const files: Partial<Record<string, string>> = {}
  files[defaultFilePath] = code
  return runFilesInContext(files, defaultFilePath, context, options)
}

export async function runFilesInContext(
  files: Partial<Record<string, string>>,
  entrypointFilePath: string,
  context: Context,
  options: Partial<IOptions> = {}
): Promise<Result> {
  for (const filePath in files) {
    const filePathError = validateFilePath(filePath)
    if (filePathError !== null) {
      context.errors.push(filePathError)
      return resolvedErrorPromise
    }
  }

  const code = files[entrypointFilePath]
  if (code === undefined) {
    context.errors.push(new CannotFindModuleError(entrypointFilePath))
    return resolvedErrorPromise
  }
  return sourceFilesRunner(files, entrypointFilePath, context, options)
}

export function resume(result: Result): Finished | ResultError | Promise<Result> {
  if (result.status === 'finished' || result.status === 'error') {
    return result
  } else {
    return result.scheduler.run(result.it, result.context)
  }
}

export function interrupt(context: Context) {
  const globalEnvironment = context.runtime.environments[context.runtime.environments.length - 1]
  context.runtime.environments = [globalEnvironment]
  context.runtime.isRunning = false
  context.errors.push(new InterruptedError(context.runtime.nodes[0]))
}

export { createContext, Context, ModuleContext, Result }
