<script setup lang="ts">
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock, UtensilsCrossed } from 'lucide-vue-next'

const emit = defineEmits<{
  authenticated: []
}>()

const pin = ref('')
const showPin = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  if (!pin.value.trim()) {
    errorMessage.value = 'Silakan masukkan PIN Admin terlebih dahulu.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/admin/auth', {
      method: 'POST',
      body: { pin: pin.value.trim() },
    })
    pin.value = ''
    emit('authenticated')
  } catch (err: unknown) {
    const fetchErr = err as { data?: { statusMessage?: string } }
    errorMessage.value = fetchErr?.data?.statusMessage || 'PIN salah. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-cream-100 px-4 py-10">
    <div class="w-full max-w-md rounded-3xl border border-cream-300 bg-white p-6 shadow-warm-md sm:p-8">
      <div class="text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-chili-600 text-amber-300 shadow-md">
          <UtensilsCrossed class="h-7 w-7" />
        </div>
        <h1 class="mt-4 font-display text-2xl font-bold text-charcoal-900">
          Dashboard Kasir &amp; Admin
        </h1>
        <p class="mt-1 text-sm text-charcoal-600">
          Masukkan PIN untuk mengelola pesanan, menu, harga, dan pengaturan Bakso Berkah.
        </p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-1.5">
          <label for="admin-pin" class="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
            PIN Akses Admin
          </label>
          <div class="relative">
            <Lock class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-500" />
            <input
              id="admin-pin"
              v-model="pin"
              :type="showPin ? 'text' : 'password'"
              inputmode="numeric"
              autocomplete="current-password"
              placeholder="Masukkan PIN (default: 1234)"
              class="w-full rounded-xl border border-cream-300 bg-cream-50/50 py-3 pl-10 pr-11 text-base font-bold tracking-widest text-charcoal-900 placeholder:tracking-normal placeholder:font-normal placeholder:text-charcoal-500/70 focus:border-chili-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chili-500/20"
            >
            <button
              type="button"
              aria-label="Tampilkan atau sembunyikan PIN"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-800"
              @click="showPin = !showPin"
            >
              <EyeOff v-if="showPin" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700"
        >
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-chili-600 px-4 py-3 text-sm font-bold text-white shadow-warm-sm transition hover:bg-chili-700 disabled:opacity-60"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <span>{{ loading ? 'Memeriksa PIN...' : 'Masuk Dashboard' }}</span>
        </button>
      </form>

      <div class="mt-6 border-t border-cream-200 pt-4 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-600 transition hover:text-chili-700"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          <span>Kembali ke Halaman Pelanggan</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
