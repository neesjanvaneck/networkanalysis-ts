import IncrementalCPMClusteringAlgorithm from './incrementalCPMClusteringAlgorithm'
import Clustering from './clustering'
import Network from './network'

/**
 * Abstract base class for iterative clustering algorithms that use the CPM
 * quality function.
 */
export default abstract class IterativeCPMClusteringAlgorithm extends IncrementalCPMClusteringAlgorithm {
  /**
   * Default number of iterations.
   */
  public static readonly DEFAULT_N_ITERATIONS: number = 1

  /**
   * Number of iterations.
   */
  protected nIterations!: number

  /**
   * Constructs an iterative CPM clustering algorithm.
   */
  public constructor () {
    super()
    this.initializeBasedOnResolutionAndNIterations(IterativeCPMClusteringAlgorithm.DEFAULT_RESOLUTION, IterativeCPMClusteringAlgorithm.DEFAULT_N_ITERATIONS)
  }

  /**
   * Initializes an iterative CPM clustering algorithm with a specified
   * resolution parameter and number of iterations.
   *
   * @param resolution  Resolution parameter
   * @param nIterations Number of iterations
   */
  public initializeBasedOnResolutionAndNIterations (resolution: number, nIterations: number): void {
    super.initializeBasedOnResolution(resolution)
    this.nIterations = nIterations
  }

  /**
   * Returns the number of iterations.
   *
   * @return Number of iterations
   */
  public getNIterations (): number {
    return this.nIterations
  }

  /**
   * Sets the number of iterations.
   *
   * @param nIterations Number of iterations
   */
  public setNIterations (nIterations: number): void {
    this.nIterations = nIterations
  }

  /**
   * Improves a clustering of the nodes in a network.
   *
   * If the number of iterations `nIterations` is positive, the clustering is
   * improved by making `nIterations` calls to
   * {@link improveClusteringOneIteration}. If `nIterations` equals 0, calls to
   * {@link #improveClusteringOneIteration} continue to be made until there has
   * been a call that did not result in an improvement of the clustering.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Boolean indicating whether the clustering has been improved
   */
  public improveClustering (network: Network, clustering: Clustering): boolean {
    let update = false
    if (this.nIterations > 0) {
      for (let i = 0; i < this.nIterations; i++) {
        const update2 = this.improveClusteringOneIteration(network, clustering)
        update ||= update2
      }
    } else {
      while (this.improveClusteringOneIteration(network, clustering)) {
        update = true
      }
    }
    return update
  }

  /**
   * Improves a clustering by performing one iteration of an iterative
   * clustering algorithm.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Boolean indicating whether the clustering has been improved
   */
  protected abstract improveClusteringOneIteration (network: Network, clustering: Clustering): boolean
}
