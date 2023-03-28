/* tslint:disable:max-classes-per-file */
import * as es from 'estree'
import { result } from 'lodash'

import { RuntimeSourceError } from '../errors/runtimeSourceError'
import {
  AssignmentExpressionNode,
  BinaryOpExpressionNode,
  BinaryOpInstruction,
  BranchInstruction,
  Command,
  CompilationUnitNode,
  ConditionalExpressionNode,
  Context,
  DeclarationExpression,
  DeclarationInstruction,
  DeclarationNode,
  ExpressionListNode,
  ExternalDeclarationNode,
  FunctionDefinitionNode,
  LambdaExpression,
  Node,
  NumberNode,
  PopInstruction,
  TranslationUnitNode,
  Value
} from '../types'
import { evaluateBinaryExpression, evaluateUnaryExpression } from '../utils/operators'
import * as rttc from '../utils/rttc'

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

const declare = (sym: string, val: Value, E: Object[]) => {
  if (E[0].hasOwnProperty(sym)) {
    throw new Error('already declared')
  }
  E[0][sym] = val
}

const applyBinaryOp = (sym: string, leftOperand: Value, rightOperand: Value): Value =>
  binaryOpMicrocode[sym](leftOperand, rightOperand)

const popInstruction: PopInstruction = { tag: 'Pop' }

const binaryOpMicrocode = {
  '+': (x: number, y: number) => x + y,
  '-': (x: number, y: number) => x - y
}

const pop = (S: Value[]) => {
  const val = S.pop()
  if (!val) {
    throw Error('internal error: expected value from stack')
  }
  return val
}

const microcode = {
  CompilationUnit: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { translationUnit } = cmd as CompilationUnitNode
    if (translationUnit) A.push(translationUnit)
  },

  TranslationUnit: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const externalDeclarationCmds: Command[] = []
    const { externalDeclarations } = cmd as TranslationUnitNode
    externalDeclarations.forEach(node => {
      externalDeclarationCmds.push(node)
      externalDeclarationCmds.push(popInstruction)
    })
    externalDeclarationCmds.pop()
    externalDeclarationCmds.reverse()
    A.push(...externalDeclarationCmds)
  },

  FunctionDefinition: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { type, declarator, compoundStatement } = cmd as FunctionDefinitionNode
    const { directDeclarator } = declarator // TODO: handle pointer
    const { identifier, parameterList: parameters } = directDeclarator
    A.push({ tag: 'Number', val: 0 }, popInstruction, {
      tag: 'DeclarationExpression',
      sym: identifier,
      expr: {
        tag: 'LambdaExpression',
        prms: parameters,
        body: compoundStatement
      }
    })
  },

  LambdaExpression: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { prms, body } = cmd as LambdaExpression
    S.push({ tag: 'Closure', prms, body, E })
  },

  ExternalDeclaration: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { functionDefinition, declaration } = cmd as ExternalDeclarationNode
    // TODO: handle function definition
    if (functionDefinition) A.push(functionDefinition)
    if (declaration) A.push(declaration)
  },

  Declaration: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const type = (cmd as DeclarationNode).type
    const { identifier, initializer } = cmd as DeclarationNode
    if (!initializer) {
      // TODO: handle identifier only situation
      return
    }
    if (initializer.expr) {
      A.push({ tag: 'Number', val: 0 }, popInstruction, {
        tag: 'DeclarationExpression',
        sym: identifier,
        expr: initializer.expr
      })
    }
  },

  DeclarationExpression: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { sym, expr } = cmd as DeclarationExpression
    A.push(
      {
        tag: 'DeclarationInstruction',
        sym
      },
      expr
    )
  },

  DeclarationInstruction: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { sym } = cmd as DeclarationInstruction
    declare(sym, S[S.length - 1], E)
  },

  AssignmentExpression: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    // TODO: handle other expression cases
    const { expr } = cmd as AssignmentExpressionNode
    if (expr) {
      A.push(expr)
    }
  },

  ConditionalExpression: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { pred, cons, alt } = cmd as ConditionalExpressionNode
    A.push(
      {
        tag: 'BranchInstruction',
        cons,
        alt
      },
      pred
    )
  },

  BranchInstruction: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { cons, alt } = cmd as BranchInstruction
    A.push(pop(S) !== 0 ? cons : alt)
  },

  BinaryOpExpression: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { sym, leftExpr, rightExpr } = cmd as BinaryOpExpressionNode
    A.push({ tag: 'BinaryOpInstruction', sym }, rightExpr, leftExpr)
  },

  BinaryOpInstruction: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { sym } = cmd as BinaryOpInstruction
    const rightOperand = pop(S)
    const leftOperand = pop(S)
    S.push(applyBinaryOp(sym, leftOperand, rightOperand))
  },

  ExpressionList: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const expressionListCmds: Command[] = []
    const { exprs } = cmd as ExpressionListNode
    exprs.forEach(node => {
      expressionListCmds.push(node)
      expressionListCmds.push(popInstruction)
    })
    expressionListCmds.pop()
    expressionListCmds.reverse()
    A.push(...expressionListCmds)
  },

  Number: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    const { val } = cmd as NumberNode
    S.push(val)
  },

  Pop: (cmd: Command, A: Command[], S: Value[], E: Object[]) => {
    S.pop()
  }
}

export function* evaluate(node: Node, context: Context) {
  // const result = yield* evaluators[node.type](node, context)
  // yield* leave(context)
  // return result
  const step_limit = 1000000
  const A: Node[] = [node] // TODO: not sure if need to be wrapped with block. see how to impl environment
  const S: Value[] = []
  const E: Object[] = [{}] // TODO: add global environment with builtin functions
  let i = 0

  while (i < step_limit) {
    const cmd = A.pop()
    if (!cmd) break
    if (!microcode.hasOwnProperty(cmd.tag))
      throw new Error('internal error: unknown command ' + cmd.tag)
    microcode[cmd.tag](cmd, A, S, E)
    i++
  }

  if (i === step_limit) throw new Error('step limit ' + step_limit + ' exceeded')
  if (S.length > 1 || S.length < 1) throw new Error('internal error: stash must be singleton')
  return S[0]
}
