import { parse } from 'papaparse'
// import data from './data/karate_club_network.txt'
import data from './data/journal_cocitation_network.txt'

export function parseData (callback: (result: unknown) => void): void {
  parse(data, {
    skipEmptyLines: true,
    complete: result => callback(result),
  })
}
