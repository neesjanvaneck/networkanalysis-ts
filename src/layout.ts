import Random from 'java-random'
import { calcAverage, calcMedian, calcMinimum, calcMaximum } from './utils/arrays'

/**
 * Interface for specifying the number of nodes when constructing a layout.
 */
export interface LayoutConstructorParametersWithNNodes {
  /**
   * Number of nodes.
   */
  nNodes: number
}

/**
 * Interface for specifying the number of nodes and the random number generator
 * when constructing a layout.
 */
export interface LayoutConstructorParametersWithNNodesAndRandom {
  /**
   * Number of nodes.
   */
  nNodes: number

  /**
   * Random number generator.
   */
  random: Random
}

/**
 * Interface for specifying the coordinates for each node when constructing a
 * layout.
 */
export interface LayoutConstructorParametersWithCoordinates {
  /**
   * Coordinates of each node.
   */
  coordinates: number[][]
}

/**
 * Layout of the nodes in a network.
 */
export default class Layout {
  /**
   * Coordinates of each node.
   */
  public coordinates!: number[][]

  /**
   * Number of nodes.
   */
  protected nNodes!: number

  /**
   * Constructs a layout.
   *
   * @param parameters Layout constructor parameters.
   */
  public constructor (parameters: LayoutConstructorParametersWithNNodes | LayoutConstructorParametersWithNNodesAndRandom | LayoutConstructorParametersWithCoordinates) {
    if (typeof (parameters as LayoutConstructorParametersWithNNodesAndRandom).random !== 'undefined') {
      const layoutParameters = parameters as LayoutConstructorParametersWithNNodesAndRandom
      this.initializeBasedOnNNodesAndRandom(layoutParameters.nNodes, layoutParameters.random)
    } else if (typeof (parameters as LayoutConstructorParametersWithNNodes).nNodes !== 'undefined') {
      const layoutParameters = parameters as LayoutConstructorParametersWithNNodes
      this.initializeBasedOnNNodes(layoutParameters.nNodes)
    } else if (typeof (parameters as LayoutConstructorParametersWithCoordinates).coordinates !== 'undefined') {
      const layoutParameters = parameters as LayoutConstructorParametersWithCoordinates
      this.initializeBasedOnCoordinates(layoutParameters.coordinates)
    }
  }

  /**
   * Initializes a random layout for a specified number of nodes.
   *
   * @param nNodes Number of nodes
   */
  public initializeBasedOnNNodes (nNodes: number): void {
    this.initializeBasedOnNNodesAndRandom(nNodes, new Random())
  }

  /**
   * Initializes a random layout for a specified number of nodes.
   *
   * @param nNodes Number of nodes
   * @param random Random number generator
   */
  public initializeBasedOnNNodesAndRandom (nNodes: number, random: Random): void {
    this.nNodes = nNodes
    this.coordinates = new Array<Array<number>>(2)
    this.coordinates[0] = new Array<number>(nNodes)
    this.coordinates[1] = new Array<number>(nNodes)
    this.initRandomCoordinatesHelper(random)
  }

  /**
   * Initializes a layout using specified coordinates for each node.
   *
   * @param coordinates Coordinates of each node
   */
  public initializeBasedOnCoordinates (coordinates: number[][]): void {
    this.nNodes = coordinates[0].length
    this.coordinates = new Array<Array<number>>(2)
    this.coordinates[0] = coordinates[0].slice()
    this.coordinates[1] = coordinates[1].slice()
  }

  /**
   * Clones the layout.
   *
   * @return Cloned layout
   */
  public clone (): Layout {
    const clonedLayout = new Layout({ nNodes: this.nNodes } as LayoutConstructorParametersWithNNodes)
    clonedLayout.coordinates = new Array<Array<number>>(2)
    clonedLayout.coordinates[0] = this.coordinates[0].slice()
    clonedLayout.coordinates[1] = this.coordinates[1].slice()
    return clonedLayout
  }

  /**
   * Returns the number of nodes.
   *
   * @return Number of nodes
   */
  public getNNodes (): number {
    return this.nNodes
  }

  /**
   * Returns the coordinates of each node.
   *
   * @return Coordinates of each node
   */
  public getCoordinates (): number[][] {
    const clonedCoordinates = new Array<Array<number>>(2)
    clonedCoordinates[0] = this.coordinates[0].slice()
    clonedCoordinates[1] = this.coordinates[1].slice()
    return clonedCoordinates
  }

  /**
   * Returns the coordinates of a node.
   *
   * @param node Node
   *
   * @return Coordinates
   */
  public getCoordinatesNode (node: number): number[] {
    const coordinates = new Array<number>(2)
    coordinates[0] = this.coordinates[0][node]
    coordinates[1] = this.coordinates[1][node]
    return coordinates
  }

  /**
   * Returns the minimum of the coordinates of all node.
   *
   * @return Minimum coordinates
   */
  public getMinCoordinates (): number[] {
    const minCoordinates = Array<number>(2)
    minCoordinates[0] = calcMinimum(this.coordinates[0])
    minCoordinates[1] = calcMinimum(this.coordinates[1])
    return minCoordinates
  }

  /**
   * Returns the maximum of the coordinates of all node.
   *
   * @return Maximum coordinates
   */
  public getMaxCoordinates (): number[] {
    const maxCoordinates = Array<number>(2)
    maxCoordinates[0] = calcMaximum(this.coordinates[0])
    maxCoordinates[1] = calcMaximum(this.coordinates[1])
    return maxCoordinates
  }

  /**
   * Returns the average distance between all pairs of nodes.
   *
   * @return Average distance
   */
  public getAverageDistance (): number {
    let averageDistance = 0
    for (let i = 0; i < this.nNodes; i++) {
      for (let j = 0; j < i; j++) {
        const distance1 = this.coordinates[0][i] - this.coordinates[0][j]
        const distance2 = this.coordinates[1][i] - this.coordinates[1][j]
        averageDistance += Math.sqrt(distance1 * distance1 + distance2 * distance2)
      }
    }
    averageDistance /= this.nNodes * (this.nNodes - 1) / 2
    return averageDistance
  }

  /**
   * Positions a node at coordinates.
   *
   * @param node        Node
   * @param coordinates Coordinates
   */
  public setCoordinates (node: number, coordinates: number[]): void {
    this.coordinates[0][node] = coordinates[0]
    this.coordinates[1][node] = coordinates[1]
  }

  /**
   * Initializes a random layout.
   *
   * Each node is positioned at random coordinates.
   *
   * @param random Random number generator
   */
  public initRandomCoordinates (random: Random = new Random()): void {
    this.initRandomCoordinatesHelper(random)
  }

  /**
   * Standardizes a layout.
   *
   * Standardization involves translation, rotation, reflection, and
   * optionally dilation. The layout is translated so that it is centered at
   * the origin. The layout is rotated so that the variance in the horizontal
   * dimension is maximized. The layout is reflected so that in both the
   * horizontal and the vertical dimension the median of the coordinates is
   * non-positive. If `standardizeDistances = true`, the layout is dilated so
   * that the average distance between nodes equals one.
   *
   * @param standardizeDistances Standardize distances
   */
  public standardize (standardizeDistances: boolean): void {
    const averageCoordinate1 = calcAverage(this.coordinates[0])
    const averageCoordinate2 = calcAverage(this.coordinates[1])
    for (let i = 0; i < this.nNodes; i++) {
      this.coordinates[0][i] -= averageCoordinate1
      this.coordinates[1][i] -= averageCoordinate2
    }

    let variance1 = 0
    let variance2 = 0
    let covariance = 0
    for (let i = 0; i < this.nNodes; i++) {
      variance1 += this.coordinates[0][i] * this.coordinates[0][i]
      variance2 += this.coordinates[1][i] * this.coordinates[1][i]
      covariance += this.coordinates[0][i] * this.coordinates[1][i]
    }
    variance1 /= this.nNodes
    variance2 /= this.nNodes
    covariance /= this.nNodes
    const discriminant = variance1 * variance1 + variance2 * variance2 - 2 * variance1 * variance2 + 4 * covariance * covariance
    const eigenvalue1 = (variance1 + variance2 - Math.sqrt(discriminant)) / 2
    const eigenvalue2 = (variance1 + variance2 + Math.sqrt(discriminant)) / 2
    let normalizedEigenvector11 = variance1 + covariance - eigenvalue1
    let normalizedEigenvector12 = variance2 + covariance - eigenvalue1
    let vectorLength = Math.sqrt(normalizedEigenvector11 * normalizedEigenvector11 + normalizedEigenvector12 * normalizedEigenvector12)
    normalizedEigenvector11 /= vectorLength
    normalizedEigenvector12 /= vectorLength
    let normalizedEigenvector21 = variance1 + covariance - eigenvalue2
    let normalizedEigenvector22 = variance2 + covariance - eigenvalue2
    vectorLength = Math.sqrt(normalizedEigenvector21 * normalizedEigenvector21 + normalizedEigenvector22 * normalizedEigenvector22)
    normalizedEigenvector21 /= vectorLength
    normalizedEigenvector22 /= vectorLength
    for (let i = 0; i < this.nNodes; i++) {
      const coordinateOld1 = this.coordinates[0][i]
      const coordinateOld2 = this.coordinates[1][i]
      this.coordinates[0][i] = normalizedEigenvector11 * coordinateOld1 + normalizedEigenvector12 * coordinateOld2
      this.coordinates[1][i] = normalizedEigenvector21 * coordinateOld1 + normalizedEigenvector22 * coordinateOld2
    }

    for (let i = 0; i < 2; i++) {
      if (calcMedian(this.coordinates[i]) > 0) {
        this.flip(i)
      }
    }

    if (standardizeDistances) {
      const averageDistance = this.getAverageDistance()
      for (let i = 0; i < this.nNodes; i++) {
        this.coordinates[0][i] /= averageDistance
        this.coordinates[1][i] /= averageDistance
      }
    }
  }

  /**
   * Rotates a layout.
   *
   * @param angle Angle
   */
  public rotate (angle: number): void {
    const sin = Math.sin(-angle * Math.PI / 180)
    const cos = Math.cos(-angle * Math.PI / 180)
    for (let i = 0; i < this.nNodes; i++) {
      const coordinateOld1 = this.coordinates[0][i]
      const coordinateOld2 = this.coordinates[1][i]
      this.coordinates[0][i] = cos * coordinateOld1 - sin * coordinateOld2
      this.coordinates[1][i] = sin * coordinateOld1 + cos * coordinateOld2
    }
  }

  /**
   * Flips a layout.
   *
   * @param dimension Dimension
   */
  public flip (dimension: number): void {
    for (let i = 0; i < this.nNodes; i++) {
      this.coordinates[dimension][i] *= -1
    }
  }

  private initRandomCoordinatesHelper (random: Random): void {
    for (let i = 0; i < this.nNodes; i++) {
      this.coordinates[0][i] = 2 * random.nextDouble() - 1
      this.coordinates[1][i] = 2 * random.nextDouble() - 1
    }
  }
}
