# networkanalysis-ts

[![Build main branch](https://github.com/neesjanvaneck/networkanalysis-ts/workflows/Build%20main%20branch/badge.svg?branch=main)](https://github.com/neesjanvaneck/networkanalysis-ts/actions)
[![License: MIT](https://badgen.net/github/license/neesjanvaneck/networkanalysis-ts?label=License&color=yellow)](https://github.com/neesjanvaneck/networkanalysis-ts/blob/main/LICENSE)
[![Latest release](https://badgen.net/github/release/neesjanvaneck/networkanalysis-ts?label=Release)](https://github.com/neesjanvaneck/networkanalysis-ts/releases)
[![npm version](https://badgen.net/npm/v/networkanalysis-ts)](https://www.npmjs.com/package/networkanalysis-ts)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7221171.svg)](https://doi.org/10.5281/zenodo.7221171)

This package is a TypeScript port of the [networkanalysis](https://github.com/CWTSLeiden/networkanalysis) package written in Java. The package provides algorithms and data structures for network analysis. Currently, the package focuses on clustering (or community detection) and layout (or mapping) of networks. In particular, the package contains an implementation of the [Leiden algorithm](https://doi.org/10.1038/s41598-019-41695-z) and the [Louvain algorithm](https://doi.org/10.1088/1742-5468/2008/10/P10008) for network clustering and the [VOS technique](https://doi.org/10.1002/asi.21421) for network layout. Only undirected networks are supported.

The networkanalysis-ts package was developed by [Nees Jan van Eck](https://orcid.org/0000-0001-8448-4521) at the [Centre for Science and Technology Studies (CWTS)](https://www.cwts.nl) at [Leiden University](https://www.universiteitleiden.nl/en) and benefited from contributions by [Olya Stukova](https://github.com/Stukova) and [Nikita Rokotyan](https://github.com/Rokotyan) from [Interacta](https://interacta.io). The networkanalysis package written in Java on which networkanalysis-ts is based was developed by [Vincent Traag](https://orcid.org/0000-0003-3170-3879), [Nees Jan van Eck](https://orcid.org/0000-0001-8448-4521), and [Ludo Waltman](https://orcid.org/0000-0001-8249-1752).

## Documentation

Documentation of the source code of networkanalysis-ts is provided in the code in `TSDoc` format. The documentation is also available in a [compiled format](https://neesjanvaneck.github.io/networkanalysis-ts).

## Installation

```sh
npm install networkanalysis-ts
```

## Usage

The following code snippet demonstrates how the core classes in networkanalysis-ts can be used to create a network and to perform network normalization, clustering, and layout:

```typescript
import { Clustering, GradientDescentVOSLayoutAlgorithm, Layout, LeidenAlgorithm, Network } from 'networkanalysis-ts'

const nRandomStarts = 10

// Construct network.
const nNodes = 6
const edges = [[0, 1, 2, 2, 3, 5, 4], [1, 2, 0, 3, 5, 4, 3]]
const network = new Network({
  nNodes: nNodes,
  setNodeWeightsToTotalEdgeWeights: true,
  edges: edges,
  sortedEdges: false,
  checkIntegrity: true,
})

// Perform network normalization.
const normalizedNetwork = network.createNormalizedNetworkUsingAssociationStrength()

// Perform clustering.
let bestClustering: Clustering | undefined
let maxQuality = Number.NEGATIVE_INFINITY
const clusteringAlgorithm = new LeidenAlgorithm()
clusteringAlgorithm.setResolution(0.2)
clusteringAlgorithm.setNIterations(50)
for (let i = 0; i < nRandomStarts; i++) {
  const clustering = new Clustering({ nNodes: normalizedNetwork.getNNodes() })
  clusteringAlgorithm.improveClustering(normalizedNetwork, clustering)
  const quality = clusteringAlgorithm.calcQuality(normalizedNetwork, clustering)
  if (quality > maxQuality) {
    bestClustering = clustering
    maxQuality = quality
  }
}
bestClustering?.orderClustersByNNodes()

// Perform layout.
let bestLayout: Layout | undefined
let minQuality = Number.POSITIVE_INFINITY
const layoutAlgorithm = new GradientDescentVOSLayoutAlgorithm();
layoutAlgorithm.setAttraction(2)
layoutAlgorithm.setRepulsion(1)
for (let i = 0; i < nRandomStarts; i++) {
  const layout = new Layout({ nNodes: normalizedNetwork.getNNodes() })
  layoutAlgorithm.improveLayout(normalizedNetwork, layout)
  const quality = layoutAlgorithm.calcQuality(normalizedNetwork, layout)
  if (quality < minQuality) {
    bestLayout = layout
    minQuality = quality
  }
}
bestLayout?.standardize(true)
```

The package also includes a `run` module that provides helper classes for running the network analysis algorithms in an easier way. The following code snippet demonstrates the use of the helper classes for constructing a network and for performing network clustering and layout:

```typescript
import { Node, Link, NetworkClustering, NetworkLayout } from 'networkanalysis-ts/run'

// Construct network.
const nodes: Node[] = [
  { id: 'James' },
  { id: 'Mary' },
  { id: 'John' },
  { id: 'Linda' },
  { id: 'David' },
  { id: 'Karen' },
]
const links: Link[] = [
  { node1: nodes[0], node2: nodes[1] },
  { node1: nodes[1], node2: nodes[2] },
  { node1: nodes[2], node2: nodes[0] },
  { node1: nodes[2], node2: nodes[3] },
  { node1: nodes[3], node2: nodes[5] },
  { node1: nodes[5], node2: nodes[4] },
  { node1: nodes[4], node2: nodes[3] },
]

// Perform clustering.
new NetworkClustering()
  .data(nodes, links)
  .qualityFunction('CPM')
  .normalization('AssociationStrength')
  .resolution(0.2)
  .minClusterSize(1)
  .algorithm('Leiden')
  .randomStarts(10)
  .iterations(50)
  .randomness(0.01)
  .seed(0)
  .run()

// Perform layout.
new NetworkLayout()
  .data(nodes, links)
  .qualityFunction('VOS')
  .normalization('AssociationStrength')
  .attraction(2)
  .repulsion(1)
  .randomStarts(10)
  .seed(0)
  .run()
```

## Demo app

The GitHub repository of networkanalys-ts also provides a [Svelt](https://svelte.dev) demo app that uses the helper classes discussed above. The source code of the demo app is available in the `app/` folder. The following screenshot shows the output of the demo app when applying it to a journal co-citation network:

<img src="https://github.com/neesjanvaneck/networkanalysis-ts/blob/main/app/assets/images/networkanalysis-ts-demo-app.png?raw=true" alt="networkanalysis-ts demo app" style="width: 100%; max-width: 800px; height: auto;">

## License

The networkanalysis-ts package is distributed under the [MIT license](LICENSE).

## Issues

If you encounter any issues, please report them using the [issue tracker](https://github.com/neesjanvaneck/networkanalysis-ts/issues) on GitHub.

## Contribution

You are welcome to contribute to the development of networkanalysis-ts. Please follow the typical GitHub workflow: Fork from this repository and make a pull request to submit your changes. Make sure that your pull request has a clear description and that the code has been properly tested.

## Development and deployment

The latest stable version of the code is available from the [`main`](https://github.com/neesjanvaneck/networkanalysis-ts/tree/main) branch on GitHub. The most recent code, which may be under development, is available from the [`develop`](https://github.com/neesjanvaneck/networkanalysis-ts/tree/develop) branch.

### Requirements

To run networkanalysis-ts locally and to build production-ready bundles, [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com) need to be installed on your system.

### Setup

Run
```sh
npm install
```
to install all required Node.js packages.

### Development

Run
```sh
npm run dev
```
to build a development version of the demo app and serve it with hot reload at [http://localhost:6800](http://localhost:6800).

### Deployment

Run
```sh
npm run build:lib
```
to build a deployment version of the package. The output is stored in the `lib/` folder.

Run
```sh
npm run build:app
```
to build a deployment version of the demo app. The output is stored in the `dist/` folder.

Run
```sh
npm run build
```
to build a deployment version of both the package and the demo app.

### References

> Traag, V.A., Waltman, L., & Van Eck, N.J. (2019). From Louvain to Leiden: Guaranteeing well-connected communities. *Scientific Reports*, 9, 5233. https://doi.org/10.1038/s41598-019-41695-z

> Van Eck, N.J., Waltman, L., Dekker, R., & Van den Berg, J. (2010). A comparison of two techniques for bibliometric mapping: Multidimensional scaling and VOS. *Journal of the American Society for Information Science and Technology*, 61(12), 2405-2416. https://doi.org/10.1002/asi.21421

> Waltman, L., Van Eck, N.J., & Noyons, E.C.M. (2010). A unified approach to mapping and clustering of bibliometric networks. *Journal of Informetrics*, 4(4), 629-635. https://doi.org/10.1016/j.joi.2010.07.002

> Van Eck, N.J., & Waltman, L. (2009). How to normalize co-occurrence data? An analysis of some well-known similarity measures. *Journal of the American Society for Information Science and Technology*, 60(8), 1635-1651. https://doi.org/10.1002/asi.21075

> Blondel, V.D., Guillaume, J.-L., Lambiotte, R., & Lefebvre, E. (2008). Fast unfolding of communities in large networks. *Journal of Statistical Mechanics: Theory and Experiment*, 10, P10008. https://doi.org/10.1088/1742-5468/2008/10/P10008 

> Newman, M.E.J. & Girvan, M. (2004). Finding and evaluating community structure in networks. *Physical Review E*, 69(2), 026113, https://doi.org/10.1103/PhysRevE.69.026113.
