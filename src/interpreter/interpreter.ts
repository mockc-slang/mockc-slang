/* tslint:disable:max-classes-per-file */

import { create } from 'domain'

import { RuntimeSourceError } from '../errors/runtimeSourceError'
import {
  AddressInstruction,
  ApplicationInstruction,
  AssignmentExpressionNode,
  AssignmentInstruction,
  BinaryOpExpressionNode,
  BinaryOpInstruction,
  BranchInstruction,
  ClosureExpression,
  Command,
  CompilationUnitNode,
  CompoundStatementNode,
  ConditionalExpressionNode,
  Context,
  DeclarationExpression,
  DeclarationNode,
  DerefStashValueInstruction,
  EnvironmentRestoreInstruction,
  ExpressionListNode,
  ExpressionStatementNode,
  ExternalDeclarationNode,
  FunctionApplicationNode,
  FunctionDefinitionNode,
  IdentifierNode,
  LambdaExpression,
  LoadAddressInstruction,
  MarkInstruction,
  Node,
  NumberNode,
  ParameterDeclarationNode,
  ParameterListNode,
  PopInstruction,
  ResetInstruction,
  ReturnStatementNode,
  SelectionStatementNode,
  StringLiteralNode,
  TranslationUnitNode,
  UnaryExpressionNode,
  Value,
  WhileInstruction,
  WhileStatementNode
} from '../types'
import {
  InterpreterContext,
  peekAgenda,
  peekStash,
  popAgenda,
  popStash,
  setUpInterpreterContext
} from './interpreterContext'

const applyBuiltin = (builtinId: number, interpreterContext: InterpreterContext) => {
  const { builtinEnv, stash } = interpreterContext
  const { builtinArray, builtinObject } = builtinEnv
  const funcName = builtinArray[builtinId]
  const func = builtinObject[funcName].func
  const result = func(interpreterContext)
  popStash(interpreterContext, false)
  stash.push(result)
}

const isTrue = (val: any) => {
  return val !== 0
}

const scanDeclarations = (cmds: Command[]): string[] => {
  const locals: string[] = []
  cmds.forEach((cmd: Command) => {
    if (cmd.tag == 'ExternalDeclaration') {
      const { declaration, functionDefinition } = cmd as ExternalDeclarationNode
      if (declaration) {
        locals.push(declaration.declarator.directDeclarator.identifier)
      }
      if (functionDefinition) {
        locals.push(functionDefinition.declarator.directDeclarator.identifier)
      }
    }
    if (cmd.tag == 'Declaration') {
      const { declarator } = cmd as DeclarationNode
      locals.push(declarator.directDeclarator.identifier)
    }
  })
  return locals
}

const scanParameters = (paramList: ParameterListNode): string[] => {
  const params: string[] = []
  paramList.parameters.forEach((prm: ParameterDeclarationNode) => {
    params.push(prm.declarator.directDeclarator.identifier)
  })
  return params
}

const extendVariableLookupEnv = (locals: string[], lookupEnv: string[][]) => {
  // returns a shallow copy
  const newEnv = [...lookupEnv]
  newEnv.push(locals)
  return newEnv
}

const lookupVariable = (identifier: string, lookupEnv: string[][]) => {
  let frameIndex = lookupEnv.length
  let valueIndex = -1
  while (valueIndex == -1) {
    if (frameIndex == 0) {
      throw new Error(`undefined reference to ${identifier}`)
    }
    const frame = lookupEnv[--frameIndex]
    for (let i = 0; i < frame.length; i++) {
      if (frame[i] === identifier) {
        valueIndex = i
        break
      }
    }
  }
  return [frameIndex, valueIndex]
}

const applyBinaryOp = (
  sym: string,
  leftOperand: Value,
  rightOperand: Value,
  interpreterContext: InterpreterContext
): Value => binaryOpMicrocode[sym](leftOperand, rightOperand, interpreterContext)
const popInstruction: PopInstruction = { tag: 'Pop' }
const markInstruction: MarkInstruction = { tag: 'MarkInstruction' }
const resetInstruction: ResetInstruction = { tag: 'ResetInstruction' }
const assignmentInstruction: AssignmentInstruction = { tag: 'AssignmentInstruction' }
const derefStashValueInstruction: DerefStashValueInstruction = { tag: 'DerefStashValueInstruction' }
const addressInstruction: AddressInstruction = { tag: 'AddressInstruction' }

const createEnvironmentRestoreInstruction = (
  env: number,
  lookupEnv: string[][]
): EnvironmentRestoreInstruction => {
  const word = new ArrayBuffer(8)
  const view = new DataView(word)
  view.setFloat64(0, env)
  return {
    tag: 'EnvironmentRestoreInstruction',
    env: view,
    variableLookupEnv: lookupEnv
  }
}

const binaryOpMicrocode = {
  '+': (x: number, y: number, interpreterContext: InterpreterContext) => {
    const { memory } = interpreterContext
    if (memory.isAddress(x) || memory.isRawAddress(x)) {
      return memory.makeRawAddress(memory.getIndexFromAddress(x) + y)
    }
    if (memory.isAddress(y) || memory.isRawAddress(y)) {
      return memory.makeRawAddress(memory.getIndexFromAddress(y) + x)
    }
    return x + y
  },
  '-': (x: number, y: number, interpreterContext: InterpreterContext) => {
    const { memory } = interpreterContext
    if (memory.isAddress(x) || memory.isRawAddress(x)) {
      return memory.makeRawAddress(memory.getIndexFromAddress(x) - y)
    }
    return x - y
  },
  '*': (x: number, y: number) => x * y,
  '/': (x: number, y: number) => Math.floor(x / y),
  '%': (x: number, y: number) => x % y,
  '==': (x: number, y: number) => (x == y ? 1 : 0),
  '!=': (x: number, y: number) => (x != y ? 1 : 0),
  '<': (x: number, y: number) => (x < y ? 1 : 0),
  '>': (x: number, y: number) => (x > y ? 1 : 0),
  '<=': (x: number, y: number) => (x <= y ? 1 : 0),
  '>=': (x: number, y: number) => (x >= y ? 1 : 0)
}

const microcode = {
  CompilationUnit: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext

    const { translationUnit } = cmd as CompilationUnitNode
    if (translationUnit) agenda.push(translationUnit)
  },

  TranslationUnit: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda, variableLookupEnv, memory, env } = interpreterContext
    const { externalDeclarations } = cmd as TranslationUnitNode

    const locals = scanDeclarations(externalDeclarations)
    interpreterContext.variableLookupEnv = extendVariableLookupEnv(locals, variableLookupEnv)
    const frameAddress = memory.allocateFrame(locals.length)
    interpreterContext.env = memory.environmentExtend(frameAddress, env)

    const externalDeclarationCmds: Command[] = []
    externalDeclarations.forEach(node => {
      externalDeclarationCmds.push(node)
    })

    externalDeclarationCmds.push({ tag: 'FunctionApplication', identifier: 'main', params: [] })
    externalDeclarationCmds.reverse()
    agenda.push(...externalDeclarationCmds)
  },

  FunctionDefinition: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext

    const { declarator, body } = cmd as FunctionDefinitionNode
    const { directDeclarator } = declarator // TODO: handle pointer
    const { identifier, parameterList } = directDeclarator
    agenda.push(popInstruction, {
      tag: 'DeclarationExpression',
      identifier,
      expr: {
        tag: 'LambdaExpression',
        prms: parameterList,
        body
      }
    })
  },

  LambdaExpression: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { stash, memory, closurePool } = interpreterContext
    const { prms, body } = cmd as LambdaExpression

    // push closure to closure pool, create a closure Tag
    // with payload as index to closure pool
    // similar to how String is implemented in realistic VM
    closurePool.push({ tag: 'Closure', prms, body })
    const closureNaN = memory.makeClosure(closurePool.length - 1)
    stash.push(closureNaN)
  },

  ExternalDeclaration: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { functionDefinition, declaration } = cmd as ExternalDeclarationNode

    if (functionDefinition) agenda.push(functionDefinition)
    if (declaration) agenda.push(declaration)
  },

  Declaration: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext

    const {
      declarator: {
        directDeclarator: { identifier }
      },
      initializer
    } = cmd as DeclarationNode
    if (!initializer) {
      // TODO: handle identifier only situation
      return
    }
    if (initializer.expr) {
      agenda.push(popInstruction, {
        tag: 'DeclarationExpression',
        identifier,
        expr: initializer.expr
      })
    }
  },

  CompoundStatement: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda, variableLookupEnv, memory, env } = interpreterContext
    const { statements } = cmd as CompoundStatementNode

    const locals = scanDeclarations(statements)
    interpreterContext.variableLookupEnv = extendVariableLookupEnv(locals, variableLookupEnv)
    const frameAddress = memory.allocateFrame(locals.length)
    interpreterContext.env = memory.environmentExtend(frameAddress, env)

    agenda.push(createEnvironmentRestoreInstruction(env, variableLookupEnv))

    const orderedStatements: Command[] = []
    statements.forEach(node => {
      orderedStatements.push(node)
    })
    orderedStatements.reverse()
    agenda.push(...orderedStatements)
  },

  EnvironmentRestoreInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { env, variableLookupEnv } = cmd as EnvironmentRestoreInstruction
    const { memory } = interpreterContext
    const oldEnv = env.getFloat64(0)
    interpreterContext.env = oldEnv
    interpreterContext.variableLookupEnv = variableLookupEnv
    memory.deallocateEnvironment(oldEnv)
  },

  ReturnStatement: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { exprs } = cmd as ReturnStatementNode
    agenda.push(resetInstruction)
    if (exprs.exprs.length > 0) {
      agenda.push(derefStashValueInstruction)
    }
    agenda.push(exprs)
  },

  ResetInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const nextInstr = agenda.pop()
    if (nextInstr && nextInstr.tag != 'MarkInstruction') {
      agenda.push(cmd)
    }
  },

  ExpressionStatement: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { exprs } = cmd as ExpressionStatementNode
    agenda.push(popInstruction, exprs)
  },

  FunctionApplication: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { identifier: functionName, params } = cmd as FunctionApplicationNode
    agenda.push({ tag: 'ApplicationInstruction', arity: params.length })

    const orderedParams = params.slice().reverse()
    agenda.push(...orderedParams)

    agenda.push({ tag: 'Identifier', val: functionName })
  },

  ApplicationInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { env, agenda, variableLookupEnv, memory } = interpreterContext
    const { arity } = cmd as ApplicationInstruction

    const func = peekStash(interpreterContext, true, arity)
    if (memory.isBuiltin(func)) {
      return applyBuiltin(memory.getIdFromBuiltin(func), interpreterContext)
    }

    const args: any[] = []
    for (let i = arity - 1; i >= 0; i--) {
      args[i] = popStash(interpreterContext)
    }

    const closure = popStash(interpreterContext) as ClosureExpression
    const params = scanParameters(closure.prms)
    interpreterContext.variableLookupEnv = extendVariableLookupEnv(params, variableLookupEnv)
    const frameAddress = memory.allocateFrame(params.length)
    interpreterContext.env = memory.environmentExtend(frameAddress, env)
    for (let i = 0; i < arity; i++) {
      memory.setFrameValue(frameAddress, i, args[i])
    }

    if (
      agenda.length == 0 ||
      (peekAgenda(agenda) as Command).tag == 'EnvironmentRestoreInstruction'
    ) {
      agenda.push(markInstruction)
    } else {
      agenda.push(createEnvironmentRestoreInstruction(env, variableLookupEnv))
      agenda.push(markInstruction)
    }
    agenda.push(func.body)
  },

  DeclarationExpression: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext

    const { identifier, expr } = cmd as DeclarationExpression
    agenda.push(
      assignmentInstruction,
      {
        tag: 'LoadAddressInstruction',
        identifier
      },
      expr
    )
  },

  LoadAddressInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { env, variableLookupEnv, memory, stash } = interpreterContext
    const { identifier } = cmd as LoadAddressInstruction
    const pos = lookupVariable(identifier, variableLookupEnv)
    const address = memory.getEnvironmentAddress(env, pos)
    stash.push(address)
  },

  AssignmentInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { memory } = interpreterContext
    const leftAddress = popStash(interpreterContext, false)
    let rightVal = peekStash(interpreterContext)
    if (memory.isRawAddress(rightVal)) {
      rightVal = memory.makeAddress(memory.getIndexFromAddress(rightVal))
    }
    memory.setValueAtAddress(leftAddress, rightVal)
  },

  DerefStashValueInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { stash } = interpreterContext
    stash.push(popStash(interpreterContext))
  },

  AddressInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { stash, memory } = interpreterContext
    const address = popStash(interpreterContext, false)
    const index = memory.getIndexFromAddress(address)
    const rawAddress = memory.makeRawAddress(index)
    stash.push(rawAddress)
  },

  AssignmentExpression: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { leftExpr, rightExpr } = cmd as AssignmentExpressionNode
    agenda.push(assignmentInstruction, leftExpr, rightExpr)
  },

  Identifier: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { val: identifier } = cmd as IdentifierNode
    agenda.push({
      tag: 'LoadAddressInstruction',
      identifier
    })
  },

  ConditionalExpression: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { pred, cons, alt } = cmd as ConditionalExpressionNode
    agenda.push(
      {
        tag: 'BranchInstruction',
        cons,
        alt
      },
      pred
    )
  },

  SelectionStatement: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { pred, cons, alt } = cmd as SelectionStatementNode
    agenda.push(
      {
        tag: 'BranchInstruction',
        cons,
        alt
      },
      pred
    )
  },

  BranchInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda, stash, memory } = interpreterContext

    const { cons, alt } = cmd as BranchInstruction
    if (isTrue(popStash(interpreterContext))) {
      agenda.push(cons)
    } else if (alt) {
      agenda.push(alt)
    }
  },

  MarkInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {},

  BinaryOpExpression: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext

    const { sym, leftExpr, rightExpr } = cmd as BinaryOpExpressionNode
    agenda.push({ tag: 'BinaryOpInstruction', sym }, rightExpr, leftExpr)
  },

  BinaryOpInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { stash } = interpreterContext

    const { sym } = cmd as BinaryOpInstruction
    const rightOperand = popStash(interpreterContext)
    const leftOperand = popStash(interpreterContext)
    stash.push(applyBinaryOp(sym, leftOperand, rightOperand, interpreterContext))
  },

  ExpressionList: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext

    const expressionListCmds: Command[] = []
    const { exprs } = cmd as ExpressionListNode
    exprs.forEach(node => {
      expressionListCmds.push(node)
      expressionListCmds.push(popInstruction)
    })
    expressionListCmds.pop()
    expressionListCmds.reverse()
    agenda.push(...expressionListCmds)
  },

  UnaryExpression: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { sym, expr } = cmd as UnaryExpressionNode
    if (sym == '*') {
      agenda.push(derefStashValueInstruction, expr)
    } else if (sym == '&') {
      agenda.push(addressInstruction, expr)
    }
  },

  WhileStatement: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { pred, body } = cmd as WhileStatementNode
    agenda.push(
      {
        tag: 'WhileInstruction',
        pred,
        body
      },
      pred
    )
  },

  WhileInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda, stash, memory } = interpreterContext
    const { pred, body } = cmd as WhileInstruction
    if (isTrue(popStash(interpreterContext))) {
      agenda.push(cmd, pred, body)
    }
  },

  BreakStatement: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const a = popAgenda(agenda)
    if (a.tag == 'WhileInstruction') return

    agenda.push(cmd)
    if (a.tag == 'EnvironmentRestoreInstruction') {
      agenda.push(a)
    }
  },

  ContinueStatement: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const a = popAgenda(agenda)
    if (a.tag == 'WhileInstruction') {
      const { pred, body } = a
      agenda.push(
        {
          tag: 'WhileInstruction',
          pred,
          body
        },
        pred
      )
      return
    }

    agenda.push(cmd)
    if (a.tag == 'EnvironmentRestoreInstruction') {
      agenda.push(a)
    }
  },

  Number: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { stash } = interpreterContext

    const { val } = cmd as NumberNode
    stash.push(val)
  },

  StringLiteral: (cmd: Command, interpreterContext: InterpreterContext) => {
    // implemented only for more verbose printf
    const { stash } = interpreterContext
    const { val } = cmd as StringLiteralNode
    stash.push(val)
  },

  Pop: (cmd: Command, interpreterContext: InterpreterContext) => {
    popStash(interpreterContext)
  }
}

function debugPrint(str: string, ctx: Context): void {
  ctx.externalBuiltIns.rawDisplay('', str, ctx)
}

function runInterpreter(context: Context, interpreterContext: InterpreterContext) {
  context.runtime.break = false

  const step_limit = 1000000

  const { stash, agenda, memory } = interpreterContext

  let i = 0
  while (i < step_limit) {
    const cmd = agenda.pop()
    if (!cmd) break
    if (!microcode.hasOwnProperty(cmd.tag))
      throw new Error('internal error: unknown command ' + cmd.tag)
    microcode[cmd.tag](cmd, interpreterContext)
    i++
  }

  if (i === step_limit) throw new Error('step limit ' + step_limit + ' exceeded')
  if (stash.length > 1 || stash.length < 1)
    throw new Error('internal error: stash must be singleton')
  return popStash(interpreterContext)
}

export function* evaluate(node: Node, context: Context) {
  // const result = yield* evaluators[node.type](node, context)
  // yield* leave(context)
  // return result
  try {
    context.runtime.isRunning = true

    const interpreterContext = setUpInterpreterContext(context, node)

    return runInterpreter(context, interpreterContext)
  } catch (error) {
    return error
  } finally {
    context.runtime.isRunning = false
  }
}
