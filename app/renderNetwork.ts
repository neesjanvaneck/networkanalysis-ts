import { select } from 'd3-selection'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { extent } from 'd3-array'
import { schemeSet3 } from 'd3-scale-chromatic'
import { margin } from './helper'

const positionXScale = scaleLinear()
const positionYScale = scaleLinear()
const colorScale = scaleOrdinal<number, string, never>().range(schemeSet3)

interface Node {
  id: number | string;
  x: number;
  y: number;
  cluster: number;

}

interface Link {
  node1: Node;
  node2: Node;
}

export function updateScales (width: number, height: number, nodes: Node[]): void {
  positionXScale
    .range([margin.left, width - margin.left - margin.right])
    .domain(extent(nodes.map(d => d.x)) as number[])
  positionYScale
    .range([height - margin.top - margin.bottom, margin.top])
    .domain(extent(nodes.map(d => d.y)) as number[])

  colorScale.domain(nodes.map(d => d.cluster))
}

function linkArc (sourceX: number, sourceY: number, targetX: number, targetY: number): string {
  // const r = Math.hypot(targetX - sourceX, targetY - sourceY)
  const r = 0
  return `
    M${sourceX},${sourceY}
    A${r},${r} 0 0,1 ${targetX},${targetY}
  `
}

export function renderLinks (svgElement: SVGAElement, links: Link[]): void {
  select(svgElement)
    .selectAll('line')
    .data(links.filter(l => l.node1 && l.node2))
    .enter()
    .append('path')
    .attr('d', d => linkArc(
      positionXScale(d.node1?.x),
      positionYScale(d.node1?.y),
      positionXScale(d.node2?.x),
      positionYScale(d.node2?.y)
    ))
    .style('fill', 'none')
    .style('stroke', 'lightgrey')
}

export function renderNodes (svgElement: SVGAElement, nodes: Node[]): void {
  select(svgElement)
    .selectAll<SVGAElement, Node>('circle')
    .data(nodes, (d: Node) => d.id)
    .enter()
    .append('circle')
    .attr('r', 10)
    .attr('cx', d => positionXScale(d.x))
    .attr('cy', d => positionYScale(d.y))
    .style('fill', d => colorScale(d.cluster))
  select(svgElement)
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('x', d => positionXScale(d.x))
    .attr('y', d => positionYScale(d.y) + 5)
    .attr('font-size', '12px')
    .attr('text-anchor', 'middle')
    .attr('fill', '#000')
    .attr('opacity', 1)
    .text(d => d.id)
}
