<script>
import { onMount } from 'svelte'
import { parseData } from './parseData'
import { processData } from './processData'
import { runNetworkLayout, runNetworkClustering } from './runAlgorithms'
import { updateScales, renderLinks, renderNodes } from './renderNetwork'

let svgElement

onMount(() => {
  parseData(parseResult => {
    try {
      const { nodes, links } = processData(parseResult.data)
      runNetworkClustering(nodes, links)
      runNetworkLayout(nodes, links)
      updateScales(svgElement.clientWidth, svgElement.clientHeight, nodes)
      renderLinks(svgElement, links)
      renderNodes(svgElement, nodes)
    } catch (error) {
      console.error(error.message)
    }
  })
})
</script>
<style>
:global(body) {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

svg {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
<div class="App">
  <svg bind:this={svgElement}>
  </svg>
</div>
