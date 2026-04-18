import Dexie from 'dexie'

const db = new Dexie('SimpliDB')

db.version(1).stores({
  events: '++id, date, createdAt',
  tasks:  '++id, date, done, createdAt',
  bills:  '++id, dueDate, paid, createdAt'
})

export default db
