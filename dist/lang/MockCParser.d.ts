import { ATN } from "antlr4ts/atn/ATN";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { RuleContext } from "antlr4ts/RuleContext";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { MockCListener } from "./MockCListener";
import { MockCVisitor } from "./MockCVisitor";
export declare class MockCParser extends Parser {
    static readonly T__0 = 1;
    static readonly T__1 = 2;
    static readonly T__2 = 3;
    static readonly T__3 = 4;
    static readonly T__4 = 5;
    static readonly T__5 = 6;
    static readonly T__6 = 7;
    static readonly T__7 = 8;
    static readonly T__8 = 9;
    static readonly T__9 = 10;
    static readonly T__10 = 11;
    static readonly T__11 = 12;
    static readonly T__12 = 13;
    static readonly T__13 = 14;
    static readonly T__14 = 15;
    static readonly T__15 = 16;
    static readonly T__16 = 17;
    static readonly T__17 = 18;
    static readonly T__18 = 19;
    static readonly T__19 = 20;
    static readonly T__20 = 21;
    static readonly T__21 = 22;
    static readonly T__22 = 23;
    static readonly T__23 = 24;
    static readonly T__24 = 25;
    static readonly T__25 = 26;
    static readonly T__26 = 27;
    static readonly T__27 = 28;
    static readonly T__28 = 29;
    static readonly T__29 = 30;
    static readonly T__30 = 31;
    static readonly T__31 = 32;
    static readonly WHITESPACE = 33;
    static readonly STRING_LITERAL = 34;
    static readonly CHARACTER_LITERAL = 35;
    static readonly NUMBER = 36;
    static readonly IDENTIFIER = 37;
    static readonly BLOCK_COMMENT = 38;
    static readonly LINE_COMMENT = 39;
    static readonly RULE_compilationUnit = 0;
    static readonly RULE_translationUnit = 1;
    static readonly RULE_externalDeclaration = 2;
    static readonly RULE_functionDefinition = 3;
    static readonly RULE_typeSpecifier = 4;
    static readonly RULE_declarator = 5;
    static readonly RULE_pointer = 6;
    static readonly RULE_directDeclarator = 7;
    static readonly RULE_constantExpression = 8;
    static readonly RULE_conditionalExpression = 9;
    static readonly RULE_logicalOrExpression = 10;
    static readonly RULE_logicalAndExpression = 11;
    static readonly RULE_equalityExpression = 12;
    static readonly RULE_relationalExpression = 13;
    static readonly RULE_additiveExpression = 14;
    static readonly RULE_multiplicativeExpression = 15;
    static readonly RULE_unaryExpression = 16;
    static readonly RULE_postfixExpression = 17;
    static readonly RULE_argumentExpressionList = 18;
    static readonly RULE_primaryExpression = 19;
    static readonly RULE_expressionList = 20;
    static readonly RULE_assignmentExpression = 21;
    static readonly RULE_assignmentOperator = 22;
    static readonly RULE_unaryOperator = 23;
    static readonly RULE_parameterList = 24;
    static readonly RULE_parameterDeclaration = 25;
    static readonly RULE_declaration = 26;
    static readonly RULE_initDeclarator = 27;
    static readonly RULE_initializer = 28;
    static readonly RULE_initializerList = 29;
    static readonly RULE_compoundStatement = 30;
    static readonly RULE_statement = 31;
    static readonly RULE_expressionStatement = 32;
    static readonly RULE_selectionStatement = 33;
    static readonly RULE_iterationStatement = 34;
    static readonly RULE_jumpStatement = 35;
    static readonly ruleNames: string[];
    private static readonly _LITERAL_NAMES;
    private static readonly _SYMBOLIC_NAMES;
    static readonly VOCABULARY: Vocabulary;
    get vocabulary(): Vocabulary;
    get grammarFileName(): string;
    get ruleNames(): string[];
    get serializedATN(): string;
    protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException;
    constructor(input: TokenStream);
    compilationUnit(): CompilationUnitContext;
    translationUnit(): TranslationUnitContext;
    externalDeclaration(): ExternalDeclarationContext;
    functionDefinition(): FunctionDefinitionContext;
    typeSpecifier(): TypeSpecifierContext;
    declarator(): DeclaratorContext;
    pointer(): PointerContext;
    directDeclarator(): DirectDeclaratorContext;
    constantExpression(): ConstantExpressionContext;
    conditionalExpression(): ConditionalExpressionContext;
    logicalOrExpression(): LogicalOrExpressionContext;
    logicalOrExpression(_p: number): LogicalOrExpressionContext;
    logicalAndExpression(): LogicalAndExpressionContext;
    logicalAndExpression(_p: number): LogicalAndExpressionContext;
    equalityExpression(): EqualityExpressionContext;
    equalityExpression(_p: number): EqualityExpressionContext;
    relationalExpression(): RelationalExpressionContext;
    relationalExpression(_p: number): RelationalExpressionContext;
    additiveExpression(): AdditiveExpressionContext;
    additiveExpression(_p: number): AdditiveExpressionContext;
    multiplicativeExpression(): MultiplicativeExpressionContext;
    multiplicativeExpression(_p: number): MultiplicativeExpressionContext;
    unaryExpression(): UnaryExpressionContext;
    postfixExpression(): PostfixExpressionContext;
    postfixExpression(_p: number): PostfixExpressionContext;
    argumentExpressionList(): ArgumentExpressionListContext;
    primaryExpression(): PrimaryExpressionContext;
    expressionList(): ExpressionListContext;
    assignmentExpression(): AssignmentExpressionContext;
    assignmentOperator(): AssignmentOperatorContext;
    unaryOperator(): UnaryOperatorContext;
    parameterList(): ParameterListContext;
    parameterDeclaration(): ParameterDeclarationContext;
    declaration(): DeclarationContext;
    initDeclarator(): InitDeclaratorContext;
    initializer(): InitializerContext;
    initializerList(): InitializerListContext;
    initializerList(_p: number): InitializerListContext;
    compoundStatement(): CompoundStatementContext;
    statement(): StatementContext;
    expressionStatement(): ExpressionStatementContext;
    selectionStatement(): SelectionStatementContext;
    iterationStatement(): IterationStatementContext;
    jumpStatement(): JumpStatementContext;
    sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean;
    private logicalOrExpression_sempred;
    private logicalAndExpression_sempred;
    private equalityExpression_sempred;
    private relationalExpression_sempred;
    private additiveExpression_sempred;
    private multiplicativeExpression_sempred;
    private postfixExpression_sempred;
    private initializerList_sempred;
    static readonly _serializedATN: string;
    static __ATN: ATN;
    static get _ATN(): ATN;
}
export declare class CompilationUnitContext extends ParserRuleContext {
    EOF(): TerminalNode;
    translationUnit(): TranslationUnitContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class TranslationUnitContext extends ParserRuleContext {
    externalDeclaration(): ExternalDeclarationContext[];
    externalDeclaration(i: number): ExternalDeclarationContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ExternalDeclarationContext extends ParserRuleContext {
    functionDefinition(): FunctionDefinitionContext | undefined;
    declaration(): DeclarationContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class FunctionDefinitionContext extends ParserRuleContext {
    typeSpecifier(): TypeSpecifierContext;
    declarator(): DeclaratorContext;
    compoundStatement(): CompoundStatementContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class TypeSpecifierContext extends ParserRuleContext {
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class DeclaratorContext extends ParserRuleContext {
    directDeclarator(): DirectDeclaratorContext;
    pointer(): PointerContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class PointerContext extends ParserRuleContext {
    pointer(): PointerContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class DirectDeclaratorContext extends ParserRuleContext {
    IDENTIFIER(): TerminalNode;
    parameterList(): ParameterListContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ConstantExpressionContext extends ParserRuleContext {
    conditionalExpression(): ConditionalExpressionContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ConditionalExpressionContext extends ParserRuleContext {
    logicalOrExpression(): LogicalOrExpressionContext;
    expressionList(): ExpressionListContext | undefined;
    conditionalExpression(): ConditionalExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class LogicalOrExpressionContext extends ParserRuleContext {
    logicalAndExpression(): LogicalAndExpressionContext;
    logicalOrExpression(): LogicalOrExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class LogicalAndExpressionContext extends ParserRuleContext {
    equalityExpression(): EqualityExpressionContext;
    logicalAndExpression(): LogicalAndExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class EqualityExpressionContext extends ParserRuleContext {
    relationalExpression(): RelationalExpressionContext;
    equalityExpression(): EqualityExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class RelationalExpressionContext extends ParserRuleContext {
    additiveExpression(): AdditiveExpressionContext;
    relationalExpression(): RelationalExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class AdditiveExpressionContext extends ParserRuleContext {
    multiplicativeExpression(): MultiplicativeExpressionContext;
    additiveExpression(): AdditiveExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class MultiplicativeExpressionContext extends ParserRuleContext {
    unaryExpression(): UnaryExpressionContext;
    multiplicativeExpression(): MultiplicativeExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class UnaryExpressionContext extends ParserRuleContext {
    postfixExpression(): PostfixExpressionContext | undefined;
    unaryOperator(): UnaryOperatorContext | undefined;
    unaryExpression(): UnaryExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class PostfixExpressionContext extends ParserRuleContext {
    primaryExpression(): PrimaryExpressionContext | undefined;
    postfixExpression(): PostfixExpressionContext | undefined;
    argumentExpressionList(): ArgumentExpressionListContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ArgumentExpressionListContext extends ParserRuleContext {
    assignmentExpression(): AssignmentExpressionContext[];
    assignmentExpression(i: number): AssignmentExpressionContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class PrimaryExpressionContext extends ParserRuleContext {
    IDENTIFIER(): TerminalNode | undefined;
    STRING_LITERAL(): TerminalNode | undefined;
    NUMBER(): TerminalNode | undefined;
    expressionList(): ExpressionListContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ExpressionListContext extends ParserRuleContext {
    assignmentExpression(): AssignmentExpressionContext[];
    assignmentExpression(i: number): AssignmentExpressionContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class AssignmentExpressionContext extends ParserRuleContext {
    conditionalExpression(): ConditionalExpressionContext | undefined;
    unaryExpression(): UnaryExpressionContext | undefined;
    assignmentOperator(): AssignmentOperatorContext | undefined;
    assignmentExpression(): AssignmentExpressionContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class AssignmentOperatorContext extends ParserRuleContext {
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class UnaryOperatorContext extends ParserRuleContext {
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ParameterListContext extends ParserRuleContext {
    parameterDeclaration(): ParameterDeclarationContext[];
    parameterDeclaration(i: number): ParameterDeclarationContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ParameterDeclarationContext extends ParserRuleContext {
    typeSpecifier(): TypeSpecifierContext;
    declarator(): DeclaratorContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class DeclarationContext extends ParserRuleContext {
    typeSpecifier(): TypeSpecifierContext;
    initDeclarator(): InitDeclaratorContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class InitDeclaratorContext extends ParserRuleContext {
    declarator(): DeclaratorContext;
    initializer(): InitializerContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class InitializerContext extends ParserRuleContext {
    assignmentExpression(): AssignmentExpressionContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class InitializerListContext extends ParserRuleContext {
    initializer(): InitializerContext;
    initializerList(): InitializerListContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class CompoundStatementContext extends ParserRuleContext {
    declaration(): DeclarationContext[];
    declaration(i: number): DeclarationContext;
    statement(): StatementContext[];
    statement(i: number): StatementContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class StatementContext extends ParserRuleContext {
    expressionStatement(): ExpressionStatementContext | undefined;
    compoundStatement(): CompoundStatementContext | undefined;
    selectionStatement(): SelectionStatementContext | undefined;
    iterationStatement(): IterationStatementContext | undefined;
    jumpStatement(): JumpStatementContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class ExpressionStatementContext extends ParserRuleContext {
    expressionList(): ExpressionListContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class SelectionStatementContext extends ParserRuleContext {
    expressionList(): ExpressionListContext;
    statement(): StatementContext[];
    statement(i: number): StatementContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class IterationStatementContext extends ParserRuleContext {
    expressionList(): ExpressionListContext;
    statement(): StatementContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
export declare class JumpStatementContext extends ParserRuleContext {
    expressionList(): ExpressionListContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    get ruleIndex(): number;
    enterRule(listener: MockCListener): void;
    exitRule(listener: MockCListener): void;
    accept<Result>(visitor: MockCVisitor<Result>): Result;
}
