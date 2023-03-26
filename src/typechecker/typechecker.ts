import * as es from 'estree'

import { ErrorSeverity, ErrorType, Node, SourceError } from '../types'

export class FatalTypeError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: es.SourceLocation, public message: string) {}

  public explain() {
    return this.message
  }

  public elaborate() {
    return 'There is a type error in your program'
  }
}

const INT_TYPE: VariableTypeAssignment = {
  tag: 'Variable',
  type: 'int'
}
const CHAR_TYPE: VariableTypeAssignment = {
  tag: 'Variable',
  type: 'char'
}
const VOID_TYPE: VariableTypeAssignment = {
  tag: 'Variable',
  type: 'void'
}
type TypeAssignment = VariableTypeAssignment | ClosureTypeAssignment | undefined
type VariableTypeAssignment = {
  tag: 'Variable'
  type: string
}
type ClosureTypeAssignment = {
  tag: 'Closure'
  parameters: TypeAssignment[]
  returnType: TypeAssignment
}
type TypeFrame = { [key: string]: TypeAssignment }
type TypeEnvironment = TypeFrame[]

function getVariableTypeFromString(type: string): VariableTypeAssignment {
  switch (type) {
    case 'int':
      return INT_TYPE
    case 'char':
      return CHAR_TYPE
    default:
      throw new FatalTypeError(
        {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: 0,
            column: 0
          }
        },
        `Unknown type ${type}`
      )
  }
}

function isSameType(a: TypeAssignment, b: TypeAssignment) {
  if (!a || !b) return false
  if (a.tag == 'Variable' && b.tag == 'Variable') {
    return a.type == b.type
  }
  if (a.tag == 'Closure' && b.tag == 'Closure') {
    return true // Functions cannot be redefined
  }
  return false
}

function isInt(assignment: TypeAssignment) {
  if (!assignment) return false
  if (assignment.tag != 'Variable') {
    return false
  }
  return assignment.type == 'int'
}

function isChar(assignment: TypeAssignment) {
  if (!assignment) return false
  if (assignment.tag != 'Variable') {
    return false
  }
  return assignment.type == 'char'
}

function extendEnvironment(E: TypeEnvironment) {
  E.push({})
}

function exitEnvironment(E: TypeEnvironment) {
  E.pop()
}

function assignIdentifierType(E: TypeEnvironment, identifier: string, type: TypeAssignment) {
  E[E.length - 1][identifier] = type
}

function checkIdentifierType(E: TypeEnvironment, identifier: string): TypeAssignment {
  for (let i = E.length - 1; i >= 0; i--) {
    const type = E[i][identifier]
    if (!type) {
      continue
    }
    return type
  }
  throw new FatalTypeError(
    {
      start: {
        line: 0,
        column: 0
      },
      end: {
        line: 0,
        column: 0
      }
    },
    `Unable to locate type for ${identifier}`
  )
}

function checkSymType(
  sym: string,
  leftExprType: TypeAssignment,
  rightExprType: TypeAssignment
): TypeAssignment | undefined {
  switch (sym) {
    case '+':
    case '-':
      if (!isInt(leftExprType) || !isInt(rightExprType)) {
        throw new FatalTypeError(
          {
            start: {
              line: 0,
              column: 0
            },
            end: {
              line: 0,
              column: 0
            }
          },
          `+ operator must be applied on int int: instead found ${leftExprType} and ${rightExprType}`
        )
      }
      return INT_TYPE
    default:
      return
  }
}

function check(node: Node | undefined, E: TypeEnvironment): TypeAssignment | undefined {
  if (!node) {
    return
  }

  const { tag } = node

  if (tag == 'CompilationUnit') {
    const { translationUnit } = node
    return check(translationUnit, E)
  }

  if (tag == 'TranslationUnit') {
    const { externalDeclarations } = node
    return externalDeclarations.reduce((_acc, curr) => check(curr, E), undefined)
  }

  if (tag == 'ExternalDeclaration') {
    const { functionDefinition, declaration } = node
    return check(functionDefinition, E) || check(declaration, E)
  }

  if (tag == 'Declaration') {
    const { type, identifier, initializer } = node
    const initializerType = check(initializer, E)
    if (initializerType && !isSameType(getVariableTypeFromString(type), initializerType)) {
      throw new FatalTypeError(
        {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: 0,
            column: 0
          }
        },
        `Assignment expression type mismatch: ${initializerType} assigned to ${type}`
      )
    }
    assignIdentifierType(E, identifier, initializerType)
    return
  }

  if (tag == 'Initializer') {
    const { expr } = node
    return check(expr, E)
  }

  if (tag == 'AssignmentExpression') {
    const { expr } = node
    return check(expr, E)
  }

  if (tag == 'ConditionalExpression') {
    const { pred, cons, alt } = node
    const predType = check(pred, E)
    if (!isInt(predType)) {
      throw new FatalTypeError(
        {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: 0,
            column: 0
          }
        },
        `Conditional expression predicate must be int: instead found ${predType}`
      )
    }
    const consType = check(cons, E)
    const altType = check(alt, E)
    if (!isSameType(consType, altType)) {
      throw new FatalTypeError(
        {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: 0,
            column: 0
          }
        },
        `Conditional expression return types must be the same: instead found ${cons} and ${alt}`
      )
    }
    return consType
  }

  if (tag == 'ExpressionList') {
    const { exprs } = node
    return exprs.reduce((_acc, curr) => check(curr, E), undefined)
  }

  if (tag == 'BinaryOpExpression') {
    const { sym, leftExpr, rightExpr } = node
    const leftExprType = check(leftExpr, E)
    const rightExprType = check(rightExpr, E)
    return checkSymType(sym, leftExprType, rightExprType)
  }

  if (tag == 'FunctionDefinition') {
    const { type, declarator, compoundStatement } = node
    const { identifier, parameters } = declarator.directDeclarator
    extendEnvironment(E)
    const returnType = getVariableTypeFromString(type)
    assignIdentifierType(E, identifier, {
      tag: 'Closure',
      parameters: parameters?.map(param => check(param, E)) || [], // TODO: Declare in same scope as compound statement
      returnType
    })
    const actualReturnType = check(compoundStatement, E)
    if (!isSameType(returnType, actualReturnType)) {
      throw new FatalTypeError(
        {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: 0,
            column: 0
          }
        },
        `Function must return defined type: instead found ${type} and ${actualReturnType}`
      )
    }
    exitEnvironment(E)
    return
  }

  if (tag == 'ParameterDeclaration') {
    const {
      type,
      declarator: {
        directDeclarator: { identifier }
      }
    } = node
    const parameterType = getVariableTypeFromString(type)
    assignIdentifierType(E, identifier, parameterType)
    return parameterType
  }

  if (tag == 'ExpressionStatement') {
    const { exprs } = node
    check(exprs, E)
    return
  }

  if (tag == 'CompoundStatement') {
    const { statements } = node
    extendEnvironment(E)
    const returnType = statements.reduce((acc, curr) => {
      const statementType = check(curr, E)
      if (!statementType) {
        return acc
      }
      if (!acc) {
        return statementType
      }
      if (!isSameType(acc, statementType)) {
        throw new FatalTypeError(
          {
            start: {
              line: 0,
              column: 0
            },
            end: {
              line: 0,
              column: 0
            }
          },
          `Return type must be consistent: instead found ${acc} and ${statementType}`
        )
      }
      return acc
    }, undefined) // TODO: check for return statements
    exitEnvironment(E)
    return returnType
  }

  if (tag == 'ReturnStatement') {
    const { exprs } = node
    return check(exprs, E)
  }

  if (tag == 'Number') {
    return INT_TYPE
  }

  if (tag == 'CharacterLiteral') {
    return CHAR_TYPE
  }

  throw new FatalTypeError(
    {
      start: {
        line: 0,
        column: 0
      },
      end: {
        line: 0,
        column: 0
      }
    },
    `Type checking not supported for ${tag}`
  )
}

export function checkTyping(program: Node) {
  const E: TypeEnvironment = []
  check(program, E)
}
