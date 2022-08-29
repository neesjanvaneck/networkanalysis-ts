import ClusteringAlgorithm from './clusteringAlgorithm'
import Clustering, { ClusteringParametersWithNNodes } from './clustering'
import Network from './network'

/**
 * Algorithm for finding the connected components of a network.
 */
export default class ComponentsAlgorithm implements ClusteringAlgorithm {
  /**
   * Constructs a components algorithm.
   */
  // public constructor () {}

  /**
   * Finds the connected components of a network.
   *
   * @param network Network
   *
   * @return Connected components
   */
  public findClustering (network: Network): Clustering {
    const clustering = new Clustering({ nNodes: network.getNNodes() } as ClusteringParametersWithNNodes)

    clustering.nClusters = 0
    const nodesVisited = new Array<boolean>(network.nNodes).fill(false)
    const nodes = new Array<number>(network.nNodes).fill(0)
    for (let i = 0; i < network.nNodes; i++) {
      if (!nodesVisited[i]) {
        clustering.clusters[i] = clustering.nClusters
        nodesVisited[i] = true
        nodes[0] = i
        let j = 1
        let k = 0
        do {
          for (let l = network.firstNeighborIndices[nodes[k]]; l < network.firstNeighborIndices[nodes[k] + 1]; l++) {
            if (!nodesVisited[network.neighbors[l]]) {
              clustering.clusters[network.neighbors[l]] = clustering.nClusters
              nodesVisited[network.neighbors[l]] = true
              nodes[j] = network.neighbors[l]
              j++
            }
          }
          k++
        } while (k < j)

        clustering.nClusters++
      }
    }

    clustering.orderClustersByNNodes()

    return clustering
  }
}
