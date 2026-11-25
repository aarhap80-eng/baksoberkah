<script setup lang="ts">
import { Info, Loader2, MapPin, Save, Store } from 'lucide-vue-next'
import type { StoreSettings } from '~/types'

const props = defineProps<{
  store: StoreSettings
}>()

const emit = defineEmits<{
  updated: [payload: { store: StoreSettings; message: string }]
}>()

const form = ref({
  store_name: props.store.store_name,
  tagline: props.store.tagline,
  is_open: props.store.is_open,
  whatsapp_number: props.store.whatsapp_number,
  address: props.store.address,
  open_hours: props.store.open_hours,
  maps_url: props.store.maps_url || '',
  maps_embed_url: props.store.maps_embed_url || '',
})

const saving = ref(false)
const togglingOpen = ref(false)
const errorMessage = ref('')

watch(
  () => props.store,
  (next) => {
    form.value = {
      store_name: next.store_name,
      tagline: next.tagline,
      is_open: next.is_open,
      whatsapp_number: next.whatsapp_number,
      address: next.address,
      open_hours: next.open_hours,
      maps_url: next.maps_url || '',
      maps_embed_url: next.maps_embed_url || '',
    }
  },
  { deep: true },
)

async function quickToggleStoreOpen() {
  togglingOpen.value = true
  errorMessage.value = ''
  try {
    const nextOpen = !form.value.is_open
    const res = await $fetch<{ store: StoreSettings }>('/api/store', {
      method: 'PUT',
      body: { is_open: nextOpen },
    })
    emit('updated', {
      store: res.store,
      message: nextOpen ? 'Warung sekarang berstatus BUKA' : 'Warung sekarang berstatus TUTUP',
    })
  } catch {
    errorMessage.value = 'Gagal mengubah status buka/tutup warung.'
  } finally {
    togglingOpen.value = false
  }
}

async function saveSettings() {
  saving.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ store: StoreSettings }>('/api/store', {
      method: 'PUT',
      body: {
        store_name: form.value.store_name,
        tagline: form.value.tagline,
        is_open: form.value.is_open,
        whatsapp_number: form.value.whatsapp_number,
        address: form.value.address,
        open_hours: form.value.open_hours,
        maps_url: form.value.maps_url.trim() || null,
        maps_embed_url: form.value.maps_embed_url.trim() || null,
      },
    })
    emit('updated', {
      store: res.store,
      message: 'Pengaturan warung & peta berhasil disimpan',
    })
  } catch (err: unknown) {
    const fetchErr = err as { data?: { statusMessage?: string } }
    errorMessage.value = fetchErr?.data?.statusMessage || 'Gagal menyimpan pengaturan.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl space-y-5">
    <!-- Quick Open / Closed Switch Card -->
    <div
      class="flex flex-col gap-4 rounded-2xl border p-5 shadow-warm-sm sm:flex-row sm:items-center sm:justify-between"
      :class="
        form.is_open
          ? 'border-emerald-200 bg-emerald-50/70'
          : 'border-red-200 bg-red-50/70'
      "
    >
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
          :class="form.is_open ? 'bg-emerald-600' : 'bg-chili-600'"
        >
          <Store class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-extrabold text-charcoal-900">
            Status Warung: {{ form.is_open ? 'BUKA (Menerima Pesanan)' : 'TUTUP SEMENTARA' }}
          </p>
          <p class="mt-0.5 text-xs text-charcoal-600">
            Ubah status warung secara instan. Saat tutup, pelanggan tidak dapat membuat pesanan baru.
          </p>
        </div>
      </div>

      <button
        type="button"
        :disabled="togglingOpen"
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition disabled:opacity-60"
        :class="form.is_open ? 'bg-chili-600 hover:bg-chili-700' : 'bg-emerald-600 hover:bg-emerald-700'"
        @click="quickToggleStoreOpen"
      >
        <Loader2 v-if="togglingOpen" class="h-4 w-4 animate-spin" />
        <span>{{ form.is_open ? 'Tutup Warung Sekarang' : 'Buka Warung Sekarang' }}</span>
      </button>
    </div>

    <!-- Settings Form -->
    <form class="space-y-6 rounded-2xl border border-cream-300 bg-white p-5 shadow-warm-sm sm:p-6" @submit.prevent="saveSettings">
      <div class="space-y-4">
        <h3 class="text-sm font-extrabold uppercase tracking-wider text-charcoal-500">
          Identitas &amp; Kontak Warung
        </h3>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-charcoal-800">Nama Warung</label>
            <input
              v-model="form.store_name"
              type="text"
              class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
            >
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-charcoal-800">Tagline</label>
            <input
              v-model="form.tagline"
              type="text"
              class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
            >
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-charcoal-800">Nomor WhatsApp Kasir</label>
            <input
              v-model="form.whatsapp_number"
              type="text"
              placeholder="6281234567890"
              class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm font-semibold focus:border-chili-500 focus:outline-none"
            >
            <p class="text-[11px] text-charcoal-500">
              Gunakan kode negara 62 tanpa tanda + atau spasi (contoh: 6281234567890).
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-charcoal-800">Jam Operasional</label>
            <input
              v-model="form.open_hours"
              type="text"
              placeholder="Setiap Hari, 10.00 - 21.00 WIB"
              class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
            >
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-charcoal-800">Alamat Warung</label>
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Google Maps Section -->
      <div class="space-y-4 border-t border-cream-200 pt-5">
        <div class="flex items-center gap-2">
          <MapPin class="h-4 w-4 text-chili-600" />
          <h3 class="text-sm font-extrabold uppercase tracking-wider text-charcoal-500">
            Lokasi Google Maps (Opsional)
          </h3>
        </div>

        <div class="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amberwarm-50 p-3.5 text-xs text-amber-950">
          <Info class="mt-0.5 h-4 w-4 shrink-0 text-amberwarm-700" />
          <p>
            Kosongkan kedua kolom ini jika titik Google Maps warung belum disetujui. Tombol <strong>"Buka di Google Maps"</strong> dan peta akan otomatis disembunyikan dengan rapi di halaman pelanggan.
          </p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-charcoal-800">Tautan Google Maps (`maps_url`)</label>
          <input
            v-model="form.maps_url"
            type="url"
            placeholder="https://maps.app.goo.gl/... (kosongkan jika belum ada)"
            class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
          >
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-charcoal-800">URL Embed Google Maps (`maps_embed_url`)</label>
          <input
            v-model="form.maps_embed_url"
            type="url"
            placeholder="https://www.google.com/maps/embed?pb=... (opsional)"
            class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
          >
        </div>
      </div>

      <p v-if="errorMessage" class="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
        {{ errorMessage }}
      </p>

      <div class="flex justify-end border-t border-cream-200 pt-4">
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex items-center gap-2 rounded-xl bg-chili-600 px-5 py-3 text-sm font-bold text-white shadow-warm-sm transition hover:bg-chili-700 disabled:opacity-60"
        >
          <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
          <Save v-else class="h-4 w-4" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>
    </form>
  </section>
</template>
