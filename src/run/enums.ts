/**
 * Clustering quality functions.
 */
export enum ClusteringQualityFunctions {
  CPM = 'CPM',
  Modularity = 'Modularity',
}

/**
 * Clustering algorithms.
 */
export enum ClusteringAlgorithms {
  Leiden = 'Leiden',
  Louvain = 'Louvain',
}

/**
 * Layout quality functions.
 */
export enum LayoutQualityFunctions {
  VOS = 'VOS',
  LinLog = 'LinLog',
}

/**
 * Normalization methods.
 */
export enum NormalizationMethods {
  NoNormalization = 'No normalization',
  AssociationStrength = 'Association strength',
  Fractionalization = 'Fractionalization',
}
