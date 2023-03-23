import { ErrorSeverity, ErrorType, Node, SourceError } from '../types'
import * as es from 'estree'

type Table = { [key: string]: string }

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

function check(node: Node | undefined, S: Table, F: Table): string | undefined {
  if (!node) {
    return
  }

  const { tag } = node

  switch (tag) {
    case 'CompilationUnit':
      const { translationUnit } = node
      return check(translationUnit, S, F)

    case 'TranslationUnit':
      const { externalDeclarations } = node
      return externalDeclarations.reduce((_acc, curr) => check(curr, S, F), undefined)

    case 'ExternalDeclaration':
      const { functionDefinition, declaration } = node
      return check(functionDefinition, S, F) || check(declaration, S, F)

    case 'Declaration':
      const { type, identifier, initializer } = node
      const initializerType = check(initializer, S, F) || type
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
      return (S[identifier] = type)

    case 'Initializer':
      const { expr: assignmentExpression } = node
      return check(assignmentExpression, S, F)

    case 'AssignmentExpression':
      const { expr } = node
      return check(expr, S, F)

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
  const S: Table = {}
  const F: Table = {}
  check(program, S, F)
}
