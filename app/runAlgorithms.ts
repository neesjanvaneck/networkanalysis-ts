import { NetworkClustering, NetworkLayout } from 'networkanalysis-ts/run'
import type { Node, Link } from 'networkanalysis-ts/run'

export function runNetworkClustering (nodes: Node[], links: Link[]): void {
  new NetworkClustering()
    .data(nodes, links)
    .qualityFunction('CPM')
    .normalization('AssociationStrength')
    .resolution(1)
    .minClusterSize(1)
    .algorithm('Leiden')
    .randomStarts(10)
    .iterations(50)
    .randomness(0.01)
    .seed(0)
    .run()
}

export function runNetworkLayout (nodes: Node[], links: Link[]): void {
  new NetworkLayout()
    .data(nodes, links)
    .qualityFunction('VOS')
    .normalization('AssociationStrength')
    .attraction(2)
    .repulsion(1)
    .randomStarts(10)
    .seed(0)
    .run()
}
