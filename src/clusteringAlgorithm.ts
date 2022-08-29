import Clustering from './clustering'
import Network from './network'

/**
 * Interface for clustering algorithms.
 */
export default interface ClusteringAlgorithm {
  /**
   * Finds a clustering of the nodes in a network.
   *
   * @param network Network
   *
   * @return Clustering
   */
  findClustering (network: Network): Clustering
}
