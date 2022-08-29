declare module 'java-random' {
  /**
   * An almost complete implementation in JS of the `java.util.Random` class
   * from J2SE, designed to so far as possible produce the same output
   * sequences as the Java original when supplied with the same seed.
   * See {@link https://www.npmjs.com/package/java-random} for more
   * information.
   */
  export default class Random {
    /**
     * Constructs a new random number generator.
     *
     * @param seedval Initial seed
     */
    public constructor(seed?: number)

    /**
     * Returns a pseudorandom double value between 0.0 and 1.0.
     *
     * @return Pseudorandom double value between 0.0 and 1.0
     */
    public nextDouble (): number

    /**
      * Returns a pseudorandom int value (between zero and the specified upper bound).
      *
      * @param bound Upper bound (exclusive)
      *
      * @return Pseudorandom int value (between zero and the specified upper bound)
      */
    public nextInt (bound?: number): number
  }
}
