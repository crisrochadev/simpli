export function sanitize(value) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, 500)
}

export function sanitizeAmount(value) {
  const n = parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : Math.round(n * 100) / 100
}
