import axios from 'axios'
import * as fs from 'fs'
import { join } from 'path'
import { Decoder } from 'ts-coder'
import { OUT_DIR, SERVER_URL } from './constants'
import { fetchM3u8 } from './M3u8'
import { cleanOut } from './out'

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

  fileId++
})

cleanOut()
;(async () => {
  const m3u8 = await fetchM3u8()

  for (const path of m3u8.paths) {
    const { data } = await axios.get(`${SERVER_URL}/${path}`, {
      responseType: 'arraybuffer',
    })

    decoder.push(Buffer.from(data))
  }
})()
