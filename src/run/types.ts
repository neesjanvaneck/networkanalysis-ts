/**
 * A node in a network.
 */
export type Node = {
  /**
   * ID of a node.
   */
  id: string | number

  /**
   * Horizontal coordinate of a node. If the coordinates of a node are specified
   * before running the layout algorithm, they will be used in the initial
   * layout.
   */
  x?: number

  /**
   * Vertical coordinate of a node. If the coordinates of a node are specified
   * before running the layout algorithm, they will be used in the initial
   * layout.
   */
  y?: number

  /**
   * Cluster to which a node belongs. A cluster is represented by a integer. If
   * the cluster of a node is specified before running the clustering algorithm,
   * it will be used in the initial clustering.
   */
  cluster?: number
}

/**
 * A link in a network.
 */
export type Link = {
  /**
   * ID of a source node.
   */
  node1: Node

  /**
   * ID of a target node.
   */
  node2: Node

  /**
   * Weight of the link between a source node and a target node. The weight is a
   * non-negative number.
   */
  weight?: number
}
