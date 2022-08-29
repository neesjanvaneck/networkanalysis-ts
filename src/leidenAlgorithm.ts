import Random from 'java-random'
import IterativeCPMClusteringAlgorithm from './iterativeCPMClusteringAlgorithm'
import IncrementalCPMClusteringAlgorithm from './incrementalCPMClusteringAlgorithm'
import LocalMergingAlgorithm from './localMergingAlgorithm'
import FastLocalMovingAlgorithm from './fastLocalMovingAlgorithm'
import Clustering, { ClusteringParametersWithNNodes } from './clustering'
import Network from './network'

/**
 * Leiden algorithm.
 *
 * The Leiden algorithm consists of three phases:
 *
 * <ol>
 * <li>local moving of nodes between clusters,</li>
 * <li>refinement of the clusters,</li>
 * <li>aggregation of the network based on the refined clusters, using the
 * non-refined clusters to create an initial clustering for the aggregate
 * network.</li>
 * </ol>
 *
 * These phases are repeated until no further improvements can be made. By
 * default, local moving of nodes is performed using the {@link
 * FastLocalMovingAlgorithm}.
 */
export default class LeidenAlgorithm extends IterativeCPMClusteringAlgorithm {
  /**
   * Default randomness parameter.
   */
  public static readonly DEFAULT_RANDOMNESS: number = LocalMergingAlgorithm.DEFAULT_RANDOMNESS

  /**
   * Randomness parameter.
   */
  protected randomness!: number

  /**
   * Local moving algorithm.
   */
  protected localMovingAlgorithm!: IncrementalCPMClusteringAlgorithm

  /**
   * Random number generator.
   */
  protected random!: Random

  /**
   * Constructs a Leiden algorithm.
   */
  public constructor () {
    super()
    this.initializeBasedOnRandom(new Random())
  }

  /**
   * Initializes a Leiden algorithm.
   *
   * @param random Random number generator
   */
  public initializeBasedOnRandom (random: Random): void {
    this.initializeBasedOnResolutionAndNIterationsAndRandomnessAndRandom(LeidenAlgorithm.DEFAULT_RESOLUTION, LeidenAlgorithm.DEFAULT_N_ITERATIONS, LeidenAlgorithm.DEFAULT_RANDOMNESS, random)
  }

  /**
   * Initializes a Leiden algorithm for a specified resolution parameter,
   * number of iterations, and randomness parameter.
   *
   * @param resolution  Resolution parameter
   * @param nIterations Number of iterations
   * @param randomness  Randomness parameter
   * @param random      Random number generator
   */
  public initializeBasedOnResolutionAndNIterationsAndRandomnessAndRandom (resolution: number, nIterations: number, randomness: number, random: Random): void {
    const localMovingAlgorithm = new FastLocalMovingAlgorithm()
    localMovingAlgorithm.initializeBasedOnRandom(random)
    this.initializeBasedOnResolutionAndNIterationsAndRandomnessAndLocalMovingAlgorithmAndRandom(resolution, nIterations, randomness, localMovingAlgorithm, random)
  }

  /**
   * Initializes a Leiden algorithm for a specified resolution parameter,
   * number of iterations, randomness parameter, and local moving algorithm.
   *
   * @param resolution           Resolution parameter
   * @param nIterations          Number of iterations
   * @param randomness           Randomness parameter
   * @param localMovingAlgorithm Local moving algorithm
   * @param random               Random number generator
   */
  public initializeBasedOnResolutionAndNIterationsAndRandomnessAndLocalMovingAlgorithmAndRandom (resolution: number, nIterations: number, randomness: number, localMovingAlgorithm: IncrementalCPMClusteringAlgorithm, random: Random): void {
    super.initializeBasedOnResolutionAndNIterations(resolution, nIterations)
    this.randomness = randomness
    this.random = random
    this.setLocalMovingAlgorithm(localMovingAlgorithm)
  }

  /**
   * Clones the algorithm.
   *
   * @return Cloned algorithm
   */
  public clone (): LeidenAlgorithm {
    const clonedAlgorithm = new LeidenAlgorithm()
    clonedAlgorithm.resolution = this.resolution
    clonedAlgorithm.nIterations = this.nIterations
    clonedAlgorithm.randomness = this.randomness
    clonedAlgorithm.localMovingAlgorithm = this.localMovingAlgorithm.clone() as IncrementalCPMClusteringAlgorithm
    clonedAlgorithm.random = this.random
    return clonedAlgorithm
  }

  /**
   * Returns the randomness parameter.
   *
   * @return Randomness parameter
   */
  public getRandomness (): number {
    return this.randomness
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
   * Sets the randomness parameter.
   *
   * @param randomness Randomness parameter
   */
  public setRandomness (randomness: number): void {
    this.randomness = randomness
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
   * Improves a clustering by performing one iteration of the Leiden
   * algorithm.
   *
   * The Leiden algorithm consists of three phases:
   *
   * <ol>
   * <li>local moving of nodes between clusters,</li>
   * <li>refinement of the clusters,</li>
   * <li>aggregation of the network based on the refined clusters, using the
   * non-refined clusters to create an initial clustering for the aggregate
   * network.</li>
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
       * Refine the clustering by iterating over the clusters and by
       * trying to split up each cluster into multiple clusters.
       */
      const localMergingAlgorithm = new LocalMergingAlgorithm()
      localMergingAlgorithm.initializeBasedOnResolutionAndRandomnessAndRandom(this.resolution, this.randomness, this.random)
      const subnetworks = network.createSubnetworks(clustering)
      const nodesPerCluster = clustering.getNodesPerCluster()
      const refinement = new Clustering({ nNodes: network.nNodes } as ClusteringParametersWithNNodes)
      refinement.nClusters = 0
      for (let i = 0; i < subnetworks.length; i++) {
        const clusteringSubnetwork = localMergingAlgorithm.findClustering(subnetworks[i])

        for (let j = 0; j < subnetworks[i].nNodes; j++) {
          refinement.clusters[nodesPerCluster[i][j]] = refinement.nClusters + clusteringSubnetwork.clusters[j]
        }

        refinement.nClusters += clusteringSubnetwork.nClusters
      }

      let reducedNetwork: Network
      let clusteringReducedNetwork: Clustering
      if (refinement.nClusters < network.nNodes) {
        /*
         * Create an aggregate network based on the refined clustering of
         * the non-aggregate network.
         */
        reducedNetwork = network.createReducedNetwork(refinement)
        /*
         * Create an initial clustering for the aggregate network based
         * on the non-refined clustering of the non-aggregate network.
         */
        clusteringReducedNetwork = new Clustering({ nNodes: refinement.nClusters } as ClusteringParametersWithNNodes)
        clusteringReducedNetwork.nClusters = clustering.nClusters
        for (let i = 0; i < network.nNodes; i++) {
          clusteringReducedNetwork.clusters[refinement.clusters[i]] = clustering.clusters[i]
        }

        /*
         * Set the non-refined clustering to the refined clustering, so that the results correctly
         * merged back after recursively applying the algorithm to the aggregate network.
         */
        clustering.clusters = refinement.clusters
        clustering.nClusters = refinement.nClusters
      } else {
        /*
         * The refinement is a singleton clustering, so we now
         * aggregate on the basis of the non-refined clustering
         * of the non-aggregate network.
         */
        reducedNetwork = network.createReducedNetwork(clustering)
        clusteringReducedNetwork = new Clustering({ nNodes: reducedNetwork.nNodes } as ClusteringParametersWithNNodes)
      }
      /*
       * Recursively apply the algorithm to the aggregate network,
       * starting from the initial clustering created for this network.
       */
      const update2 = this.improveClusteringOneIteration(reducedNetwork, clusteringReducedNetwork)
      update ||= update2

      /*
       * Update the clustering of the non-aggregate network so that it
       * coincides with the final clustering obtained for the aggregate
       * network.
       */
      clustering.mergeClusters(clusteringReducedNetwork)
    }

    return update
  }
}
