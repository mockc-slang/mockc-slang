import { Context, CustomBuiltIns, Environment, Variant } from './types';
export declare class LazyBuiltIn {
    func: (...arg0: any) => any;
    evaluateArgs: boolean;
    constructor(func: (...arg0: any) => any, evaluateArgs: boolean);
}
export declare class EnvTree {
    private _root;
    private map;
    get root(): EnvTreeNode | null;
    insert(environment: Environment): void;
    getTreeNode(environment: Environment): EnvTreeNode | undefined;
}
export declare class EnvTreeNode {
    readonly environment: Environment;
    parent: EnvTreeNode | null;
    private _children;
    constructor(environment: Environment, parent: EnvTreeNode | null);
    get children(): EnvTreeNode[];
    resetChildren(newChildren: EnvTreeNode[]): void;
    private clearChildren;
    private addChildren;
    addChild(newChild: EnvTreeNode): EnvTreeNode;
}
export declare const createGlobalEnvironment: () => Environment;
export declare const createEmptyContext: <T>(variant: Variant, externalSymbols: string[], externalContext?: T | undefined, externalBuiltIns?: CustomBuiltIns) => Context<T>;
export declare const ensureGlobalEnvironmentExist: (context: Context) => void;
declare const createContext: <T>(variant?: Variant, externalSymbols?: string[], externalContext?: T | undefined, externalBuiltIns?: CustomBuiltIns) => Context;
export default createContext;
