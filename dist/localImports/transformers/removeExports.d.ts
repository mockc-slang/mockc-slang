import es from 'estree';
/**
 * Removes all export-related nodes from the AST.
 *
 * Export-related AST nodes are only needed in the local imports pre-processing
 * step to determine which functions/variables/expressions should be made
 * available to other files/modules. After which, they have no functional effect
 * on program evaluation.
 *
 * @param program The AST which should be stripped of export-related nodes.
 */
export declare const removeExports: (program: es.Program) => void;
