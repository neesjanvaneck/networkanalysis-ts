import Random from 'java-random'
import IterativeCPMClusteringAlgorithm from './iterativeCPMClusteringAlgorithm'
import IncrementalCPMClusteringAlgorithm from './incrementalCPMClusteringAlgorithm'
import StandardLocalMovingAlgorithm from './standardLocalMovingAlgorithm'
import Clustering, { ClusteringParametersWithNNodes } from './clustering'
import Network from './network'

/**
 * Louvain algorithm.
 *
 * The Louvain algorithm consists of two phases:
 *
 * <ol>
 * <li>local moving of nodes between clusters,</li>
 * <li>aggregation of the network based on the clusters.</li>
 * </ol>
 *
 * These phases are repeated until no further improvements can be made. By
 * default, local moving of nodes is performed using the {@link
 * StandardLocalMovingAlgorithm}.
 */
export default class LouvainAlgorithm extends IterativeCPMClusteringAlgorithm {
  /**
   * Local moving algorithm.
   */
  protected localMovingAlgorithm!: IncrementalCPMClusteringAlgorithm

  /**
   * Constructs a Louvain algorithm.
   */
  public constructor () {
    super()
    this.initializeBasedOnRandom(new Random())
  }

  /**
   * Initializes a Louvain algorithm.
   *
   * @param random Random number generator
   */
  public initializeBasedOnRandom (random: Random): void {
    this.initializeBasedOnResolutionAndNIterationsAndRandom(LouvainAlgorithm.DEFAULT_RESOLUTION, LouvainAlgorithm.DEFAULT_N_ITERATIONS, random)
  }

  /**
   * Initializes a Louvain algorithm for a specified resolution parameter and
   * number of iterations.
   *
   * @param resolution  Resolution parameter
   * @param nIterations Number of iterations
   * @param random      Random number generator
   */
  public initializeBasedOnResolutionAndNIterationsAndRandom (resolution: number, nIterations: number, random: Random): void {
    const localMovingAlgorithm = new StandardLocalMovingAlgorithm()
    localMovingAlgorithm.initializeBasedOnRandom(random)
    this.initializeBasedOnResolutionAndNIterationsAndLocalMovingAlgorithm(resolution, nIterations, localMovingAlgorithm)
  }

  /**
   * Initializes a Louvain algorithm for a specified resolution parameter,
   * number of iterations, and local moving algorithm.
   *
   * @param resolution           Resolution parameter
   * @param nIterations          Number of iterations
   * @param localMovingAlgorithm Local moving algorithm
   */
  public initializeBasedOnResolutionAndNIterationsAndLocalMovingAlgorithm (resolution: number, nIterations: number, localMovingAlgorithm: IncrementalCPMClusteringAlgorithm): void {
    super.initializeBasedOnResolutionAndNIterations(resolution, nIterations)
    this.setLocalMovingAlgorithm(localMovingAlgorithm)
  }

  /**
   * Clones the algorithm.
   *
   * @return Cloned algorithm
   */
  public clone (): LouvainAlgorithm {
    const clonedAlgorithm = new LouvainAlgorithm()
    clonedAlgorithm.resolution = this.resolution
    clonedAlgorithm.nIterations = this.nIterations
    clonedAlgorithm.localMovingAlgorithm = this.localMovingAlgorithm.clone() as IncrementalCPMClusteringAlgorithm
    return clonedAlgorithm
  }

  /**
   * Returns the local moving algorithm.
   *
   * @return Local moving algorithm
   */
  public getLocalMovingAlgorithm (): IncrementalCPMClusteringAlgorithm {
    return this.localMovingAlgorithm.clone() as IncrementalCPMClusteringAlgorithm
  }

  /**
   * Sets the resolution parameter.
   *
   * Also sets the resolution parameter for the local moving algorithm.
   *
   * @param resolution Resolution parameter
   */
  public setResolution (resolution: number): void {
    super.setResolution(resolution)
    this.localMovingAlgorithm.setResolution(resolution)
  }

  /**
   * Sets the local moving algorithm.
   *
   * @param localMovingAlgorithm Local moving algorithm
   */
  public setLocalMovingAlgorithm (localMovingAlgorithm: IncrementalCPMClusteringAlgorithm): void {
    this.localMovingAlgorithm = localMovingAlgorithm.clone() as IncrementalCPMClusteringAlgorithm
    this.localMovingAlgorithm.setResolution(this.resolution)
  }

  /**
   * Improves a clustering by performing one iteration of the Louvain
   * algorithm.
   *
   * The Louvain algorithm consists of two phases:
   *
   * <ol>
   * <li>local moving of nodes between clusters,</li>
   * <li>aggregation of the network based on the clusters.</li>
   * </ol>
   *
   * These phases are repeated until no further improvements can be made.
   *
   * @param network    Network
   * @param clustering Clustering
   *
   * @return Boolean indicating whether the clustering has been improved
   */
  protected improveClusteringOneIteration (network: Network, clustering: Clustering): boolean {
    // Update the clustering by moving individual nodes between clusters.
    let update = this.localMovingAlgorithm.improveClustering(network, clustering)

    /*
       * Terminate the algorithm if each node is assigned to its own cluster.
       * Otherwise create an aggregate network and recursively apply the
       * algorithm to this network.
       */
    if (clustering.nClusters < network.nNodes) {
      /*
         * Create an aggregate network based on the clustering of the
         * non-aggregate network.
         */
      const reducedNetwork = network.createReducedNetwork(clustering)

      /*
         * Recursively apply the algorithm to the aggregate network,
         * starting from a singleton clustering.
         */
      const reducedClustering = new Clustering({ nNodes: reducedNetwork.getNNodes() } as ClusteringParametersWithNNodes)
      const update2 = this.improveClusteringOneIteration(reducedNetwork, reducedClustering)
      update ||= update2

      /*
         * Update the clustering of the non-aggregate network so that it
         * coincides with the final clustering obtained for the aggregate
         * network.
         */
      clustering.mergeClusters(reducedClustering)
    }

    return update
  }
}
