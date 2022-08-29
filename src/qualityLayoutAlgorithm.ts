import Layout from './layout'
import LayoutAlgorithm from './layoutAlgorithm'
import Network from './network'

/**
 * Interface for layout algorithms that use a quality function.
 */
export default interface QualityLayoutAlgorithm extends LayoutAlgorithm {
  /**
   * Calculates the quality of a layout of the nodes in a network.
   *
   * @param network Network
   * @param layout  Layout
   *
   * @return Quality of the layout
   */
  calcQuality (network: Network, layout: Layout): number
}
