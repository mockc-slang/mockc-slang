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

// class Thunk {
//   public value: Value
//   public isMemoized: boolean
//   constructor(public exp: es.Node, public env: Environment) {
//     this.isMemoized = false
//     this.value = null
//   }
// }

// function* forceIt(val: any, context: Context): Value {
//   if (val instanceof Thunk) {
//     if (val.isMemoized) return val.value

//     pushEnvironment(context, val.env)
//     const evalRes = yield* actualValue(val.exp, context)
//     popEnvironment(context)
//     val.value = evalRes
//     val.isMemoized = true
//     return evalRes
//   } else return val
// }

// export function* actualValue(exp: es.Node, context: Context): Value {
//   const evalResult = yield* evaluate(exp, context)
//   const forced = yield* forceIt(evalResult, context)
//   return forced
// }

// const handleRuntimeError = (context: Context, error: RuntimeSourceError): never => {
//   context.errors.push(error)
//   context.runtime.environments = context.runtime.environments.slice(
//     -context.numberOfOuterEnvironments
//   )
//   throw error
// }

// function* visit(context: Context, node: es.Node) {
//   context.runtime.nodes.unshift(node)
//   yield context
// }

// function* leave(context: Context) {
//   context.runtime.break = false
//   context.runtime.nodes.shift()
//   yield context
// }

// const popEnvironment = (context: Context) => context.runtime.environments.shift()
// export const pushEnvironment = (context: Context, environment: Environment) => {
//   context.runtime.environments.unshift(environment)
//   context.runtime.environmentTree.insert(environment)
// }

// export type Evaluator<T extends es.Node> = (node: T, context: Context) => IterableIterator<Value>

// function* evaluateBlockSatement(context: Context, node: es.BlockStatement) {
//   let result
//   for (const statement of node.body) {
//     result = yield* evaluate(statement, context)
//   }
//   return result
// }

// /**
//  * WARNING: Do not use object literal shorthands, e.g.
//  *   {
//  *     *Literal(node: es.Literal, ...) {...},
//  *     *ThisExpression(node: es.ThisExpression, ..._ {...},
//  *     ...
//  *   }
//  * They do not minify well, raising uncaught syntax errors in production.
//  * See: https://github.com/webpack/webpack/issues/7566
//  */
// // tslint:disable:object-literal-shorthand
// // prettier-ignore
// export const evaluators: { [nodeType: string]: Evaluator<es.Node> } = {
//   /** Simple Values */
//   Literal: function* (node: es.Literal, _context: Context) {
//     return node.value
//   },

//   TemplateLiteral: function* (node: es.TemplateLiteral) {
//     // Expressions like `${1}` are not allowed, so no processing needed
//     return node.quasis[0].value.cooked
//   },

//   ThisExpression: function* (node: es.ThisExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   ArrayExpression: function* (node: es.ArrayExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   FunctionExpression: function* (node: es.FunctionExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   ArrowFunctionExpression: function* (node: es.ArrowFunctionExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   Identifier: function* (node: es.Identifier, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   CallExpression: function* (node: es.CallExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   NewExpression: function* (node: es.NewExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   UnaryExpression: function* (node: es.UnaryExpression, context: Context) {
//     const value = yield* actualValue(node.argument, context)

//     const error = rttc.checkUnaryExpression(node, node.operator, value)
//     if (error) {
//       return handleRuntimeError(context, error)
//     }
//     return evaluateUnaryExpression(node.operator, value)
//   },

//   BinaryExpression: function* (node: es.BinaryExpression, context: Context) {
//     const left = yield* actualValue(node.left, context)
//     const right = yield* actualValue(node.right, context)
//     const error = rttc.checkBinaryExpression(node, node.operator, left, right)
//     if (error) {
//       return handleRuntimeError(context, error)
//     }
//     return evaluateBinaryExpression(node.operator, left, right)
//   },

//   ConditionalExpression: function* (node: es.ConditionalExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   LogicalExpression: function* (node: es.LogicalExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   VariableDeclaration: function* (node: es.VariableDeclaration, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   ContinueStatement: function* (_node: es.ContinueStatement, _context: Context) {
//     throw new Error(`not supported yet: ${_node.type}`)
//   },

//   BreakStatement: function* (_node: es.BreakStatement, _context: Context) {
//     throw new Error(`not supported yet: ${_node.type}`)
//   },

//   ForStatement: function* (node: es.ForStatement, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   AssignmentExpression: function* (node: es.AssignmentExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   FunctionDeclaration: function* (node: es.FunctionDeclaration, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   IfStatement: function* (node: es.IfStatement | es.ConditionalExpression, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   ExpressionStatement: function* (node: es.ExpressionStatement, context: Context) {
//     return yield* evaluate(node.expression, context)
//   },

//   ReturnStatement: function* (node: es.ReturnStatement, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   WhileStatement: function* (node: es.WhileStatement, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   BlockStatement: function* (node: es.BlockStatement, context: Context) {
//     throw new Error(`not supported yet: ${node.type}`)
//   },

//   Program: function* (node: es.BlockStatement, context: Context) {
//     const result = yield* forceIt(yield* evaluateBlockSatement(context, node), context);
//     return result;
//   }
// }
// // tslint:enable:object-literal-shorthand

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
  const pos = lookupVairable(identifier, variableLookupEnv)
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

const lookupVairable = (sym: string, lookupEnv: string[][]) => {
  let frameIndex = lookupEnv.length
  let valueIndex = -1
  while (valueIndex == -1) {
    if (frameIndex == 0) {
      throw new Error(`undefined reference to ${sym}`)
    }
    const frame = lookupEnv[--frameIndex]
    for (let i = 0; i < frame.length; i++) {
      if (frame[i] === sym) {
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

const peek = (stash: Value[]) => {
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

    const { type, declarator, body } = cmd as FunctionDefinitionNode
    const { directDeclarator } = declarator // TODO: handle pointer
    const { identifier, parameterList } = directDeclarator
    agenda.push({
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
      agenda.push({
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
    agenda.push(...orderedExprs)
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
    const { stash, env, agenda, variableLookupEnv, memory } = interpreterContext
    const { arity } = cmd as ApplicationInstruction

    const args: any[] = []
    for (let i = arity - 1; i >= 0; i--) {
      args[i] = popStash(stash)
    }

    const func = popStash(stash) as ClosureExpression
    const params = scanParameters(func.prms)
    interpreterContext.variableLookupEnv = extendVariableLookupEnv(params, variableLookupEnv)
    const frameAddress = memory.allocateFrame(params.length)
    interpreterContext.env = memory.environmentExtend(frameAddress, env)
    for (let i = 0; i < arity; i++) {
      memory.setFrameValue(frameAddress, i, args[i])
    }

    // TODO: implement builtin here
    // if (func.tag == 'builtin') { }
    if (agenda.length == 0 || (peek(agenda) as Command).tag == 'EnvironmentRestoreInstruction') {
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
      {
        tag: 'AssignmentInstruction',
        identifier
      },
      expr
    )
  },

  AssignmentInstruction: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { stash, memory } = interpreterContext
    const { identifier } = cmd as AssignmentInstruction
    assign(identifier, popStash(stash), interpreterContext)
  },

  AssignmentExpression: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { agenda } = interpreterContext
    const { identifier, expr } = cmd as AssignmentExpressionNode
    agenda.push(
      {
        tag: 'AssignmentInstruction',
        identifier
      },
      expr
    )
  },

  Identifier: (cmd: Command, interpreterContext: InterpreterContext) => {
    const { variableLookupEnv, stash, memory, env, closurePool } = interpreterContext
    const { val: sym } = cmd as IdentifierNode

    const pos = lookupVairable(sym, variableLookupEnv)
    const val = memory.getEnvironmentValue(env, pos)

    if (memory.isClosure(val)) {
      const closurePoolIndex = memory.getClosurePoolIndex(val)
      stash.push(closurePool[closurePoolIndex])
    } else {
      stash.push(val)
    }
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
    i++
  }

  if (i === step_limit) throw new Error('step limit ' + step_limit + ' exceeded')
  if (stash.length > 1 || stash.length < 1)
    throw new Error('internal error: stash must be singleton')
  return stash[0]
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
