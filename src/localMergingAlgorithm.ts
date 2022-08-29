import Random from 'java-random'
import CPMClusteringAlgorithm from './CPMClusteringAlgorithm'
import Clustering, { ClusteringParametersWithNNodes } from './clustering'
import Network from './network'
import { generateRandomPermutation } from './utils/arrays'
import { fastExp } from './utils/fastMath'

/**
 * Local merging algorithm.
 *
 * The local merging algorithm starts from a singleton partition. It performs a
 * single iteration over the nodes in a network. Each node belonging to a
 * singleton cluster is considered for merging with another cluster. This
 * cluster is chosen randomly from all clusters that do not result in a
 * decrease in the quality function. The larger the increase in the quality
 * function, the more likely a cluster is to be chosen. The strength of this
 * effect is determined by the randomness parameter. The higher the value of
 * the randomness parameter, the stronger the randomness in the choice of a
 * cluster. The lower the value of the randomness parameter, the more likely
 * the cluster resulting in the largest increase in the quality function is to
 * be chosen. A node is merged with a cluster only if both are sufficiently
 * well connected to the rest of the network.
 *
 * The local merging algorithm is used in the cluster refinement phase of the
 * {@link LeidenAlgorithm}.
 */
export default class LocalMergingAlgorithm extends CPMClusteringAlgorithm {
  /**
   * Default randomness parameter.
   */
  public static readonly DEFAULT_RANDOMNESS: number = 1e-2

  /**
   * Randomness parameter.
   */
  protected randomness!: number

  /**
   * Random number generator.
   */
  protected random!: Random

  /**
   * Constructs a local merging algorithm.
   */
  public constructor () {
    super()
    this.initializeBasedOnRandom(new Random())
  }

  /**
   * Initializes a local merging algorithm.
   *
   * @param random Random number generator
   */
  public initializeBasedOnRandom (random: Random): void {
    this.initializeBasedOnResolutionAndRandomnessAndRandom(LocalMergingAlgorithm.DEFAULT_RESOLUTION, LocalMergingAlgorithm.DEFAULT_RANDOMNESS, random)
  }

  /**
   * Initializes a local merging algorithm for a specified resolution
   * parameter and randomness parameter.
   *
   * @param resolution Resolution parameter
   * @param randomness Randomness parameter
   * @param random     Random number generator
   */
  public initializeBasedOnResolutionAndRandomnessAndRandom (resolution: number, randomness: number, random: Random): void {
    super.initializeBasedOnResolution(resolution)
    this.randomness = randomness
    this.random = random
  }

  /**
   * Clones the algorithm.
   *
   * @return Cloned algorithm
   */
  public clone (): LocalMergingAlgorithm {
    const clonedAlgorithm = new LocalMergingAlgorithm()
    clonedAlgorithm.resolution = this.resolution
    clonedAlgorithm.randomness = this.randomness
    clonedAlgorithm.random = this.random
    return clonedAlgorithm
  }

  /**
   * Returns the randomness parameter.
   *
   * @return Randomness
   */
  public getRandomness (): number {
    return this.randomness
  }

  /**
   * Sets the randomness parameter.
   *
   * @param randomness Randomness
   */
  public setRandomness (randomness: number): void {
    this.randomness = randomness
  }

  /**
   * Finds a clustering of the nodes in a network using the local merging
   * algorithm.
   *
   * The local merging algorithm starts from a singleton partition. It
   * performs a single iteration over the nodes in a network. Each node
   * belonging to a singleton cluster is considered for merging with another
   * cluster. This cluster is chosen randomly from all clusters that do not
   * result in a decrease in the quality function. The larger the increase in
   * the quality function, the more likely a cluster is to be chosen. The
   * strength of this effect is determined by the randomness parameter. The
   * higher the value of the randomness parameter, the stronger the
   * randomness in the choice of a cluster. The lower the value of the
   * randomness parameter, the more likely the cluster resulting in the
   * largest increase in the quality function is to be chosen. A node is
   * merged with a cluster only if both are sufficiently well connected to
   * the rest of the network.
   *
   * @param network Network
   *
   * @return Clustering
   */
  public findClustering (network: Network): Clustering {
    const clustering = new Clustering({ nNodes: network.nNodes } as ClusteringParametersWithNNodes)

    if (network.nNodes === 1) {
      return clustering
    }

    let update = false

    const totalNodeWeight = network.getTotalNodeWeight()
    const clusterWeights = network.getNodeWeights()
    const nonSingletonClusters = new Array<boolean>(network.nNodes).fill(false)
    const externalEdgeWeightPerCluster = network.getTotalEdgeWeightPerNode()

    const nodeOrder = generateRandomPermutation(network.nNodes, this.random)

    const edgeWeightPerCluster = new Array<number>(network.nNodes).fill(0)
    const neighboringClusters = new Array<number>(network.nNodes).fill(0)
    const cumTransformedQualityValueIncrementPerCluster = new Array<number>(network.nNodes).fill(0)
    for (let i = 0; i < network.nNodes; i++) {
      const j = nodeOrder[i]

      /*
       * Only nodes belonging to singleton clusters can be moved to a
       * different cluster. This guarantees that clusters will never be
       * split up. Additionally, only nodes that are well connected with
       * the rest of the network are considered for moving.
       */
      if (!nonSingletonClusters[j] && (externalEdgeWeightPerCluster[j] >= clusterWeights[j] * (totalNodeWeight - clusterWeights[j]) * this.resolution)) {
        /*
         * Remove the currently selected node from its current cluster.
         * This causes the cluster to be empty.
         */
        clusterWeights[j] = 0
        externalEdgeWeightPerCluster[j] = 0

        /*
         * Identify the neighboring clusters of the currently selected
         * node, that is, the clusters with which the currently
         * selected node is connected. The old cluster of the currently
         * selected node is also included in the set of neighboring
         * clusters. In this way, it is always possible that the
         * currently selected node will be moved back to its old
         * cluster.
         */
        neighboringClusters[0] = j
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
         * determine whether the neighboring cluster is well connected
         * with the rest of the network. For each neighboring cluster
         * that is well connected, calculate the increment of the
         * quality function obtained by moving the currently selected
         * node to the neighboring cluster. For each neighboring
         * cluster for which the increment is non-negative, calculate a
         * transformed increment that will determine the probability
         * with which the currently selected node is moved to the
         * neighboring cluster.
         */
        let bestCluster = j
        let maxQualityValueIncrement = 0
        let totalTransformedQualityValueIncrement = 0
        for (let k = 0; k < nNeighboringClusters; k++) {
          const l = neighboringClusters[k]

          if (externalEdgeWeightPerCluster[l] >= clusterWeights[l] * (totalNodeWeight - clusterWeights[l]) * this.resolution) {
            const qualityValueIncrement = edgeWeightPerCluster[l] - network.nodeWeights[j] * clusterWeights[l] * this.resolution

            if (qualityValueIncrement > maxQualityValueIncrement) {
              bestCluster = l
              maxQualityValueIncrement = qualityValueIncrement
            }

            if (qualityValueIncrement >= 0) {
              totalTransformedQualityValueIncrement += fastExp(qualityValueIncrement / this.randomness)
            }
          }

          cumTransformedQualityValueIncrementPerCluster[k] = totalTransformedQualityValueIncrement

          edgeWeightPerCluster[l] = 0
        }

        /*
         * Determine the neighboring cluster to which the currently
         * selected node will be moved.
         */
        let chosenCluster: number
        if (totalTransformedQualityValueIncrement < Number.POSITIVE_INFINITY) {
          const r = totalTransformedQualityValueIncrement * this.random.nextDouble()
          let minIdx = -1
          let maxIdx = nNeighboringClusters + 1
          while (minIdx < maxIdx - 1) {
            const midIdx = Math.trunc((minIdx + maxIdx) / 2)
            if (cumTransformedQualityValueIncrementPerCluster[midIdx] >= r) {
              maxIdx = midIdx
            } else {
              minIdx = midIdx
            }
          }
          chosenCluster = neighboringClusters[maxIdx]
        } else {
          chosenCluster = bestCluster
        }

        /*
         * Move the currently selected node to its new cluster and
         * update the clustering statistics.
         */
        clusterWeights[chosenCluster] += network.nodeWeights[j]

        for (let k = network.firstNeighborIndices[j]; k < network.firstNeighborIndices[j + 1]; k++) {
          if (clustering.clusters[network.neighbors[k]] === chosenCluster) {
            externalEdgeWeightPerCluster[chosenCluster] -= network.edgeWeights[k]
          } else {
            externalEdgeWeightPerCluster[chosenCluster] += network.edgeWeights[k]
          }
        }

        if (chosenCluster !== j) {
          clustering.clusters[j] = chosenCluster

          nonSingletonClusters[chosenCluster] = true
          update = true
        }
      }
    }

    if (update) {
      clustering.removeEmptyClusters()
    }

    return clustering
  }
}
