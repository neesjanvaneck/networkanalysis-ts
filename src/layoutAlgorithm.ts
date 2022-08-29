import Layout from './layout'
import Network from './network'

/**
 * Interface for layout algorithms.
 */
export default interface LayoutAlgorithm {
  /**
   * Finds a layout of the nodes in a network.
   *
   * @param network Network
   *
   * @return Layout
   */
  findLayout (network: Network): Layout
}
