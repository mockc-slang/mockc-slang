import { Identifier, Node, SourceLocation } from 'estree';
import { Context } from './types';
export declare function findIdentifierNode(root: Node, context: Context, loc: {
    line: number;
    column: number;
}): Identifier | undefined;
export declare function findDeclarationNode(program: Node, identifier: Identifier): Node | undefined;
export declare function isInLoc(line: number, col: number, location: SourceLocation): boolean;
export declare function findAncestors(root: Node, identifier: Identifier): Node[] | undefined;
