export function today() {
  const d = new Date()
  return toDateString(d)
}

export function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isToday(dateStr) {
  return dateStr === today()
}

export function isPast(dateStr) {
  return dateStr < today()
}

export function daysDiff(dateStr) {
  const target = parseDate(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

export function getWeekDates(referenceDate = new Date()) {
  const d = new Date(referenceDate)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return toDateString(dd)
  })
}

export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - startOffset)

  const endOffset = lastDay.getDay() === 0 ? 0 : 7 - lastDay.getDay()
  const end = new Date(lastDay)
  end.setDate(lastDay.getDate() + endOffset)

  const dates = []
  const cur = new Date(start)
  while (cur <= end) {
    dates.push(toDateString(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function formatShortDate(dateStr) {
  return parseDate(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function formatFullDate(dateStr) {
  return parseDate(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

export function formatDayShort(dateStr) {
  return parseDate(dateStr).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

export function formatDayNumber(dateStr) {
  return parseInt(dateStr.split('-')[2], 10)
}

export function sameMonth(dateStr, year, month) {
  const [y, m] = dateStr.split('-').map(Number)
  return y === year && m === month + 1
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}
