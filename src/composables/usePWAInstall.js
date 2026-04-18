import { ref, onMounted } from 'vue'

// Singleton state shared across all usages
const canInstall  = ref(false)
const isInstalled = ref(false)
let deferredPrompt    = null
let listenersAdded    = false

export function usePWAInstall() {
  onMounted(() => {
    if (listenersAdded) return
    listenersAdded = true

    isInstalled.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (isInstalled.value) return

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      canInstall.value = true
    })

    window.addEventListener('appinstalled', () => {
      canInstall.value  = false
      isInstalled.value = true
      deferredPrompt    = null
    })
  })

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      canInstall.value = false
      deferredPrompt   = null
    }
  }

  function dismiss() {
    canInstall.value = false
  }

  return { canInstall, isInstalled, install, dismiss }
}
