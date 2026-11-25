<script setup lang="ts">
import { Flame, Minus, Plus, ShoppingBag, Utensils, X } from 'lucide-vue-next'
import type { MenuItem, OrderItemCustomization } from '~/types'

const props = defineProps<{
  item: MenuItem | null
}>()

const emit = defineEmits<{
  close: []
  add: [payload: { item: MenuItem; quantity: number; customization: OrderItemCustomization }]
}>()

const { formatRupiah } = useFormatters()

const NOODLE_OPTIONS = ['Mie Kuning', 'Bihun', 'Campur', 'Tanpa Mie']
const SPICE_OPTIONS = ['Tidak Pedas', 'Sedang', 'Pedas', 'Pedas Gila']
const SERVING_OPTIONS = ['Goreng', 'Kuah']

const quantity = ref(1)
const noodleMix = ref('Campur')
const servingStyle = ref('Goreng')
const spiceLevel = ref('Sedang')
const notes = ref('')

const isBakso = computed(() => props.item?.category === 'bakso')
const isMieOrNasi = computed(() => props.item?.category === 'mie' || props.item?.category === 'nasi')
const isMieTiaw = computed(() => {
  const name = props.item?.name.toLowerCase() || ''
  return props.item?.category === 'mie' && (name.includes('tiaw') || name.includes('kwetiau'))
})

const notesPlaceholder = computed(() => {
  if (!props.item) return ''
  if (props.item.category === 'bakso') return 'Contoh: tanpa seledri, banyakin bawang goreng'
  if (props.item.category === 'mie') return 'Contoh: kuah dipisah, tanpa sawi, ekstra pangsit'
  if (props.item.category === 'nasi') return 'Contoh: telur dadar, tanpa acar, ekstra kerupuk'
  return 'Contoh: sedikit es, kurang manis'
})

const subtotal = computed(() => (props.item ? props.item.price * quantity.value : 0))

watch(
  () => props.item,
  (nextItem) => {
    if (nextItem) {
      quantity.value = 1
      noodleMix.value = 'Campur'
      servingStyle.value = 'Goreng'
      spiceLevel.value = 'Sedang'
      notes.value = ''
    }
  },
)

function handleSubmit() {
  if (!props.item) return
  const customization: OrderItemCustomization = {}

  if (isBakso.value) {
    customization.noodleMix = noodleMix.value
    customization.spiceLevel = spiceLevel.value
  } else if (isMieOrNasi.value) {
    if (isMieTiaw.value) {
      customization.servingStyle = servingStyle.value
    }
    customization.spiceLevel = spiceLevel.value
  }

  if (notes.value.trim()) {
    customization.notes = notes.value.trim()
  }

  emit('add', {
    item: props.item,
    quantity: quantity.value,
    customization,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="item"
        class="fixed inset-0 z-50 flex items-end justify-center bg-charcoal-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="emit('close')"
      >
        <div
          class="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:rounded-3xl"
          role="dialog"
          aria-modal="true"
          :aria-label="`Atur pesanan ${item.name}`"
        >
          <!-- Header Photo -->
          <div class="relative h-44 w-full shrink-0 overflow-hidden bg-cream-200 sm:h-52">
            <img
              :src="item.image_url"
              :alt="item.name"
              class="h-full w-full object-cover"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent" />

            <button
              type="button"
              aria-label="Tutup"
              class="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal-900/65 text-white backdrop-blur-md transition hover:bg-charcoal-900"
              @click="emit('close')"
            >
              <X class="h-5 w-5" />
            </button>

            <div class="absolute bottom-3.5 left-4 right-4 text-white">
              <h3 class="font-display text-2xl font-bold leading-tight">
                {{ item.name }}
              </h3>
              <p class="mt-0.5 text-sm font-bold text-amber-300">
                {{ formatRupiah(item.price) }}
              </p>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            <p class="text-sm leading-relaxed text-charcoal-600">
              {{ item.description }}
            </p>

            <!-- Bakso: Noodle Mix -->
            <div v-if="isBakso" class="space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-1.5 text-sm font-bold text-charcoal-900">
                  <Utensils class="h-4 w-4 text-chili-600" />
                  Pilihan Mie
                </label>
                <span class="rounded-full bg-chili-50 px-2 py-0.5 text-[11px] font-bold text-chili-700">Wajib Pilih</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="option in NOODLE_OPTIONS"
                  :key="option"
                  type="button"
                  class="rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition"
                  :class="
                    noodleMix === option
                      ? 'border-chili-600 bg-chili-50 text-chili-800 ring-1 ring-chili-600'
                      : 'border-cream-300 bg-white text-charcoal-700 hover:border-chili-300'
                  "
                  @click="noodleMix = option"
                >
                  {{ option }}
                </button>
              </div>
            </div>

            <!-- Mie Tiaw: Goreng / Kuah -->
            <div v-if="isMieTiaw" class="space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-1.5 text-sm font-bold text-charcoal-900">
                  <Utensils class="h-4 w-4 text-chili-600" />
                  Pilihan Penyajian
                </label>
                <span class="rounded-full bg-chili-50 px-2 py-0.5 text-[11px] font-bold text-chili-700">Wajib Pilih</span>
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <button
                  v-for="style in SERVING_OPTIONS"
                  :key="style"
                  type="button"
                  class="rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition"
                  :class="
                    servingStyle === style
                      ? 'border-chili-600 bg-chili-50 text-chili-800 ring-1 ring-chili-600'
                      : 'border-cream-300 bg-white text-charcoal-700 hover:border-chili-300'
                  "
                  @click="servingStyle = style"
                >
                  {{ style }}
                </button>
              </div>
            </div>

            <!-- Bakso, Mie & Nasi: Spice Level -->
            <div v-if="isBakso || isMieOrNasi" class="space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-1.5 text-sm font-bold text-charcoal-900">
                  <Flame class="h-4 w-4 text-chili-600" />
                  Tingkat Pedas
                </label>
                <span class="rounded-full bg-amberwarm-100 px-2 py-0.5 text-[11px] font-bold text-amberwarm-700">Sesuai Selera</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="level in SPICE_OPTIONS"
                  :key="level"
                  type="button"
                  class="rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition"
                  :class="
                    spiceLevel === level
                      ? 'border-chili-600 bg-chili-50 text-chili-800 ring-1 ring-chili-600'
                      : 'border-cream-300 bg-white text-charcoal-700 hover:border-chili-300'
                  "
                  @click="spiceLevel = level"
                >
                  {{ level }}
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-2">
              <label for="item-notes" class="block text-sm font-bold text-charcoal-900">
                Catatan Tambahan <span class="font-normal text-charcoal-500">(Opsional)</span>
              </label>
              <textarea
                id="item-notes"
                v-model="notes"
                rows="2"
                maxlength="200"
                :placeholder="notesPlaceholder"
                class="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/70 focus:border-chili-500 focus:outline-none focus:ring-2 focus:ring-chili-500/20"
              />
            </div>
          </div>

          <!-- Footer Controls -->
          <div class="border-t border-cream-300 bg-white p-4 sm:px-6">
            <div class="flex items-center gap-3">
              <!-- Quantity Stepper -->
              <div class="flex items-center rounded-xl border border-cream-300 bg-cream-50 p-1">
                <button
                  type="button"
                  aria-label="Kurangi jumlah"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-700 transition hover:bg-white disabled:opacity-40"
                  :disabled="quantity <= 1"
                  @click="quantity = Math.max(1, quantity - 1)"
                >
                  <Minus class="h-4 w-4" />
                </button>
                <span class="w-9 text-center text-sm font-extrabold text-charcoal-900">
                  {{ quantity }}
                </span>
                <button
                  type="button"
                  aria-label="Tambah jumlah"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-700 transition hover:bg-white"
                  @click="quantity = Math.min(99, quantity + 1)"
                >
                  <Plus class="h-4 w-4" />
                </button>
              </div>

              <!-- Add Button -->
              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-chili-600 px-4 py-3 text-sm font-bold text-white shadow-warm-sm transition hover:bg-chili-700 active:scale-[0.99]"
                @click="handleSubmit"
              >
                <ShoppingBag class="h-4 w-4" />
                <span>Tambah • {{ formatRupiah(subtotal) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
