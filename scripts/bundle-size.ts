import { Buffer } from 'node:buffer'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'tsdown'
import buildConfig from '../tsdown.config.ts'

const root = resolve(import.meta.dirname, '..')
const readmePath = resolve(root, 'README.md')
const readme = await readFile(readmePath, 'utf8')
const section = /^- ✨ Minimal footprint\r?\n(?: {2}[^\r\n]*\r?\n)*/m
if (!section.test(readme)) {
  throw new Error('Cannot find the Minimal footprint section in README.md')
}

const outDir = await mkdtemp(resolve(tmpdir(), 'obug-bundle-size-'))
const sizes: { name: string; bytes: number; gzipBytes: number }[] = []
try {
  for (const name of ['plain', 'browser', 'ansi']) {
    const entryDir = resolve(outDir, name)
    await build({
      ...buildConfig,
      cwd: root,
      config: false,
      entry: { [name]: resolve(root, 'src', `${name}.ts`) },
      outDir: entryDir,
      dts: false,
      minify: true,
      report: false,
      logLevel: 'silent',
    })
    const files = await readdir(entryDir)
    if (files.length !== 1 || files[0] !== `${name}.js`) {
      throw new Error(`Expected a single complete bundle for ${name}: ${files}`)
    }
    const code = await readFile(resolve(entryDir, `${name}.js`))
    const gzipBytes = gzipSync(code, { level: 9 }).byteLength
    sizes.push({ name, bytes: Buffer.byteLength(code), gzipBytes })
  }
} finally {
  await rm(outDir, { recursive: true, force: true })
}

const newline = readme.includes('\r\n') ? '\r\n' : '\n'
const footprint =
  [
    '- ✨ Minimal footprint',
    ...sizes.map(
      ({ name, gzipBytes }) =>
        `  - ${(gzipBytes / 1000).toFixed(2)} kB minified + gzipped (${name})`,
    ),
  ].join(newline) + newline
const updated = readme.replace(section, footprint)
if (updated !== readme) {
  await writeFile(readmePath, updated)
}
console.table(sizes)
console.log(
  updated === readme ? 'README.md is up to date' : 'Updated README.md',
)
