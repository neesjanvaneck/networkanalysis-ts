import Clustering from '../clustering'
import Layout from '../layout'
import Network from '../network'
import type { Node, Link } from './types'

export default class NetworkHelper {
  private _nodes: Node[]
  private _network: Network
  private _initialClustering: Clustering | undefined
  private _initialLayout: Layout | undefined

  public constructor (nodes: Node[], links: Link[]) {
    this._nodes = nodes

    // Deduplicate links and convert them to an edge list.
    const nodeIdToIndex: { [key: string]: number } = {}
    nodes.forEach((node, index) => {
      nodeIdToIndex[node.id] = index
    })
    const edgeContainer: { [key: string]: { node1Index: number, node2Index: number, weight: number } } = {}
    links.forEach(link => {
      let node1Index = nodeIdToIndex[link.node1.id]
      let node2Index = nodeIdToIndex[link.node2.id]
      if (node1Index !== node2Index) {
        const weight = link.weight ?? 1
        if (node2Index < node1Index) {
          const oldNode1Index = node1Index
          node1Index = node2Index
          node2Index = oldNode1Index
        }
        if (edgeContainer[`${node1Index}-${node2Index}`]) {
          edgeContainer[`${node1Index}-${node2Index}`].weight += weight
        } else {
          edgeContainer[`${node1Index}-${node2Index}`] = { node1Index, node2Index, weight }
        }
      }
    })
    const edgeList = Object.values(edgeContainer)

    // Create network object.
    let nNodes = this._nodes.length
    const nEdges = edgeList.length
    const edges = new Array<number[]>(2)
    edges[0] = new Array<number>(nEdges)
    edges[1] = new Array<number>(nEdges)
    const edgeWeights = new Array<number>(nEdges)
    edgeList.forEach((edge, i) => {
      edges[0][i] = edge.node1Index
      edges[1][i] = edge.node2Index
      edgeWeights[i] = edge.weight
      if (edge.node1Index > nNodes) nNodes = edge.node1Index + 1
      if (edge.node2Index > nNodes) nNodes = edge.node2Index + 1
    })
    this._network = new Network({
      nNodes: nNodes,
      setNodeWeightsToTotalEdgeWeights: true,
      edges: edges,
      edgeWeights: edgeWeights,
      sortedEdges: false,
      checkIntegrity: false,
    })

    // Create initial clustering object.
    const clusters = nodes.map(node => Number(node.cluster))
    if (!clusters.includes(NaN)) {
      const uniqueClusters = [...new Set<number>(clusters)].sort((a, b) => a - b)
      const clusterIdToIndex: { [key: number]: number } = {}
      uniqueClusters.forEach((cluster, index) => {
        clusterIdToIndex[cluster] = index
      })
      const zeroIndexedClusters = new Array<number>(clusters.length)
      clusters.forEach((cluster, index) => {
        zeroIndexedClusters[index] = clusterIdToIndex[cluster]
      })
      this._initialClustering = new Clustering({ clusters: zeroIndexedClusters })
    }

    // Create initial layout object.
    const coordinates = new Array<Array<number>>(2)
    coordinates[0] = nodes.map(item => Number(item.x))
    coordinates[1] = nodes.map(item => Number(item.y))
    if (!coordinates[0].includes(NaN) && !coordinates[1].includes(NaN)) this._initialLayout = new Layout({ coordinates })
  }

  public getNetwork (): Network {
    return this._network
  }

  public getInitialClustering (): Clustering | undefined {
    return this._initialClustering
  }

  public getInitialLayout (): Layout | undefined {
    return this._initialLayout
  }

  public setClusters (clusters: number[]): void {
    this._nodes.forEach((node, i) => {
      node.cluster = clusters[i]
    })
  }

  public setCoordinates (coordinates: number[][]): void {
    this._nodes.forEach((node, i) => {
      node.x = coordinates[0][i]
      node.y = coordinates[1][i]
    })
  }
}
