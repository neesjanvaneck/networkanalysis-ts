import typescript from 'rollup-plugin-typescript2'
import typescriptCompiler from 'typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

const regexesOfPackages = externals // To prevent having node_modules in the build files
  .map(packageName => new RegExp(`^${packageName}(/.*)?`))

const plugins = [
  typescript({
    tsconfig: './tsconfig.lib.json',
    typescript: typescriptCompiler,
  }),
  resolve(),
  commonjs({ include: 'node_modules/**', extensions: ['.js', '.ts'] }),
  terser(),
]

module.exports = {
  input: ['src/index.ts', 'src/run/index.ts', 'src/utils/index.ts'],
  external: regexesOfPackages,
  output: [
    {
      dir: 'lib',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: './src',
    },
  ],
  plugins,
}
