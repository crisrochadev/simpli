import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import db from '@/db'
import { sanitize, sanitizeAmount } from '@/utils/sanitize'
import { today, daysDiff } from '@/utils/dateUtils'

export const useBillsStore = defineStore('bills', () => {
  const bills = ref([])
  const loading = ref(false)

  async function loadAll() {
    loading.value = true
    try {
      bills.value = await db.bills.orderBy('dueDate').toArray()
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    const bill = {
      name: sanitize(data.name),
      amount: sanitizeAmount(data.amount),
      dueDate: data.dueDate,
      paid: false,
      createdAt: new Date().toISOString()
    }
    const id = await db.bills.add(bill)
    bills.value.push({ ...bill, id })
    bills.value.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }

  async function togglePaid(id) {
    const bill = bills.value.find(b => b.id === id)
    if (!bill) return
    await db.bills.update(id, { paid: !bill.paid })
    bill.paid = !bill.paid
  }

  async function remove(id) {
    await db.bills.delete(id)
    bills.value = bills.value.filter(b => b.id !== id)
  }

  const urgentBills = computed(() =>
    bills.value.filter(b => !b.paid && daysDiff(b.dueDate) <= 7)
  )

  function getByMonth(year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return bills.value.filter(b => b.dueDate.startsWith(prefix))
  }

  return { bills, loading, loadAll, create, togglePaid, remove, urgentBills, getByMonth }
})
