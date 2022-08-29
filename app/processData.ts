import type { Node, Link } from 'networkanalysis-ts/run'

export function processData (data: string[][]): { nodes: Node[], links: Link[] } {
  const nodeById = data.reduce<{ [key: string]: Node }>((acc, curr) => {
    if (!acc[curr[0]]) acc[curr[0]] = { id: curr[0] }
    if (!acc[curr[1]]) acc[curr[1]] = { id: curr[1] }
    return acc
  }, {})
  const nodes = Object.values(nodeById)
  const links = data.map<Link>(link => {
    return {
      node1: nodeById[link[0]],
      node2: nodeById[link[1]],
      weight: link[2] !== undefined ? +link[2] : undefined,
    }
  })

  return { nodes, links }
}
