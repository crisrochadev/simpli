import db from '@/db'

export function useDataSync() {
  async function exportData() {
    const [events, tasks, bills] = await Promise.all([
      db.events.toArray(),
      db.tasks.toArray(),
      db.bills.toArray()
    ])

    const payload = {
      app: 'simpli',
      version: 1,
      exportedAt: new Date().toISOString(),
      events,
      tasks,
      bills
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `simpli-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function importData(file) {
    const text = await file.text()

    let data
    try { data = JSON.parse(text) }
    catch { throw new Error('Arquivo inválido: não é um JSON válido') }

    if (data.app !== 'simpli' || !data.version) {
      throw new Error('Arquivo inválido: não é um backup do Simpli')
    }
    if (!Array.isArray(data.events) || !Array.isArray(data.tasks) || !Array.isArray(data.bills)) {
      throw new Error('Arquivo corrompido: dados incompletos')
    }

    const strip = ({ id, ...rest }) => rest

    await db.transaction('rw', [db.events, db.tasks, db.bills], async () => {
      await Promise.all([db.events.clear(), db.tasks.clear(), db.bills.clear()])
      await Promise.all([
        db.events.bulkAdd(data.events.map(strip)),
        db.tasks.bulkAdd(data.tasks.map(strip)),
        db.bills.bulkAdd(data.bills.map(strip))
      ])
    })
  }

  return { exportData, importData }
}
