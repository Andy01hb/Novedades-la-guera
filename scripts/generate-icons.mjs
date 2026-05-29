import { writeFileSync, mkdirSync } from 'fs'

// Minimal 1x1 pink pixel PNG in base64
// This is a valid 68-byte PNG with a 1x1 pixel
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==',
  'base64'
)

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', minimalPng)
writeFileSync('public/icons/icon-512.png', minimalPng)
console.log('Placeholder icons created.')
