<script setup lang="ts">
import {
  Check,
  Edit3,
  Flame,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'
import type { MenuCategory, MenuItem } from '~/types'

const props = defineProps<{
  items: MenuItem[]
}>()

const emit = defineEmits<{
  changed: [message: string]
}>()

const { formatRupiah, getCategoryLabel } = useFormatters()

const searchQuery = ref('')
const activeCategory = ref<'semua' | MenuCategory>('semua')
const inlinePrices = ref<Record<number, number>>({})
const savingId = ref<number | null>(null)

// Modal State
const modalOpen = ref(false)
const editingItem = ref<MenuItem | null>(null)
const formSaving = ref(false)
const formError = ref('')

const form = ref({
  name: '',
  category: 'bakso' as MenuCategory,
  price: 15000,
  description: '',
  image_url: '/images/menu/bakso-urat.jpg',
  is_available: true,
  is_bestseller: false,
})

const PRESET_IMAGES = [
  { label: 'Bakso Urat', url: '/images/menu/bakso-urat.jpg' },
  { label: 'Bakso Telur', url: '/images/menu/bakso-telur.jpg' },
  { label: 'Mie Ayam', url: '/images/menu/mie-ayam.jpg' },
  { label: 'Nasi Goreng', url: '/images/menu/nasi-goreng.jpg' },
  { label: 'Mie Tiaw Sapi', url: '/images/menu/mie-tiaw-sapi.jpg' },
  { label: 'Mie Tiaw Ayam', url: '/images/menu/mie-tiaw-ayam.jpg' },
  { label: 'Es Teh Manis', url: '/images/menu/es-teh-manis.jpg' },
  { label: 'Es Jeruk', url: '/images/menu/es-jeruk.jpg' },
]

watch(
  () => props.items,
  (list) => {
    const map: Record<number, number> = {}
    for (const item of list) {
      map[item.id] = item.price
    }
    inlinePrices.value = map
  },
  { immediate: true, deep: true },
)

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return props.items.filter((item) => {
    const matchCat = activeCategory.value === 'semua' || item.category === activeCategory.value
    const matchQ = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    return matchCat && matchQ
  })
})

function openCreateModal() {
  editingItem.value = null
  formError.value = ''
  form.value = {
    name: '',
    category: 'bakso',
    price: 15000,
    description: '',
    image_url: '/images/menu/bakso-urat.jpg',
    is_available: true,
    is_bestseller: false,
  }
  modalOpen.value = true
}

function openEditModal(item: MenuItem) {
  editingItem.value = item
  formError.value = ''
  form.value = {
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description,
    image_url: item.image_url,
    is_available: item.is_available,
    is_bestseller: item.is_bestseller,
  }
  modalOpen.value = true
}

async function toggleAvailability(item: MenuItem) {
  savingId.value = item.id
  try {
    await $fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      body: { is_available: !item.is_available },
    })
    emit('changed', `${item.name} ditandai ${!item.is_available ? 'Tersedia' : 'Habis'}`)
  } finally {
    savingId.value = null
  }
}

async function saveInlinePrice(item: MenuItem) {
  const nextPrice = Number(inlinePrices.value[item.id])
  if (!Number.isFinite(nextPrice) || nextPrice < 0) return
  savingId.value = item.id
  try {
    await $fetch(`/api/menu/${item.id}`, {
      method: 'PATCH',
      body: { price: Math.round(nextPrice) },
    })
    emit('changed', `Harga ${item.name} diperbarui menjadi ${formatRupiah(nextPrice)}`)
  } finally {
    savingId.value = null
  }
}

async function handleSaveModal() {
  formError.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'Nama menu wajib diisi.'
    return
  }
  if (!Number.isFinite(Number(form.value.price)) || Number(form.value.price) < 0) {
    formError.value = 'Harga harus berupa angka yang valid.'
    return
  }

  formSaving.value = true
  try {
    if (editingItem.value) {
      await $fetch(`/api/menu/${editingItem.value.id}`, {
        method: 'PATCH',
        body: {
          ...form.value,
          price: Math.round(Number(form.value.price)),
        },
      })
      modalOpen.value = false
      emit('changed', `Menu "${form.value.name}" berhasil diperbarui`)
    } else {
      await $fetch('/api/menu', {
        method: 'POST',
        body: {
          ...form.value,
          price: Math.round(Number(form.value.price)),
        },
      })
      modalOpen.value = false
      emit('changed', `Menu baru "${form.value.name}" berhasil ditambahkan`)
    }
  } catch (err: unknown) {
    const fetchErr = err as { data?: { statusMessage?: string } }
    formError.value = fetchErr?.data?.statusMessage || 'Gagal menyimpan menu.'
  } finally {
    formSaving.value = false
  }
}

async function handleDelete(item: MenuItem) {
  if (import.meta.client && !window.confirm(`Hapus menu "${item.name}" dari daftar?`)) {
    return
  }
  savingId.value = item.id
  try {
    await $fetch(`/api/menu/${item.id}`, { method: 'DELETE' })
    emit('changed', `Menu "${item.name}" telah dihapus`)
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <section class="space-y-5">
    <!-- Top Controls -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        <div class="relative flex-1 sm:max-w-xs">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari menu..."
            class="w-full rounded-xl border border-cream-300 bg-white py-2.5 pl-10 pr-3 text-sm text-charcoal-900 focus:border-chili-500 focus:outline-none focus:ring-2 focus:ring-chili-500/20"
          >
        </div>

        <select
          v-model="activeCategory"
          class="rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-charcoal-800 focus:border-chili-500 focus:outline-none"
        >
          <option value="semua">Semua Kategori</option>
          <option value="bakso">Bakso</option>
          <option value="mie">Mie &amp; Kwetiau</option>
          <option value="nasi">Nasi</option>
          <option value="minuman">Minuman</option>
        </select>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-chili-600 px-4 py-2.5 text-sm font-bold text-white shadow-warm-sm transition hover:bg-chili-700"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4 stroke-[2.5]" />
        <span>Tambah Menu Baru</span>
      </button>
    </div>

    <!-- Menu Cards Grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        class="rounded-2xl border border-cream-300 bg-white p-4 shadow-warm-sm transition"
        :class="!item.is_available ? 'bg-stone-50/90 opacity-90' : ''"
      >
        <div class="flex gap-3.5">
          <img
            :src="item.image_url"
            :alt="item.name"
            class="h-20 w-20 shrink-0 rounded-xl object-cover bg-cream-200"
            :class="!item.is_available ? 'grayscale-[60%]' : ''"
          >
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex flex-wrap items-center gap-1.5">
                  <h3 class="text-sm font-bold text-charcoal-900 sm:text-base">{{ item.name }}</h3>
                  <span
                    v-if="item.is_bestseller"
                    class="inline-flex items-center gap-0.5 rounded-full bg-amberwarm-100 px-2 py-0.5 text-[10px] font-bold text-amberwarm-700"
                  >
                    <Flame class="h-3 w-3" />
                    Terlaris
                  </span>
                </div>
                <p class="text-[11px] font-semibold text-charcoal-500">
                  {{ getCategoryLabel(item.category) }}
                </p>
              </div>

              <!-- One-Click Tersedia / Habis Toggle -->
              <button
                type="button"
                :disabled="savingId === item.id"
                class="shrink-0 rounded-full px-3 py-1 text-xs font-extrabold transition"
                :class="
                  item.is_available
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                "
                @click="toggleAvailability(item)"
              >
                {{ item.is_available ? 'Tersedia' : 'Habis' }}
              </button>
            </div>

            <p class="mt-1.5 line-clamp-2 text-xs text-charcoal-600">
              {{ item.description }}
            </p>
          </div>
        </div>

        <!-- Inline Quick Price Editor & Actions -->
        <div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 pt-3">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold text-charcoal-500">Rp</span>
            <input
              v-model.number="inlinePrices[item.id]"
              type="number"
              min="0"
              step="500"
              class="w-28 rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-sm font-bold text-charcoal-900 focus:border-chili-500 focus:bg-white focus:outline-none"
            >
            <button
              v-if="inlinePrices[item.id] !== item.price"
              type="button"
              :disabled="savingId === item.id"
              class="inline-flex items-center gap-1 rounded-lg bg-chili-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-chili-700"
              @click="saveInlinePrice(item)"
            >
              <Check class="h-3.5 w-3.5" />
              <span>Simpan</span>
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-xs font-bold text-charcoal-700 transition hover:bg-cream-200"
              @click="openEditModal(item)"
            >
              <Edit3 class="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              aria-label="Hapus menu"
              class="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 transition hover:bg-red-100"
              @click="handleDelete(item)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Add / Edit Menu Modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 p-4 backdrop-blur-sm"
        @click.self="modalOpen = false"
      >
        <div class="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-cream-200 px-5 py-4">
            <h3 class="font-display text-xl font-bold text-charcoal-900">
              {{ editingItem ? 'Edit Detail Menu' : 'Tambah Menu Baru' }}
            </h3>
            <button
              type="button"
              class="rounded-xl border border-cream-300 p-2 text-charcoal-600 hover:bg-cream-100"
              @click="modalOpen = false"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <form class="flex-1 space-y-4 overflow-y-auto p-5" @submit.prevent="handleSaveModal">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-charcoal-800">Nama Menu *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Contoh: Bakso Mercon / Es Campur"
                class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-charcoal-800">Kategori *</label>
                <select
                  v-model="form.category"
                  class="w-full rounded-xl border border-cream-300 px-3 py-2.5 text-sm font-semibold focus:border-chili-500 focus:outline-none"
                >
                  <option value="bakso">Bakso</option>
                  <option value="mie">Mie &amp; Kwetiau</option>
                  <option value="nasi">Nasi</option>
                  <option value="minuman">Minuman</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-charcoal-800">Harga (Rp) *</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="500"
                  class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm font-bold focus:border-chili-500 focus:outline-none"
                >
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-charcoal-800">Deskripsi Menu</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Jelaskan rasa, isian, dan keunggulan menu..."
                class="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm focus:border-chili-500 focus:outline-none"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-charcoal-800">URL Foto Menu</label>
              <input
                v-model="form.image_url"
                type="text"
                placeholder="/images/menu/bakso-urat.jpg atau https://..."
                class="w-full rounded-xl border border-cream-300 px-3.5 py-2 text-xs focus:border-chili-500 focus:outline-none"
              >
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="preset in PRESET_IMAGES"
                  :key="preset.url"
                  type="button"
                  class="rounded-lg border px-2 py-1 text-[11px] font-semibold transition"
                  :class="
                    form.image_url === preset.url
                      ? 'border-chili-600 bg-chili-50 text-chili-700'
                      : 'border-cream-300 bg-cream-50 text-charcoal-600 hover:border-chili-300'
                  "
                  @click="form.image_url = preset.url"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-5 pt-1">
              <label class="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-charcoal-800">
                <input v-model="form.is_available" type="checkbox" class="h-4 w-4 rounded accent-chili-600">
                <span>Menu Tersedia</span>
              </label>

              <label class="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-charcoal-800">
                <input v-model="form.is_bestseller" type="checkbox" class="h-4 w-4 rounded accent-amber-500">
                <span>Tandai sebagai Terlaris</span>
              </label>
            </div>

            <p v-if="formError" class="rounded-xl bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700">
              {{ formError }}
            </p>

            <div class="flex items-center justify-end gap-2 border-t border-cream-200 pt-4">
              <button
                type="button"
                class="rounded-xl border border-cream-300 px-4 py-2.5 text-sm font-bold text-charcoal-700 hover:bg-cream-100"
                @click="modalOpen = false"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="formSaving"
                class="inline-flex items-center gap-2 rounded-xl bg-chili-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-chili-700 disabled:opacity-60"
              >
                <Loader2 v-if="formSaving" class="h-4 w-4 animate-spin" />
                <span>{{ editingItem ? 'Simpan Perubahan' : 'Tambahkan Menu' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </section>
</template>
