import * as fs from 'fs'
import { OUT_DIR } from './constants'

/**
 * clean out folder.
 */
export const cleanOut = () => {
  if (fs.existsSync(OUT_DIR)) {
    fs.rmdirSync(OUT_DIR, { recursive: true })
  }
  fs.mkdirSync(OUT_DIR)
}
