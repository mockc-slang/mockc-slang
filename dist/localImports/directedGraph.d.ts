/**
 * The result of attempting to find a topological ordering
 * of nodes on a DirectedGraph.
 */
export declare type TopologicalOrderResult = {
    isValidTopologicalOrderFound: true;
    topologicalOrder: string[];
    firstCycleFound: null;
} | {
    isValidTopologicalOrderFound: false;
    topologicalOrder: null;
    firstCycleFound: string[];
};
/**
 * Represents a directed graph which disallows self-loops.
 */
export declare class DirectedGraph {
    private readonly adjacencyList;
    private readonly differentKeysError;
    constructor();
    /**
     * Adds a directed edge to the graph from the source node to
     * the destination node. Self-loops are not allowed.
     *
     * @param sourceNode      The name of the source node.
     * @param destinationNode The name of the destination node.
     */
    addEdge(sourceNode: string, destinationNode: string): void;
    /**
     * Returns whether the directed edge from the source node to the
     * destination node exists in the graph.
     *
     * @param sourceNode      The name of the source node.
     * @param destinationNode The name of the destination node.
     */
    hasEdge(sourceNode: string, destinationNode: string): boolean;
    /**
     * Calculates the in-degree of every node in the directed graph.
     *
     * The in-degree of a node is the number of edges coming into
     * the node.
     */
    private calculateInDegrees;
    /**
     * Finds a cycle of nodes in the directed graph. This operates on the
     * invariant that any nodes left over with a non-zero in-degree after
     * Kahn's algorithm has been run is part of a cycle.
     *
     * @param inDegrees The number of edges coming into each node after
     *                  running Kahn's algorithm.
     */
    private findCycle;
    /**
     * Returns a topological ordering of the nodes in the directed
     * graph if the graph is acyclic. Otherwise, returns null.
     *
     * To get the topological ordering, Kahn's algorithm is used.
     */
    getTopologicalOrder(): TopologicalOrderResult;
}
