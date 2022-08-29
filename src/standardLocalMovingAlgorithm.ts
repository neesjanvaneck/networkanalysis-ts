import Random from 'java-random'
import IncrementalCPMClusteringAlgorithm from './incrementalCPMClusteringAlgorithm'
import Clustering from './clustering'
import Network from './network'
import { generateRandomPermutation } from './utils/arrays'

/**
 * Standard local moving algorithm.
 *
 * The standard local moving algorithm iterates over the nodes in a network. A
 * node is moved to the cluster that results in the largest increase in the
 * quality function. If the current cluster assignment of the node is already
 * optimal, the node is not moved. The algorithm continues iterating over the
 * nodes in a network until no more nodes can be moved.
 *
 * A fast variant of the standard local moving algorithm is provided by the
 * {@link FastLocalMovingAlgorithm}.
 */
export default class StandardLocalMovingAlgorithm extends IncrementalCPMClusteringAlgorithm {
  /**
   * Random number generator.
   */
  protected random!: Random

  /**
   * Constructs a standard local moving algorithm.
   */
  public constructor () {
    super()
    this.initializeBasedOnRandom(new Random())
  }

  /**
   * Initializes a standard local merging algorithm.
   *
   * @param random Random number generator
   */
  public initializeBasedOnRandom (random: Random): void {
    this.initializeBasedOnResolutionAndRandom(StandardLocalMovingAlgorithm.DEFAULT_RESOLUTION, random)
  }

  /**
   * Initializes a standard local merging algorithm for a specified resolution
   * parameter.
   *
   * @param resolution  Resolution parameter
   * @param random      Random number generator
   */
  public initializeBasedOnResolutionAndRandom (resolution: number, random: Random): void {
    super.initializeBasedOnResolution(resolution)
    this.random = random
  }

  /**
   * Clones the algorithm.
   *
   * @return Cloned algorithm
   */
  public clone (): StandardLocalMovingAlgorithm {
    const clonedAlgorithm = new StandardLocalMovingAlgorithm()
    clonedAlgorithm.resolution = this.resolution
    clonedAlgorithm.random = this.random
    return clonedAlgorithm
  }

  /**
   * Improves a clustering of the nodes in a network using the standard local
   * moving algorithm.
   *
   * The standard local moving algorithm iterates over the nodes in a
   * network. A node is moved to the cluster that results in the largest
   * increase in the quality function. If the current cluster assignment of
   * the node is already optimal, the node is not moved. The algorithm
   * continues iterating over the nodes in a network until no more nodes can
   * be moved.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Boolean indicating whether the clustering has been improved
   */
  public improveClustering (network: Network, clustering: Clustering): boolean {
    if (network.nNodes === 1) {
      return false
    }

    let update = false

    const clusterWeights = new Array<number>(network.nNodes).fill(0)
    const nNodesPerCluster = new Array<number>(network.nNodes).fill(0)
    for (let i = 0; i < network.nNodes; i++) {
      clusterWeights[clustering.clusters[i]] += network.nodeWeights[i]
      nNodesPerCluster[clustering.clusters[i]]++
    }

    let nUnusedClusters = 0
    const unusedClusters = new Array<number>(network.nNodes - 1).fill(0)
    for (let i = network.nNodes - 1; i >= 0; i--) {
      if (nNodesPerCluster[i] === 0) {
        unusedClusters[nUnusedClusters] = i
        nUnusedClusters++
      }
    }

    const nodeOrder = generateRandomPermutation(network.nNodes, this.random)

    /*
     * Iterate over the nodeOrder array in a cyclical manner. When the end
     * of the array has been reached, start again from the beginning.
     * Continue iterating until none of the last nNodes node visits has
     * resulted in a node movement.
     */
    const edgeWeightPerCluster = new Array<number>(network.nNodes).fill(0)
    const neighboringClusters = new Array<number>(network.nNodes).fill(0)
    let nUnstableNodes = network.nNodes
    let i = 0
    do {
      const j = nodeOrder[i]

      const currentCluster = clustering.clusters[j]

      // Remove the currently selected node from its current cluster.
      clusterWeights[currentCluster] -= network.nodeWeights[j]
      nNodesPerCluster[currentCluster]--
      if (nNodesPerCluster[currentCluster] === 0) {
        unusedClusters[nUnusedClusters] = currentCluster
        nUnusedClusters++
      }

      /*
       * Identify the neighboring clusters of the currently selected
       * node, that is, the clusters with which the currently selected
       * node is connected. An empty cluster is also included in the set
       * of neighboring clusters. In this way, it is always possible that
       * the currently selected node will be moved to an empty cluster.
       */
      neighboringClusters[0] = unusedClusters[nUnusedClusters - 1]
      let nNeighboringClusters = 1
      for (let k = network.firstNeighborIndices[j]; k < network.firstNeighborIndices[j + 1]; k++) {
        const l = clustering.clusters[network.neighbors[k]]
        if (edgeWeightPerCluster[l] === 0) {
          neighboringClusters[nNeighboringClusters] = l
          nNeighboringClusters++
        }
        edgeWeightPerCluster[l] += network.edgeWeights[k]
      }

      /*
       * For each neighboring cluster of the currently selected node,
       * calculate the increment of the quality function obtained by
       * moving the currently selected node to the neighboring cluster.
       * Determine the neighboring cluster for which the increment of the
       * quality function is largest. The currently selected node will be
       * moved to this optimal cluster. In order to guarantee convergence
       * of the algorithm, if the old cluster of the currently selected
       * node is optimal but there are also other optimal clusters, the
       * currently selected node will be moved back to its old cluster.
       */
      let bestCluster = currentCluster
      let maxQualityValueIncrement = edgeWeightPerCluster[currentCluster] - network.nodeWeights[j] * clusterWeights[currentCluster] * this.resolution
      for (let k = 0; k < nNeighboringClusters; k++) {
        const l = neighboringClusters[k]

        const qualityValueIncrement = edgeWeightPerCluster[l] - network.nodeWeights[j] * clusterWeights[l] * this.resolution
        if (qualityValueIncrement > maxQualityValueIncrement) {
          bestCluster = l
          maxQualityValueIncrement = qualityValueIncrement
        }

        edgeWeightPerCluster[l] = 0
      }

      /*
       * Move the currently selected node to its new cluster. Update the
       * clustering statistics.
       */
      clusterWeights[bestCluster] += network.nodeWeights[j]
      nNodesPerCluster[bestCluster]++
      if (bestCluster === unusedClusters[nUnusedClusters - 1]) {
        nUnusedClusters--
      }
      nUnstableNodes--

      /*
       * If the new cluster of the currently selected node is different
       * from the old cluster, some further updating of the clustering
       * statistics is performed.
       */
      if (bestCluster !== currentCluster) {
        clustering.clusters[j] = bestCluster
        if (bestCluster >= clustering.nClusters) {
          clustering.nClusters = bestCluster + 1
        }

        nUnstableNodes = network.nNodes

        update = true
      }

      i = (i < network.nNodes - 1) ? (i + 1) : 0
    } while (nUnstableNodes > 0)

    if (update) {
      clustering.removeEmptyClusters()
    }

    return update
  }
}
