import Clustering from './clustering'
import ClusteringAlgorithm from './clusteringAlgorithm'
import Network from './network'

/**
 * Interface for clustering algorithms that use a quality function.
 */
export default interface QualityClusteringAlgorithm extends ClusteringAlgorithm {
  /**
   * Calculates the quality of a clustering of the nodes in a network.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Quality of the clustering
   */
  calcQuality (network: Network, clustering: Clustering): number
}
