import { calcMaximum } from './utils/arrays'

/**
 * Interface for specifying the number of nodes when constructing a clustering.
 */
export interface ClusteringParametersWithNNodes {
  /**
   * Number of nodes.
   */
  nNodes: number
}

/**
 * Interface for specifying the cluster for each node when constructing a
 * clustering.
 */
export interface ClusteringParametersWithClusters {
  /**
   * Cluster of each node.
   */
  clusters: number[]
}

/**
 * Clustering of the nodes in a network.
 *
 * Each node belongs to exactly one cluster.
 */
export default class Clustering {
  /**
   * Cluster of each node.
   */
  public clusters!: number[]

  /**
   * Number of clusters.
   */
  public nClusters!: number

  /**
   * Number of nodes.
   */
  protected nNodes!: number

  /**
   * Constructs a clustering.
   *
   * @param parameters Clustering constructor parameters
   */
  public constructor (parameters: ClusteringParametersWithNNodes | ClusteringParametersWithClusters) {
    if (typeof (parameters as ClusteringParametersWithNNodes).nNodes !== 'undefined') {
      const clusteringParameters = parameters as ClusteringParametersWithNNodes
      this.initializeBasedOnNNodes(clusteringParameters.nNodes)
    } else if (typeof (parameters as ClusteringParametersWithClusters).clusters !== 'undefined') {
      const clusteringParameters = parameters as ClusteringParametersWithClusters
      this.initializeBasedOnClusters(clusteringParameters.clusters)
    }
  }

  /**
   * Initializes a singleton clustering for a specified number of nodes.
   *
   * @param nNodes Number of nodes
   */
  public initializeBasedOnNNodes (nNodes: number): void {
    this.nNodes = nNodes
    this.initSingletonClustersHelper()
  }

  /**
   * Initializes a clustering using a specified cluster for each node.
   *
   * @param clusters Cluster of each node
   */
  public initializeBasedOnClusters (clusters: number[]): void {
    this.nNodes = clusters.length
    this.clusters = clusters.slice()
    this.nClusters = calcMaximum(clusters) + 1
  }

  /**
   * Clones the clustering.
   *
   * @return Cloned clustering
   */
  public clone (): Clustering {
    const clonedClustering = new Clustering({ nNodes: this.nNodes } as ClusteringParametersWithNNodes)
    clonedClustering.nClusters = this.nClusters
    clonedClustering.clusters = this.clusters.slice()
    return clonedClustering
  }

  /**
   * Returns the number of nodes.
   *
   * @return Number of nodes
   */
  public getNNodes (): number {
    return this.nNodes
  }

  /**
   * Returns the number of clusters.
   *
   * @return Number of clusters
   */
  public getNClusters (): number {
    return this.nClusters
  }

  /**
   * Returns the cluster of each node.
   *
   * @return Cluster of each node
   */
  public getClusters (): number[] {
    return this.clusters.slice()
  }

  /**
   * Returns the cluster of a node.
   *
   * @param node Node
   *
   * @return Cluster
   */
  public getCluster (node: number): number {
    return this.clusters[node]
  }

  /**
   * Returns the number of nodes per cluster.
   *
   * @return Number of nodes per cluster
   */
  public getNNodesPerCluster (): number[] {
    const nNodesPerCluster = new Array<number>(this.nClusters).fill(0)
    for (let i = 0; i < this.nNodes; i++) {
      nNodesPerCluster[this.clusters[i]]++
    }
    return nNodesPerCluster
  }

  /**
   * Returns a list of nodes per cluster.
   *
   * @return List of nodes per cluster
   */
  public getNodesPerCluster (): number[][] {
    const nodesPerCluster = new Array<Array<number>>(this.nClusters)
    const nNodesPerCluster = this.getNNodesPerCluster()
    for (let i = 0; i < this.nClusters; i++) {
      nodesPerCluster[i] = new Array<number>(nNodesPerCluster[i]).fill(0)
      nNodesPerCluster[i] = 0
    }
    for (let i = 0; i < this.nNodes; i++) {
      nodesPerCluster[this.clusters[i]][nNodesPerCluster[this.clusters[i]]] = i
      nNodesPerCluster[this.clusters[i]]++
    }
    return nodesPerCluster
  }

  /**
   * Assigns a node to a cluster.
   *
   * @param node    Node
   * @param cluster Cluster
   */
  public setCluster (node: number, cluster: number): void {
    this.clusters[node] = cluster
    this.nClusters = Math.max(this.nClusters, cluster + 1)
  }

  /**
   * Initializes a singleton clustering.
   *
   * Each node `i` is assigned to a cluster `i`.
   */
  public initSingletonClusters (): void {
    this.initSingletonClustersHelper()
  }

  /**
   * Removes empty clusters.
   *
   * Clusters are relabeled to follow a strictly consecutive numbering
   * `0, ..., nClusters - 1`.
   */
  public removeEmptyClusters (): void {
    const nonEmptyClusters = new Array<boolean>(this.nClusters).fill(false)
    const newClusters = new Array<number>(this.nClusters).fill(0)
    for (let i = 0; i < this.nNodes; i++) {
      nonEmptyClusters[this.clusters[i]] = true
    }
    let i = 0
    for (let j = 0; j < this.nClusters; j++) {
      if (nonEmptyClusters[j]) {
        newClusters[j] = i
        i++
      }
    }
    this.nClusters = i
    for (i = 0; i < this.nNodes; i++) {
      this.clusters[i] = newClusters[this.clusters[i]]
    }
  }

  /**
   * Orders the clusters in decreasing order of their number of nodes.
   *
   * @see {@link orderClustersByWeight}
   */
  public orderClustersByNNodes (): void {
    this.orderClustersByWeight(new Array<number>(this.nNodes).fill(1))
  }

  /**
   * Orders the clusters in decreasing order of their total node weight.
   *
   * The total node weight of a cluster equals the sum of the weights of the
   * nodes belonging to the cluster.
   *
   * @param nodeWeights Node weights
   *
   * @see {@link orderClustersByNNodes}
   */
  public orderClustersByWeight (nodeWeights: number[]): void {
    interface Cluster {
      cluster: number
      weight: number
    }

    const clusterWeights = new Array<number>(this.nClusters).fill(0)
    for (let i = 0; i < this.nNodes; i++) {
      clusterWeights[this.clusters[i]] += nodeWeights[i]
    }
    const clusters = new Array<Cluster>(this.nClusters)
    for (let i = 0; i < this.nClusters; i++) {
      clusters[i] = {
        cluster: i,
        weight: clusterWeights[i],
      }
    }

    clusters.sort((a, b) => ((b.weight > a.weight) ? 1 : ((b.weight < a.weight) ? -1 : 0)))

    const newClusters = new Array<number>(this.nClusters).fill(0)
    let i = 0
    do {
      newClusters[clusters[i].cluster] = i
      i++
    } while ((i < this.nClusters) && (clusters[i].weight > 0))
    this.nClusters = i
    for (i = 0; i < this.nNodes; i++) {
      this.clusters[i] = newClusters[this.clusters[i]]
    }
  }

  /**
   * Merges the clusters based on a clustering of the clusters.
   *
   * @param clustering Clustering of the clusters
   */
  public mergeClusters (clustering: Clustering): void {
    for (let i = 0; i < this.nNodes; i++) {
      this.clusters[i] = clustering.clusters[this.clusters[i]]
    }
    this.nClusters = clustering.nClusters
  }

  private initSingletonClustersHelper (): void {
    this.clusters = new Array<number>(this.nNodes)
    for (let i = 0; i < this.nNodes; i++) {
      this.clusters[i] = i
    }
    this.nClusters = this.nNodes
  }
}
