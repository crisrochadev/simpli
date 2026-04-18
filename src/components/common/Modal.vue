<script setup>
defineProps({ show: Boolean, title: String })
defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-sheet" @click.stop>
          <div class="modal-handle" />
          <p class="modal-title">{{ title }}</p>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
