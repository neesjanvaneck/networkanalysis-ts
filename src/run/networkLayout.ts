/* eslint-disable no-console */
import Random from 'java-random'
import NetworkAnalysis from './networkAnalysis'
import { LayoutQualityFunctions, NormalizationMethods } from './enums'
import GradientDescentVOSLayoutAlgorithm from '../gradientDescentVOSLayoutAlgorithm'
import Layout from '../layout'

/**
 * Class for running the gradient descent VOS layout algorithm for network
 * layout.
 */
export default class NetworkLayout extends NetworkAnalysis {
  private _useLinLog = false
  private _normalization: NormalizationMethods = NormalizationMethods.NoNormalization
  private _attraction = GradientDescentVOSLayoutAlgorithm.DEFAULT_ATTRACTION
  private _repulsion = GradientDescentVOSLayoutAlgorithm.DEFAULT_REPULSION
  private _nRandomStarts = 1
  private _maxNIterations = GradientDescentVOSLayoutAlgorithm.DEFAULT_MAX_N_ITERATIONS
  private _initialStepSize = GradientDescentVOSLayoutAlgorithm.DEFAULT_INITIAL_STEP_SIZE
  private _minStepSize = GradientDescentVOSLayoutAlgorithm.DEFAULT_MIN_STEP_SIZE
  private _stepSizeReduction = GradientDescentVOSLayoutAlgorithm.DEFAULT_STEP_SIZE_REDUCTION
  private _requiredNQualityValueImprovements = GradientDescentVOSLayoutAlgorithm.DEFAULT_REQUIRED_N_QUALITY_VALUE_IMPROVEMENTS
  private _seed = 0
  private _useSeed = false
  private _edgeWeightIncrementUnconnectedNodes = 0.01

  /**
   * Quality function to be optimized. Either the VOS (visualization of
   * similarities) or the LinLog quality function can be used.
  */
  public qualityFunction (value: keyof typeof LayoutQualityFunctions): this {
    this._useLinLog = LayoutQualityFunctions[value] === LayoutQualityFunctions.LinLog
    return this
  }

  /**
   * Method for normalizing edge weights in the VOS quality function.
   */
  public normalization (value: keyof typeof NormalizationMethods): this {
    this._normalization = NormalizationMethods[value]
    return this
  }

  /**
   * Attraction parameter of the VOS quality function.
   */
  public attraction (value: number): this {
    this._attraction = value
    return this
  }

  /**
   * Maximum number of iterations of the gradient descent algorithm.
   */
  public maxNIterations (value: number): this {
    this._maxNIterations = value
    return this
  }

  /**
   * Initial step size of the gradient descent algorithm.
   */
  public initialStepSize (value: number): this {
    this._initialStepSize = value
    return this
  }

  /**
   * Minimum step size of the gradient descent algorithm.
   */
  public minStepSize (value: number): this {
    this._minStepSize = value
    return this
  }

  /**
   * Step size reduction of the gradient descent algorithm.
   */
  public stepSizeReduction (value: number): this {
    this._stepSizeReduction = value
    return this
  }

  /**
   * Required number of quality value improvements of the gradient descent algorithm.
   */
  public requiredNQualityValueImprovements (value: number): this {
    this._requiredNQualityValueImprovements = value
    return this
  }

  /**
   * Repulsion parameter of the VOS quality function.
   */
  public repulsion (value: number): this {
    this._repulsion = value
    return this
  }

  /**
   * Number of random starts of the gradient descent algorithm.
   */
  public randomStarts (value: number): this {
    this._nRandomStarts = value
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
   * Determine a layout for a network using the gradient descent VOS layout
   * algorithm.
   */
  public run (): void {
    if (!this._networkHelper) {
      throw new Error('Network data is not initialized.')
    }

    let network = this._networkHelper.getNetwork()
    console.log(`Network consists of ${network.getNNodes()} nodes and ${network.getNEdges()} edges with a total edge weight of ${network.getTotalEdgeWeight()}.`)

    const initialLayout = this._networkHelper.getInitialLayout()

    console.log('Running gradient descent VOS layout algorithm.')
    console.log(`Quality function:                              ${this._useLinLog ? LayoutQualityFunctions.LinLog : LayoutQualityFunctions.VOS}`)
    if (!this._useLinLog) console.log(`Normalization method:                          ${this._normalization}`)
    console.log(`Attraction parameter:                          ${this._attraction}`)
    console.log(`Repulsion parameter:                           ${this._repulsion}`)
    console.log(`Number of random starts:                       ${this._nRandomStarts}`)
    console.log(`Maximum number of iterations:                  ${this._maxNIterations}`)
    console.log(`Initial step size:                             ${this._initialStepSize}`)
    console.log(`Minimum step size:                             ${this._minStepSize}`)
    console.log(`Step size reduction:                           ${this._stepSizeReduction}`)
    console.log(`Required number of quality value improvements: ${this._requiredNQualityValueImprovements}`)
    console.log(`Random number generator seed:                  ${this._useSeed ? this._seed : 'random'}`)

    const startTimeAlgorithm = Date.now()
    if (!this._useLinLog) {
      if (this._normalization === NormalizationMethods.NoNormalization) {
        network = network.createNetworkWithoutNodeWeights()
      } else if (this._normalization === NormalizationMethods.AssociationStrength) {
        network = network.createNormalizedNetworkUsingAssociationStrength()
      } else if (this._normalization === NormalizationMethods.Fractionalization) {
        network = network.createNormalizedNetworkUsingFractionalization()
      }
    }

    const edgeWeightIncrement = (network.identifyComponents().getNClusters() > 1) ? this._edgeWeightIncrementUnconnectedNodes : 0
    const random = this._useSeed ? new Random(this._seed) : new Random()
    const algorithm = new GradientDescentVOSLayoutAlgorithm()
    algorithm.initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrementAndMaxNIterationsAndInitialStepSizeAndMinStepSizeAndStepSizeReductionAndRequiredNQualityValueImprovementsAndRandom(this._attraction, this._repulsion, edgeWeightIncrement, this._maxNIterations, this._initialStepSize, this._minStepSize, this._stepSizeReduction, this._requiredNQualityValueImprovements, random)
    let finalLayout: Layout | undefined
    let minQuality = Number.POSITIVE_INFINITY
    for (let i = 0; i < this._nRandomStarts; i++) {
      const layout = (initialLayout !== undefined) ? initialLayout.clone() : new Layout({ nNodes: network.getNNodes(), random: random })
      algorithm.improveLayout(network, layout)
      const quality = algorithm.calcQuality(network, layout)
      if (this._nRandomStarts > 1) {
        console.log(`Quality function in random start ${i + 1} equals ${quality}.`)
      }
      if (quality < minQuality) {
        finalLayout = layout
        minQuality = quality
      }
    }
    if (finalLayout) {
      finalLayout.standardize(true)
      console.log(`Running algorithm took ${(Date.now() - startTimeAlgorithm) / 1000}s.`)
      if (this._nRandomStarts > 1) {
        console.log(`Minimum value of quality function in ${this._nRandomStarts} random starts equals ${minQuality}.`)
      } else {
        console.log(`Quality function equals ${minQuality}.`)
      }

      const coordinates = finalLayout.getCoordinates()
      this._networkHelper.setCoordinates(coordinates)
    }
  }
}
