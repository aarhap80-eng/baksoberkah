<script setup lang="ts">
import {
  AlertCircle,
  Bike,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Utensils,
  X,
} from 'lucide-vue-next'
import type { OrderRecord, OrderType, StoreSettings } from '~/types'

const props = defineProps<{
  open: boolean
  store: StoreSettings
}>()

const emit = defineEmits<{
  close: []
}>()

const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart()
const { formatRupiah, getOrderTypeLabel } = useFormatters()

const customerName = ref('')
const customerPhone = ref('')
const orderType = ref<OrderType>('dine_in')
const tableNumber = ref('')
const deliveryAddress = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const completedOrder = ref<OrderRecord | null>(null)
const completedWhatsappUrl = ref('')

const ORDER_TYPES: { value: OrderType; label: string; desc: string }[] = [
  { value: 'dine_in', label: 'Makan di Tempat', desc: 'Isi nomor meja' },
  { value: 'takeaway', label: 'Bungkus / Ambil Sendiri', desc: 'Ambil di kasir' },
  { value: 'delivery', label: 'Pesan Antar', desc: 'Kirim ke alamat' },
]

function closeDrawer() {
  errorMessage.value = ''
  emit('close')
}

function startNewOrder() {
  completedOrder.value = null
  completedWhatsappUrl.value = ''
  customerName.value = ''
  customerPhone.value = ''
  tableNumber.value = ''
  deliveryAddress.value = ''
  errorMessage.value = ''
  emit('close')
}

async function submitOrder() {
  errorMessage.value = ''

  if (!props.store.is_open) {
    errorMessage.value = 'Maaf, warung sedang tutup sementara.'
    return
  }

  if (items.value.length === 0) {
    errorMessage.value = 'Keranjang masih kosong. Yuk pilih menu dulu!'
    return
  }

  if (!customerName.value.trim()) {
    errorMessage.value = 'Mohon isi nama pemesan terlebih dahulu.'
    return
  }

  if (orderType.value === 'dine_in' && !tableNumber.value.trim()) {
    errorMessage.value = 'Mohon isi nomor meja untuk makan di tempat.'
    return
  }

  if (orderType.value === 'delivery' && !deliveryAddress.value.trim()) {
    errorMessage.value = 'Mohon isi alamat lengkap untuk pesan antar.'
    return
  }

  submitting.value = true
  try {
    const response = await $fetch<{ order: OrderRecord; whatsappUrl: string }>('/api/orders', {
      method: 'POST',
      body: {
        customer_name: customerName.value.trim(),
        customer_phone: customerPhone.value.trim() || null,
        order_type: orderType.value,
        table_number: orderType.value === 'dine_in' ? tableNumber.value.trim() : null,
        delivery_address: orderType.value === 'delivery' ? deliveryAddress.value.trim() : null,
        items: items.value.map(entry => ({
          menu_item_id: entry.menuItem.id,
          quantity: entry.quantity,
          customization: entry.customization,
        })),
      },
    })

    completedOrder.value = response.order
    completedWhatsappUrl.value = response.whatsappUrl
    clearCart()

    if (import.meta.client && response.whatsappUrl) {
      window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (err: unknown) {
    const fetchErr = err as { data?: { statusMessage?: string; message?: string }; message?: string }
    errorMessage.value =
      fetchErr?.data?.statusMessage
      || fetchErr?.data?.message
      || 'Gagal mengirim pesanan. Silakan coba beberapa saat lagi.'
  } finally {
    submitting.value = false
  }
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
        v-if="open"
        class="fixed inset-0 z-50 flex justify-end bg-charcoal-900/60 backdrop-blur-sm"
        @click.self="closeDrawer"
      >
        <div
          class="flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Keranjang Pesanan"
        >
          <!-- Drawer Header -->
          <div class="flex items-center justify-between border-b border-cream-300 bg-white px-5 py-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-chili-50 text-chili-600">
                <ShoppingBag class="h-5 w-5" />
              </div>
              <div>
                <h2 class="text-base font-extrabold text-charcoal-900">
                  {{ completedOrder ? 'Pesanan Berhasil Dibuat!' : 'Keranjang Pesanan' }}
                </h2>
                <p class="text-xs text-charcoal-500">
                  {{ completedOrder ? `Kode: ${completedOrder.order_code}` : `${totalItems} item dipilih` }}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Tutup keranjang"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-cream-300 text-charcoal-600 transition hover:bg-cream-100"
              @click="closeDrawer"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Success Confirmation State -->
          <div v-if="completedOrder" class="flex-1 space-y-5 overflow-y-auto p-5">
            <div class="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <CheckCircle2 class="h-8 w-8" />
              </div>
              <h3 class="mt-3 font-display text-2xl font-bold text-emerald-950">
                Pesanan Tercatat!
              </h3>
              <p class="mt-1 text-sm text-emerald-800">
                Pesanan Anda sudah masuk ke sistem warung. Lanjutkan konfirmasi lewat WhatsApp agar segera diproses.
              </p>
              <div class="mt-4 inline-block rounded-xl border border-emerald-300 bg-white px-4 py-2">
                <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                  Kode Pesanan Anda
                </p>
                <p class="font-mono text-2xl font-extrabold tracking-wider text-chili-700">
                  {{ completedOrder.order_code }}
                </p>
              </div>
            </div>

            <!-- Order Summary Card -->
            <div class="rounded-2xl border border-cream-300 bg-white p-4 space-y-3">
              <div class="flex items-center justify-between text-xs text-charcoal-600">
                <span>Pemesan</span>
                <span class="font-bold text-charcoal-900">{{ completedOrder.customer_name }}</span>
              </div>
              <div class="flex items-center justify-between text-xs text-charcoal-600">
                <span>Tipe Pesanan</span>
                <span class="font-bold text-charcoal-900">
                  {{ getOrderTypeLabel(completedOrder.order_type) }}
                  <template v-if="completedOrder.table_number"> (Meja {{ completedOrder.table_number }})</template>
                </span>
              </div>
              <div v-if="completedOrder.delivery_address" class="text-xs text-charcoal-600">
                <span class="block">Alamat Pengantaran:</span>
                <span class="mt-0.5 block font-semibold text-charcoal-900">{{ completedOrder.delivery_address }}</span>
              </div>

              <div class="border-t border-cream-200 pt-3 space-y-2">
                <div
                  v-for="(item, idx) in completedOrder.items_json"
                  :key="idx"
                  class="flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <p class="font-bold text-charcoal-900">{{ item.quantity }}x {{ item.name }}</p>
                    <p
                      v-if="item.customization.noodleMix || item.customization.servingStyle || item.customization.spiceLevel || item.customization.notes"
                      class="text-[11px] text-charcoal-500"
                    >
                      {{
                        [
                          item.customization.noodleMix,
                          item.customization.servingStyle,
                          item.customization.spiceLevel,
                          item.customization.notes,
                        ]
                          .filter(Boolean)
                          .join(' • ')
                      }}
                    </p>
                  </div>
                  <span class="shrink-0 font-semibold text-charcoal-800">{{ formatRupiah(item.subtotal) }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between border-t border-cream-200 pt-3">
                <span class="text-sm font-bold text-charcoal-900">Total Pembayaran</span>
                <span class="text-lg font-extrabold text-chili-700">{{ formatRupiah(completedOrder.total_amount) }}</span>
              </div>
            </div>

            <div class="space-y-2.5">
              <a
                :href="completedWhatsappUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                <MessageCircle class="h-5 w-5" />
                <span>Kirim Pesanan di WhatsApp</span>
                <ExternalLink class="h-4 w-4 opacity-80" />
              </a>

              <button
                type="button"
                class="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm font-bold text-charcoal-700 transition hover:bg-cream-100"
                @click="startNewOrder"
              >
                Kembali ke Menu
              </button>
            </div>
          </div>

          <!-- Empty Cart State -->
          <div v-else-if="items.length === 0" class="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-200 text-charcoal-500">
              <ShoppingBag class="h-8 w-8" />
            </div>
            <h3 class="mt-4 text-lg font-bold text-charcoal-900">Keranjang Masih Kosong</h3>
            <p class="mt-1.5 text-sm text-charcoal-500">
              Pilih Bakso Urat, Mie Ayam, atau minuman segar favorit Anda untuk mulai memesan.
            </p>
            <button
              type="button"
              class="mt-6 rounded-xl bg-chili-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-chili-700"
              @click="closeDrawer"
            >
              Lihat Daftar Menu
            </button>
          </div>

          <!-- Active Cart + Checkout Form -->
          <template v-else>
            <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
              <!-- Cart Items -->
              <section class="space-y-2.5">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
                    Daftar Pesanan
                  </h3>
                  <button
                    type="button"
                    class="text-xs font-semibold text-chili-600 hover:underline"
                    @click="clearCart"
                  >
                    Kosongkan
                  </button>
                </div>

                <div
                  v-for="entry in items"
                  :key="entry.key"
                  class="rounded-2xl border border-cream-300 bg-white p-3.5 shadow-warm-sm"
                >
                  <div class="flex gap-3">
                    <img
                      :src="entry.menuItem.image_url"
                      :alt="entry.menuItem.name"
                      class="h-16 w-16 shrink-0 rounded-xl object-cover bg-cream-200"
                    >
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-2">
                        <h4 class="text-sm font-bold text-charcoal-900 leading-snug">
                          {{ entry.menuItem.name }}
                        </h4>
                        <button
                          type="button"
                          aria-label="Hapus item"
                          class="text-charcoal-400 transition hover:text-chili-600"
                          @click="removeFromCart(entry.key)"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </div>

                      <!-- Customizations -->
                      <div class="mt-1 flex flex-wrap gap-1">
                        <span
                          v-if="entry.customization.noodleMix"
                          class="rounded-md bg-cream-200 px-1.5 py-0.5 text-[11px] font-semibold text-charcoal-700"
                        >
                          {{ entry.customization.noodleMix }}
                        </span>
                        <span
                          v-if="entry.customization.servingStyle"
                          class="rounded-md bg-cream-200 px-1.5 py-0.5 text-[11px] font-semibold text-charcoal-700"
                        >
                          {{ entry.customization.servingStyle }}
                        </span>
                        <span
                          v-if="entry.customization.spiceLevel"
                          class="rounded-md bg-chili-50 px-1.5 py-0.5 text-[11px] font-semibold text-chili-700"
                        >
                          {{ entry.customization.spiceLevel }}
                        </span>
                      </div>
                      <p v-if="entry.customization.notes" class="mt-1 text-[11px] italic text-charcoal-500">
                        "{{ entry.customization.notes }}"
                      </p>

                      <div class="mt-2.5 flex items-center justify-between">
                        <span class="text-sm font-extrabold text-chili-700">
                          {{ formatRupiah(entry.menuItem.price * entry.quantity) }}
                        </span>

                        <div class="flex items-center rounded-lg border border-cream-300 bg-cream-50">
                          <button
                            type="button"
                            aria-label="Kurangi"
                            class="flex h-7 w-7 items-center justify-center text-charcoal-700 hover:bg-white rounded-l-lg"
                            @click="updateQuantity(entry.key, -1)"
                          >
                            <Minus class="h-3.5 w-3.5" />
                          </button>
                          <span class="w-7 text-center text-xs font-bold text-charcoal-900">
                            {{ entry.quantity }}
                          </span>
                          <button
                            type="button"
                            aria-label="Tambah"
                            class="flex h-7 w-7 items-center justify-center text-charcoal-700 hover:bg-white rounded-r-lg"
                            @click="updateQuantity(entry.key, 1)"
                          >
                            <Plus class="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Checkout Form -->
              <section class="space-y-4 rounded-2xl border border-cream-300 bg-white p-4">
                <h3 class="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
                  Data Pemesan &amp; Pengambilan
                </h3>

                <div class="space-y-1.5">
                  <label for="checkout-name" class="block text-xs font-bold text-charcoal-800">
                    Nama Pemesan <span class="text-chili-600">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    v-model="customerName"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    class="w-full rounded-xl border border-cream-300 bg-cream-50/50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/70 focus:border-chili-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chili-500/20"
                  >
                </div>

                <div class="space-y-1.5">
                  <label for="checkout-phone" class="block text-xs font-bold text-charcoal-800">
                    No. WhatsApp / HP <span class="font-normal text-charcoal-500">(Opsional)</span>
                  </label>
                  <input
                    id="checkout-phone"
                    v-model="customerPhone"
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    class="w-full rounded-xl border border-cream-300 bg-cream-50/50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/70 focus:border-chili-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chili-500/20"
                  >
                </div>

                <!-- Order Type Selector -->
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-charcoal-800">
                    Pilih Tipe Pesanan <span class="text-chili-600">*</span>
                  </label>
                  <div class="grid grid-cols-1 gap-2">
                    <button
                      v-for="opt in ORDER_TYPES"
                      :key="opt.value"
                      type="button"
                      class="flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition"
                      :class="
                        orderType === opt.value
                          ? 'border-chili-600 bg-chili-50 ring-1 ring-chili-600'
                          : 'border-cream-300 bg-cream-50/40 hover:border-chili-300'
                      "
                      @click="orderType = opt.value"
                    >
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        :class="
                          orderType === opt.value
                            ? 'bg-chili-600 text-white'
                            : 'bg-cream-200 text-charcoal-600'
                        "
                      >
                        <Utensils v-if="opt.value === 'dine_in'" class="h-4 w-4" />
                        <Store v-else-if="opt.value === 'takeaway'" class="h-4 w-4" />
                        <Bike v-else class="h-4 w-4" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-bold text-charcoal-900">{{ opt.label }}</p>
                        <p class="text-[11px] text-charcoal-500">{{ opt.desc }}</p>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Conditional Table Number -->
                <div v-if="orderType === 'dine_in'" class="space-y-1.5">
                  <label for="checkout-table" class="block text-xs font-bold text-charcoal-800">
                    Nomor Meja <span class="text-chili-600">*</span>
                  </label>
                  <input
                    id="checkout-table"
                    v-model="tableNumber"
                    type="text"
                    placeholder="Contoh: Meja 04"
                    class="w-full rounded-xl border border-cream-300 bg-cream-50/50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/70 focus:border-chili-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chili-500/20"
                  >
                </div>

                <!-- Conditional Delivery Address -->
                <div v-if="orderType === 'delivery'" class="space-y-1.5">
                  <label for="checkout-address" class="block text-xs font-bold text-charcoal-800">
                    Alamat Pengantaran <span class="text-chili-600">*</span>
                  </label>
                  <textarea
                    id="checkout-address"
                    v-model="deliveryAddress"
                    rows="3"
                    placeholder="Tulis alamat lengkap, nomor rumah, dan patokan lokasi..."
                    class="w-full rounded-xl border border-cream-300 bg-cream-50/50 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-500/70 focus:border-chili-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chili-500/20"
                  />
                </div>

                <!-- Error Alert -->
                <div
                  v-if="errorMessage"
                  class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{{ errorMessage }}</span>
                </div>
              </section>
            </div>

            <!-- Sticky Checkout Footer -->
            <div class="border-t border-cream-300 bg-white p-4 sm:px-5">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-semibold text-charcoal-600">Total Pembayaran</span>
                <span class="text-xl font-extrabold text-chili-700">{{ formatRupiah(totalAmount) }}</span>
              </div>

              <button
                type="button"
                :disabled="submitting || !store.is_open"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-chili-600 px-4 py-3.5 text-sm font-bold text-white shadow-warm-md transition hover:bg-chili-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                @click="submitOrder"
              >
                <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
                <MessageCircle v-else class="h-5 w-5" />
                <span>{{ submitting ? 'Menyimpan Pesanan...' : 'Pesan & Kirim ke WhatsApp' }}</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
