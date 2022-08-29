/**
 * Calculates `exp(exponent)` using a fast implementation.
 *
 * @param exponent Exponent
 *
 * @return exp(exponent)
 */
export function fastExp (exponent: number): number {
  if (exponent < -256) return 0

  exponent = 1 + exponent / 256
  exponent *= exponent
  exponent *= exponent
  exponent *= exponent
  exponent *= exponent
  exponent *= exponent
  exponent *= exponent
  exponent *= exponent
  exponent *= exponent
  return exponent
}

/**
 * Calculates `base ^ exponent` using a fast implementation.
 *
 * @param base     Base
 * @param exponent Exponent
 *
 * @return base ^ exponent
 */
export function fastPow (base: number, exponent: number): number {
  let power: number
  if (exponent > 0) {
    power = base
    for (let i = 1; i < exponent; i++) {
      power *= base
    }
  } else if (exponent < 0) {
    power = 1 / base
    for (let i = -1; i > exponent; i--) {
      power /= base
    }
  } else {
    power = 1
  }
  return power
}
