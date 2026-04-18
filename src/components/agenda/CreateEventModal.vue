<script setup>
import { reactive } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { useEventsStore } from '@/stores/events'
import { today } from '@/utils/dateUtils'

const props = defineProps({ show: Boolean, defaultDate: { type: String, default: '' } })
const emit = defineEmits(['close'])

const store = useEventsStore()
const form = reactive({ title: '', date: '', startTime: '', endTime: '' })

function reset() {
  form.title = ''
  form.date  = props.defaultDate || today()
  form.startTime = ''
  form.endTime   = ''
}

async function submit() {
  if (!form.title.trim() || !form.date) return
  await store.create({ ...form })
  emit('close')
  reset()
}

function onOpen() { reset() }
</script>

<template>
  <Modal :show="show" title="Novo Evento" @close="$emit('close')">
    <form @submit.prevent="submit" @vue:mounted="onOpen">
      <div class="field">
        <label>Título *</label>
        <input
          v-model="form.title"
          placeholder="Nome do evento"
          required
          maxlength="200"
          autofocus
        />
      </div>
      <div class="field">
        <label>Data *</label>
        <input v-model="form.date" type="date" required />
      </div>
      <div class="form-row">
        <div class="field">
          <label>Início</label>
          <input v-model="form.startTime" type="time" />
        </div>
        <div class="field">
          <label>Fim</label>
          <input v-model="form.endTime" type="time" />
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost btn-sm" @click="$emit('close')">Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">Criar evento</button>
      </div>
    </form>
  </Modal>
</template>
