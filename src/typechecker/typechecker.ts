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
type IdentifierTypeAssignment = VariableTypeAssignment | ClosureTypeAssignment
type TypeAssignment = IdentifierTypeAssignment | undefined
type VariableTypeAssignment = {
  tag: 'Variable'
  type: string
}
type ClosureTypeAssignment = {
  tag: 'Closure'
  parameterTypes: TypeAssignment[]
  returnType: TypeAssignment
}
type TypeFrame = { [key: string]: TypeAssignment }
type TypeEnvironment = TypeFrame[]

function toString(type: TypeAssignment): string {
  if (!type) return 'undefined'
  if (type.tag == 'Variable') return type.type
  const { parameterTypes, returnType } = type
  return `(${parameterTypes.map(paramType => toString(paramType))}) => ${toString(returnType)}`
}

function getVariableTypeFromString(type: string): VariableTypeAssignment {
  switch (type) {
    case 'int':
      return INT_TYPE
    case 'char':
      return CHAR_TYPE
    case 'void':
      return VOID_TYPE
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

function isSameType(a: TypeAssignment, b: TypeAssignment): boolean {
  if (!a || !b) return false
  if (a.tag == 'Variable' && b.tag == 'Variable') {
    return a.type == b.type
  }
  if (a.tag == 'Closure' && b.tag == 'Closure') {
    const { parameterTypes: aParameterTypes, returnType: aReturnType } = a
    const { parameterTypes: bParameterTypes, returnType: bReturnType } = b
    if (aParameterTypes.length != bParameterTypes.length) {
      return false
    }
    for (let i = 0; i < aParameterTypes.length; i++) {
      if (!isSameType(aParameterTypes[i], bParameterTypes[i])) {
        return false
      }
    }
    return isSameType(aReturnType, bReturnType)
  }
  return false
}

function extendEnvironment(E: TypeEnvironment) {
  E.push({})
}

function exitEnvironment(E: TypeEnvironment) {
  E.pop()
}

function assignIdentifierType(identifier: string, type: TypeAssignment, E: TypeEnvironment) {
  E[E.length - 1][identifier] = type
}

function checkIdentifierType(identifier: string, E: TypeEnvironment): IdentifierTypeAssignment {
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
    `Unable to locate type for identifier: ${identifier}`
  )
}

function checkSymType(
  sym: string,
  leftExprType: TypeAssignment,
  rightExprType: TypeAssignment
): TypeAssignment {
  switch (sym) {
    case '+':
    case '-':
      if (!isSameType(leftExprType, INT_TYPE) || !isSameType(rightExprType, INT_TYPE)) {
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
          `+ operator must be applied on int int: instead found ${toString(
            leftExprType
          )} and ${toString(rightExprType)}`
        )
      }
      return INT_TYPE
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
        `Type checking not supported for ${sym}`
      )
  }
}

function check(node: Node | undefined, E: TypeEnvironment): TypeAssignment {
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
    const { type: typeString, identifier, initializer } = node
    const declaredType = getVariableTypeFromString(typeString)
    const initializerType = check(initializer, E)
    if (initializerType && !isSameType(declaredType, initializerType)) {
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
        `Declaration type mismatch: ${toString(initializerType)} declared as ${toString(
          declaredType
        )}`
      )
    }
    assignIdentifierType(identifier, declaredType, E)
    return
  }

  if (tag == 'Initializer') {
    const { expr } = node
    return check(expr, E)
  }

  if (tag == 'AssignmentExpression') {
    const { identifier, sym, expr } = node
    const identifierType = checkIdentifierType(identifier, E)
    const exprType = check(expr, E)

    if (sym == '=') {
      if (!isSameType(identifierType, exprType)) {
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
          `Assignment type mismatch: ${toString(exprType)} assigned to ${toString(identifierType)}`
        )
      }
      return identifierType
    }

    return checkSymType(sym, identifierType, exprType)
  }

  if (tag == 'ConditionalExpression') {
    const { pred, cons, alt } = node
    const predType = check(pred, E)
    if (!isSameType(predType, INT_TYPE)) {
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
        `Conditional expression predicate must be int: instead found ${toString(predType)}`
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
        `Conditional expression return types must be the same: instead found ${toString(
          consType
        )} and ${toString(altType)}`
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
    const {
      identifier,
      parameterList: { parameters }
    } = declarator.directDeclarator
    const returnType = getVariableTypeFromString(type)
    const closureType: TypeAssignment = {
      tag: 'Closure',
      parameterTypes: [],
      returnType
    }
    assignIdentifierType(identifier, closureType, E)
    extendEnvironment(E)
    closureType.parameterTypes = parameters.map(param => check(param, E)) // Only check params after extending environment
    const actualReturnType = check(compoundStatement, E) || VOID_TYPE
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
        `Function must return defined type: expected ${toString(returnType)} but found ${toString(
          actualReturnType
        )}`
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
    assignIdentifierType(identifier, parameterType, E)
    return parameterType
  }

  if (tag == 'ExpressionStatement') {
    const { exprs } = node
    exprs.forEach(expr => check(expr, E))
    return
  }

  if (tag == 'CompoundStatement') {
    const { statements } = node
    extendEnvironment(E)
    const returnType = statements.reduce((acc: TypeAssignment, curr) => {
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
          `Return type must be consistent: instead found ${toString(acc)} and ${toString(
            statementType
          )}`
        )
      }
      return acc
    }, undefined)
    exitEnvironment(E)
    return returnType
  }

  if (tag == 'FunctionApplication') {
    const { identifier, params } = node
    const identifierType = checkIdentifierType(identifier, E)
    if (identifierType.tag == 'Variable') {
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
        `No such function: ${identifier}`
      )
    }
    const { parameterTypes: expectedTypes, returnType } = identifierType
    const expectedLength = expectedTypes.length
    const actualLength = params.length
    if (expectedLength != actualLength) {
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
        `Function ${identifier} expects ${expectedLength} arguments but found ${actualLength} instead`
      )
    }
    const actualTypes = params.map(param => check(param, E))
    for (let i = 0; i < expectedLength; i++) {
      if (!isSameType(expectedTypes[i], actualTypes[i])) {
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
          `Function ${identifier} expects (${expectedTypes.map(type =>
            toString(type)
          )}) but found ${actualTypes.map(type => toString(type))} instead`
        )
      }
    }
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

  if (tag == 'Identifier') {
    const { val } = node
    return checkIdentifierType(val, E)
  }

  if (tag == 'SelectionStatement') {
    const { pred, cons, alt } = node
    const predType = check(pred, E)
    if (!isSameType(predType, INT_TYPE)) {
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
        `Predicate expects ${toString(INT_TYPE)}: instead found ${toString(predType)} instead`
      )
    }
    const consType = check(cons, E)
    if (alt) {
      const altType = check(alt, E)
      if (!altType || !consType) {
        return
      }
      if (!isSameType(altType, consType)) {
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
          `Selection statement return types must be consistent: instead found ${toString(
            consType
          )} and ${toString(altType)}`
        )
      }
      return consType
    }
    return
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
  const E: TypeEnvironment = [{}]
  check(program, E)
}
