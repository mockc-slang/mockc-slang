import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';
import { CompilationUnitContext } from './MockCParser';
import { TranslationUnitContext } from './MockCParser';
import { ExternalDeclarationContext } from './MockCParser';
import { FunctionDefinitionContext } from './MockCParser';
import { TypeSpecifierContext } from './MockCParser';
import { DeclaratorContext } from './MockCParser';
import { PointerContext } from './MockCParser';
import { DirectDeclaratorContext } from './MockCParser';
import { ConstantExpressionContext } from './MockCParser';
import { ConditionalExpressionContext } from './MockCParser';
import { LogicalOrExpressionContext } from './MockCParser';
import { LogicalAndExpressionContext } from './MockCParser';
import { EqualityExpressionContext } from './MockCParser';
import { RelationalExpressionContext } from './MockCParser';
import { AdditiveExpressionContext } from './MockCParser';
import { MultiplicativeExpressionContext } from './MockCParser';
import { UnaryExpressionContext } from './MockCParser';
import { PostfixExpressionContext } from './MockCParser';
import { ArgumentExpressionListContext } from './MockCParser';
import { PrimaryExpressionContext } from './MockCParser';
import { ExpressionListContext } from './MockCParser';
import { AssignmentExpressionContext } from './MockCParser';
import { AssignmentOperatorContext } from './MockCParser';
import { UnaryOperatorContext } from './MockCParser';
import { ParameterListContext } from './MockCParser';
import { ParameterDeclarationContext } from './MockCParser';
import { DeclarationContext } from './MockCParser';
import { InitDeclaratorContext } from './MockCParser';
import { InitializerContext } from './MockCParser';
import { InitializerListContext } from './MockCParser';
import { CompoundStatementContext } from './MockCParser';
import { StatementContext } from './MockCParser';
import { ExpressionStatementContext } from './MockCParser';
import { SelectionStatementContext } from './MockCParser';
import { IterationStatementContext } from './MockCParser';
import { JumpStatementContext } from './MockCParser';
/**
 * This interface defines a complete listener for a parse tree produced by
 * `MockCParser`.
 */
export interface MockCListener extends ParseTreeListener {
    /**
     * Enter a parse tree produced by `MockCParser.compilationUnit`.
     * @param ctx the parse tree
     */
    enterCompilationUnit?: (ctx: CompilationUnitContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.compilationUnit`.
     * @param ctx the parse tree
     */
    exitCompilationUnit?: (ctx: CompilationUnitContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.translationUnit`.
     * @param ctx the parse tree
     */
    enterTranslationUnit?: (ctx: TranslationUnitContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.translationUnit`.
     * @param ctx the parse tree
     */
    exitTranslationUnit?: (ctx: TranslationUnitContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.externalDeclaration`.
     * @param ctx the parse tree
     */
    enterExternalDeclaration?: (ctx: ExternalDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.externalDeclaration`.
     * @param ctx the parse tree
     */
    exitExternalDeclaration?: (ctx: ExternalDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.functionDefinition`.
     * @param ctx the parse tree
     */
    enterFunctionDefinition?: (ctx: FunctionDefinitionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.functionDefinition`.
     * @param ctx the parse tree
     */
    exitFunctionDefinition?: (ctx: FunctionDefinitionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.typeSpecifier`.
     * @param ctx the parse tree
     */
    enterTypeSpecifier?: (ctx: TypeSpecifierContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.typeSpecifier`.
     * @param ctx the parse tree
     */
    exitTypeSpecifier?: (ctx: TypeSpecifierContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.declarator`.
     * @param ctx the parse tree
     */
    enterDeclarator?: (ctx: DeclaratorContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.declarator`.
     * @param ctx the parse tree
     */
    exitDeclarator?: (ctx: DeclaratorContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.pointer`.
     * @param ctx the parse tree
     */
    enterPointer?: (ctx: PointerContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.pointer`.
     * @param ctx the parse tree
     */
    exitPointer?: (ctx: PointerContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.directDeclarator`.
     * @param ctx the parse tree
     */
    enterDirectDeclarator?: (ctx: DirectDeclaratorContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.directDeclarator`.
     * @param ctx the parse tree
     */
    exitDirectDeclarator?: (ctx: DirectDeclaratorContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.constantExpression`.
     * @param ctx the parse tree
     */
    enterConstantExpression?: (ctx: ConstantExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.constantExpression`.
     * @param ctx the parse tree
     */
    exitConstantExpression?: (ctx: ConstantExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.conditionalExpression`.
     * @param ctx the parse tree
     */
    enterConditionalExpression?: (ctx: ConditionalExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.conditionalExpression`.
     * @param ctx the parse tree
     */
    exitConditionalExpression?: (ctx: ConditionalExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.logicalOrExpression`.
     * @param ctx the parse tree
     */
    enterLogicalOrExpression?: (ctx: LogicalOrExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.logicalOrExpression`.
     * @param ctx the parse tree
     */
    exitLogicalOrExpression?: (ctx: LogicalOrExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.logicalAndExpression`.
     * @param ctx the parse tree
     */
    enterLogicalAndExpression?: (ctx: LogicalAndExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.logicalAndExpression`.
     * @param ctx the parse tree
     */
    exitLogicalAndExpression?: (ctx: LogicalAndExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.equalityExpression`.
     * @param ctx the parse tree
     */
    enterEqualityExpression?: (ctx: EqualityExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.equalityExpression`.
     * @param ctx the parse tree
     */
    exitEqualityExpression?: (ctx: EqualityExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.relationalExpression`.
     * @param ctx the parse tree
     */
    enterRelationalExpression?: (ctx: RelationalExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.relationalExpression`.
     * @param ctx the parse tree
     */
    exitRelationalExpression?: (ctx: RelationalExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.additiveExpression`.
     * @param ctx the parse tree
     */
    enterAdditiveExpression?: (ctx: AdditiveExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.additiveExpression`.
     * @param ctx the parse tree
     */
    exitAdditiveExpression?: (ctx: AdditiveExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.multiplicativeExpression`.
     * @param ctx the parse tree
     */
    enterMultiplicativeExpression?: (ctx: MultiplicativeExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.multiplicativeExpression`.
     * @param ctx the parse tree
     */
    exitMultiplicativeExpression?: (ctx: MultiplicativeExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.unaryExpression`.
     * @param ctx the parse tree
     */
    enterUnaryExpression?: (ctx: UnaryExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.unaryExpression`.
     * @param ctx the parse tree
     */
    exitUnaryExpression?: (ctx: UnaryExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.postfixExpression`.
     * @param ctx the parse tree
     */
    enterPostfixExpression?: (ctx: PostfixExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.postfixExpression`.
     * @param ctx the parse tree
     */
    exitPostfixExpression?: (ctx: PostfixExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.argumentExpressionList`.
     * @param ctx the parse tree
     */
    enterArgumentExpressionList?: (ctx: ArgumentExpressionListContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.argumentExpressionList`.
     * @param ctx the parse tree
     */
    exitArgumentExpressionList?: (ctx: ArgumentExpressionListContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.primaryExpression`.
     * @param ctx the parse tree
     */
    enterPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.primaryExpression`.
     * @param ctx the parse tree
     */
    exitPrimaryExpression?: (ctx: PrimaryExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.expressionList`.
     * @param ctx the parse tree
     */
    enterExpressionList?: (ctx: ExpressionListContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.expressionList`.
     * @param ctx the parse tree
     */
    exitExpressionList?: (ctx: ExpressionListContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.assignmentExpression`.
     * @param ctx the parse tree
     */
    enterAssignmentExpression?: (ctx: AssignmentExpressionContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.assignmentExpression`.
     * @param ctx the parse tree
     */
    exitAssignmentExpression?: (ctx: AssignmentExpressionContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.assignmentOperator`.
     * @param ctx the parse tree
     */
    enterAssignmentOperator?: (ctx: AssignmentOperatorContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.assignmentOperator`.
     * @param ctx the parse tree
     */
    exitAssignmentOperator?: (ctx: AssignmentOperatorContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.unaryOperator`.
     * @param ctx the parse tree
     */
    enterUnaryOperator?: (ctx: UnaryOperatorContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.unaryOperator`.
     * @param ctx the parse tree
     */
    exitUnaryOperator?: (ctx: UnaryOperatorContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.parameterList`.
     * @param ctx the parse tree
     */
    enterParameterList?: (ctx: ParameterListContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.parameterList`.
     * @param ctx the parse tree
     */
    exitParameterList?: (ctx: ParameterListContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.parameterDeclaration`.
     * @param ctx the parse tree
     */
    enterParameterDeclaration?: (ctx: ParameterDeclarationContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.parameterDeclaration`.
     * @param ctx the parse tree
     */
    exitParameterDeclaration?: (ctx: ParameterDeclarationContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.declaration`.
     * @param ctx the parse tree
     */
    enterDeclaration?: (ctx: DeclarationContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.declaration`.
     * @param ctx the parse tree
     */
    exitDeclaration?: (ctx: DeclarationContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.initDeclarator`.
     * @param ctx the parse tree
     */
    enterInitDeclarator?: (ctx: InitDeclaratorContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.initDeclarator`.
     * @param ctx the parse tree
     */
    exitInitDeclarator?: (ctx: InitDeclaratorContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.initializer`.
     * @param ctx the parse tree
     */
    enterInitializer?: (ctx: InitializerContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.initializer`.
     * @param ctx the parse tree
     */
    exitInitializer?: (ctx: InitializerContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.initializerList`.
     * @param ctx the parse tree
     */
    enterInitializerList?: (ctx: InitializerListContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.initializerList`.
     * @param ctx the parse tree
     */
    exitInitializerList?: (ctx: InitializerListContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.compoundStatement`.
     * @param ctx the parse tree
     */
    enterCompoundStatement?: (ctx: CompoundStatementContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.compoundStatement`.
     * @param ctx the parse tree
     */
    exitCompoundStatement?: (ctx: CompoundStatementContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.statement`.
     * @param ctx the parse tree
     */
    enterStatement?: (ctx: StatementContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.statement`.
     * @param ctx the parse tree
     */
    exitStatement?: (ctx: StatementContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.expressionStatement`.
     * @param ctx the parse tree
     */
    enterExpressionStatement?: (ctx: ExpressionStatementContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.expressionStatement`.
     * @param ctx the parse tree
     */
    exitExpressionStatement?: (ctx: ExpressionStatementContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.selectionStatement`.
     * @param ctx the parse tree
     */
    enterSelectionStatement?: (ctx: SelectionStatementContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.selectionStatement`.
     * @param ctx the parse tree
     */
    exitSelectionStatement?: (ctx: SelectionStatementContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.iterationStatement`.
     * @param ctx the parse tree
     */
    enterIterationStatement?: (ctx: IterationStatementContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.iterationStatement`.
     * @param ctx the parse tree
     */
    exitIterationStatement?: (ctx: IterationStatementContext) => void;
    /**
     * Enter a parse tree produced by `MockCParser.jumpStatement`.
     * @param ctx the parse tree
     */
    enterJumpStatement?: (ctx: JumpStatementContext) => void;
    /**
     * Exit a parse tree produced by `MockCParser.jumpStatement`.
     * @param ctx the parse tree
     */
    exitJumpStatement?: (ctx: JumpStatementContext) => void;
}
