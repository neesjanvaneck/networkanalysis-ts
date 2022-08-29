import Random from 'java-random'
import Layout, { LayoutConstructorParametersWithNNodesAndRandom } from './layout'
import Network from './network'
import VOSLayoutAlgorithm from './VOSLayoutAlgorithm'
import { generateRandomPermutation } from './utils/arrays'
import { fastPow } from './utils/fastMath'

/**
 * Gradient descent VOS layout algorithm.
 */
export default class GradientDescentVOSLayoutAlgorithm extends VOSLayoutAlgorithm {
  /**
   * Default maximum number of iterations.
   */
  public static readonly DEFAULT_MAX_N_ITERATIONS: number = 1000

  /**
   * Default initial step size.
   */
  public static readonly DEFAULT_INITIAL_STEP_SIZE: number = 1

  /**
   * Default minimum step size.
   */
  public static readonly DEFAULT_MIN_STEP_SIZE: number = 0.001

  /**
   * Default step size reduction.
   */
  public static readonly DEFAULT_STEP_SIZE_REDUCTION: number = 0.75

  /**
   * Default required number of quality value improvements.
   */
  public static readonly DEFAULT_REQUIRED_N_QUALITY_VALUE_IMPROVEMENTS: number = 5

  /**
   * Maximum number of iterations.
   */
  protected maxNIterations!: number

  /**
   * Initial step size.
   */
  protected initialStepSize!: number

  /**
   * Minimum step size.
   */
  protected minStepSize!: number

  /**
   * Step size reduction.
   */
  protected stepSizeReduction!: number

  /**
   * Required number of quality value improvements.
   */
  protected requiredNQualityValueImprovements!: number

  /**
   * Random number generator.
   */
  protected random!: Random

  /**
   * Constructs a gradient descent VOS layout algorithm.
   */
  public constructor () {
    super()
    this.initializeBasedOnRandom(new Random())
  }

  /**
   * Initializes a gradient descent VOS layout algorithm.
   *
   * @param random Random number generator
   */
  public initializeBasedOnRandom (random: Random): void {
    this.initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrementAndRandom(GradientDescentVOSLayoutAlgorithm.DEFAULT_ATTRACTION, GradientDescentVOSLayoutAlgorithm.DEFAULT_REPULSION, GradientDescentVOSLayoutAlgorithm.DEFAULT_EDGE_WEIGHT_INCREMENT, random)
  }

  /**
   * Initializes a gradient descent VOS layout algorithm for a specified
   * attraction parameter, repulsion parameter, and edge weight increment
   * parameter.
   *
   * @param attraction          Attraction parameter
   * @param repulsion           Repulsion parameter
   * @param edgeWeightIncrement Edge weight increment parameter
   * @param random              Random number generator
   */
  public initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrementAndRandom (attraction: number, repulsion: number, edgeWeightIncrement: number, random: Random): void {
    this.initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrementAndMaxNIterationsAndInitialStepSizeAndMinStepSizeAndStepSizeReductionAndRequiredNQualityValueImprovementsAndRandom(attraction, repulsion, edgeWeightIncrement, GradientDescentVOSLayoutAlgorithm.DEFAULT_MAX_N_ITERATIONS, GradientDescentVOSLayoutAlgorithm.DEFAULT_INITIAL_STEP_SIZE, GradientDescentVOSLayoutAlgorithm.DEFAULT_MIN_STEP_SIZE, GradientDescentVOSLayoutAlgorithm.DEFAULT_STEP_SIZE_REDUCTION, GradientDescentVOSLayoutAlgorithm.DEFAULT_REQUIRED_N_QUALITY_VALUE_IMPROVEMENTS, random)
  }

  /**
   * Initializes a gradient descent VOS layout algorithm for a specified
   * attraction parameter, repulsion parameter, edge weight increment
   * parameter, maximum number of iterations, initial step size, minimum step
   * size, step size reduction, and required number of quality value
   * improvements.
   *
   * @param attraction                        Attraction parameter
   * @param repulsion                         Repulsion parameter
   * @param edgeWeightIncrement               Edge weight increment parameter
   * @param maxNIterations                    Maximum number of iterations
   * @param initialStepSize                   Initial step size
   * @param minStepSize                       Minimum step size
   * @param stepSizeReduction                 Step size reduction
   * @param requiredNQualityValueImprovements Required number of quality value
   *            improvements
   * @param random                            Random number generator
   */
  public initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrementAndMaxNIterationsAndInitialStepSizeAndMinStepSizeAndStepSizeReductionAndRequiredNQualityValueImprovementsAndRandom (attraction: number, repulsion: number, edgeWeightIncrement: number, maxNIterations: number, initialStepSize: number, minStepSize: number, stepSizeReduction: number, requiredNQualityValueImprovements: number, random: Random): void {
    super.initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrement(attraction, repulsion, edgeWeightIncrement)

    this.maxNIterations = maxNIterations
    this.initialStepSize = initialStepSize
    this.minStepSize = minStepSize
    this.stepSizeReduction = stepSizeReduction
    this.requiredNQualityValueImprovements = requiredNQualityValueImprovements
    this.random = random
  }

  /**
   * Clones the algorithm.
   *
   * @return Cloned algorithm
   */
  public clone (): GradientDescentVOSLayoutAlgorithm {
    const clonedAlgorithm = new GradientDescentVOSLayoutAlgorithm()
    clonedAlgorithm.attraction = this.attraction
    clonedAlgorithm.repulsion = this.repulsion
    clonedAlgorithm.edgeWeightIncrement = this.edgeWeightIncrement
    clonedAlgorithm.maxNIterations = this.maxNIterations
    clonedAlgorithm.initialStepSize = this.initialStepSize
    clonedAlgorithm.minStepSize = this.minStepSize
    clonedAlgorithm.stepSizeReduction = this.stepSizeReduction
    clonedAlgorithm.requiredNQualityValueImprovements = this.requiredNQualityValueImprovements
    return clonedAlgorithm
  }

  /**
   * Returns the maximum number of iterations.
   *
   * @return Maximum number of iterations
   */
  public getMaxNIterations (): number {
    return this.maxNIterations
  }

  /**
   * Returns the initial step size.
   *
   * @return Initial step size
   */
  public getInitialStepSize (): number {
    return this.initialStepSize
  }

  /**
   * Returns the minimum step size.
   *
   * @return Minimum step size
   */
  public getMinStepSize (): number {
    return this.minStepSize
  }

  /**
   * Returns the step size reduction.
   *
   * @return Step size reduction
   */
  public getStepSizeReduction (): number {
    return this.stepSizeReduction
  }

  /**
   * Returns the required number of quality value improvements.
   *
   * @return Required number of quality value improvements
   */
  public getRequiredNQualityValueImprovements (): number {
    return this.requiredNQualityValueImprovements
  }

  /**
   * Sets the maximum number of iterations.
   *
   * @param maxNIterations Maximum number of iterations
   */
  public setMaxNIterations (maxNIterations: number): void {
    this.maxNIterations = maxNIterations
  }

  /**
   * Sets the initial step size.
   *
   * @param initialStepSize Initial step size
   */
  public setInitialStepSize (initialStepSize: number): void {
    this.initialStepSize = initialStepSize
  }

  /**
   * Sets the minimum step size.
   *
   * @param minStepSize Minimum step size
   */
  public setMinStepSize (minStepSize: number): void {
    this.minStepSize = minStepSize
  }

  /**
   * Sets the step size reduction.
   *
   * @param stepSizeReduction Step size reduction
   */
  public setStepSizeReduction (stepSizeReduction: number): void {
    this.stepSizeReduction = stepSizeReduction
  }

  /**
   * Sets the required number of quality value improvements.
   *
   * @param requiredNQualityValueImprovements Required number of quality value
   *            improvements
   */
  public setRequiredNQualityValueImprovements (requiredNQualityValueImprovements: number): void {
    this.requiredNQualityValueImprovements = requiredNQualityValueImprovements
  }

  /**
   * Finds a layout using the gradient descent VOS layout algorithm.
   *
   * @param network Network
   *
   * @return Layout
   */
  public findLayout (network: Network): Layout {
    const layout = new Layout({ nNodes: network.getNNodes(), random: this.random } as LayoutConstructorParametersWithNNodesAndRandom)
    this.improveLayout(network, layout)
    return layout
  }

  /**
   * Improves a layout using the gradient descent VOS layout algorithm.
   *
   * @param network Network
   * @param layout  Layout
   */
  public improveLayout (network: Network, layout: Layout): void {
    const nodeOrder = generateRandomPermutation(network.nNodes, this.random)

    let stepSize = this.initialStepSize
    let qualityValue = Number.POSITIVE_INFINITY
    let nQualityValueImprovements = 0
    const visitedNodes = new Array<boolean>(network.nNodes)
    let i = 0
    let a: number
    while ((i < this.maxNIterations) && (stepSize >= this.minStepSize)) {
      const oldQualityValue = qualityValue
      qualityValue = 0
      visitedNodes.fill(false)
      for (let j = 0; j < network.nNodes; j++) {
        const k = nodeOrder[j]

        let gradient1 = 0
        let gradient2 = 0

        for (let l = network.firstNeighborIndices[k]; l < network.firstNeighborIndices[k + 1]; l++) {
          const distance1 = layout.coordinates[0][k] - layout.coordinates[0][network.neighbors[l]]
          const distance2 = layout.coordinates[1][k] - layout.coordinates[1][network.neighbors[l]]
          const squaredDistance = distance1 * distance1 + distance2 * distance2

          const distance = Math.sqrt(squaredDistance)
          a = fastPow(distance, this.attraction)

          if (squaredDistance > 0) {
            const b = network.edgeWeights[l] * a / squaredDistance
            gradient1 += b * distance1
            gradient2 += b * distance2
          }

          if (!visitedNodes[network.neighbors[l]]) {
            if (this.attraction !== 0) {
              qualityValue += network.edgeWeights[l] * a / this.attraction
            } else {
              qualityValue += network.edgeWeights[l] * Math.log(distance)
            }
          }
        }

        for (let l = 0; l < network.nNodes; l++) {
          if (l !== k) {
            const distance1 = layout.coordinates[0][k] - layout.coordinates[0][l]
            const distance2 = layout.coordinates[1][k] - layout.coordinates[1][l]
            const squaredDistance = distance1 * distance1 + distance2 * distance2
            const distance = Math.sqrt(squaredDistance)

            a = fastPow(distance, this.repulsion)

            if (squaredDistance > 0) {
              const b = network.nodeWeights[k] * network.nodeWeights[l] * a / squaredDistance
              gradient1 -= b * distance1
              gradient2 -= b * distance2
            }

            if (!visitedNodes[l]) {
              if (this.repulsion !== 0) {
                qualityValue -= network.nodeWeights[k] * network.nodeWeights[l] * a / this.repulsion
              } else {
                qualityValue -= network.nodeWeights[k] * network.nodeWeights[l] * Math.log(distance)
              }
            }

            if (this.edgeWeightIncrement > 0) {
              a = fastPow(distance, this.attraction)

              if (squaredDistance > 0) {
                const b = this.edgeWeightIncrement * a / squaredDistance
                gradient1 += b * distance1
                gradient2 += b * distance2
              }

              if (!visitedNodes[l]) {
                if (this.attraction !== 0) {
                  qualityValue += this.edgeWeightIncrement * a / this.attraction
                } else {
                  qualityValue += this.edgeWeightIncrement * Math.log(distance)
                }
              }
            }
          }
        }

        const gradientLength = Math.sqrt(gradient1 * gradient1 + gradient2 * gradient2)
        layout.coordinates[0][k] -= stepSize * gradient1 / gradientLength
        layout.coordinates[1][k] -= stepSize * gradient2 / gradientLength

        visitedNodes[k] = true
      }

      if (qualityValue < oldQualityValue) {
        nQualityValueImprovements++
        if (nQualityValueImprovements >= this.requiredNQualityValueImprovements) {
          stepSize /= this.stepSizeReduction
          nQualityValueImprovements = 0
        }
      } else {
        stepSize *= this.stepSizeReduction
        nQualityValueImprovements = 0
      }

      i++
    }
  }
}
