import CPMClusteringAlgorithm from './CPMClusteringAlgorithm'
import IncrementalClusteringAlgorithm from './incrementalClusteringAlgorithm'
import Clustering, { ClusteringParametersWithNNodes } from './clustering'
import Network from './network'

/**
 * Abstract base class for incremental clustering algorithms that use the CPM
 * quality function.
 */
export default abstract class IncrementalCPMClusteringAlgorithm extends CPMClusteringAlgorithm implements IncrementalClusteringAlgorithm {
  /**
   * Constructs an incremental CPM clustering algorithm.
   */
  public constructor () {
    super()
    this.initializeBasedOnResolution(IncrementalCPMClusteringAlgorithm.DEFAULT_RESOLUTION)
  }

  /**
   * Initializes an incremental CPM clustering algorithm with a specified
   * resolution parameter.
   *
   * @param resolution Resolution parameter
   */
  public initializeBasedOnResolution (resolution: number): void {
    super.initializeBasedOnResolution(resolution)
  }

  /**
   * Finds a clustering of the nodes in a network.
   *
   * The clustering is obtained by calling {@link improveClustering} and by
   * providing a singleton clustering as input to this method.
   *
   * @param network Network
   *
   * @return Clustering
   */
  public findClustering (network: Network): Clustering {
    const clustering = new Clustering({ nNodes: network.getNNodes() } as ClusteringParametersWithNNodes)
    this.improveClustering(network, clustering)
    return clustering
  }

  /**
   * Improves a clustering of the nodes in a network.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Boolean indicating whether the clustering has been improved
   */
  public abstract improveClustering (network: Network, clustering: Clustering): boolean
}
