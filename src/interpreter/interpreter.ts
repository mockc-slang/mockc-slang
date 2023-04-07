/* tslint:disable:max-classes-per-file */

import { create } from 'domain'

import { RuntimeSourceError } from '../errors/runtimeSourceError'
import {
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
  TranslationUnitNode,
  Value,
  WhileInstruction,
  WhileStatementNode
} from '../types'
import { Memory } from './memory'

type InterpreterContext = {
  agenda: Command[]
  stash: Value[]
  memory: Memory
  env: number
  variableLookupEnv: string[][]
  closurePool: ClosureExpression[]
}

const isTrue = (val: any) => {
  return val !== 0
}

const assign = (identifier: string, val: Value, interpreterContext: InterpreterContext) => {
  const { variableLookupEnv, env, memory } = interpreterContext
  const pos = lookupVariable(identifier, variableLookupEnv)
  memory.setEnvironmentValue(env, pos, val)
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

const applyBinaryOp = (sym: string, leftOperand: Value, rightOperand: Value): Value =>
  binaryOpMicrocode[sym](leftOperand, rightOperand)
const popInstruction: PopInstruction = { tag: 'Pop' }
const markInstruction: MarkInstruction = { tag: 'MarkInstruction' }
const resetInstruction: ResetInstruction = { tag: 'ResetInstruction' }
const assignmentInstruction: AssignmentInstruction = { tag: 'AssignmentInstruction' }

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
  '+': (x: number, y: number) => x + y,
  '-': (x: number, y: number) => x - y,
  '==': (x: number, y: number) => (x == y ? 1 : 0),
  '!=': (x: number, y: number) => (x != y ? 1 : 0)
}

const popStash = (stash: Value[]) => {
  const val = stash.pop()
  if (val == undefined) {
    throw Error('internal error: expected value from stash')
  }
  return val
}

const popAgenda = (agenda: Command[]) => {
  const val = agenda.pop()
  if (val == undefined) {
    throw Error('internal error: expected value from agenda')
  }
  return val
}

const peekStash = (stash: Value[]) => {
  if (stash.length == 0) {
    throw Error('internal error: expected value from stash')
  }
  return stash[stash.length - 1]
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
    const { exprs } = (cmd as ReturnStatementNode).exprs
    agenda.push(resetInstruction)
    const orderedExprs = exprs.slice().reverse()
    agenda.push(...orderedExprs)
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
    const orderedExprs = exprs.slice().reverse()
    agenda.push(popInstruction, ...orderedExprs)
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
    const { stash, env, agenda, variableLookupEnv, memory, closurePool } = interpreterContext
    const { arity } = cmd as ApplicationInstruction

    const args: any[] = []
    for (let i = arity - 1; i >= 0; i--) {
      args[i] = popStash(stash)
    }

    const closureIndexAddress = popStash(stash)
    const closureNan = memory.getIndexFromAddress(closureIndexAddress)
    const closurePoolIndex = memory.getClosurePoolIndex(closureNan)
    const func = closurePool[closurePoolIndex]
    const params = scanParameters(func.prms)
    interpreterContext.variableLookupEnv = extendVariableLookupEnv(params, variableLookupEnv)
    const frameAddress = memory.allocateFrame(params.length)
    interpreterContext.env = memory.environmentExtend(frameAddress, env)
    for (let i = 0; i < arity; i++) {
      memory.setFrameValue(frameAddress, i, args[i])
    }

    // TODO: implement builtin here
    // if (func.tag == 'builtin') { }
    if (
      agenda.length == 0 ||
      (peekStash(agenda) as Command).tag == 'EnvironmentRestoreInstruction'
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
    const { stash, memory } = interpreterContext
    const leftAddress = popStash(stash)
    const rightAddress = peekStash(stash)
    memory.copyValue(leftAddress, rightAddress)
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
    const { agenda, stash } = interpreterContext

    const { cons, alt } = cmd as BranchInstruction
    if (isTrue(popStash(stash))) {
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
    const rightOperand = popStash(stash)
    const leftOperand = popStash(stash)
    stash.push(applyBinaryOp(sym, leftOperand, rightOperand))
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
    const { agenda, stash } = interpreterContext
    const { pred, body } = cmd as WhileInstruction
    if (isTrue(popStash(stash))) {
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

  Pop: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { stash } = interpreterContext
    popStash(stash)
  }
}

function debugPrint(str: string, ctx: Context): void {
  if (ctx.externalBuiltIns?.rawDisplay) {
    ctx.externalBuiltIns.rawDisplay('', str, ctx)
  } else {
    console.log(str)
  }
}

function runInterpreter(context: Context, interpreterContext: InterpreterContext) {
  context.runtime.break = false

  const step_limit = 1000000

  const { stash, agenda, memory } = interpreterContext

  interpreterContext.env = memory.createGlobalEnvironment()

  let i = 0
  while (i < step_limit) {
    const cmd = agenda.pop()
    if (!cmd) break
    if (!microcode.hasOwnProperty(cmd.tag))
      throw new Error('internal error: unknown command ' + cmd.tag)
    microcode[cmd.tag](cmd, interpreterContext)
    console.log(cmd)
    console.log(stash)
    i++
  }

  if (i === step_limit) throw new Error('step limit ' + step_limit + ' exceeded')
  if (stash.length > 1 || stash.length < 1)
    throw new Error('internal error: stash must be singleton')
  return memory.addressDeref(stash[0])
}

export function* evaluate(node: Node, context: Context) {
  // const result = yield* evaluators[node.type](node, context)
  // yield* leave(context)
  // return result
  try {
    context.runtime.isRunning = true

    const interpreterContext: InterpreterContext = {
      agenda: [node],
      stash: [],
      memory: new Memory(10),
      env: 0,
      variableLookupEnv: [], // TODO: add primitives / builtins here
      closurePool: []
    }

    // debugPrint('test if this shows', context)

    interpreterContext.env = interpreterContext.memory.createGlobalEnvironment()

    return runInterpreter(context, interpreterContext)
  } catch (error) {
    return error
  } finally {
    context.runtime.isRunning = false
  }
}
