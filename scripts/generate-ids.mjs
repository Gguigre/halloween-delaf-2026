#!/usr/bin/env node
// Génère N identifiants de fantômes uniques, en vérifiant l'absence de collision
// avec le contenu déjà écrit (specs/03).
//
//   node scripts/generate-ids.mjs 12

import { randomInt } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'
const ID_LENGTH = 6

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets')

const readIds = (file, pick) => {
  try {
    return JSON.parse(readFileSync(join(assetsDir, file), 'utf8')).map(pick)
  } catch {
    return []
  }
}

const existing = new Set([
  ...readIds('basicGhosts.json', (entry) => entry),
  ...readIds('quizGhosts.json', (entry) => entry.id),
  ...readIds('jokerGhosts.json', (entry) => entry.id),
])

const count = Number(process.argv[2] ?? 10)
if (!Number.isInteger(count) || count < 1) {
  console.error('Usage : node scripts/generate-ids.mjs <nombre>')
  process.exit(1)
}

const generated = new Set()
while (generated.size < count) {
  let id = ''
  for (let i = 0; i < ID_LENGTH; i += 1) id += ALPHABET[randomInt(ALPHABET.length)]
  if (!existing.has(id)) generated.add(id)
}

console.log([...generated].join('\n'))
console.error(`\n${count} identifiants générés, ${existing.size} déjà utilisés, aucune collision.`)
