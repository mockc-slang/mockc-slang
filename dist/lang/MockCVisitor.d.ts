import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { CompilationUnitContext } from "./MockCParser";
import { TranslationUnitContext } from "./MockCParser";
import { ExternalDeclarationContext } from "./MockCParser";
import { FunctionDefinitionContext } from "./MockCParser";
import { TypeSpecifierContext } from "./MockCParser";
import { DeclaratorContext } from "./MockCParser";
import { PointerContext } from "./MockCParser";
import { DirectDeclaratorContext } from "./MockCParser";
import { ConstantExpressionContext } from "./MockCParser";
import { ConditionalExpressionContext } from "./MockCParser";
import { LogicalOrExpressionContext } from "./MockCParser";
import { LogicalAndExpressionContext } from "./MockCParser";
import { EqualityExpressionContext } from "./MockCParser";
import { RelationalExpressionContext } from "./MockCParser";
import { AdditiveExpressionContext } from "./MockCParser";
import { MultiplicativeExpressionContext } from "./MockCParser";
import { UnaryExpressionContext } from "./MockCParser";
import { PostfixExpressionContext } from "./MockCParser";
import { ArgumentExpressionListContext } from "./MockCParser";
import { PrimaryExpressionContext } from "./MockCParser";
import { ExpressionListContext } from "./MockCParser";
import { AssignmentExpressionContext } from "./MockCParser";
import { AssignmentOperatorContext } from "./MockCParser";
import { UnaryOperatorContext } from "./MockCParser";
import { ParameterListContext } from "./MockCParser";
import { ParameterDeclarationContext } from "./MockCParser";
import { DeclarationContext } from "./MockCParser";
import { InitDeclaratorContext } from "./MockCParser";
import { InitializerContext } from "./MockCParser";
import { InitializerListContext } from "./MockCParser";
import { CompoundStatementContext } from "./MockCParser";
import { StatementContext } from "./MockCParser";
import { ExpressionStatementContext } from "./MockCParser";
import { SelectionStatementContext } from "./MockCParser";
import { IterationStatementContext } from "./MockCParser";
import { JumpStatementContext } from "./MockCParser";
/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `MockCParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface MockCVisitor<Result> extends ParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `MockCParser.compilationUnit`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCompilationUnit?: (ctx: CompilationUnitContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.translationUnit`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTranslationUnit?: (ctx: TranslationUnitContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.externalDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExternalDeclaration?: (ctx: ExternalDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.functionDefinition`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFunctionDefinition?: (ctx: FunctionDefinitionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.typeSpecifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeSpecifier?: (ctx: TypeSpecifierContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.declarator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclarator?: (ctx: DeclaratorContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.pointer`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPointer?: (ctx: PointerContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.directDeclarator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDirectDeclarator?: (ctx: DirectDeclaratorContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.constantExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConstantExpression?: (ctx: ConstantExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.conditionalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitConditionalExpression?: (ctx: ConditionalExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.logicalOrExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalOrExpression?: (ctx: LogicalOrExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.logicalAndExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicalAndExpression?: (ctx: LogicalAndExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.equalityExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEqualityExpression?: (ctx: EqualityExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.relationalExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRelationalExpression?: (ctx: RelationalExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.additiveExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAdditiveExpression?: (ctx: AdditiveExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.multiplicativeExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMultiplicativeExpression?: (ctx: MultiplicativeExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.unaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnaryExpression?: (ctx: UnaryExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.postfixExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPostfixExpression?: (ctx: PostfixExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.argumentExpressionList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitArgumentExpressionList?: (ctx: ArgumentExpressionListContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.primaryExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPrimaryExpression?: (ctx: PrimaryExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.expressionList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpressionList?: (ctx: ExpressionListContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.assignmentExpression`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssignmentExpression?: (ctx: AssignmentExpressionContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.assignmentOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitAssignmentOperator?: (ctx: AssignmentOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.unaryOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitUnaryOperator?: (ctx: UnaryOperatorContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.parameterList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameterList?: (ctx: ParameterListContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.parameterDeclaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitParameterDeclaration?: (ctx: ParameterDeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.declaration`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitDeclaration?: (ctx: DeclarationContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.initDeclarator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInitDeclarator?: (ctx: InitDeclaratorContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.initializer`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInitializer?: (ctx: InitializerContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.initializerList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitInitializerList?: (ctx: InitializerListContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.compoundStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCompoundStatement?: (ctx: CompoundStatementContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatement?: (ctx: StatementContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.expressionStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpressionStatement?: (ctx: ExpressionStatementContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.selectionStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSelectionStatement?: (ctx: SelectionStatementContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.iterationStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIterationStatement?: (ctx: IterationStatementContext) => Result;
    /**
     * Visit a parse tree produced by `MockCParser.jumpStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitJumpStatement?: (ctx: JumpStatementContext) => Result;
}
