import * as path from 'path'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

const resizeImg = require('resize-img')

const ROOT_DIR = path.join(__dirname, '../')
const SRC_DIR = path.join(ROOT_DIR, 'src')
const LOGOS_DIR = path.join(ROOT_DIR, 'logos')
const DIST_DIR = path.join(ROOT_DIR, 'dist')

interface WalletRegistry {
  version: string
  updated: string
  extensionList: any[]
  desktopList: any[]
  webList: any[]
  iOSList: any[]
}

const convertLogosToBase64 = async (registry: WalletRegistry): Promise<WalletRegistry> => {
  const convertList = async (list: any[]) => {
    return Promise.all(
      list.map(async (entry) => {
        if (!entry.logo) return entry

        // If already base64, return as-is
        if (entry.logo.startsWith('data:')) return entry

        const ext = path.extname(entry.logo).replace('.', '')
        if (!ext) return entry

        try {
          const imgBuffer = await readFile(path.join(LOGOS_DIR, entry.logo))

          if (ext === 'svg') {
            return {
              ...entry,
              logo: `data:image/svg+xml;base64,${imgBuffer.toString('base64')}`
            }
          } else {
            // Resize PNG images to 256x256
            const resizedImage = await resizeImg(imgBuffer, {
              width: 256,
              height: 256
            })
            return {
              ...entry,
              logo: `data:image/${ext};base64,${resizedImage.toString('base64')}`
            }
          }
        } catch (error) {
          console.warn(`Failed to process logo ${entry.logo}:`, error)
          return entry
        }
      })
    )
  }

  return {
    ...registry,
    extensionList: await convertList(registry.extensionList),
    desktopList: await convertList(registry.desktopList),
    webList: await convertList(registry.webList),
    iOSList: await convertList(registry.iOSList)
  }
}

const build = async () => {
  try {
    await mkdir(DIST_DIR, { recursive: true })

    // Read source JSON files
    const tezos = JSON.parse((await readFile(path.join(SRC_DIR, 'tezos.json'))).toString())
    const substrate = JSON.parse((await readFile(path.join(SRC_DIR, 'substrate.json'))).toString())
    const tezosSapling = JSON.parse(
      (await readFile(path.join(SRC_DIR, 'tezos-sapling.json'))).toString()
    )

    // Convert logos to base64 and set current timestamp
    const buildTimestamp = new Date().toISOString()

    const tezosWithBase64 = await convertLogosToBase64(tezos)
    tezosWithBase64.updated = buildTimestamp

    const substrateWithBase64 = await convertLogosToBase64(substrate)
    substrateWithBase64.updated = buildTimestamp

    const tezosSaplingWithBase64 = await convertLogosToBase64(tezosSapling)
    tezosSaplingWithBase64.updated = buildTimestamp

    // Write to dist/
    await writeFile(path.join(DIST_DIR, 'tezos.json'), JSON.stringify(tezosWithBase64, null, 2))
    await writeFile(
      path.join(DIST_DIR, 'substrate.json'),
      JSON.stringify(substrateWithBase64, null, 2)
    )
    await writeFile(
      path.join(DIST_DIR, 'tezos-sapling.json'),
      JSON.stringify(tezosSaplingWithBase64, null, 2)
    )

    console.log('✓ Built wallet lists with embedded logos')
    console.log('  - tezos.json')
    console.log('  - substrate.json')
    console.log('  - tezos-sapling.json')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

build()
