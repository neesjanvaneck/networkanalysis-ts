import typescript from 'rollup-plugin-typescript2'
import typescriptCompiler from 'typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import html2 from 'rollup-plugin-html2'
import svelte from 'rollup-plugin-svelte'
import serve from 'rollup-plugin-serve'
import postcss from 'rollup-plugin-postcss'
import livereload from 'rollup-plugin-livereload'
import sveltePreprocessor from 'svelte-preprocess'
import { terser } from 'rollup-plugin-terser'
import { string } from 'rollup-plugin-string'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

const isDevelopment = process.env.NODE_ENV === 'development'
const plugins = [
  svelte({
    dev: isDevelopment,
    extensions: ['.svelte'],
    preprocess: sveltePreprocessor(),
    emitCss: true,
  }),
  globals(),
  builtins(),
  typescript({
    tsconfig: './tsconfig.app.json',
    typescript: typescriptCompiler,
  }),
  resolve(),
  postcss({
    extract: true,
  }),
  string({
    include: '**/*.txt',
  }),
  commonjs({ include: 'node_modules/**', extensions: ['.js', '.ts'] }),
  html2({
    template: 'app/index.html',
  }),
]

if (isDevelopment) {
  plugins.push(
    serve({
      contentBase: './dist',
      open: false,
      port: 6800,
    }),
    livereload({ watch: './dist' })
  )
} else {
  plugins.push(terser())
}

module.exports = {
  input: 'app/index.js',
  output: {
    file: 'dist/index.js',
    sourcemap: true,
    format: 'iife',
  },
  plugins,
}
