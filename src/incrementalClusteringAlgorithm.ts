import ClusteringAlgorithm from './clusteringAlgorithm'
import Clustering from './clustering'
import Network from './network'

/**
 * Interface for clustering algorithms that are able to improve an existing
 * clustering.
 */
export default interface IncrementalClusteringAlgorithm extends ClusteringAlgorithm {
  /**
   * Improves a clustering of the nodes in a network.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Boolean indicating whether the clustering has been improved
   */
  improveClustering (network: Network, clustering: Clustering): boolean
}
