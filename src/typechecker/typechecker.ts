import * as es from 'estree'

import { ErrorSeverity, ErrorType, Node, SourceError } from '../types'

type TypeEnvironment = { [key: string]: string }

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

function checkSymType(
  sym: string,
  leftExprType: string | undefined,
  rightExprType: string | undefined
): string | undefined {
  switch (sym) {
    case '+':
    case '-':
      if (leftExprType != 'int' || rightExprType != 'int') {
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
          `Binary op must be int int: instead found ${leftExprType} and ${rightExprType}`
        )
      }
      return 'int'
    default:
      return undefined
  }
}

function check(node: Node | undefined, E: TypeEnvironment): string | undefined {
  if (!node) {
    return
  }

  const { tag } = node

  switch (tag) {
    case 'CompilationUnit':
      const { translationUnit } = node
      return check(translationUnit, E)

    case 'TranslationUnit':
      const { externalDeclarations } = node
      return externalDeclarations.reduce((_acc, curr) => check(curr, E), undefined)

    case 'ExternalDeclaration':
      const { functionDefinition, declaration } = node
      return check(functionDefinition, E) || check(declaration, E)

    case 'Declaration':
      const { type, identifier, initializer } = node
      const initializerType = check(initializer, E) || type
      if (type != initializerType) {
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
          `Type mismatch: ${initializerType} assigned to ${type} ${identifier}`
        )
      }
      return (E[identifier] = type)

    case 'Initializer':
      const { expr: assignmentExpression } = node
      return check(assignmentExpression, E)

    case 'AssignmentExpression':
      const { expr } = node
      return check(expr, E)

    case 'ConditionalExpression':
      const { pred, cons, alt } = node
      const predType = check(pred, E)
      if (predType != 'int') {
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
      if (consType != altType) {
        if (predType != 'int') {
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
      }
      return check(expr, E)

    case 'ExpressionList':
      const { exprs } = node
      return exprs.reduce((_acc, curr) => check(curr, E), undefined)

    case 'BinaryOpExpression':
      const { sym, leftExpr, rightExpr } = node
      const leftExprType = check(leftExpr, E)
      const rightExprType = check(rightExpr, E)
      return checkSymType(sym, leftExprType, rightExprType)

    case 'Number':
      return 'int'

    case 'StringLiteral':
      return 'char[]'

    case 'CharacterLiteral':
      return 'char'

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
        `Type checking not supported for ${tag}`
      )
  }
}

export function checkTyping(program: Node) {
  const E: TypeEnvironment = {}
  check(program, E)
}
