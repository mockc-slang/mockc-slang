import { SourceLocation } from 'acorn';
import * as es from 'estree';
import { EnvTree } from './createContext';
/**
 * Defines functions that act as built-ins, but might rely on
 * different implementations. e.g display() in a web application.
 */
export interface CustomBuiltIns {
    rawDisplay: (value: Value, str: string, externalContext: any) => Value;
    prompt: (value: Value, str: string, externalContext: any) => string | null;
    alert: (value: Value, str: string, externalContext: any) => void;
    visualiseList: (list: any, externalContext: any) => void;
}
export declare enum ErrorType {
    SYNTAX = "Syntax",
    TYPE = "Type",
    RUNTIME = "Runtime"
}
export declare enum ErrorSeverity {
    WARNING = "Warning",
    ERROR = "Error"
}
export interface SourceError {
    type: ErrorType;
    severity: ErrorSeverity;
    location: es.SourceLocation;
    explain(): string;
    elaborate(): string;
}
export interface Rule<T extends es.Node> {
    name: string;
    disableForVariants?: Variant[];
    checkers: {
        [name: string]: (node: T, ancestors: es.Node[]) => SourceError[];
    };
}
export interface Comment {
    type: 'Line' | 'Block';
    value: string;
    start: number;
    end: number;
    loc: SourceLocation | undefined;
}
export declare type ExecutionMethod = 'native' | 'interpreter' | 'auto';
export declare enum Chapter {
    CALC = 1
}
export declare enum Variant {
    DEFAULT = "calc"
}
export interface Language {
    chapter: Chapter;
    variant: Variant;
}
export declare type ValueWrapper = LetWrapper | ConstWrapper;
export interface LetWrapper {
    kind: 'let';
    getValue: () => Value;
    assignNewValue: <T>(newValue: T) => T;
}
export interface ConstWrapper {
    kind: 'const';
    getValue: () => Value;
}
export interface Context<T = any> {
    /** The external symbols that exist in the Context. */
    externalSymbols: string[];
    /** All the errors gathered */
    errors: SourceError[];
    /** Runtime Sepecific state */
    runtime: {
        break: boolean;
        debuggerOn: boolean;
        isRunning: boolean;
        environmentTree: EnvTree;
        environments: Environment[];
        nodes: es.Node[];
    };
    numberOfOuterEnvironments: number;
    prelude: string | null;
    /**
     * Used for storing external properties.
     * For e.g, this can be used to store some application-related
     * context for use in your own built-in functions (like `display(a)`)
     */
    externalContext?: T;
    /**
     * Describes the language processor to be used for evaluation
     */
    executionMethod: ExecutionMethod;
    /**
     * Describes the strategy / paradigm to be used for evaluation
     * Examples: lazy, concurrent or nondeterministic
     */
    variant: Variant;
    /**
     * Contains the evaluated code that has not yet been typechecked.
     */
    unTypecheckedCode: string[];
    /**
     * Storage container for module specific information and state
     */
    moduleContexts: {
        [name: string]: ModuleContext;
    };
    /**
     * Code previously executed in this context
     */
    previousCode: string[];
    /**
     * External builtins.
     * If defined, the user should call the appropriate method instead.
     * E.g. display in web application
     */
    externalBuiltIns: CustomBuiltIns;
}
export declare type ModuleContext = {
    state: null | any;
    tabs: null | any[];
};
export interface BlockFrame {
    type: string;
    loc?: es.SourceLocation | null;
    enclosingLoc?: es.SourceLocation | null;
    children: (DefinitionNode | BlockFrame)[];
}
export interface DefinitionNode {
    name: string;
    type: string;
    loc?: es.SourceLocation | null;
}
export interface Frame {
    [name: string]: any;
}
export declare type Value = any;
export declare type AllowedDeclarations = 'const' | 'let';
export interface Environment {
    id: string;
    name: string;
    tail: Environment | null;
    callExpression?: es.CallExpression;
    head: Frame;
    thisContext?: Value;
}
export interface Thunk {
    value: any;
    isMemoized: boolean;
    f: () => any;
}
export interface Error {
    status: 'error';
}
export interface Finished {
    status: 'finished';
    context: Context;
    value: Value;
}
export interface Suspended {
    status: 'suspended';
    it: IterableIterator<Value>;
    scheduler: Scheduler;
    context: Context;
}
export declare type SuspendedNonDet = Omit<Suspended, 'status'> & {
    status: 'suspended-non-det';
} & {
    value: Value;
};
export declare type Result = Suspended | SuspendedNonDet | Finished | Error;
export interface Scheduler {
    run(it: IterableIterator<Value>, context: Context): Promise<Result>;
}
export interface Directive extends es.ExpressionStatement {
    type: 'ExpressionStatement';
    expression: es.Literal;
    directive: string;
}
/** For use in the substituter, to differentiate between a function declaration in the expression position,
 * which has an id, as opposed to function expressions.
 */
export interface FunctionDeclarationExpression extends es.FunctionExpression {
    id: es.Identifier;
    body: es.BlockStatement;
}
/**
 * For use in the substituter: call expressions can be reduced into an expression if the block
 * only contains a single return statement; or a block, but has to be in the expression position.
 * This is NOT compliant with the ES specifications, just as an intermediate step during substitutions.
 */
export interface BlockExpression extends es.BaseExpression {
    type: 'BlockExpression';
    body: es.Statement[];
}
export declare type substituterNodes = es.Node | BlockExpression;
export declare type ContiguousArrayElementExpression = Exclude<es.ArrayExpression['elements'][0], null>;
export declare type ContiguousArrayElements = ContiguousArrayElementExpression[];
export declare type PrimitiveType = 'boolean' | 'null' | 'number' | 'string' | 'undefined';
export declare type TSAllowedTypes = 'any' | 'void';
export declare const disallowedTypes: readonly ["bigint", "never", "object", "symbol", "unknown"];
export declare type TSDisallowedTypes = typeof disallowedTypes[number];
export declare type TSBasicType = PrimitiveType | TSAllowedTypes | TSDisallowedTypes;
export declare type NodeWithInferredType<T extends es.Node> = InferredType & T;
export declare type FuncDeclWithInferredTypeAnnotation = NodeWithInferredType<es.FunctionDeclaration> & TypedFuncDecl;
export declare type InferredType = Untypable | Typed | NotYetTyped;
export interface TypedFuncDecl {
    functionInferredType?: Type;
}
export interface Untypable {
    typability?: 'Untypable';
    inferredType?: Type;
}
export interface NotYetTyped {
    typability?: 'NotYetTyped';
    inferredType?: Type;
}
export interface Typed {
    typability?: 'Typed';
    inferredType?: Type;
}
export declare type Constraint = 'none' | 'addable';
export declare type Type = Primitive | Variable | FunctionType | List | Pair | SArray | UnionType | LiteralType;
export interface Primitive {
    kind: 'primitive';
    name: PrimitiveType | TSAllowedTypes;
    value?: string | number | boolean;
}
export interface Variable {
    kind: 'variable';
    name: string;
    constraint: Constraint;
}
export interface FunctionType {
    kind: 'function';
    parameterTypes: Type[];
    returnType: Type;
}
export interface List {
    kind: 'list';
    elementType: Type;
    typeAsPair?: Pair;
}
export interface Pair {
    kind: 'pair';
    headType: Type;
    tailType: Type;
}
export interface SArray {
    kind: 'array';
    elementType: Type;
}
export interface UnionType {
    kind: 'union';
    types: Type[];
}
export interface LiteralType {
    kind: 'literal';
    value: string | number | boolean;
}
export declare type BindableType = Type | ForAll | PredicateType;
export interface ForAll {
    kind: 'forall';
    polyType: Type;
}
export interface PredicateType {
    kind: 'predicate';
    ifTrueType: Type | ForAll;
}
export declare type PredicateTest = {
    node: NodeWithInferredType<es.CallExpression>;
    ifTrueType: Type | ForAll;
    argVarName: string;
};
/**
 * Each element in the TypeEnvironment array represents a different scope
 * (e.g. first element is the global scope, last element is the closest).
 * Within each scope, variable types/declaration kinds, as well as type aliases, are stored.
 */
export declare type TypeEnvironment = {
    typeMap: Map<string, BindableType>;
    declKindMap: Map<string, AllowedDeclarations>;
    typeAliasMap: Map<string, Type>;
}[];
export declare type Command = Node | DeclarationExpression | LambdaExpression | ClosureExpression | Instruction;
export declare type Instruction = AssignmentInstruction | BranchInstruction | BinaryOpInstruction | PopInstruction | EnvironmentRestoreInstruction | MarkInstruction | ResetInstruction | ApplicationInstruction | WhileInstruction | LoadAddressInstruction | DerefStashValueInstruction | AddressInstruction | UnaryOpInstruction;
export declare type DeclarationExpression = {
    tag: 'DeclarationExpression';
    identifier: string;
    expr: Command;
};
export declare type DerefStashValueInstruction = {
    tag: 'DerefStashValueInstruction';
};
export declare type AddressInstruction = {
    tag: 'AddressInstruction';
};
export declare type LoadAddressInstruction = {
    tag: 'LoadAddressInstruction';
    identifier: string;
};
export declare type WhileInstruction = {
    tag: 'WhileInstruction';
    pred: ExpressionListNode;
    body: StatementNode;
};
export declare type AssignmentInstruction = {
    tag: 'AssignmentInstruction';
};
export declare type LambdaExpression = {
    tag: 'LambdaExpression';
    prms: ParameterListNode;
    body: CompoundStatementNode;
};
export declare type BranchInstruction = {
    tag: 'BranchInstruction';
    cons: Command;
    alt?: Command;
};
export declare type BinaryOpInstruction = {
    tag: 'BinaryOpInstruction';
    sym: string;
};
export declare type UnaryOpInstruction = {
    tag: 'UnaryOpInstruction';
    sym: string;
};
export declare type PopInstruction = {
    tag: 'Pop';
};
export declare type EnvironmentRestoreInstruction = {
    tag: 'EnvironmentRestoreInstruction';
    env: DataView;
    variableLookupEnv: string[][];
};
export declare type MarkInstruction = {
    tag: 'MarkInstruction';
};
export declare type ResetInstruction = {
    tag: 'ResetInstruction';
};
export declare type ApplicationInstruction = {
    tag: 'ApplicationInstruction';
    arity: number;
};
export declare type ClosureExpression = {
    tag: 'Closure';
    prms: ParameterListNode;
    body: CompoundStatementNode;
};
export declare type Node = CompilationUnitNode | TranslationUnitNode | ExternalDeclarationNode | FunctionDefinitionNode | DeclarationNode | TypeSpecifierNode | InitDeclaratorNode | DeclaratorNode | DirectDeclaratorNode | PointerNode | InitializerNode | ExpressionNode | StatementNode | ParameterDeclarationNode | ParameterListNode;
export declare type ExpressionNode = ConditionalExpressionNode | BinaryOpExpressionNode | AssignmentExpressionNode | FunctionApplicationNode | NumberNode | StringLiteralNode | CharacterLiteralNode | IdentifierNode | ExpressionListNode | UnaryExpressionNode;
export declare type StatementNode = ExpressionStatementNode | CompoundStatementNode | SelectionStatementNode | IterationStatementNode | JumpStatementNode;
export declare type IterationStatementNode = WhileStatementNode;
export declare type JumpStatementNode = BreakStatementNode | ContinueStatementNode | ReturnStatementNode;
export declare type CompilationUnitNode = {
    tag: 'CompilationUnit';
    translationUnit?: TranslationUnitNode;
};
export declare type TranslationUnitNode = {
    tag: 'TranslationUnit';
    externalDeclarations: ExternalDeclarationNode[];
};
export declare type ExternalDeclarationNode = {
    tag: 'ExternalDeclaration';
    functionDefinition?: FunctionDefinitionNode;
    declaration?: DeclarationNode;
};
export declare type FunctionDefinitionNode = {
    tag: 'FunctionDefinition';
    type: string;
    declarator: DeclaratorNode;
    body: CompoundStatementNode;
};
export declare type DeclarationNode = {
    tag: 'Declaration';
    type: string;
    declarator: DeclaratorNode;
    initializer?: InitializerNode;
};
export declare type TypeSpecifierNode = {
    tag: 'TypeSpecifier';
    type: string;
};
export declare type InitDeclaratorNode = {
    tag: 'InitDeclarator';
    declarator: DeclaratorNode;
    initializer?: InitializerNode;
};
export declare type CompoundStatementNode = {
    tag: 'CompoundStatement';
    statements: (DeclarationNode | StatementNode)[];
};
export declare type ExpressionStatementNode = {
    tag: 'ExpressionStatement';
    exprs: ExpressionListNode;
};
export declare type SelectionStatementNode = {
    tag: 'SelectionStatement';
    pred: ExpressionListNode;
    cons: StatementNode;
    alt?: StatementNode;
};
export declare type WhileStatementNode = {
    tag: 'WhileStatement';
    pred: ExpressionListNode;
    body: StatementNode;
};
export declare type BreakStatementNode = {
    tag: 'BreakStatement';
};
export declare type ContinueStatementNode = {
    tag: 'ContinueStatement';
};
export declare type ReturnStatementNode = {
    tag: 'ReturnStatement';
    exprs: ExpressionListNode;
};
export declare type DeclaratorNode = {
    tag: 'Declarator';
    directDeclarator: DirectDeclaratorNode;
    pointer?: PointerNode;
};
export declare type DirectDeclaratorNode = {
    tag: 'DirectDeclarator';
    identifier: string;
    parameterList: ParameterListNode;
};
export declare type PointerNode = {
    tag: 'Pointer';
    pointer?: PointerNode;
};
export declare type ParameterListNode = {
    tag: 'ParameterList';
    parameters: ParameterDeclarationNode[];
};
export declare type ParameterDeclarationNode = {
    tag: 'ParameterDeclaration';
    type: string;
    declarator: DeclaratorNode;
};
export declare type InitializerNode = {
    tag: 'Initializer';
    expr?: ExpressionNode;
};
export declare type AssignmentExpressionNode = {
    tag: 'AssignmentExpression';
    leftExpr: ExpressionNode;
    sym: string;
    rightExpr: ExpressionNode;
};
export declare type ConditionalExpressionNode = {
    tag: 'ConditionalExpression';
    pred: ExpressionNode;
    cons: ExpressionNode;
    alt: ExpressionNode;
};
export declare type FunctionApplicationNode = {
    tag: 'FunctionApplication';
    identifier: string;
    params: ExpressionNode[];
};
export declare type NumberNode = {
    tag: 'Number';
    val: number;
};
export declare type StringLiteralNode = {
    tag: 'StringLiteral';
    val: string;
};
export declare type CharacterLiteralNode = {
    tag: 'CharacterLiteral';
    val: string;
};
export declare type IdentifierNode = {
    tag: 'Identifier';
    val: string;
};
export declare type ExpressionListNode = {
    tag: 'ExpressionList';
    exprs: ExpressionNode[];
};
export declare type BinaryOpExpressionNode = {
    tag: 'BinaryOpExpression';
    sym: string;
    leftExpr: ExpressionNode;
    rightExpr: ExpressionNode;
};
export declare type UnaryExpressionNode = {
    tag: 'UnaryExpression';
    sym: string;
    expr: ExpressionNode;
};
