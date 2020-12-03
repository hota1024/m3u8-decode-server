import axios from 'axios'
import * as fs from 'fs'
import { join } from 'path'
import { Decoder } from 'ts-coder'
import { OUT_DIR, SERVER_URL } from './constants'
import { fetchM3u8, M3u8 } from './M3u8'
import { cleanOut } from './out'

cleanOut()

let currentSequence = 0
const decoder = new Decoder({
  headSize: 4,
  isEnd(head) {
    return head[0] === 0x02
  },
})

let fileId = 0
decoder.onData((d) => {
  const file = `${fileId}.jpg`
  fs.writeFileSync(join(OUT_DIR, file), d)
  console.log(`decoded ${file}`)
  // console.log(decoder['buffers'])
  decoder['buffers'] = []

  fileId++
})

async function update(m3u8: M3u8) {
  if (currentSequence === m3u8.sequence) {
    return
  }
  currentSequence = m3u8.sequence
  console.log(currentSequence, m3u8.paths[currentSequence])

  const paths = m3u8.paths.slice(currentSequence)

  for (const path of paths) {
    const { data } = await axios.get(`${SERVER_URL}/${path}`, {
      responseType: 'arraybuffer',
    })

    decoder.push(Buffer.from(data))
  }
}

async function main() {
  while (true as const) {
    const m3u8 = await fetchM3u8()
    await update(m3u8)
    await new Promise((r) => setTimeout(r, m3u8.duration * 0.95))
  }

  // setInterval(update, m3u8.duration)
}

main()
