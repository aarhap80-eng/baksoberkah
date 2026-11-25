<script setup lang="ts">
import {
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  ShoppingBag,
  Store,
  Utensils,
  XCircle,
} from 'lucide-vue-next'
import type { OrderRecord, OrderStatus } from '~/types'

const props = defineProps<{
  orders: OrderRecord[]
  refreshing: boolean
}>()

const emit = defineEmits<{
  refresh: []
  updateStatus: [payload: { id: string; status: OrderStatus }]
}>()

const { formatRupiah, formatOrderTime, getOrderTypeLabel, getOrderStatusInfo } = useFormatters()

type FilterStatus = 'all' | OrderStatus
const activeFilter = ref<FilterStatus>('all')
const updatingId = ref<string | null>(null)

const STATUS_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Menunggu' },
  { id: 'preparing', label: 'Dimasak' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
]

function getCount(status: FilterStatus): number {
  if (status === 'all') return props.orders.length
  return props.orders.filter(o => o.status === status).length
}

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return props.orders
  return props.orders.filter(o => o.status === activeFilter.value)
})

async function changeStatus(orderId: string, nextStatus: OrderStatus) {
  updatingId.value = orderId
  emit('updateStatus', { id: orderId, status: nextStatus })
  setTimeout(() => {
    if (updatingId.value === orderId) updatingId.value = null
  }, 500)
}
</script>

<template>
  <section class="space-y-5">
    <!-- Controls Bar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <button
          v-for="filter in STATUS_FILTERS"
          :key="filter.id"
          type="button"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition"
          :class="
            activeFilter === filter.id
              ? 'bg-chili-600 text-white shadow-sm'
              : 'border border-cream-300 bg-white text-charcoal-700 hover:border-chili-300'
          "
          @click="activeFilter = filter.id"
        >
          <span>{{ filter.label }}</span>
          <span
            class="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold"
            :class="activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-600'"
          >
            {{ getCount(filter.id) }}
          </span>
        </button>
      </div>

      <button
        type="button"
        :disabled="refreshing"
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-cream-300 bg-white px-4 py-2 text-xs font-bold text-charcoal-800 shadow-warm-sm transition hover:border-chili-300 hover:text-chili-700 disabled:opacity-60"
        @click="emit('refresh')"
      >
        <RefreshCw class="h-3.5 w-3.5" :class="refreshing ? 'animate-spin' : ''" />
        <span>Muat Ulang Pesanan</span>
      </button>
    </div>

    <!-- Empty Orders State -->
    <div
      v-if="filteredOrders.length === 0"
      class="rounded-3xl border border-cream-300 bg-white px-6 py-14 text-center shadow-warm-sm"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-charcoal-500">
        <ShoppingBag class="h-7 w-7" />
      </div>
      <h3 class="mt-4 text-base font-bold text-charcoal-900">Belum Ada Pesanan</h3>
      <p class="mt-1 text-sm text-charcoal-500">
        Pesanan baru dari pelanggan akan muncul otomatis di sini secara berurutan dari yang terbaru.
      </p>
    </div>

    <!-- Orders Grid -->
    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article
        v-for="order in filteredOrders"
        :key="order.id"
        class="flex flex-col rounded-2xl border border-cream-300 bg-white p-4 shadow-warm-sm transition hover:border-chili-200 sm:p-5"
      >
        <!-- Top Row: Code + Status -->
        <div class="flex flex-wrap items-start justify-between gap-2 border-b border-cream-200 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-base font-extrabold tracking-wide text-chili-700">
                {{ order.order_code }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                :class="getOrderStatusInfo(order.status).badgeClass"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="getOrderStatusInfo(order.status).dotClass" />
                {{ getOrderStatusInfo(order.status).label }}
              </span>
            </div>
            <p class="mt-1 flex items-center gap-1 text-xs text-charcoal-500">
              <Clock class="h-3.5 w-3.5" />
              {{ formatOrderTime(order.created_at) }}
            </p>
          </div>

          <div class="text-right">
            <p class="text-[11px] font-medium text-charcoal-500">Total</p>
            <p class="text-base font-extrabold text-charcoal-900">
              {{ formatRupiah(order.total_amount) }}
            </p>
          </div>
        </div>

        <!-- Customer & Order Type -->
        <div class="mt-3 space-y-1.5 text-xs">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-bold text-charcoal-900">
              {{ order.customer_name }}
            </p>
            <span class="inline-flex items-center gap-1 rounded-lg bg-cream-200 px-2.5 py-1 font-bold text-charcoal-800">
              <Utensils v-if="order.order_type === 'dine_in'" class="h-3.5 w-3.5 text-chili-600" />
              <Store v-else-if="order.order_type === 'takeaway'" class="h-3.5 w-3.5 text-amberwarm-700" />
              <Bike v-else class="h-3.5 w-3.5 text-blue-600" />
              {{ getOrderTypeLabel(order.order_type) }}
              <template v-if="order.table_number">• Meja {{ order.table_number }}</template>
            </span>
          </div>

          <p v-if="order.customer_phone" class="flex items-center gap-1.5 text-charcoal-600">
            <Phone class="h-3.5 w-3.5 text-charcoal-400" />
            <span>{{ order.customer_phone }}</span>
          </p>

          <p v-if="order.delivery_address" class="flex items-start gap-1.5 rounded-xl bg-blue-50/70 p-2.5 text-blue-950">
            <MapPin class="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span>{{ order.delivery_address }}</span>
          </p>
        </div>

        <!-- Itemized Breakdown -->
        <div class="mt-3.5 flex-1 space-y-2 rounded-xl bg-cream-100/80 p-3">
          <div
            v-for="(item, idx) in order.items_json"
            :key="idx"
            class="flex items-start justify-between gap-2 border-b border-cream-200 pb-2 last:border-b-0 last:pb-0 text-xs"
          >
            <div>
              <p class="font-bold text-charcoal-900">
                {{ item.quantity }}x {{ item.name }}
              </p>
              <div class="mt-0.5 flex flex-wrap gap-1">
                <span
                  v-if="item.customization?.noodleMix"
                  class="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-charcoal-700"
                >
                  {{ item.customization.noodleMix }}
                </span>
                <span
                  v-if="item.customization?.servingStyle"
                  class="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-charcoal-700"
                >
                  {{ item.customization.servingStyle }}
                </span>
                <span
                  v-if="item.customization?.spiceLevel"
                  class="rounded bg-chili-50 px-1.5 py-0.5 text-[11px] font-semibold text-chili-700"
                >
                  {{ item.customization.spiceLevel }}
                </span>
              </div>
              <p v-if="item.customization?.notes" class="mt-0.5 italic text-charcoal-600">
                Catatan: "{{ item.customization.notes }}"
              </p>
            </div>
            <span class="shrink-0 font-bold text-charcoal-800">
              {{ formatRupiah(item.subtotal) }}
            </span>
          </div>
        </div>

        <!-- Workflow Action Buttons -->
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            v-if="order.status === 'pending'"
            type="button"
            :disabled="updatingId === order.id"
            class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            @click="changeStatus(order.id, 'preparing')"
          >
            <Loader2 v-if="updatingId === order.id" class="h-3.5 w-3.5 animate-spin" />
            <ChefHat v-else class="h-4 w-4" />
            <span>Mulai Masak</span>
          </button>

          <button
            v-if="order.status === 'pending' || order.status === 'preparing'"
            type="button"
            :disabled="updatingId === order.id"
            class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            @click="changeStatus(order.id, 'completed')"
          >
            <CheckCircle2 class="h-4 w-4" />
            <span>Tandai Selesai</span>
          </button>

          <button
            v-if="order.status === 'pending' || order.status === 'preparing'"
            type="button"
            :disabled="updatingId === order.id"
            class="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            @click="changeStatus(order.id, 'cancelled')"
          >
            <XCircle class="h-4 w-4" />
            <span>Batal</span>
          </button>

          <div
            v-if="order.status === 'completed' || order.status === 'cancelled'"
            class="flex w-full items-center justify-between text-xs text-charcoal-500"
          >
            <span>Pesanan sudah {{ order.status === 'completed' ? 'selesai dilayani' : 'dibatalkan' }}.</span>
            <button
              type="button"
              class="font-bold text-chili-600 hover:underline"
              @click="changeStatus(order.id, 'pending')"
            >
              Kembalikan ke Menunggu
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
