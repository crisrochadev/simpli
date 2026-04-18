<script setup>
import { reactive } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { useBillsStore } from '@/stores/bills'
import { today } from '@/utils/dateUtils'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const store = useBillsStore()
const form = reactive({ name: '', amount: '', dueDate: '' })

function reset() {
  form.name    = ''
  form.amount  = ''
  form.dueDate = today()
}

async function submit() {
  if (!form.name.trim() || !form.dueDate) return
  await store.create({ ...form })
  emit('close')
  reset()
}
</script>

<template>
  <Modal :show="show" title="Nova Conta" @close="$emit('close')">
    <form @submit.prevent="submit">
      <div class="field">
        <label>Nome da conta *</label>
        <input
          v-model="form.name"
          placeholder="ex: Internet, Aluguel..."
          required
          maxlength="100"
          autofocus
        />
      </div>
      <div class="form-row">
        <div class="field">
          <label>Valor (R$)</label>
          <input
            v-model="form.amount"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            placeholder="0,00"
          />
        </div>
        <div class="field">
          <label>Vencimento *</label>
          <input v-model="form.dueDate" type="date" required />
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost btn-sm" @click="$emit('close')">Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">Salvar conta</button>
      </div>
    </form>
  </Modal>
</template>
