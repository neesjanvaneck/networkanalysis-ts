import Layout from './layout'
import Network from './network'
import QualityLayoutAlgorithm from './qualityLayoutAlgorithm'
import { fastPow } from './utils/fastMath'

/**
 * Abstract base class for layout algorithms that use the VOS quality function.
 */
export default abstract class VOSLayoutAlgorithm implements QualityLayoutAlgorithm {
  /**
   * Default attraction parameter.
   */
  public static readonly DEFAULT_ATTRACTION: number = 2

  /**
   * Default repulsion parameter.
   */
  public static readonly DEFAULT_REPULSION: number = 1

  /**
   * Default edge weight increment parameter.
   */
  public static readonly DEFAULT_EDGE_WEIGHT_INCREMENT: number = 0

  /**
   * Attraction parameter.
   */
  protected attraction!: number

  /**
   * Repulsion parameter.
   */
  protected repulsion!: number

  /**
   * Edge weight increment parameter.
   */
  protected edgeWeightIncrement!: number

  /**
   * Constructs a VOS layout algorithm.
   */
  public constructor () {
    this.initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrement(VOSLayoutAlgorithm.DEFAULT_ATTRACTION, VOSLayoutAlgorithm.DEFAULT_REPULSION, VOSLayoutAlgorithm.DEFAULT_EDGE_WEIGHT_INCREMENT)
  }

  /**
   * Initializes a VOS layout algorithm with a specified attraction parameter,
   * repulsion parameter, and edge weight increment parameter.
   *
   * @param attraction          Attraction parameter
   * @param repulsion           Repulsion parameter
   * @param edgeWeightIncrement Edge weight increment parameter
   */
  public initializeBasedOnAttractionAndRepulsionAndEdgeWeightIncrement (attraction: number, repulsion: number, edgeWeightIncrement: number): void {
    this.attraction = attraction
    this.repulsion = repulsion
    this.edgeWeightIncrement = edgeWeightIncrement
  }

  /**
   * Returns the attraction parameter.
   *
   * @return Attraction parameter
   */
  public getAttraction (): number {
    return this.attraction
  }

  /**
   * Returns the repulsion parameter.
   *
   * @return Repulsion parameter
   */
  public getRepulsion (): number {
    return this.repulsion
  }

  /**
   * Returns the edge weight increment parameter.
   *
   * @return Edge weight increment parameter
   */
  public getEdgeWeightIncrement (): number {
    return this.edgeWeightIncrement
  }

  /**
   * Sets the attraction parameter.
   *
   * @param attraction Attraction parameter
   */
  public setAttraction (attraction: number): void {
    this.attraction = attraction
  }

  /**
   * Sets the repulsion parameter.
   *
   * @param repulsion Repulsion parameter
   */
  public setRepulsion (repulsion: number): void {
    this.repulsion = repulsion
  }

  /**
   * Sets the edge weight increment parameter.
   *
   * @param edgeWeightIncrement Edge weight increment parameter
   */
  public setEdgeWeightIncrement (edgeWeightIncrement: number): void {
    this.edgeWeightIncrement = edgeWeightIncrement
  }

  /**
   * Calculates the quality of a layout using the VOS quality function.
   *
   * The VOS quality function is given by
   *
   * ```
   * 1 / attraction * sum(a[i][j] * d(x[i], x[j]) ^
   * attraction) - 1 / repulsion * sum(d(x[i], x[j]) ^
   * repulsion),
   * ```
   *
   * where `a[i][j]` is the weight of the edge between nodes `i` and `j` and
   * `x[i] = (x[i][1], x[i][2])` are the coordinates of node `i`. The function
   * `d(x[i], x[j])` is the Euclidean distance between nodes `i` and `j`. The
   * sum is taken over all pairs of nodes `i` and `j` with `j < i`. The
   * attraction parameter must be greater than the repulsion parameter. The
   * lower the value of the VOS quality function, the higher the quality of the
   * layout.
   *
   * @param network Network
   * @param layout  Layout
   *
   * @return Quality of the layout
   */
  public calcQuality (network: Network, layout: Layout): number {
    let quality = 0

    for (let i = 0; i < network.nNodes; i++) {
      for (let j = network.firstNeighborIndices[i]; j < network.firstNeighborIndices[i + 1]; j++) {
        if (network.neighbors[j] < i) {
          const distance1 = layout.coordinates[0][i] - layout.coordinates[0][network.neighbors[j]]
          const distance2 = layout.coordinates[1][i] - layout.coordinates[1][network.neighbors[j]]
          const distance = Math.sqrt(distance1 * distance1 + distance2 * distance2)
          if (this.attraction !== 0) {
            quality += network.edgeWeights[j] * fastPow(distance, this.attraction) / this.attraction
          } else {
            quality += network.edgeWeights[j] * Math.log(distance)
          }
        }
      }
    }

    for (let i = 0; i < network.nNodes; i++) {
      for (let j = 0; j < i; j++) {
        const distance1 = layout.coordinates[0][i] - layout.coordinates[0][j]
        const distance2 = layout.coordinates[1][i] - layout.coordinates[1][j]
        const distance = Math.sqrt(distance1 * distance1 + distance2 * distance2)

        if (this.repulsion !== 0) {
          quality -= network.nodeWeights[i] * network.nodeWeights[j] * fastPow(distance, this.repulsion) / this.repulsion
        } else {
          quality -= network.nodeWeights[i] * network.nodeWeights[j] * Math.log(distance)
        }

        if (this.edgeWeightIncrement > 0) {
          if (this.attraction !== 0) {
            quality += this.edgeWeightIncrement * fastPow(distance, this.attraction) / this.attraction
          } else {
            quality += this.edgeWeightIncrement * Math.log(distance)
          }
        }
      }
    }

    return quality
  }

  /**
   * Clones the algorithm.
   *
   * @return Cloned algorithm
   */
  public abstract clone (): VOSLayoutAlgorithm

  /**
   * Finds a layout of the nodes in a network.
   *
   * @param network Network
   *
   * @return Layout
   */
  public abstract findLayout (network: Network): Layout
}
