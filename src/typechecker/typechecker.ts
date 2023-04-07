import * as es from 'estree'

import { ErrorSeverity, ErrorType, Node, PointerNode, SourceError } from '../types'

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
type TypeFrame = {
  tag: string
  assignments: {
    [key: string]: TypeAssignment
  }
}
type TypeEnvironment = TypeFrame[]

const toString = (type: TypeAssignment): string => {
  if (!type) return 'undefined'
  if (type.tag == 'Variable') return type.type
  const { parameterTypes, returnType } = type
  return `(${parameterTypes.map(paramType => toString(paramType))}) => ${toString(returnType)}`
}

const getVariableType = (
  typeString: string,
  pointer: PointerNode | undefined
): VariableTypeAssignment => {
  let type = typeString
  while (pointer) {
    type += '*'
    pointer = pointer.pointer
  }

  switch (typeString) {
    case 'int':
      break
    case 'void':
      if (!pointer) break
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

  return {
    tag: 'Variable',
    type
  }
}

const isSameType = (a: TypeAssignment, b: TypeAssignment): boolean => {
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

const isPointer = (a: TypeAssignment): boolean => {
  if (!a) return false
  if (a.tag == 'Closure') return false
  return a.type.includes('*')
}

const extendEnvironment = (E: TypeEnvironment, tag: string) => {
  E.push({ tag, assignments: {} })
}

const exitEnvironment = (E: TypeEnvironment) => {
  E.pop()
}

const isInsideLoop = (E: TypeEnvironment) => {
  for (let i = E.length - 1; i >= 0; i--) {
    if (E[i].tag == 'loop') {
      return true
    }
  }
  return false
}

const assignIdentifierType = (identifier: string, type: TypeAssignment, E: TypeEnvironment) => {
  E[E.length - 1].assignments[identifier] = type
}

const checkIdentifierType = (identifier: string, E: TypeEnvironment): IdentifierTypeAssignment => {
  for (let i = E.length - 1; i >= 0; i--) {
    const type = E[i].assignments[identifier]
    if (!type) {
      continue
    }
    return JSON.parse(JSON.stringify(type))
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
    `Unable to locate type for identifier '${identifier}'`
  )
}

const checkSymType = (
  sym: string,
  leftExprType: TypeAssignment,
  rightExprType: TypeAssignment
): TypeAssignment => {
  switch (sym) {
    case '=':
      if (!isSameType(leftExprType, rightExprType)) {
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
          `Assignment type mismatch: '${toString(rightExprType)}' assigned to '${toString(
            leftExprType
          )}'`
        )
      }
      return leftExprType
    case '+':
    case '-':
      if (isSameType(leftExprType, INT_TYPE) && isSameType(rightExprType, INT_TYPE)) {
        return INT_TYPE
      }
      if (
        (isSameType(leftExprType, INT_TYPE) || isSameType(rightExprType, INT_TYPE)) &&
        (isPointer(leftExprType) || isPointer(rightExprType))
      ) {
        return isPointer(leftExprType) ? leftExprType : rightExprType
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
        `Binary operator'${sym}' cannot be applied on '${toString(leftExprType)}' and '${toString(
          rightExprType
        )}'`
      )
    case '==':
    case '!=':
      if (
        isSameType(leftExprType, rightExprType) &&
        (isSameType(leftExprType, INT_TYPE) || isPointer(leftExprType))
      )
        return INT_TYPE
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
        `Binary operator'${sym}' cannot be applied on '${toString(leftExprType)}' and '${toString(
          rightExprType
        )}'`
      )
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
        `Type checking not supported for '${sym}'`
      )
  }
}

const check = (node: Node | undefined, E: TypeEnvironment): TypeAssignment => {
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
    const {
      type: typeString,
      declarator: {
        directDeclarator: { identifier },
        pointer
      },
      initializer
    } = node
    const declaredType = getVariableType(typeString, pointer)
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
        `Declaration type mismatch: '${toString(initializerType)}' declared as '${toString(
          declaredType
        )}'`
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
    const { leftExpr, sym, rightExpr } = node
    const leftExprType = check(leftExpr, E)
    const rightExprType = check(rightExpr, E)
    return checkSymType(sym, leftExprType, rightExprType)
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
        `Conditional expression predicate must be 'int': instead found '${toString(predType)}'`
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
        `Conditional expression return types must be the same: instead found '${toString(
          consType
        )}' and '${toString(altType)}'`
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
    const { type: typeString, declarator, body } = node
    const {
      pointer,
      directDeclarator: {
        identifier,
        parameterList: { parameters }
      }
    } = declarator
    const returnType = getVariableType(typeString, pointer)
    const closureType: TypeAssignment = {
      tag: 'Closure',
      parameterTypes: [],
      returnType
    }
    assignIdentifierType(identifier, closureType, E)
    extendEnvironment(E, 'block')
    closureType.parameterTypes = parameters.map(param => check(param, E)) // Only check params after extending environment
    const actualReturnType = check(body, E) || VOID_TYPE
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
        `Returning '${toString(
          actualReturnType
        )}' from a function with incompatible result type '${toString(returnType)}'`
      )
    }
    exitEnvironment(E)
    return
  }

  if (tag == 'ParameterDeclaration') {
    const {
      type: typeString,
      declarator: {
        directDeclarator: { identifier },
        pointer
      }
    } = node
    const parameterType = getVariableType(typeString, pointer)
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
    extendEnvironment(E, 'block')
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
          `Return type must be consistent: instead found '${toString(acc)}' and '${toString(
            statementType
          )}'`
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
        `Unable to locate function: '${identifier}'`
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
        `Function '${identifier}' expects '${expectedLength}' arguments: instead found '${actualLength}'`
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
          )}): instead found ${actualTypes.map(type => toString(type))}`
        )
      }
    }
    return returnType
  }

  if (tag == 'WhileStatement') {
    const { pred, body } = node
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
        `While loop predicate must be int: instead found ${toString(predType)}`
      )
    }
    extendEnvironment(E, 'loop')
    const returnType = check(body, E)
    exitEnvironment(E)
    return returnType
  }

  if (tag == 'BreakStatement') {
    if (!isInsideLoop(E)) {
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
        `Break statement not in loop statement`
      )
    }
    return
  }

  if (tag == 'ContinueStatement') {
    if (!isInsideLoop(E)) {
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
        `Continue statement not in loop statement`
      )
    }
    return
  }

  if (tag == 'UnaryExpression') {
    const { sym, expr } = node
    const exprType = check(expr, E)
    if (!exprType) {
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
        `Unary operator '${sym}' cannot be applied on 'undefined' type`
      )
    }

    if (sym == '*') {
      if (exprType.tag == 'Closure' || exprType.type[exprType.type.length - 1] != '*') {
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
          `Unary operator '${sym}' must be used on pointer type`
        )
      }
      exprType.type = exprType.type.substring(0, exprType.type.length - 1)
      return exprType
    }
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
        `Predicate expects '${toString(INT_TYPE)}': instead found '${toString(predType)}'`
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
          `Selection statement return types must be consistent: instead found '${toString(
            consType
          )}' and '${toString(altType)}'`
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
    `Type checking not supported for '${tag}'`
  )
}

export const checkTyping = (program: Node) => {
  const E: TypeEnvironment = [{ tag: 'block', assignments: {} }]
  check(program, E)
}
