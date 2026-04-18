import { ref, computed, onMounted } from 'vue'

const isStandalone = ref(false)
const canNativeInstall = ref(false)
const isIOS = ref(false)
let deferredPrompt = null
let listenersAdded = false

export function usePWAInstall() {
  onMounted(() => {
    // Detect standalone (already installed)
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (isStandalone.value) return

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)

    if (listenersAdded) return
    listenersAdded = true

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      canNativeInstall.value = true
    })

    window.addEventListener('appinstalled', () => {
      isStandalone.value     = true
      canNativeInstall.value = false
      deferredPrompt         = null
    })
  })

  // Show install UI whenever NOT running in standalone mode
  // (covers Chrome before prompt fires, iOS, Firefox, etc.)
  const showInstall = computed(() => !isStandalone.value)

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      canNativeInstall.value = false
      deferredPrompt         = null
    }
  }

  return { showInstall, isStandalone, isIOS, canNativeInstall, install }
}
