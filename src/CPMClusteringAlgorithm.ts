import Clustering, { ClusteringParametersWithNNodes } from './clustering'
import Network from './network'
import QualityClusteringAlgorithm from './qualityClusteringAlgorithm'
import { calcMaximum } from './utils/arrays'

/**
 * Abstract base class for clustering algorithms that use the CPM quality
 * function.
 */
export default abstract class CPMClusteringAlgorithm implements QualityClusteringAlgorithm {
  /**
   * Default resolution parameter.
   */
  public static readonly DEFAULT_RESOLUTION: number = 1

  /**
   * Resolution parameter.
   */
  protected resolution!: number

  /**
   * Constructs a CPM clustering algorithm.
   */
  public constructor () {
    this.initializeBasedOnResolution(CPMClusteringAlgorithm.DEFAULT_RESOLUTION)
  }

  /**
   * Initializes a CPM clustering algorithm with a specified resolution
   * parameter.
   *
   * @param resolution Resolution parameter
   */
  public initializeBasedOnResolution (resolution: number): void {
    this.resolution = resolution
  }

  /**
   * Returns the resolution parameter.
   *
   * @return Resolution parameter
   */
  public getResolution (): number {
    return this.resolution
  }

  /**
   * Sets the resolution parameter.
   *
   * @param resolution Resolution parameter
   */
  public setResolution (resolution: number): void {
    this.resolution = resolution
  }

  /**
   * Calculates the quality of a clustering using the CPM quality function.
   *
   * The CPM quality function is given by
   *
   * ```
   * 1 / (2 * m) * sum(d(c[i], c[j]) * (a[i][j] - resolution * n[i] *
   * n[j])),
   * ```
   *
   * where `a[i][j]` is the weight of the edge between nodes `i` and `j`,
   * `n[i]` is the weight of node `i`, `m` is the total edge weight, and
   * `resolution` is the resolutionparameter. The function `d(c[i], c[j])`
   * equals 1 if nodes `i` and `j` belong to the same cluster and 0 otherwise.
   * The sum is taken over all pairs of nodes `i` and `j`.
   *
   * Modularity can be expressed in terms of CPM by setting `n[i]` equal to
   * the total weight of the edges between node `i` and its neighbors and by
   * rescaling the resolution parameter by `2 * m`.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Quality of the clustering
   */
  public calcQuality (network: Network, clustering: Clustering): number {
    let quality = 0

    for (let i = 0; i < network.nNodes; i++) {
      const j = clustering.clusters[i]
      for (let k = network.firstNeighborIndices[i]; k < network.firstNeighborIndices[i + 1]; k++) {
        if (clustering.clusters[network.neighbors[k]] === j) {
          quality += network.edgeWeights[k]
        }
      }
    }
    quality += network.totalEdgeWeightSelfLinks

    const clusterWeights = new Array<number>(clustering.nClusters).fill(0)
    for (let i = 0; i < network.nNodes; i++) {
      clusterWeights[clustering.clusters[i]] += network.nodeWeights[i]
    }
    for (let i = 0; i < clustering.nClusters; i++) {
      quality -= clusterWeights[i] * clusterWeights[i] * this.resolution
    }

    quality /= 2 * network.getTotalEdgeWeight() + network.totalEdgeWeightSelfLinks

    return quality
  }

  /**
   * Removes a cluster from a clustering by merging the cluster with another
   * cluster. If a cluster has no connections with other clusters, it cannot
   * be removed.
   *
   * @param network    Network
   * @param clustering Clustering
   * @param cluster    Cluster to be removed
   *
   * @return Cluster with which the cluster to be removed has been merged, or
   *         -1 if the cluster could not be removed
   */
  public removeCluster (network: Network, clustering: Clustering, cluster: number): number {
    const clusterWeights = new Array<number>(clustering.nClusters).fill(0)
    const totalEdgeWeightPerCluster = new Array<number>(clustering.nClusters).fill(0)
    for (let i = 0; i < network.nNodes; i++) {
      clusterWeights[clustering.clusters[i]] += network.nodeWeights[i]
      if (clustering.clusters[i] === cluster) {
        for (let j = network.firstNeighborIndices[i]; j < network.firstNeighborIndices[i + 1]; j++) {
          totalEdgeWeightPerCluster[clustering.clusters[network.neighbors[j]]] += network.edgeWeights[j]
        }
      }
    }

    let i = -1
    let maxQualityFunction = 0
    for (let j = 0; j < clustering.nClusters; j++) {
      if ((j !== cluster) && (clusterWeights[j] > 0)) {
        const qualityFunction = totalEdgeWeightPerCluster[j] / clusterWeights[j]
        if (qualityFunction > maxQualityFunction) {
          i = j
          maxQualityFunction = qualityFunction
        }
      }
    }

    if (i >= 0) {
      for (let j = 0; j < network.nNodes; j++) {
        if (clustering.clusters[j] === cluster) {
          clustering.clusters[j] = i
        }
      }
      if (cluster === clustering.nClusters - 1) {
        clustering.nClusters = calcMaximum(clustering.clusters) + 1
      }
    }

    return i
  }

  /**
   * Removes small clusters from a clustering. Clusters are merged until each
   * cluster contains at least a certain minimum number of nodes.
   *
   * @param network             Network
   * @param clustering          Clustering
   * @param minNNodesPerCluster Minimum number of nodes per cluster
   *
   * @return Boolean indicating whether any clusters have been removed
   */
  public removeSmallClustersBasedOnNNodes (network: Network, clustering: Clustering, minNNodesPerCluster: number): boolean {
    const reducedNetwork = network.createReducedNetwork(clustering)
    const clusteringReducedNetwork = new Clustering({ nNodes: reducedNetwork.nNodes } as ClusteringParametersWithNNodes)

    const nNodesPerCluster = clustering.getNNodesPerCluster()

    let i: number
    do {
      i = -1
      let nNodesSmallestCluster = minNNodesPerCluster
      for (let j = 0; j < clustering.nClusters; j++) {
        if ((nNodesPerCluster[j] > 0) && (nNodesPerCluster[j] < nNodesSmallestCluster)) {
          i = j
          nNodesSmallestCluster = nNodesPerCluster[j]
        }
      }

      if (i >= 0) {
        const j = this.removeCluster(reducedNetwork, clusteringReducedNetwork, i)
        if (j >= 0) {
          nNodesPerCluster[j] += nNodesPerCluster[i]
        }
        nNodesPerCluster[i] = 0
      }
    } while (i >= 0)

    clustering.mergeClusters(clusteringReducedNetwork)

    return clusteringReducedNetwork.nClusters < reducedNetwork.nNodes
  }

  /**
   * Removes small clusters from a clustering. Clusters are merged until each
   * cluster has at least a certain minimum total node weight.
   *
   * The total node weight of a cluster equals the sum of the weights of the
   * nodes belonging to the cluster.
   *
   * @param network          Network
   * @param clustering       Clustering
   * @param minClusterWeight Minimum total node weight of a cluster
   *
   * @return Boolean indicating whether any clusters have been removed
   */
  public removeSmallClustersBasedOnWeight (network: Network, clustering: Clustering, minClusterWeight: number): boolean {
    const reducedNetwork = network.createReducedNetwork(clustering)
    const clusteringReducedNetwork = new Clustering({ nNodes: reducedNetwork.nNodes } as ClusteringParametersWithNNodes)

    const clusterWeights = reducedNetwork.nodeWeights.slice()

    let i: number
    do {
      i = -1
      let weightSmallestCluster = minClusterWeight
      for (let j = 0; j < clusteringReducedNetwork.nClusters; j++) {
        if ((clusterWeights[j] > 0) && (clusterWeights[j] < weightSmallestCluster)) {
          i = j
          weightSmallestCluster = clusterWeights[j]
        }
      }

      if (i >= 0) {
        const j = this.removeCluster(reducedNetwork, clusteringReducedNetwork, i)
        if (j >= 0) {
          clusterWeights[j] += clusterWeights[i]
        }
        clusterWeights[i] = 0
      }
    } while (i >= 0)

    clustering.mergeClusters(clusteringReducedNetwork)

    return clusteringReducedNetwork.nClusters < reducedNetwork.nNodes
  }

  /**
   * Clones the algorithm.
   *
   * @return Cloned algorithm
   */
  public abstract clone (): CPMClusteringAlgorithm

  /**
   * Finds a clustering of the nodes in a network.
   *
   * @param network Network
   *
   * @return Clustering
   */
  public abstract findClustering (network: Network): Clustering
}
