// Rebuilds the src folders from flat file names, e.g. src__pages__Home.tsx -> src/pages/Home.tsx
import { readdirSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname } from 'node:path'

let count = 0
for (const name of readdirSync('.')) {
  if (!name.includes('__')) continue
  const target = name.split('__').join('/')
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(name, target)
  count++
}
console.log(`setup: placed ${count} files`)
