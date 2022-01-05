import * as esbuild from 'esbuild'
import { readdir } from 'fs/promises'

const externals = {
  name: 'make-all-packages-external',
  setup(build) {
    let filter = /^[^./]|^\.[^./]|^\.\.[^/]/ // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({ path: args.path, external: true }))
  }
}

const addExtension = {
  name: 'add-file-extension',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.importer) return { path: args.path + '.js', external: true }
    })
  }
}

const isWatching = process.argv.includes('--watch')

esbuild
  .build({
    entryPoints: (await readdir('src')).map((x) => `./src/${x}`),
    bundle: true,
    format: 'esm',
    plugins: [externals, addExtension],
    watch: isWatching
      ? {
          onRebuild(error, result) {
            if (error) console.error('watch build failed:', error)
            else console.log('watch build succeeded:', result)
          }
        }
      : undefined,
    outdir: 'dist'
  })
  .then(() => {
    if (isWatching) {
      console.log('watching...')
    }
  })
  .catch(() => process.exit(1))
