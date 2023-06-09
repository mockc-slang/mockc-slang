import {
  ANTLRErrorListener,
  CharStreams,
  CommonTokenStream,
  RecognitionException,
  Recognizer
} from 'antlr4ts'
import { ErrorNode } from 'antlr4ts/tree/ErrorNode'
import { ParseTree } from 'antlr4ts/tree/ParseTree'
import { RuleNode } from 'antlr4ts/tree/RuleNode'
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'
import * as es from 'estree'

import { MockCLexer } from '../lang/MockCLexer'
import {
  AdditiveExpressionContext,
  ArgumentExpressionListContext,
  AssignmentExpressionContext,
  AssignmentOperatorContext,
  CompilationUnitContext,
  CompoundStatementContext,
  ConditionalExpressionContext,
  ConstantExpressionContext,
  DeclarationContext,
  DeclaratorContext,
  DirectDeclaratorContext,
  EqualityExpressionContext,
  ExpressionListContext,
  ExpressionStatementContext,
  ExternalDeclarationContext,
  FunctionDefinitionContext,
  InitDeclaratorContext,
  InitializerContext,
  InitializerListContext,
  IterationStatementContext,
  JumpStatementContext,
  LogicalAndExpressionContext,
  LogicalOrExpressionContext,
  MockCParser,
  MultiplicativeExpressionContext,
  ParameterDeclarationContext,
  ParameterListContext,
  PointerContext,
  PostfixExpressionContext,
  PrimaryExpressionContext,
  RelationalExpressionContext,
  SelectionStatementContext,
  StatementContext,
  TranslationUnitContext,
  TypeSpecifierContext,
  UnaryExpressionContext,
  UnaryOperatorContext
} from '../lang/MockCParser'
import { MockCVisitor } from '../lang/MockCVisitor'
import { checkTyping } from '../typechecker/typechecker'
import {
  CompilationUnitNode,
  CompoundStatementNode,
  Context,
  DeclarationNode,
  DeclaratorNode,
  DirectDeclaratorNode,
  ErrorSeverity,
  ErrorType,
  ExpressionListNode,
  ExpressionNode,
  ExpressionStatementNode,
  ExternalDeclarationNode,
  FunctionDefinitionNode,
  InitDeclaratorNode,
  InitializerNode,
  IterationStatementNode,
  JumpStatementNode,
  Node,
  ParameterDeclarationNode,
  ParameterListNode,
  PointerNode,
  SelectionStatementNode,
  SourceError,
  StatementNode,
  TranslationUnitNode,
  TypeSpecifierNode
} from '../types'
export class FatalSyntaxError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: es.SourceLocation, public message: string) {}

  public explain() {
    return this.message
  }

  public elaborate() {
    return 'There is a syntax error in your program'
  }
}

// function contextToLocation(ctx: ExpressionContext): es.SourceLocation {
//   return {
//     start: {
//       line: ctx.start.line,
//       column: ctx.start.charPositionInLine
//     },
//     end: {
//       line: ctx.stop ? ctx.stop.line : ctx.start.line,
//       column: ctx.stop ? ctx.stop.charPositionInLine : ctx.start.charPositionInLine
//     }
//   }
// }

class ErrorListener implements ANTLRErrorListener<any> {
  public static readonly Instance: ErrorListener = new ErrorListener()

  public syntaxError<T>(
    _recognizer: Recognizer<T, any>,
    _offendingSymbol: T,
    line: number,
    charPositionInLine: number,
    msg: string,
    _e: RecognitionException | undefined
  ): void {
    throw new FatalSyntaxError(
      {
        start: {
          line,
          column: charPositionInLine
        },
        end: {
          line,
          column: charPositionInLine + 1
        }
      },
      msg
    )
  }
}

class NodeGenerator implements MockCVisitor<Node> {
  visitCompilationUnit(ctx: CompilationUnitContext): CompilationUnitNode {
    return {
      tag: 'CompilationUnit',
      translationUnit: ctx.translationUnit()?.accept(this) as TranslationUnitNode
    }
  }

  visitTranslationUnit(ctx: TranslationUnitContext): TranslationUnitNode {
    const externalDeclarations: ExternalDeclarationNode[] = []
    for (const externalDeclaration of ctx.externalDeclaration()) {
      externalDeclarations.push(externalDeclaration.accept(this) as ExternalDeclarationNode)
    }
    return {
      tag: 'TranslationUnit',
      externalDeclarations
    }
  }

  visitExternalDeclaration(ctx: ExternalDeclarationContext): ExternalDeclarationNode {
    return {
      tag: 'ExternalDeclaration',
      functionDefinition: ctx.functionDefinition()?.accept(this) as FunctionDefinitionNode,
      declaration: ctx.declaration()?.accept(this) as DeclarationNode
    }
  }

  visitFunctionDefinition(ctx: FunctionDefinitionContext): FunctionDefinitionNode {
    return {
      tag: 'FunctionDefinition',
      type: ctx.typeSpecifier().text,
      declarator: ctx.declarator().accept(this) as DeclaratorNode,
      body: ctx.compoundStatement().accept(this) as CompoundStatementNode
    }
  }

  visitTypeSpecifier(ctx: TypeSpecifierContext): TypeSpecifierNode {
    return {
      tag: 'TypeSpecifier',
      type: ctx.text
    }
  }

  visitDeclarator(ctx: DeclaratorContext): DeclaratorNode {
    return {
      tag: 'Declarator',
      directDeclarator: ctx.directDeclarator().accept(this) as DirectDeclaratorNode,
      pointer: ctx.pointer()?.accept(this) as PointerNode | undefined
    }
  }

  visitPointer(ctx: PointerContext): PointerNode {
    return {
      tag: 'Pointer',
      pointer: ctx.pointer()?.accept(this) as PointerNode | undefined
    }
  }

  visitDirectDeclarator(ctx: DirectDeclaratorContext): DirectDeclaratorNode {
    const parameterList = (ctx.parameterList()?.accept(this) as ParameterListNode) || {
      tag: 'ParameterList',
      parameters: []
    }

    // TODO: Check for function/array declaration
    return {
      tag: 'DirectDeclarator',
      identifier: ctx.IDENTIFIER().text,
      parameterList
    }
  }

  visitConstantExpression(ctx: ConstantExpressionContext): ExpressionNode {
    return ctx.conditionalExpression().accept(this) as ExpressionNode
  }

  visitConditionalExpression(ctx: ConditionalExpressionContext): ExpressionNode {
    const logicalOrExpression = ctx.logicalOrExpression()
    const expressionList = ctx.expressionList()
    const conditionalExpression = ctx.conditionalExpression()

    if (expressionList && conditionalExpression) {
      return {
        tag: 'ConditionalExpression',
        pred: logicalOrExpression.accept(this) as ExpressionNode,
        cons: expressionList.accept(this) as ExpressionNode,
        alt: conditionalExpression.accept(this) as ExpressionNode
      }
    }

    return logicalOrExpression.accept(this) as ExpressionNode
  }

  visitLogicalOrExpression(ctx: LogicalOrExpressionContext): ExpressionNode {
    const logicalOrExpression = ctx.logicalOrExpression()
    const logicalAndExpression = ctx.logicalAndExpression()
    if (logicalOrExpression) {
      return {
        tag: 'BinaryOpExpression',
        sym: ctx.getChild(1).text,
        leftExpr: logicalOrExpression.accept(this) as ExpressionNode,
        rightExpr: logicalAndExpression.accept(this) as ExpressionNode
      }
    }
    return ctx.logicalAndExpression().accept(this) as ExpressionNode
  }

  visitLogicalAndExpression(ctx: LogicalAndExpressionContext): ExpressionNode {
    const logicalAndExpression = ctx.logicalAndExpression()
    const equalityExpression = ctx.equalityExpression()
    if (logicalAndExpression) {
      return {
        tag: 'BinaryOpExpression',
        sym: ctx.getChild(1).text,
        leftExpr: logicalAndExpression.accept(this) as ExpressionNode,
        rightExpr: equalityExpression.accept(this) as ExpressionNode
      }
    }
    return ctx.equalityExpression().accept(this) as ExpressionNode
  }

  visitEqualityExpression(ctx: EqualityExpressionContext): ExpressionNode {
    // TODO: Check for equality expression
    const equalityExpression = ctx.equalityExpression()?.accept(this) as ExpressionNode
    const relationalExpression = ctx.relationalExpression().accept(this) as ExpressionNode
    if (equalityExpression) {
      return {
        tag: 'BinaryOpExpression',
        sym: ctx.getChild(1).text,
        leftExpr: equalityExpression,
        rightExpr: relationalExpression
      }
    }
    return relationalExpression
  }

  visitRelationalExpression(ctx: RelationalExpressionContext): ExpressionNode {
    const relationalExpression = ctx.relationalExpression()?.accept(this) as ExpressionNode
    const additiveExpression = ctx.additiveExpression()?.accept(this) as ExpressionNode
    if (relationalExpression) {
      return {
        tag: 'BinaryOpExpression',
        sym: ctx.getChild(1).text,
        leftExpr: relationalExpression,
        rightExpr: additiveExpression
      }
    }
    return additiveExpression
  }

  visitAdditiveExpression(ctx: AdditiveExpressionContext): ExpressionNode {
    // TODO: Check for additive expression
    const additiveExpression = ctx.additiveExpression()
    const multiplicativeExpression = ctx.multiplicativeExpression()

    if (additiveExpression) {
      return {
        tag: 'BinaryOpExpression',
        sym: ctx.getChild(1).text,
        leftExpr: additiveExpression.accept(this) as ExpressionNode,
        rightExpr: multiplicativeExpression.accept(this) as ExpressionNode
      }
    }

    return multiplicativeExpression.accept(this) as ExpressionNode
  }

  visitMultiplicativeExpression(ctx: MultiplicativeExpressionContext): ExpressionNode {
    const multiplicativeExpression = ctx.multiplicativeExpression()?.accept(this) as ExpressionNode
    const unaryExpression = ctx.unaryExpression()?.accept(this) as ExpressionNode

    if (multiplicativeExpression) {
      return {
        tag: 'BinaryOpExpression',
        sym: ctx.getChild(1).text,
        leftExpr: multiplicativeExpression,
        rightExpr: unaryExpression
      }
    }

    return unaryExpression
  }

  visitUnaryExpression(ctx: UnaryExpressionContext): ExpressionNode {
    // TODO: Check for unary expression
    const unaryOperator = ctx.unaryOperator()
    const unaryExpression = ctx.unaryExpression()?.accept(this) as ExpressionNode | undefined
    if (unaryOperator && unaryExpression) {
      return {
        tag: 'UnaryExpression',
        sym: unaryOperator.text,
        expr: unaryExpression
      }
    }
    return ctx.postfixExpression()?.accept(this) as ExpressionNode
  }

  visitPostfixExpression(ctx: PostfixExpressionContext): ExpressionNode {
    if (ctx.childCount == 1) {
      return ctx.primaryExpression()?.accept(this) as ExpressionNode
    }

    const sym = ctx.getChild(1).text

    if (sym == '(') {
      const identifier = ctx.getChild(0).text
      const expressionList = ctx.argumentExpressionList()?.accept(this) as
        | ExpressionListNode
        | undefined
      const params: ExpressionNode[] = expressionList?.exprs || []
      return {
        tag: 'FunctionApplication',
        identifier,
        params
      }
    }

    return ctx.primaryExpression()?.accept(this) as ExpressionNode
  }

  visitArgumentExpressionList(ctx: ArgumentExpressionListContext): ExpressionNode {
    const exprs: ExpressionNode[] = []
    for (let i = 0; i < ctx.childCount; i++) {
      const child = ctx.getChild(i)
      if (child.text != ',') {
        exprs.push(child.accept(this) as ExpressionNode)
      }
    }
    return {
      tag: 'ExpressionList',
      exprs
    }
  }

  visitPrimaryExpression(ctx: PrimaryExpressionContext): ExpressionNode {
    const number = ctx.NUMBER()
    if (number) {
      return {
        tag: 'Number',
        val: parseInt(number.text)
      }
    }

    const stringLiteralNode = ctx.STRING_LITERAL()
    if (stringLiteralNode) {
      return {
        tag: 'StringLiteral',
        val: stringLiteralNode.text.slice(1, -1)
      }
    }

    const identifierNode = ctx.IDENTIFIER()
    if (identifierNode) {
      return {
        tag: 'Identifier',
        val: identifierNode.text
      }
    }

    return ctx.expressionList()?.accept(this) as ExpressionListNode
  }

  visitExpressionList(ctx: ExpressionListContext): ExpressionListNode {
    const exprs: ExpressionNode[] = []

    for (let i = 0; i < ctx.childCount; i++) {
      const child = ctx.getChild(i)
      if (child.text != ',') {
        exprs.push(child.accept(this) as ExpressionNode)
      }
    }

    return {
      tag: 'ExpressionList',
      exprs
    }
  }

  visitAssignmentExpression(ctx: AssignmentExpressionContext): ExpressionNode {
    const leftExpr = ctx.unaryExpression()?.accept(this) as ExpressionNode
    const sym = ctx.assignmentOperator()?.text
    const rightExpr = ctx.assignmentExpression()?.accept(this) as ExpressionNode
    if (leftExpr && sym && rightExpr) {
      return {
        tag: 'AssignmentExpression',
        leftExpr,
        sym,
        rightExpr
      }
    }
    return ctx.conditionalExpression()?.accept(this) as ExpressionNode
  }

  visitAssignmentOperator?: ((ctx: AssignmentOperatorContext) => Node) | undefined
  visitUnaryOperator?: ((ctx: UnaryOperatorContext) => Node) | undefined

  visitParameterList(ctx: ParameterListContext): ParameterListNode {
    const parameters: ParameterDeclarationNode[] = []

    for (let i = 0; i < ctx.childCount; i++) {
      const child = ctx.getChild(i)
      if (child.text != ',') {
        parameters.push(child.accept(this) as ParameterDeclarationNode)
      }
    }

    return {
      tag: 'ParameterList',
      parameters
    }
  }

  visitParameterDeclaration(ctx: ParameterDeclarationContext): ParameterDeclarationNode {
    return {
      tag: 'ParameterDeclaration',
      type: ctx.typeSpecifier().text,
      declarator: ctx.declarator().accept(this) as DeclaratorNode
    }
  }

  visitDeclaration(ctx: DeclarationContext): DeclarationNode {
    const { declarator, initializer } = ctx.initDeclarator().accept(this) as InitDeclaratorNode
    return {
      tag: 'Declaration',
      type: ctx.typeSpecifier().text,
      declarator,
      initializer
    }
  }

  visitInitDeclarator(ctx: InitDeclaratorContext): InitDeclaratorNode {
    return {
      tag: 'InitDeclarator',
      declarator: ctx.declarator().accept(this) as DeclaratorNode,
      initializer: ctx.initializer()?.accept(this) as InitializerNode
    }
  }

  visitInitializer(ctx: InitializerContext): InitializerNode {
    return {
      tag: 'Initializer',
      expr: ctx.assignmentExpression()?.accept(this) as ExpressionNode
    }
  }

  visitInitializerList?: ((ctx: InitializerListContext) => Node) | undefined

  visitCompoundStatement(ctx: CompoundStatementContext): CompoundStatementNode {
    const statements: (DeclarationNode | StatementNode)[] = []

    for (let i = 0; i < ctx.childCount; i++) {
      const child = ctx.getChild(i)
      if (child.text == '{' || child.text == '}') {
        continue
      }
      statements.push(child.accept(this) as DeclarationNode | StatementNode)
    }

    return {
      tag: 'CompoundStatement',
      statements
    }
  }

  visitStatement(ctx: StatementContext): StatementNode {
    const expressionStatement = ctx.expressionStatement()
    if (expressionStatement) {
      return expressionStatement.accept(this) as ExpressionStatementNode
    }
    const compoundStatement = ctx.compoundStatement()
    if (compoundStatement) {
      return compoundStatement.accept(this) as ExpressionStatementNode
    }
    const selectionStatement = ctx.selectionStatement()
    if (selectionStatement) {
      return selectionStatement.accept(this) as ExpressionStatementNode
    }
    const iterationStatement = ctx.iterationStatement()
    if (iterationStatement) {
      return iterationStatement.accept(this) as ExpressionStatementNode
    }

    return ctx.jumpStatement()?.accept(this) as ExpressionStatementNode
  }

  visitExpressionStatement(ctx: ExpressionStatementContext): ExpressionStatementNode {
    const expressionList = ctx.expressionList()?.accept(this) as ExpressionListNode | undefined

    return {
      tag: 'ExpressionStatement',
      exprs: expressionList || {
        tag: 'ExpressionList',
        exprs: []
      }
    }
  }

  visitSelectionStatement(ctx: SelectionStatementContext): SelectionStatementNode {
    const statements = ctx.statement()
    return {
      tag: 'SelectionStatement',
      pred: ctx.expressionList().accept(this) as ExpressionListNode,
      cons: statements[0].accept(this) as StatementNode,
      alt: statements.length > 1 ? (statements[1].accept(this) as StatementNode) : undefined
    }
  }

  visitIterationStatement(ctx: IterationStatementContext): IterationStatementNode {
    return {
      tag: 'WhileStatement',
      pred: ctx.expressionList().accept(this) as ExpressionListNode,
      body: ctx.statement().accept(this) as StatementNode
    }
  }

  visitJumpStatement(ctx: JumpStatementContext): JumpStatementNode {
    const keyword = ctx.getChild(0).text
    if (keyword == 'return') {
      return {
        tag: 'ReturnStatement',
        exprs: (ctx.expressionList()?.accept(this) as ExpressionListNode) || {
          tag: 'ExpressionList',
          exprs: []
        }
      }
    }

    if (keyword == 'break') {
      return {
        tag: 'BreakStatement'
      }
    }

    return {
      tag: 'ContinueStatement'
    }
  }

  visit(tree: ParseTree): Node {
    throw new Error('Method not implemented.')
  }
  visitChildren(node: RuleNode): Node {
    throw new Error('Method not implemented.')
  }
  visitTerminal(node: TerminalNode): Node {
    throw new Error('Method not implemented.')
  }
  visitErrorNode(node: ErrorNode): Node {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

function convertSource(compilationUnit: CompilationUnitContext): Node {
  const generator = new NodeGenerator()
  return compilationUnit.accept(generator)
}

export function parse(source: string, context: Context) {
  let program: Node | undefined

  if (context.variant === 'calc') {
    const inputStream = CharStreams.fromString(source)
    const lexer = new MockCLexer(inputStream)
    const tokenStream = new CommonTokenStream(lexer)
    const parser = new MockCParser(tokenStream)
    parser.addErrorListener(ErrorListener.Instance)
    parser.buildParseTree = true
    try {
      const tree = parser.compilationUnit()
      program = convertSource(tree)
      console.log(JSON.stringify(program, undefined, 2), 'final tree')
      checkTyping(program)
    } catch (error) {
      context.errors.push(error)
    }
    const hasErrors = context.errors.find(m => m.severity === ErrorSeverity.ERROR)
    if (program && !hasErrors) {
      return program
    } else {
      return undefined
    }
  } else {
    return undefined
  }
}
