/* eslint-disable no-console */
import Random from 'java-random'
import NetworkAnalysis from './networkAnalysis'
import { ClusteringQualityFunctions, ClusteringAlgorithms, NormalizationMethods } from './enums'
import CPMClusteringAlgorithm from '../CPMClusteringAlgorithm'
import IterativeCPMClusteringAlgorithm from '../iterativeCPMClusteringAlgorithm'
import LouvainAlgorithm from '../louvainAlgorithm'
import LeidenAlgorithm from '../leidenAlgorithm'
import Clustering from '../clustering'

/**
 * Class for running the Leiden and Louvain algorithms for network clustering.
 */
export default class NetworkClustering extends NetworkAnalysis {
  private _useModularity = false
  private _normalization: NormalizationMethods = NormalizationMethods.NoNormalization
  private _resolution = CPMClusteringAlgorithm.DEFAULT_RESOLUTION
  private _minClusterSize = 1
  private _useLouvain = false
  private _nRandomStarts = 1
  private _nIterations = 10
  private _randomness = LeidenAlgorithm.DEFAULT_RANDOMNESS
  private _useSeed = false
  private _seed = 0

  /**
   * Quality function to be optimized. Either the CPM (constant Potts model) or
   * the modularity quality function can be used.
  */
  public qualityFunction (value: keyof typeof ClusteringQualityFunctions): this {
    this._useModularity = ClusteringQualityFunctions[value] === ClusteringQualityFunctions.Modularity
    return this
  }

  /**
   * Method for normalizing edge weights in the CPM quality function.
  */
  public normalization (value: keyof typeof NormalizationMethods): this {
    this._normalization = NormalizationMethods[value]
    return this
  }

  /**
   * Resolution parameter of the quality function.
   */
  public resolution (value: number): this {
    this._resolution = value
    return this
  }

  /**
   * Minimum number of nodes per cluster.
   */
  public minClusterSize (value: number): this {
    this._minClusterSize = value
    return this
  }

  /**
   * Algorithm for optimizing the quality function. Either the Leiden or the Louvain algorithm can be used.
  */
  public algorithm (value: keyof typeof ClusteringAlgorithms): this {
    this._useLouvain = ClusteringAlgorithms[value] === ClusteringAlgorithms.Louvain
    return this
  }

  /**
   * Number of random starts of the algorithm.
   */
  public randomStarts (value: number): this {
    this._nRandomStarts = value
    return this
  }

  /**
   * Number of random starts of the algorithm.
   */
  public iterations (value: number): this {
    this._nIterations = value
    return this
  }

  /**
   * Randomness parameter of the Leiden algorithm.
   */
  public randomness (value: number): this {
    this._randomness = value
    return this
  }

  /**
   * Seed of the random number generator.
   */
  public seed (value: number): this {
    this._seed = value
    this._useSeed = true
    return this
  }

  /**
   * Identify clusters (also known as communities) in a network using either
   * the Leiden or the Louvain algorithm.
   */
  public run (): void {
    if (!this._networkHelper) {
      throw new Error('Network data is not initialized.')
    }

    let network = this._networkHelper.getNetwork()
    console.log(`Network consists of ${network.getNNodes()} nodes and ${network.getNEdges()} edges with a total edge weight of ${network.getTotalEdgeWeight()}.`)

    let initialClustering = this._networkHelper.getInitialClustering()
    if (initialClustering !== undefined) {
      console.log(`Initial clustering consists of ${initialClustering.getNClusters()} clusters.`)
    } else {
      initialClustering = new Clustering({ nNodes: network.getNNodes() })
      console.log('Using singleton initial clustering.')
    }

    console.log(`Running ${this._useLouvain ? ClusteringAlgorithms.Louvain : ClusteringAlgorithms.Leiden} algorithm.`)
    console.log(`Quality function:             ${this._useModularity ? ClusteringQualityFunctions.Modularity : ClusteringQualityFunctions.CPM}`)
    if (!this._useModularity) console.log(`Normalization method:         ${this._normalization}`)
    console.log(`Resolution parameter:         ${this._resolution}`)
    console.log(`Minimum cluster size:         ${this._minClusterSize}`)
    console.log(`Number of random starts:      ${this._nRandomStarts}`)
    console.log(`Number of iterations:         ${this._nIterations}`)
    if (!this._useLouvain) console.log(`Randomness parameter:         ${this._randomness}`)
    console.log(`Random number generator seed: ${this._useSeed ? this._seed : 'random'}`)

    const startTimeAlgorithm = Date.now()
    if (!this._useModularity) {
      if (this._normalization === NormalizationMethods.NoNormalization) {
        network = network.createNetworkWithoutNodeWeights()
      } else if (this._normalization === NormalizationMethods.AssociationStrength) {
        network = network.createNormalizedNetworkUsingAssociationStrength()
      } else if (this._normalization === NormalizationMethods.Fractionalization) {
        network = network.createNormalizedNetworkUsingFractionalization()
      }
    }
    const resolution2 = this._useModularity ? (this._resolution / (2 * network.getTotalEdgeWeight() + network.getTotalEdgeWeightSelfLinks())) : this._resolution
    const random = this._useSeed ? new Random(this._seed) : new Random()
    let algorithm: IterativeCPMClusteringAlgorithm
    if (this._useLouvain) {
      const lovainAlgorithm = new LouvainAlgorithm()
      lovainAlgorithm.initializeBasedOnResolutionAndNIterationsAndRandom(resolution2, this._nIterations, random)
      algorithm = lovainAlgorithm
    } else {
      const leidenAlgorithm = new LeidenAlgorithm()
      leidenAlgorithm.initializeBasedOnResolutionAndNIterationsAndRandomnessAndRandom(resolution2, this._nIterations, this._randomness, random)
      algorithm = leidenAlgorithm
    }
    let finalClustering: Clustering | undefined
    let maxQuality = Number.NEGATIVE_INFINITY
    for (let i = 0; i < this._nRandomStarts; i++) {
      const clustering = initialClustering.clone()
      algorithm.improveClustering(network, clustering)
      const quality = algorithm.calcQuality(network, clustering)
      if (this._nRandomStarts > 1) {
        console.log(`Quality function in random start ${i + 1} equals ${quality}.`)
      }
      if (quality > maxQuality) {
        finalClustering = clustering
        maxQuality = quality
      }
    }
    if (finalClustering) {
      finalClustering.orderClustersByNNodes()
      console.log(`Running algorithm took ${(Date.now() - startTimeAlgorithm) / 1000}s.`)
      if (this._nRandomStarts > 1) {
        console.log(`Maximum value of quality function in ${this._nRandomStarts} random starts equals ${maxQuality}.`)
      } else {
        console.log(`Quality function equals ${maxQuality}.`)
      }
      if (this._minClusterSize > 1) {
        console.log(`Clustering consists of ${finalClustering.getNClusters()} clusters.`)
        console.log(`Removing clusters consisting of fewer than ${this._minClusterSize} nodes.`)
        algorithm.removeSmallClustersBasedOnNNodes(network, finalClustering, this._minClusterSize)
      }
      console.log(`Final clustering consists of ${finalClustering.getNClusters()} clusters.`)

      const clusters = finalClustering.getClusters()
      this._networkHelper.setClusters(clusters)
    }
  }
}
