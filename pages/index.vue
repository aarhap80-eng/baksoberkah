<script setup lang="ts">
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-vue-next'
import type { MenuCategory, MenuItem, OrderItemCustomization, StoreSettings } from '~/types'

const { data: storePayload } = await useAsyncData('store-settings', () =>
  $fetch<{ store: StoreSettings; dbMode: 'tidb' | 'memory' }>('/api/store'),
)

const { data: menuPayload } = await useAsyncData('menu-items', () =>
  $fetch<{ items: MenuItem[] }>('/api/menu'),
)

const store = computed<StoreSettings>(() => storePayload.value?.store ?? {
  id: 1,
  store_name: 'Bakso Berkah',
  tagline: 'Gurih Kuahnya, Mantap Dagingnya',
  is_open: true,
  whatsapp_number: '6281234567890',
  address: 'Alamat warung belum diatur — hubungi WhatsApp untuk lokasi',
  open_hours: 'Setiap Hari, 10.00 - 21.00 WIB',
  maps_url: null,
  maps_embed_url: null,
})

const menuItems = computed<MenuItem[]>(() => menuPayload.value?.items ?? [])

useHead(() => ({
  title: `${store.value.store_name} — ${store.value.tagline}`,
}))

const { formatRupiah } = useFormatters()
const {
  totalItems,
  totalAmount,
  hydrateFromStorage,
  addToCart,
  syncMenuCatalog,
  getItemCountForMenu,
} = useCart()

onMounted(() => {
  hydrateFromStorage()
  if (menuItems.value.length > 0) {
    syncMenuCatalog(menuItems.value)
  }
})

type CategoryTab = 'semua' | MenuCategory
const activeCategory = ref<CategoryTab>('semua')
const searchQuery = ref('')
const selectedItem = ref<MenuItem | null>(null)
const cartOpen = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const CATEGORY_TABS: { id: CategoryTab; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'bakso', label: 'Bakso' },
  { id: 'mie', label: 'Mie & Kwetiau' },
  { id: 'nasi', label: 'Nasi' },
  { id: 'minuman', label: 'Minuman' },
]

function getCategoryCount(tab: CategoryTab): number {
  if (tab === 'semua') return menuItems.value.length
  return menuItems.value.filter(item => item.category === tab).length
}

const filteredMenu = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return menuItems.value.filter((item) => {
    const matchCategory = activeCategory.value === 'semua' || item.category === activeCategory.value
    const matchQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    return matchCategory && matchQuery
  })
})

const hasMapsEmbed = computed(() => Boolean(store.value.maps_embed_url && store.value.maps_embed_url.trim().length > 0))
const cleanWhatsappLink = computed(() => {
  const phone = (store.value.whatsapp_number || '6281234567890').replace(/[^\d]/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Halo ${store.value.store_name}, saya mau tanya info menu & lokasi warung.`)}`
})

function handleSelectMenu(item: MenuItem) {
  if (!item.is_available || !store.value.is_open) return
  selectedItem.value = item
}

function handleAddToCart(payload: { item: MenuItem; quantity: number; customization: OrderItemCustomization }) {
  addToCart(payload.item, payload.quantity, payload.customization)
  selectedItem.value = null
  showToast(`${payload.quantity}x ${payload.item.name} ditambahkan ke keranjang`)
}

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2600)
}
</script>

<template>
  <div class="min-h-screen pb-28">
    <!-- Hero & Store Header -->
    <StoreHeader :store="store" />

    <!-- Main Catalog Container -->
    <main class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
      <!-- Store Closed Notice Banner -->
      <div
        v-if="!store.is_open"
        class="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-900 shadow-warm-sm"
      >
        <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-chili-600" />
        <div>
          <p class="text-sm font-bold">Warung Sedang Tutup Sementara</p>
          <p class="mt-0.5 text-xs text-red-800 sm:text-sm">
            Anda tetap dapat melihat daftar menu dan harga kami. Pemesanan online akan dibuka kembali saat jam operasional ({{ store.open_hours }}).
          </p>
        </div>
      </div>

      <!-- Sticky Search & Category Filter Bar -->
      <section class="sticky top-0 z-20 -mx-4 bg-cream-100/95 px-4 pb-3 pt-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <!-- Category Tabs -->
          <div class="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
            <button
              v-for="tab in CATEGORY_TABS"
              :key="tab.id"
              type="button"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm"
              :class="
                activeCategory === tab.id
                  ? 'bg-chili-600 text-white shadow-warm-sm'
                  : 'border border-cream-300 bg-white text-charcoal-700 hover:border-chili-300 hover:text-chili-700'
              "
              @click="activeCategory = tab.id"
            >
              <span>{{ tab.label }}</span>
              <span
                class="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold"
                :class="
                  activeCategory === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-cream-200 text-charcoal-600'
                "
              >
                {{ getCategoryCount(tab.id) }}
              </span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full md:w-72">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari bakso, mie ayam, es teh..."
              class="w-full rounded-full border border-cream-300 bg-white py-2.5 pl-10 pr-9 text-sm text-charcoal-900 placeholder:text-charcoal-500/75 shadow-warm-sm focus:border-chili-500 focus:outline-none focus:ring-2 focus:ring-chili-500/20"
            >
            <button
              v-if="searchQuery"
              type="button"
              aria-label="Hapus pencarian"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
              @click="searchQuery = ''"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- Section Heading -->
      <div class="mt-4 flex items-center justify-between">
        <div>
          <h2 class="font-display text-2xl font-bold text-charcoal-900 sm:text-3xl">
            Daftar Menu Pilihan
          </h2>
          <p class="mt-0.5 text-xs text-charcoal-600 sm:text-sm">
            Pilih menu favorit Anda, atur tingkat pedas &amp; mie sesuai selera.
          </p>
        </div>

        <span class="hidden items-center gap-1.5 rounded-full bg-amberwarm-100 px-3 py-1 text-xs font-bold text-amberwarm-700 sm:inline-flex">
          <Sparkles class="h-3.5 w-3.5" />
          {{ filteredMenu.length }} Menu
        </span>
      </div>

      <!-- Menu Grid -->
      <div
        v-if="filteredMenu.length > 0"
        class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5"
      >
        <MenuCard
          v-for="item in filteredMenu"
          :key="item.id"
          :item="item"
          :in-cart-count="getItemCountForMenu(item.id)"
          :store-open="store.is_open"
          @select="handleSelectMenu"
        />
      </div>

      <!-- Empty Filter State -->
      <div
        v-else
        class="mt-8 rounded-3xl border border-cream-300 bg-white px-6 py-12 text-center shadow-warm-sm"
      >
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-charcoal-500">
          <UtensilsCrossed class="h-7 w-7" />
        </div>
        <h3 class="mt-4 text-lg font-bold text-charcoal-900">Menu Tidak Ditemukan</h3>
        <p class="mt-1 text-sm text-charcoal-600">
          Coba ubah kata kunci pencarian atau pilih kategori menu lainnya.
        </p>
        <button
          type="button"
          class="mt-5 rounded-xl bg-chili-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-chili-700"
          @click="activeCategory = 'semua'; searchQuery = ''"
        >
          Tampilkan Semua Menu
        </button>
      </div>

      <!-- Optional Embedded Google Maps Section (only shown if maps_embed_url is set) -->
      <section v-if="hasMapsEmbed" class="mt-12">
        <div class="overflow-hidden rounded-3xl border border-cream-300 bg-white shadow-warm-sm">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 px-5 py-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-chili-50 text-chili-600">
                <MapPin class="h-5 w-5" />
              </div>
              <div>
                <h3 class="font-display text-lg font-bold text-charcoal-900">Lokasi {{ store.store_name }}</h3>
                <p class="text-xs text-charcoal-600">{{ store.address }}</p>
              </div>
            </div>
          </div>
          <iframe
            :src="store.maps_embed_url!"
            class="h-72 w-full border-0 sm:h-80"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Peta Lokasi Bakso Berkah"
          />
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-14 border-t border-cream-300 bg-white/80">
      <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="font-display text-xl font-bold text-chili-700">{{ store.store_name }}</h3>
            <p class="mt-1 text-xs text-charcoal-600">{{ store.tagline }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-charcoal-600">
              <span class="inline-flex items-center gap-1.5">
                <Clock class="h-3.5 w-3.5 text-amberwarm-600" />
                {{ store.open_hours }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <MapPin class="h-3.5 w-3.5 text-chili-600" />
                {{ store.address }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <a
              :href="cleanWhatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-600 hover:text-white"
            >
              <MessageCircle class="h-4 w-4" />
              <span>Chat WhatsApp</span>
            </a>

            <NuxtLink
              to="/admin"
              class="inline-flex items-center gap-1.5 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-xs font-bold text-charcoal-700 transition hover:bg-cream-200"
            >
              <span>Portal Kasir &amp; Admin</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>

    <!-- Subtle Added-to-Cart Toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed left-1/2 top-4 z-40 -translate-x-1/2 rounded-full bg-charcoal-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl"
      >
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- Floating Cart Bar -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-10 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-10 opacity-0"
    >
      <div
        v-if="totalItems > 0"
        class="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-xl"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-2xl bg-chili-600 px-4 py-3.5 text-white shadow-warm-lg ring-2 ring-white/20 transition hover:bg-chili-700 active:scale-[0.99] sm:px-5"
          @click="cartOpen = true"
        >
          <div class="flex items-center gap-3">
            <div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <ShoppingBag class="h-5 w-5" />
              <span class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-extrabold text-charcoal-900">
                {{ totalItems }}
              </span>
            </div>
            <div class="text-left">
              <p class="text-[11px] font-semibold text-chili-100">
                {{ totalItems }} item di keranjang
              </p>
              <p class="text-base font-extrabold leading-tight">
                {{ formatRupiah(totalAmount) }}
              </p>
            </div>
          </div>

          <span class="inline-flex items-center gap-1 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-chili-700 shadow-sm sm:text-sm">
            <span>Lanjut Pesan</span>
            <ChevronRight class="h-4 w-4" />
          </span>
        </button>
      </div>
    </Transition>

    <!-- Smart Customization Modal -->
    <CustomizationModal
      :item="selectedItem"
      @close="selectedItem = null"
      @add="handleAddToCart"
    />

    <!-- Cart & WhatsApp Checkout Drawer -->
    <CartDrawer
      :open="cartOpen"
      :store="store"
      @close="cartOpen = false"
    />
  </div>
</template>
