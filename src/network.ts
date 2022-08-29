import Random from 'java-random'
import ComponentsAlgorithm from './componentsAlgorithm'
import Clustering from './clustering'
import { calcSum, calcSumWithinRange, createDoubleArrayOfRandomNumbers, binarySearch } from './utils/arrays'

/**
 * Interface for specifying parameters when constructing a network.
 */
export interface NetworkConstructorParameters {
  /**
   * Number of nodes.
   */
  nNodes?: number

  /**
   * Indicates whether to set node weights equal to total edge weights.
   */
  setNodeWeightsToTotalEdgeWeights?: boolean

  /**
   * Node weights.
   */
  nodeWeights?: number[]

  /**
   * Edge list.
   */
  edges?: number[][]

  /**
   * Index of the first neighbor of each node.
   */
  firstNeighborIndices?: number[]

  /**
   * Neighbor list.
   */
  neighbors?: number[]

  /**
   * Edge weights.
   */
  edgeWeights?: number[]

  /**
   * Indicates whether the edge list is sorted.
   */
  sortedEdges?: boolean

  /**
   * Indicates whether to check the integrity of the network.
   */
  checkIntegrity?: boolean
}

/**
 * Network.
 *
 * Weighted nodes and weighted edges are supported. Directed edges are not
 * supported.
 *
 * Network objects are immutable.
 *
 * The adjacency matrix of the network is stored in a sparse compressed format.
 */
export default class Network {
  /**
   * Number of nodes.
   */
  public nNodes!: number

  /**
   * Node weights.
   */
  public nodeWeights!: number[]

  /**
   * Index of the first neighbor of each node in the `neighbors` array.
   *
   * The neighbors of node `i` are given by
   * `neighbors[firstNeighborIndices[i]], ...,
   * neighbors[firstNeighborIndices[i + 1] - 1]`.
   */
  public firstNeighborIndices!: number[]

  /**
   * Neighbors of each node.
   */
  public neighbors!: number[]

  /**
   * Edge weights.
   */
  public edgeWeights!: number[]

  /**
   * Total edge weight of self links.
   */
  public totalEdgeWeightSelfLinks!: number

  /**
   * Number of edges.
   *
   * Each edge is counted twice, once in each direction.
   */
  protected nEdges!: number

  /**
   * Constructs a network based on a list of edges or neighbors.
   *
   * @param parameters Network constructor parameters
   */
  public constructor (parameters?: NetworkConstructorParameters) {
    if (parameters) {
      if (parameters.nodeWeights && parameters.edges) {
        this.initializeNetworkBasedOnEdges(parameters.nodeWeights.length, parameters.nodeWeights, parameters.setNodeWeightsToTotalEdgeWeights, parameters.edges, parameters.edgeWeights, parameters.sortedEdges, parameters.checkIntegrity)
      } else if (parameters.nodeWeights && parameters.firstNeighborIndices && parameters.neighbors) {
        this.initializeNetworkBasedOnNeighbors(parameters.nodeWeights.length, parameters.nodeWeights, parameters.setNodeWeightsToTotalEdgeWeights, parameters.firstNeighborIndices, parameters.neighbors, parameters.edgeWeights, parameters.checkIntegrity)
      } else if (parameters.nNodes && parameters.edges) {
        this.initializeNetworkBasedOnEdges(parameters.nNodes, parameters.nodeWeights, parameters.setNodeWeightsToTotalEdgeWeights, parameters.edges, parameters.edgeWeights, parameters.sortedEdges, parameters.checkIntegrity)
      } else if (parameters.nNodes && parameters.firstNeighborIndices && parameters.neighbors) {
        this.initializeNetworkBasedOnNeighbors(parameters.nNodes, parameters.nodeWeights, parameters.setNodeWeightsToTotalEdgeWeights, parameters.firstNeighborIndices, parameters.neighbors, parameters.edgeWeights, parameters.checkIntegrity)
      }
    }
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
   * Returns the total node weight.
   *
   * @return Total node weight
   */
  public getTotalNodeWeight (): number {
    return calcSum(this.nodeWeights)
  }

  /**
   * Returns the weight of each node.
   *
   * @return Weight of each node
   */
  public getNodeWeights (): number[] {
    return this.nodeWeights.slice()
  }

  /**
   * Returns the weight of a node.
   *
   * @param node Node
   *
   * @return Weight
   */
  public getNodeWeight (node: number): number {
    return this.nodeWeights[node]
  }

  /**
   * Returns the number of edges.
   *
   * Each edge is counted only once, even though an edge runs in two
   * directions. This means that the number of edges returned by
   * {@link getEdges} equals twice the number of edges returned by
   * {@link getNEdges}.
   *
   * @return Number of edges
   */
  public getNEdges (): number {
    return this.nEdges / 2
  }

  /**
   * Returns the number of neighbors per node.
   *
   * @return Number of neighbors per node
   */
  public getNNeighborsPerNode (): number[] {
    const nNeighborsPerNode = new Array<number>(this.nNodes)
    for (let i = 0; i < this.nNodes; i++) {
      nNeighborsPerNode[i] = this.firstNeighborIndices[i + 1] - this.firstNeighborIndices[i]
    }
    return nNeighborsPerNode
  }

  /**
   * Returns the number of neighbors of a node.
   *
   * @param node Node
   *
   * @return Number of neighbors
   */
  public getNNeighbors (node: number): number {
    return this.firstNeighborIndices[node + 1] - this.firstNeighborIndices[node]
  }

  /**
   * Returns the list of edges.
   *
   * Each edge is included twice, once in each direction. This means that the
   * number of edges returned by {@link getEdges} equals twice the number of
   * edges returned by {@link getNEdges}.
   *
   * The list of edges is returned in a two-dimensional array `edges`.
   * Edge `i` connects nodes `edges[0][i]` and `edges[1][i]`.
   *
   * @return List of edges
   */
  public getEdges (): number[][] {
    const edges = new Array<Array<number>>(2)
    edges[0] = new Array<number>(this.nEdges)
    for (let i = 0; i < this.nNodes; i++) {
      edges[0].fill(i, this.firstNeighborIndices[i], this.firstNeighborIndices[i + 1])
    }
    edges[1] = this.neighbors.slice()
    return edges
  }

  /**
   * Returns a list of neighbors per node.
   *
   * @return List of neighbors per node
   */
  public getNeighborsPerNode (): number[][] {
    const neighborsPerNode = new Array<Array<number>>(this.nNodes)
    for (let i = 0; i < this.nNodes; i++) {
      neighborsPerNode[i] = this.neighbors.slice(this.firstNeighborIndices[i], this.firstNeighborIndices[i + 1])
    }
    return neighborsPerNode
  }

  /**
   * Returns the list of neighbors of a node.
   *
   * @param node Node
   *
   * @return List of neighbors
   */
  public getNeighbors (node: number): number[] {
    return this.neighbors.slice(this.firstNeighborIndices[node], this.firstNeighborIndices[node + 1])
  }

  /**
   * Returns the total edge weight per node. The total edge weight of a node
   * equals the sum of the weights of the edges between the node and its
   * neighbors.
   *
   * @return Total edge weight per node
   */
  public getTotalEdgeWeightPerNode (): number[] {
    return this.getTotalEdgeWeightPerNodeHelper()
  }

  /**
   * Returns the total edge weight.
   *
   * Each edge is considered only once, even though an edge runs in two
   * directions. This means that the sum of the edge weights returned by
   * {@link getEdgeWeights} equals twice the total edge weight returned by
   * {@link getTotalEdgeWeight}.
   *
   * Edge weights of self links are not included.
   *
   * @param node Node
   *
   * @return Total edge weight
   */
  public getTotalEdgeWeight (node?: number): number {
    return node === undefined ? calcSum(this.edgeWeights) / 2 : calcSumWithinRange(this.edgeWeights, this.firstNeighborIndices[node], this.firstNeighborIndices[node + 1])
  }

  /**
   * Returns a list of edge weights per node. These are the weights of the
   * edges between a node and its neighbors.
   *
   * @return List of edge weights per node
   */
  public getEdgeWeightsPerNode (): number[][] {
    const edgeWeightsPerNode = new Array<Array<number>>(this.nNodes)
    for (let i = 0; i < this.nNodes; i++) {
      edgeWeightsPerNode[i] = this.edgeWeights.slice(this.firstNeighborIndices[i], this.firstNeighborIndices[i + 1])
    }
    return edgeWeightsPerNode
  }

  /**
   * Returns the list of edge weights of a node. These are the weights of the
   * edges between the node and its neighbors.
   *
   * @param node Node
   *
   * @return List of edge weights
   */
  public getEdgeWeights (node?: number): number[] {
    return node === undefined ? this.edgeWeights.slice() : this.edgeWeights.slice(this.firstNeighborIndices[node], this.firstNeighborIndices[node + 1])
  }

  /**
   * Returns the total edge weight of self links.
   *
   * @return Total edge weight of self links
   */
  public getTotalEdgeWeightSelfLinks (): number {
    return this.totalEdgeWeightSelfLinks
  }

  /**
   * Creates a copy of the network, but without node weights.
   *
   * Each node is assigned a weight of 1.
   *
   * @return Network without node weights
   */
  public createNetworkWithoutNodeWeights (): Network {
    const networkWithoutNodeWeights = new Network()
    networkWithoutNodeWeights.nNodes = this.nNodes
    networkWithoutNodeWeights.nEdges = this.nEdges
    networkWithoutNodeWeights.nodeWeights = new Array<number>(this.nNodes).fill(1)
    networkWithoutNodeWeights.firstNeighborIndices = this.firstNeighborIndices
    networkWithoutNodeWeights.neighbors = this.neighbors
    networkWithoutNodeWeights.edgeWeights = this.edgeWeights
    networkWithoutNodeWeights.totalEdgeWeightSelfLinks = this.totalEdgeWeightSelfLinks
    return networkWithoutNodeWeights
  }

  /**
   * Creates a copy of the network, but without edge weights.
   *
   * Each edge is assigned a weight of 1.
   *
   * @return Network without edge weights
   */
  public createNetworkWithoutEdgeWeights (): Network {
    const networkWithoutEdgeWeights = new Network()
    networkWithoutEdgeWeights.nNodes = this.nNodes
    networkWithoutEdgeWeights.nEdges = this.nEdges
    networkWithoutEdgeWeights.nodeWeights = this.nodeWeights
    networkWithoutEdgeWeights.firstNeighborIndices = this.firstNeighborIndices
    networkWithoutEdgeWeights.neighbors = this.neighbors
    networkWithoutEdgeWeights.edgeWeights = new Array<number>(this.nEdges).fill(1)
    networkWithoutEdgeWeights.totalEdgeWeightSelfLinks = 0
    return networkWithoutEdgeWeights
  }

  /**
   * Creates a copy of the network, but without node and edge weights.
   *
   * Each node is assigned a weight of 1, and each edge is assigned a weight
   * of 1.
   *
   * @return Network without node and edge weights
   */
  public createNetworkWithoutNodeAndEdgeWeights (): Network {
    const networkWithoutNodeAndEdgeWeights = new Network()
    networkWithoutNodeAndEdgeWeights.nNodes = this.nNodes
    networkWithoutNodeAndEdgeWeights.nEdges = this.nEdges
    networkWithoutNodeAndEdgeWeights.nodeWeights = new Array<number>(this.nNodes).fill(1)
    networkWithoutNodeAndEdgeWeights.firstNeighborIndices = this.firstNeighborIndices
    networkWithoutNodeAndEdgeWeights.neighbors = this.neighbors
    networkWithoutNodeAndEdgeWeights.edgeWeights = new Array<number>(this.nEdges).fill(1)
    networkWithoutNodeAndEdgeWeights.totalEdgeWeightSelfLinks = 0
    return networkWithoutNodeAndEdgeWeights
  }

  /**
   * Creates a copy of the network in which the edge weights have been
   * normalized using the association strength.
   *
   * The normalized weight `a'[i][j]` of the edge between nodes `i` and `j` is
   * given by
   *
   * ```
   * a'[i][j] = a[i][j] / (n[i] * n[j] / (2 * m)),
   * ```
   *
   * where `a[i][j]` is the non-normalized weight of the edge between nodes `i`
   * and `j`, `n[i]` is the weight of node `i`, and `m` is half the total node
   * weight.
   *
   * If each node's weight equals the total weight of the edges between the
   * node and its neighbors, the edge weights are normalized by dividing them
   * by the expected edge weights in the random configuration model.
   *
   * The node weights are set to 1.
   *
   * @return Normalized network
   */
  public createNormalizedNetworkUsingAssociationStrength (): Network {
    const normalizedNetwork = new Network()

    normalizedNetwork.nNodes = this.nNodes
    normalizedNetwork.nEdges = this.nEdges
    normalizedNetwork.nodeWeights = new Array<number>(this.nNodes).fill(1)
    normalizedNetwork.firstNeighborIndices = this.firstNeighborIndices
    normalizedNetwork.neighbors = this.neighbors

    normalizedNetwork.edgeWeights = new Array<number>(this.nEdges)
    const totalNodeWeight = this.getTotalNodeWeight()
    for (let i = 0; i < this.nNodes; i++) {
      for (let j = this.firstNeighborIndices[i]; j < this.firstNeighborIndices[i + 1]; j++) {
        normalizedNetwork.edgeWeights[j] = this.edgeWeights[j] / ((this.nodeWeights[i] * this.nodeWeights[this.neighbors[j]]) / totalNodeWeight)
      }
    }

    normalizedNetwork.totalEdgeWeightSelfLinks = 0

    return normalizedNetwork
  }

  /**
   * Creates a copy of the network in which the edge weights have been
   * normalized using fractionalization.
   *
   * The normalized weight `a'[i][j]` of the edge between nodes `i` and `j` is
   * given by
   *
   * ```
   * a'[i][j] = a[i][j] * (n / n[i] + n / n[j]) / 2,
   * ```
   *
   * where `a[i][j]` is the non-normalized weight of the edge between nodes `i`
   * and `j`, `n[i]` is the weight of node `i`, and `n` is the number of nodes.
   *
   * The node weights are set to 1.
   *
   * @return Normalized network
   */
  public createNormalizedNetworkUsingFractionalization (): Network {
    const normalizedNetwork = new Network()

    normalizedNetwork.nNodes = this.nNodes
    normalizedNetwork.nEdges = this.nEdges
    normalizedNetwork.nodeWeights = new Array<number>(this.nNodes).fill(1)
    normalizedNetwork.firstNeighborIndices = this.firstNeighborIndices
    normalizedNetwork.neighbors = this.neighbors

    normalizedNetwork.edgeWeights = new Array<number>(this.nEdges)
    for (let i = 0; i < this.nNodes; i++) {
      for (let j = this.firstNeighborIndices[i]; j < this.firstNeighborIndices[i + 1]; j++) {
        normalizedNetwork.edgeWeights[j] = this.edgeWeights[j] / (2 / (this.nNodes / this.nodeWeights[i] + this.nNodes / this.nodeWeights[this.neighbors[j]]))
      }
    }

    normalizedNetwork.totalEdgeWeightSelfLinks = 0

    return normalizedNetwork
  }

  /**
   * Creates a copy of the network that has been pruned in order to have a
   * specified maximum number of edges.
   *
    * Only the edges with the highest weights are retained in the pruned
   * network. In case of ties, the edges to be retained are selected
   * randomly.
   *
   * @param maxNEdges Maximum number of edges
   * @param random    Random number generator
   *
   * @return Pruned network
   */
  public createPrunedNetwork (maxNEdges: number, random: Random = new Random()): Network {
    maxNEdges *= 2

    if (maxNEdges >= this.nEdges) return this

    const edgeWeights = new Array<number>(this.nEdges / 2).fill(0)
    let i = 0
    for (let j = 0; j < this.nNodes; j++) {
      let k = this.firstNeighborIndices[j]
      while ((k < this.firstNeighborIndices[j + 1]) && (this.neighbors[k] < j)) {
        edgeWeights[i] = this.edgeWeights[k]
        i++
        k++
      }
    }
    edgeWeights.sort((a, b) => a - b)
    const edgeWeightThreshold = edgeWeights[(this.nEdges - maxNEdges) / 2]

    let nEdgesAboveThreshold = 0
    while (edgeWeights[this.nEdges / 2 - nEdgesAboveThreshold - 1] > edgeWeightThreshold) {
      nEdgesAboveThreshold++
    }
    let nEdgesAtThreshold = 0
    while ((nEdgesAboveThreshold + nEdgesAtThreshold < this.nEdges / 2) && (edgeWeights[this.nEdges / 2 - nEdgesAboveThreshold - nEdgesAtThreshold - 1] === edgeWeightThreshold)) {
      nEdgesAtThreshold++
    }

    const randomNumbers = createDoubleArrayOfRandomNumbers(this.nNodes * this.nNodes, random)

    const randomNumbersEdgesAtThreshold = new Array<number>(nEdgesAtThreshold).fill(0)
    i = 0
    for (let j = 0; j < this.nNodes; j++) {
      let k = this.firstNeighborIndices[j]
      while ((k < this.firstNeighborIndices[j + 1]) && (this.neighbors[k] < j)) {
        if (this.edgeWeights[k] === edgeWeightThreshold) {
          randomNumbersEdgesAtThreshold[i] = this.getRandomNumber(j, this.neighbors[k], randomNumbers)
          i++
        }
        k++
      }
    }
    randomNumbersEdgesAtThreshold.sort((a, b) => a - b)
    const randomNumberThreshold = randomNumbersEdgesAtThreshold[nEdgesAboveThreshold + nEdgesAtThreshold - maxNEdges / 2]

    const prunedNetwork = new Network()

    prunedNetwork.nNodes = this.nNodes
    prunedNetwork.nEdges = maxNEdges
    prunedNetwork.nodeWeights = this.nodeWeights

    prunedNetwork.firstNeighborIndices = new Array<number>(this.nNodes + 1).fill(0)
    prunedNetwork.neighbors = new Array<number>(maxNEdges).fill(0)
    prunedNetwork.edgeWeights = new Array<number>(maxNEdges).fill(0)
    i = 0
    for (let j = 0; j < this.nNodes; j++) {
      for (let k = this.firstNeighborIndices[j]; k < this.firstNeighborIndices[j + 1]; k++) {
        if ((this.edgeWeights[k] > edgeWeightThreshold) || ((this.edgeWeights[k] === edgeWeightThreshold) && (this.getRandomNumber(j, this.neighbors[k], randomNumbers) >= randomNumberThreshold))) {
          prunedNetwork.neighbors[i] = this.neighbors[k]
          prunedNetwork.edgeWeights[i] = this.edgeWeights[k]
          i++
        }
      }
      prunedNetwork.firstNeighborIndices[j + 1] = i
    }

    prunedNetwork.totalEdgeWeightSelfLinks = 0

    return prunedNetwork
  }

  /**
   * Creates an induced subnetwork for specified nodes.
   *
   * @param nodes Nodes
   *
   * @return Subnetwork
   */
  public createSubnetworkForNodes1 (nodes: number[]): Network {
    const subnetwork = new Network()

    subnetwork.nNodes = nodes.length

    if (subnetwork.nNodes === 1) {
      subnetwork.nEdges = 0
      subnetwork.nodeWeights = new Array<number>(1)
      subnetwork.nodeWeights[0] = this.nodeWeights[nodes[0]]
      subnetwork.firstNeighborIndices = new Array<number>(2).fill(0)
      subnetwork.neighbors = new Array<number>(0)
      subnetwork.edgeWeights = new Array<number>(0)
    } else {
      const subnetworkNodes = new Array<number>(this.nNodes).fill(-1)
      for (let i = 0; i < nodes.length; i++) {
        subnetworkNodes[nodes[i]] = i
      }

      subnetwork.nEdges = 0
      subnetwork.nodeWeights = new Array<number>(subnetwork.nNodes)
      subnetwork.firstNeighborIndices = new Array<number>(subnetwork.nNodes + 1).fill(0)
      const subnetworkNeighbors = new Array<number>(this.nEdges).fill(0)
      const subnetworkEdgeWeights = new Array<number>(this.nEdges).fill(0)
      for (let i = 0; i < subnetwork.nNodes; i++) {
        const j = nodes[i]
        subnetwork.nodeWeights[i] = this.nodeWeights[j]
        for (let k = this.firstNeighborIndices[j]; k < this.firstNeighborIndices[j + 1]; k++) {
          if (subnetworkNodes[this.neighbors[k]] >= 0) {
            subnetworkNeighbors[subnetwork.nEdges] = subnetworkNodes[this.neighbors[k]]
            subnetworkEdgeWeights[subnetwork.nEdges] = this.edgeWeights[k]
            subnetwork.nEdges++
          }
        }

        subnetwork.firstNeighborIndices[i + 1] = subnetwork.nEdges
      }
      subnetwork.neighbors = subnetworkNeighbors.slice(0, subnetwork.nEdges)
      subnetwork.edgeWeights = subnetworkEdgeWeights.slice(0, subnetwork.nEdges)
    }

    subnetwork.totalEdgeWeightSelfLinks = 0

    return subnetwork
  }

  /**
   * Creates an induced subnetwork for specified nodes.
   *
   * @param nodesInSubnetwork Indicates the nodes to be included in the
   *                          subnetwork.
   *
   * @return Subnetwork
   */
  public createSubnetworkForNodes2 (nodesInSubnetwork: boolean[]): Network {
    let i = 0
    for (let j = 0; j < this.nNodes; j++) {
      if (nodesInSubnetwork[j]) {
        i++
      }
    }
    const nodes = new Array<number>(i).fill(0)
    i = 0
    for (let j = 0; j < this.nNodes; j++) {
      if (nodesInSubnetwork[j]) {
        nodes[i] = j
        i++
      }
    }
    return this.createSubnetworkForNodes1(nodes)
  }

  /**
   * Creates an induced subnetwork for a specified cluster in a clustering.
   *
   * If subnetworks need to be created for all clusters in a clustering, it
   * is more efficient to use {@link createSubnetworks}.
    *
    * @param clustering Clustering
    * @param cluster    Cluster
    *
    * @return Subnetwork
    */
  public createSubnetworkForCluster (clustering: Clustering, cluster: number): Network {
    const nodesPerCluster = clustering.getNodesPerCluster()
    const subnetworkNodes = new Array<number>(this.nNodes).fill(0)
    const subnetworkNeighbors = new Array<number>(this.nEdges).fill(0)
    const subnetworkEdgeWeights = new Array<number>(this.nEdges).fill(0)
    return this.createSubnetwork(clustering, cluster, nodesPerCluster[cluster], subnetworkNodes, subnetworkNeighbors, subnetworkEdgeWeights)
  }

  /**
   * Creates induced subnetworks for the clusters in a clustering.
   *
   * @param clustering Clustering
   *
   * @return Subnetworks
   */
  public createSubnetworks (clustering: Clustering): Network[] {
    const subnetworks = new Array<Network>(clustering.nClusters)
    const nodesPerCluster = clustering.getNodesPerCluster()
    const subnetworkNodes = new Array<number>(this.nNodes).fill(0)
    const subnetworkNeighbors = new Array<number>(this.nEdges).fill(0)
    const subnetworkEdgeWeights = new Array<number>(this.nEdges).fill(0)
    for (let i = 0; i < clustering.nClusters; i++) {
      subnetworks[i] = this.createSubnetwork(clustering, i, nodesPerCluster[i], subnetworkNodes, subnetworkNeighbors, subnetworkEdgeWeights)
    }
    return subnetworks
  }

  /**
   * Creates an induced subnetwork of the largest connected component.
   *
   * @return Subnetwork
   */
  public createSubnetworkLargestComponent (): Network {
    return this.createSubnetworkForCluster(this.identifyComponents(), 0)
  }

  /**
   * Creates a reduced (or aggregate) network based on a clustering.
   *
   * Each node in the reduced network corresponds to a cluster of nodes in
   * the original network. The weight of a node in the reduced network equals
   * the sum of the weights of the nodes in the corresponding cluster in the
   * original network. The weight of an edge between two nodes in the reduced
   * network equals the sum of the weights of the edges between the nodes in
   * the two corresponding clusters in the original network.
   *
   * @param clustering Clustering
   *
   * @return Reduced network
   */
  public createReducedNetwork (clustering: Clustering): Network {
    const reducedNetwork = new Network()

    reducedNetwork.nNodes = clustering.nClusters

    reducedNetwork.nEdges = 0
    reducedNetwork.nodeWeights = new Array<number>(clustering.nClusters).fill(0)
    reducedNetwork.firstNeighborIndices = new Array<number>(clustering.nClusters + 1).fill(0)
    reducedNetwork.totalEdgeWeightSelfLinks = this.totalEdgeWeightSelfLinks
    const reducedNetworkNeighbors1 = new Array<number>(this.nEdges).fill(0)
    const reducedNetworkEdgeWeights1 = new Array<number>(this.nEdges).fill(0)
    const reducedNetworkNeighbors2 = new Array<number>(clustering.nClusters - 1).fill(0)
    const reducedNetworkEdgeWeights2 = new Array<number>(clustering.nClusters).fill(0)
    const nodesPerCluster = clustering.getNodesPerCluster()
    for (let i = 0; i < clustering.nClusters; i++) {
      let j = 0
      for (let k = 0; k < nodesPerCluster[i].length; k++) {
        const l = nodesPerCluster[i][k]

        reducedNetwork.nodeWeights[i] += this.nodeWeights[l]

        for (let m = this.firstNeighborIndices[l]; m < this.firstNeighborIndices[l + 1]; m++) {
          const n = clustering.clusters[this.neighbors[m]]
          if (n !== i) {
            if (reducedNetworkEdgeWeights2[n] === 0) {
              reducedNetworkNeighbors2[j] = n
              j++
            }
            reducedNetworkEdgeWeights2[n] += this.edgeWeights[m]
          } else {
            reducedNetwork.totalEdgeWeightSelfLinks += this.edgeWeights[m]
          }
        }
      }

      for (let k = 0; k < j; k++) {
        reducedNetworkNeighbors1[reducedNetwork.nEdges + k] = reducedNetworkNeighbors2[k]
        reducedNetworkEdgeWeights1[reducedNetwork.nEdges + k] = reducedNetworkEdgeWeights2[reducedNetworkNeighbors2[k]]
        reducedNetworkEdgeWeights2[reducedNetworkNeighbors2[k]] = 0
      }
      reducedNetwork.nEdges += j
      reducedNetwork.firstNeighborIndices[i + 1] = reducedNetwork.nEdges
    }
    reducedNetwork.neighbors = reducedNetworkNeighbors1.slice(0, reducedNetwork.nEdges)
    reducedNetwork.edgeWeights = reducedNetworkEdgeWeights1.slice(0, reducedNetwork.nEdges)

    return reducedNetwork
  }

  /**
   * Identifies the connected components of the network.
   *
   * @return Connected components
   */
  public identifyComponents (): Clustering {
    const componentsAlgorithm = new ComponentsAlgorithm()
    return componentsAlgorithm.findClustering(this)
  }

  /**
   * Checks the integrity of the network.
   *
   * It is checked whether:
   *
   * <ul>
   * <li>variables have a correct value,</li>
   * <li>arrays have a correct length,</li>
   * <li>edges are sorted correctly,</li>
   * <li>edges are stored in both directions.</li>
   * </ul>
   *
   * An exception is thrown if the integrity of the network is violated.
   *
   * @throws An illegal argument was provided in the construction of the network.
   */
  private checkIntegrity (): void {
    // Check whether variables have a correct value and arrays have a correct length.
    if (this.nNodes < 0) {
      throw new Error('nNodes must be non-negative.')
    }
    if (this.nEdges < 0) {
      throw new Error('nEdges must be non-negative.')
    }
    if (this.nEdges % 2 === 1) {
      throw new Error('nEdges must be even.')
    }
    if (this.nodeWeights.length !== this.nNodes) {
      throw new Error('Length of nodeWeight array must be equal to nNodes.')
    }
    if (this.firstNeighborIndices.length !== this.nNodes + 1) {
      throw new Error('Length of firstNeighborIndices array must be equal to nNodes + 1.')
    }
    if (this.firstNeighborIndices[0] !== 0) {
      throw new Error('First element of firstNeighborIndices array must be equal to 0.')
    }
    if (this.firstNeighborIndices[this.nNodes] !== this.nEdges) {
      throw new Error('Last element of firstNeighborIndices array must be equal to nEdges.')
    }
    if (this.neighbors.length !== this.nEdges) {
      throw new Error('Length of neighbors array must be equal to nEdges.')
    }
    if (this.edgeWeights.length !== this.nEdges) {
      throw new Error('Length of edgeWeights array must be equal to nEdges.')
    }

    // Check whether edges are sorted correctly.
    for (let i = 0; i < this.nNodes; i++) {
      if (this.firstNeighborIndices[i + 1] < this.firstNeighborIndices[i]) {
        throw new Error('Elements of firstNeighborIndices array must be in non-decreasing order.')
      }
      for (let j = this.firstNeighborIndices[i]; j < this.firstNeighborIndices[i + 1]; j++) {
        const k = this.neighbors[j]
        if (k < 0) {
          throw new Error('Elements of neighbors array must have non-negative values.')
        } else if (k >= this.nNodes) {
          throw new Error('Elements of neighbors array must have values less than nNodes.')
        }
        if (j > this.firstNeighborIndices[i]) {
          const l = this.neighbors[j - 1]
          if (k < l) {
            throw new Error('For each node, corresponding elements of neighbors array must be in increasing order.')
          } else if (k === l) {
            throw new Error('For each node, corresponding elements of neighbors array must not include duplicate values.')
          }
        }
      }
    }

    // Check whether edges are stored in both directions.
    const checked = new Array<boolean>(this.nEdges)
    for (let i = 0; i < this.nNodes; i++) {
      for (let j = this.firstNeighborIndices[i]; j < this.firstNeighborIndices[i + 1]; j++) {
        if (!checked[j]) {
          const k = this.neighbors[j]
          const l = binarySearch(this.neighbors, this.firstNeighborIndices[k], this.firstNeighborIndices[k + 1], i)
          if (l < 0) {
            throw new Error('Edges must be stored in both directions.')
          }
          if (this.edgeWeights[j] !== this.edgeWeights[l]) {
            throw new Error('Edge weights must be the same in both directions.')
          }
          checked[j] = true
          checked[l] = true
        }
      }
    }
  }

  private initializeNetworkBasedOnEdges (nNodes: number, nodeWeights: number[] | undefined, setNodeWeightsToTotalEdgeWeights: boolean | undefined, edges: number[][], edgeWeights: number[] | undefined, sortedEdges: boolean | undefined, checkIntegrity: boolean | undefined): void {
    let i: number
    if (!sortedEdges) {
      const edges2 = [new Array<number>(2 * edges[0].length), new Array<number>(2 * edges[0].length)]
      const edgeWeights2 = edgeWeights !== undefined ? new Array<number>(2 * edges[0].length) : undefined

      i = 0
      for (let j = 0; j < edges[0].length; j++) {
        edges2[0][i] = edges[0][j]
        edges2[1][i] = edges[1][j]

        if (edgeWeights !== undefined && edgeWeights2 !== undefined) edgeWeights2[i] = edgeWeights[j]
        i++
        if (edges[0][j] !== edges[1][j]) {
          edges2[0][i] = edges[1][j]
          edges2[1][i] = edges[0][j]
          if (edgeWeights !== undefined && edgeWeights2 !== undefined) edgeWeights2[i] = edgeWeights[j]
          i++
        }
      }
      edges[0] = edges2[0].slice(0, i)
      edges[1] = edges2[1].slice(0, i)
      if (edgeWeights !== undefined && edgeWeights2 !== undefined) edgeWeights = edgeWeights2.slice(0, i)
      this.sortEdges(edges, edgeWeights)
    }
    this.nNodes = nNodes
    this.nEdges = 0
    this.firstNeighborIndices = new Array<number>(nNodes + 1).fill(0)
    this.neighbors = new Array<number>(edges[0].length).fill(0)
    this.edgeWeights = new Array<number>(edges[0].length).fill(0)
    this.totalEdgeWeightSelfLinks = 0
    i = 1
    for (let j = 0; j < edges[0].length; j++) {
      if (edges[0][j] !== edges[1][j]) {
        for (; i <= edges[0][j]; i++) {
          this.firstNeighborIndices[i] = this.nEdges
        }
        this.neighbors[this.nEdges] = edges[1][j]
        this.edgeWeights[this.nEdges] = edgeWeights !== undefined ? edgeWeights[j] : 1
        this.nEdges++
      } else {
        this.totalEdgeWeightSelfLinks += edgeWeights !== undefined ? edgeWeights[j] : 1
      }
    }

    for (; i <= nNodes; i++) {
      this.firstNeighborIndices[i] = this.nEdges
    }
    this.neighbors = this.neighbors.slice(0, this.nEdges)
    this.edgeWeights = this.edgeWeights.slice(0, this.nEdges)

    if (typeof nodeWeights !== 'undefined') {
      this.nodeWeights = nodeWeights.slice()
    } else {
      this.nodeWeights = setNodeWeightsToTotalEdgeWeights ? this.getTotalEdgeWeightPerNodeHelper() : new Array<number>(this.nNodes).fill(1)
    }

    if (checkIntegrity) this.checkIntegrity()
  }

  private initializeNetworkBasedOnNeighbors (nNodes: number, nodeWeights: number[] | undefined, setNodeWeightsToTotalEdgeWeights: boolean | undefined, firstNeighborIndices: number[], neighbors: number[], edgeWeights: number[] | undefined, checkIntegrity: boolean | undefined): void {
    this.nNodes = nNodes
    this.nEdges = neighbors.length
    this.firstNeighborIndices = firstNeighborIndices.slice()
    this.neighbors = neighbors.slice()
    this.edgeWeights = edgeWeights ? edgeWeights.slice() : new Array<number>(this.nEdges).fill(1)
    this.totalEdgeWeightSelfLinks = 0

    if (nodeWeights !== undefined) {
      this.nodeWeights = nodeWeights.slice()
    } else {
      this.nodeWeights = setNodeWeightsToTotalEdgeWeights ? this.getTotalEdgeWeightPerNodeHelper() : new Array<number>(this.nNodes).fill(1)
    }

    if (checkIntegrity) this.checkIntegrity()
  }

  private getTotalEdgeWeightPerNodeHelper (): number[] {
    const totalEdgeWeightPerNode = new Array<number>(this.nNodes)
    for (let i = 0; i < this.nNodes; i++) {
      totalEdgeWeightPerNode[i] = calcSumWithinRange(this.edgeWeights, this.firstNeighborIndices[i], this.firstNeighborIndices[i + 1])
    }
    return totalEdgeWeightPerNode
  }

  private getRandomNumber (node1: number, node2: number, randomNumbers: number[]): number {
    let i: number
    let j: number
    if (node1 < node2) {
      i = node1
      j = node2
    } else {
      i = node2
      j = node1
    }
    return randomNumbers[i * this.nNodes + j]
  }

  private createSubnetwork (clustering: Clustering, cluster: number, nodes: number[], subnetworkNodes: number[], subnetworkNeighbors: number[], subnetworkEdgeWeights: number[]): Network {
    const subnetwork = new Network()

    subnetwork.nNodes = nodes.length

    if (subnetwork.nNodes === 1) {
      subnetwork.nEdges = 0
      subnetwork.nodeWeights = new Array<number>(1)
      subnetwork.nodeWeights[0] = this.nodeWeights[nodes[0]]
      subnetwork.firstNeighborIndices = new Array<number>(2).fill(0)
      subnetwork.neighbors = new Array<number>(0)
      subnetwork.edgeWeights = new Array<number>(0)
    } else {
      for (let i = 0; i < nodes.length; i++) {
        subnetworkNodes[nodes[i]] = i
      }

      subnetwork.nEdges = 0
      subnetwork.nodeWeights = new Array<number>(subnetwork.nNodes)
      subnetwork.firstNeighborIndices = new Array<number>(subnetwork.nNodes + 1).fill(0)
      for (let i = 0; i < subnetwork.nNodes; i++) {
        const j = nodes[i]
        subnetwork.nodeWeights[i] = this.nodeWeights[j]
        for (let k = this.firstNeighborIndices[j]; k < this.firstNeighborIndices[j + 1]; k++) {
          if (clustering.clusters[this.neighbors[k]] === cluster) {
            subnetworkNeighbors[subnetwork.nEdges] = subnetworkNodes[this.neighbors[k]]
            subnetworkEdgeWeights[subnetwork.nEdges] = this.edgeWeights[k]
            subnetwork.nEdges++
          }
        }
        subnetwork.firstNeighborIndices[i + 1] = subnetwork.nEdges
      }
      subnetwork.neighbors = subnetworkNeighbors.slice(0, subnetwork.nEdges)
      subnetwork.edgeWeights = subnetworkEdgeWeights.slice(0, subnetwork.nEdges)
    }

    subnetwork.totalEdgeWeightSelfLinks = 0

    return subnetwork
  }

  private sortEdges (edges: number[][], edgeWeights?: number[]): void {
    function compareEdges (edges: number[][], i: number, j: number): number {
      if (edges[0][i] > edges[0][j]) return 1
      if (edges[0][i] < edges[0][j]) return -1
      if (edges[1][i] > edges[1][j]) return 1
      if (edges[1][i] < edges[1][j]) return -1
      return 0
    }

    const nEdges = edges[0].length

    // Determine sorting order.
    const indices = [...Array(nEdges).keys()]
    indices.sort((a, b) => compareEdges(edges, a, b))

    // Sort edges.
    const edgesSorted = new Array<Array<number>>(2)
    edgesSorted[0] = new Array<number>(nEdges)
    edgesSorted[1] = new Array<number>(nEdges)
    for (let i = 0; i < nEdges; i++) {
      edgesSorted[0][i] = edges[0][indices[i]]
      edgesSorted[1][i] = edges[1][indices[i]]
    }
    edges[0] = edgesSorted[0]
    edges[1] = edgesSorted[1]

    // Sort edge weights.
    if (edgeWeights !== undefined) {
      const edgeWeightsSorted = new Array<number>(nEdges)
      for (let i = 0; i < nEdges; i++) {
        edgeWeightsSorted[i] = edgeWeights[indices[i]]
      }
      Object.assign(edgeWeights, edgeWeightsSorted)
    }
  }
}
