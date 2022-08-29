import Random from 'java-random'

/**
 * Calculates the sum of the values in an array.
 *
 * @param values     Values
 * @param beginIndex Begin index
 * @param endIndex   End index
 *
 * @returns Sum of values
 */
export function calcSum (values: number[]): number {
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
  }
  return sum
}

/**
 * Calculates the sum of the values in an array, considering only array
 * elements within a specified range.
 *
 * The sum is calculated over the elements `values[beginIndex], ...,
 * values[endIndex - 1]`.
 *
 * @param values     Values
 * @param beginIndex Begin index
 * @param endIndex   End index
 *
 * @return Sum of values
 */
export function calcSumWithinRange (values: number[], beginIndex: number, endIndex: number): number {
  let sum = 0
  for (let i = beginIndex; i < endIndex; i++) {
    sum += values[i]
  }
  return sum
}

/**
 * Calculates the average of the values in an array.
 *
 * @param values Values
 *
 * @return Average value
 */
export function calcAverage (values: number[]): number {
  return calcSum(values) / values.length
}

/**
 * Calculates the median of the values in an array.
 *
 * @param values Values
 *
 * @return Median value
 */
export function calcMedian (values: number[]): number {
  const sortedValues = values.slice()
  sortedValues.sort((a, b) => a - b)
  let median: number
  if (sortedValues.length % 2 === 1) {
    median = sortedValues[(sortedValues.length - 1) / 2]
  } else {
    median = (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
  }
  return median
}

/**
 * Calculates the minimum of the values in an array.
 *
 * @param values Values
 *
 * @return Minimum value
 */
export function calcMinimum (values: number[]): number {
  let minimum = values[0]
  for (let i = 1; i < values.length; i++) {
    minimum = Math.min(minimum, values[i])
  }
  return minimum
}

/**
 * Calculates the maximum of the values in an array.
 *
 * @param values Values
 *
 * @return Maximum value
 */
export function calcMaximum (values: number[]): number {
  let maximum = values[0]
  for (let i = 1; i < values.length; i++) {
    maximum = Math.max(maximum, values[i])
  }
  return maximum
}

/**
 * Creates a double array of random numbers.
 *
 * @param nElements Number of elements
 * @param random    Random number generator
 *
 * @return Array of random numbers
 */
export function createDoubleArrayOfRandomNumbers (nElements: number, random: Random = new Random()): number[] {
  const values = new Array<number>(nElements)
  for (let i = 0; i < nElements; i++) {
    values[i] = random.nextDouble()
  }
  return values
}

/**
 * Generates a random permutation.
 *
 * A random permutation is generated of the integers`0, ..., nElements - 1`.
 *
 * @param nElements Number of elements
 * @param random    Random number generator
 *
 * @return Random permutation
 */
export function generateRandomPermutation (nElements: number, random: Random = new Random()): number[] {
  const permutation = new Array<number>(nElements)
  for (let i = 0; i < nElements; i++) {
    permutation[i] = i
  }
  for (let i = 0; i < nElements; i++) {
    const j = random.nextInt(nElements)
    const k = permutation[i]
    permutation[i] = permutation[j]
    permutation[j] = k
  }
  return permutation
}

/**
 * Searches a range of the specified array of numbers for the specified value
 * using the binary search algorithm. The array must be sorted prior to making
 * this call. If it is not sorted, the results are undefined. If the range
 * contains multiple elements with the specified value, there is no guarantee
 * which one will be found.
 *
 * @param sortedValues Array to be searched (must be sorted)
 * @param fromIndex    Index of the first element (inclusive) to be searched
 * @param toIndex      Index of the last element (exclusive) to be searched
 * @param key          Value to be searched for
 *
 * @returns Index at which the key was found, or -n-1 if it was not found,
 *     where n is the index of the first value higher than key or length if
 *     there is no such value.
 */
export function binarySearch (sortedValues: number[], fromIndex: number, toIndex: number, key: number): number {
  let low = fromIndex
  let high = toIndex - 1
  while (low <= high) {
    const mid = (low + high) >>> 1
    const midVal = sortedValues[mid]
    if (midVal < key) {
      low = mid + 1
    } else if (midVal > key) {
      high = mid - 1
    } else {
      return mid
    }
  }
  return -(low + 1)
}
