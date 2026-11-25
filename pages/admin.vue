<script setup lang="ts">
import {
  ClipboardList,
  Database,
  ExternalLink,
  LogOut,
  Settings,
  UtensilsCrossed,
} from 'lucide-vue-next'
import type { MenuItem, OrderRecord, OrderStatus, StoreSettings } from '~/types'

useHead({
  title: 'Admin & Kasir — Bakso Berkah',
})

type AdminTab = 'orders' | 'menu' | 'store'

const authenticated = ref(false)
const checkingSession = ref(true)
const dbMode = ref<'tidb' | 'memory'>('memory')
const activeTab = ref<AdminTab>('orders')

const store = ref<StoreSettings | null>(null)
const menuItems = ref<MenuItem[]>([])
const orders = ref<OrderRecord[]>([])
const refreshingOrders = ref(false)
const toastMessage = ref('')

let toastTimer: ReturnType<typeof setTimeout> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

async function loadAllData() {
  refreshingOrders.value = true
  try {
    const [storeRes, menuRes, ordersRes] = await Promise.all([
      $fetch<{ store: StoreSettings; dbMode: 'tidb' | 'memory' }>('/api/store'),
      $fetch<{ items: MenuItem[] }>('/api/menu'),
      $fetch<{ orders: OrderRecord[] }>('/api/orders'),
    ])
    store.value = storeRes.store
    dbMode.value = storeRes.dbMode
    menuItems.value = menuRes.items
    orders.value = ordersRes.orders
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode
    if (status === 401) {
      authenticated.value = false
    }
  } finally {
    refreshingOrders.value = false
  }
}

async function refreshOrdersOnly() {
  refreshingOrders.value = true
  try {
    const ordersRes = await $fetch<{ orders: OrderRecord[] }>('/api/orders')
    orders.value = ordersRes.orders
  } finally {
    refreshingOrders.value = false
  }
}

async function handleOrderStatusUpdate(payload: { id: string; status: OrderStatus }) {
  try {
    const res = await $fetch<{ order: OrderRecord }>(`/api/orders/${payload.id}`, {
      method: 'PATCH',
      body: { status: payload.status },
    })
    const idx = orders.value.findIndex(o => o.id === payload.id)
    if (idx !== -1) {
      orders.value[idx] = res.order
    }
    showToast(`Status pesanan ${res.order.order_code} diperbarui`)
  } catch {
    showToast('Gagal memperbarui status pesanan')
  }
}

async function handleMenuChanged(message: string) {
  const menuRes = await $fetch<{ items: MenuItem[] }>('/api/menu')
  menuItems.value = menuRes.items
  showToast(message)
}

function handleStoreUpdated(payload: { store: StoreSettings; message: string }) {
  store.value = payload.store
  showToast(payload.message)
}

async function handleAuthenticated() {
  authenticated.value = true
  await loadAllData()
  startAutoRefresh()
}

async function handleLogout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  authenticated.value = false
  stopAutoRefresh()
}

function startAutoRefresh() {
  stopAutoRefresh()
  pollTimer = setInterval(() => {
    if (authenticated.value && activeTab.value === 'orders') {
      refreshOrdersOnly()
    }
  }, 15000)
}

function stopAutoRefresh() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(async () => {
  try {
    const session = await $fetch<{ authenticated: boolean; dbMode: 'tidb' | 'memory' }>('/api/admin/session')
    authenticated.value = session.authenticated
    dbMode.value = session.dbMode
    if (session.authenticated) {
      await loadAllData()
      startAutoRefresh()
    }
  } finally {
    checkingSession.value = false
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})

const pendingCount = computed(() => orders.value.filter(o => o.status === 'pending').length)
const preparingCount = computed(() => orders.value.filter(o => o.status === 'preparing').length)
const availableMenuCount = computed(() => menuItems.value.filter(m => m.is_available).length)
</script>

<template>
  <div v-if="checkingSession" class="flex min-h-screen items-center justify-center bg-cream-100">
    <p class="text-sm font-semibold text-charcoal-600">Memuat dashboard kasir...</p>
  </div>

  <AdminPinLogin v-else-if="!authenticated" @authenticated="handleAuthenticated" />

  <div v-else class="min-h-screen bg-cream-100 pb-16">
    <!-- Top Admin Navbar -->
    <header class="sticky top-0 z-30 border-b border-cream-300 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-chili-600 text-amber-300 shadow-sm">
            <UtensilsCrossed class="h-5 w-5" />
          </div>
          <div>
            <h1 class="font-display text-lg font-bold leading-tight text-charcoal-900">
              {{ store?.store_name || 'Bakso Berkah' }}
            </h1>
            <p class="text-[11px] font-semibold text-charcoal-500">Dashboard Admin &amp; Kasir</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex"
            :class="
              dbMode === 'tidb'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
            "
          >
            <Database class="h-3.5 w-3.5" />
            {{ dbMode === 'tidb' ? 'TiDB Cloud Aktif' : 'Mode Preview Lokal' }}
          </span>

          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-xs font-bold text-charcoal-700 transition hover:bg-cream-200"
          >
            <span>Lihat Toko</span>
            <ExternalLink class="h-3.5 w-3.5" />
          </NuxtLink>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
            @click="handleLogout"
          >
            <LogOut class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <!-- DB Mode Notice when TiDB URL not configured yet -->
      <div
        v-if="dbMode === 'memory'"
        class="mb-5 rounded-2xl border border-amber-200 bg-amberwarm-50 px-4 py-3 text-xs text-amber-950"
      >
        <strong>Mode Preview Lokal:</strong> Variabel <code class="rounded bg-amber-100 px-1 font-mono">DATABASE_URL</code> belum diisi di <code class="rounded bg-amber-100 px-1 font-mono">.env</code>. Data tersimpan sementara di memori server sampai koneksi TiDB Cloud ditambahkan.
      </div>

      <!-- Summary Stat Cards -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div class="rounded-2xl border border-cream-300 bg-white p-4 shadow-warm-sm">
          <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Menunggu</p>
          <p class="mt-1 text-2xl font-extrabold text-amber-600">{{ pendingCount }}</p>
        </div>
        <div class="rounded-2xl border border-cream-300 bg-white p-4 shadow-warm-sm">
          <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Sedang Dimasak</p>
          <p class="mt-1 text-2xl font-extrabold text-blue-600">{{ preparingCount }}</p>
        </div>
        <div class="rounded-2xl border border-cream-300 bg-white p-4 shadow-warm-sm">
          <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Menu Tersedia</p>
          <p class="mt-1 text-2xl font-extrabold text-charcoal-900">
            {{ availableMenuCount }} <span class="text-sm font-semibold text-charcoal-500">/ {{ menuItems.length }}</span>
          </p>
        </div>
        <div class="rounded-2xl border border-cream-300 bg-white p-4 shadow-warm-sm">
          <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Status Warung</p>
          <p
            class="mt-1 text-xl font-extrabold"
            :class="store?.is_open ? 'text-emerald-600' : 'text-chili-600'"
          >
            {{ store?.is_open ? 'BUKA' : 'TUTUP' }}
          </p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="mt-6 flex gap-2 overflow-x-auto border-b border-cream-300 pb-3">
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition"
          :class="
            activeTab === 'orders'
              ? 'bg-chili-600 text-white shadow-sm'
              : 'bg-white text-charcoal-700 border border-cream-300 hover:border-chili-300'
          "
          @click="activeTab = 'orders'"
        >
          <ClipboardList class="h-4 w-4" />
          <span>Pesanan Masuk</span>
          <span
            v-if="pendingCount > 0"
            class="rounded-full px-1.5 py-0.5 text-[11px] font-extrabold"
            :class="activeTab === 'orders' ? 'bg-amber-400 text-charcoal-900' : 'bg-chili-600 text-white'"
          >
            {{ pendingCount }}
          </span>
        </button>

        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition"
          :class="
            activeTab === 'menu'
              ? 'bg-chili-600 text-white shadow-sm'
              : 'bg-white text-charcoal-700 border border-cream-300 hover:border-chili-300'
          "
          @click="activeTab = 'menu'"
        >
          <UtensilsCrossed class="h-4 w-4" />
          <span>Kelola Menu &amp; Harga</span>
        </button>

        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition"
          :class="
            activeTab === 'store'
              ? 'bg-chili-600 text-white shadow-sm'
              : 'bg-white text-charcoal-700 border border-cream-300 hover:border-chili-300'
          "
          @click="activeTab = 'store'"
        >
          <Settings class="h-4 w-4" />
          <span>Pengaturan Warung &amp; Peta</span>
        </button>
      </nav>

      <!-- Active Tab Content -->
      <div class="mt-6">
        <AdminOrdersTab
          v-if="activeTab === 'orders'"
          :orders="orders"
          :refreshing="refreshingOrders"
          @refresh="refreshOrdersOnly"
          @update-status="handleOrderStatusUpdate"
        />

        <AdminMenuTab
          v-else-if="activeTab === 'menu'"
          :items="menuItems"
          @changed="handleMenuChanged"
        />

        <AdminStoreTab
          v-else-if="activeTab === 'store' && store"
          :store="store"
          @updated="handleStoreUpdated"
        />
      </div>
    </main>

    <!-- Admin Toast -->
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
        class="fixed bottom-5 right-5 z-50 rounded-2xl bg-charcoal-900 px-4 py-3 text-xs font-bold text-white shadow-xl"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>
