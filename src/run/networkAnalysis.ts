import NetworkHelper from './networkHelper'
import type { Node, Link } from './types'

export default abstract class NetworkAnalysis {
  protected _networkHelper: NetworkHelper | undefined

  /**
   * Initialize network data.
   */
  public data (nodes: Node[], links: Link[]): this {
    this._networkHelper = new NetworkHelper(nodes, links)
    return this
  }

  /**
   * Run network analysis.
   */
  public abstract run (): void
}
