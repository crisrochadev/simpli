<script setup>
import { reactive } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { useTasksStore } from '@/stores/tasks'
import { today } from '@/utils/dateUtils'

const props = defineProps({ show: Boolean, defaultDate: { type: String, default: '' } })
const emit = defineEmits(['close'])

const store = useTasksStore()
const form = reactive({ title: '', date: '' })

function reset() {
  form.title = ''
  form.date  = props.defaultDate || today()
}

async function submit() {
  if (!form.title.trim()) return
  await store.create({ ...form })
  emit('close')
  reset()
}

function onOpen() { reset() }
</script>

<template>
  <Modal :show="show" title="Nova Tarefa" @close="$emit('close')">
    <form @submit.prevent="submit" @vue:mounted="onOpen">
      <div class="field">
        <label>Tarefa *</label>
        <input
          v-model="form.title"
          placeholder="O que precisa ser feito?"
          required
          maxlength="200"
          autofocus
        />
      </div>
      <div class="field">
        <label>Dia</label>
        <input v-model="form.date" type="date" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost btn-sm" @click="$emit('close')">Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">Adicionar</button>
      </div>
    </form>
  </Modal>
</template>
