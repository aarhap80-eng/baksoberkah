<script setup lang="ts">
import { Flame, Plus, ShoppingBag } from 'lucide-vue-next'
import type { MenuItem } from '~/types'

const props = defineProps<{
  item: MenuItem
  inCartCount: number
  storeOpen: boolean
}>()

const emit = defineEmits<{
  select: [item: MenuItem]
}>()

const { formatRupiah, getCategoryLabel } = useFormatters()

const canOrder = computed(() => props.item.is_available && props.storeOpen)
</script>

<template>
  <article
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-cream-300/80 bg-white shadow-warm-sm transition-all duration-200"
    :class="
      item.is_available
        ? 'hover:-translate-y-0.5 hover:border-chili-200 hover:shadow-warm-md'
        : 'opacity-80'
    "
  >
    <!-- Image Container -->
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-cream-200">
      <img
        :src="item.image_url"
        :alt="item.name"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500"
        :class="item.is_available ? 'group-hover:scale-105' : 'grayscale-[55%]'"
      >

      <!-- Top Badges -->
      <div class="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
        <div class="flex flex-wrap gap-1.5">
          <span
            v-if="item.is_bestseller"
            class="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
          >
            <Flame class="h-3 w-3 fill-white" />
            Terlaris
          </span>
          <span class="rounded-full bg-charcoal-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {{ getCategoryLabel(item.category) }}
          </span>
        </div>

        <span
          v-if="inCartCount > 0"
          class="inline-flex items-center gap-1 rounded-full bg-chili-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-md"
        >
          <ShoppingBag class="h-3 w-3" />
          {{ inCartCount }}
        </span>
      </div>

      <!-- Sold Out Overlay -->
      <div
        v-if="!item.is_available"
        class="absolute inset-0 flex items-center justify-center bg-charcoal-900/45 backdrop-blur-[1px]"
      >
        <span class="rounded-full border border-white/30 bg-charcoal-900/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg">
          Habis
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-base font-bold leading-snug text-charcoal-900 group-hover:text-chili-700 transition-colors">
          {{ item.name }}
        </h3>
        <span
          v-if="!item.is_available"
          class="shrink-0 rounded-md bg-stone-200 px-2 py-0.5 text-[11px] font-bold text-stone-700"
        >
          Habis
        </span>
      </div>

      <p class="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-charcoal-600 sm:text-sm">
        {{ item.description }}
      </p>

      <!-- Price & Action -->
      <div class="mt-4 flex items-center justify-between gap-3 border-t border-cream-200 pt-3">
        <div>
          <p class="text-[11px] font-medium text-charcoal-500">Harga</p>
          <p class="text-base font-extrabold text-chili-700 sm:text-lg">
            {{ formatRupiah(item.price) }}
          </p>
        </div>

        <button
          type="button"
          :disabled="!canOrder"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm"
          :class="
            canOrder
              ? 'bg-chili-600 text-white shadow-sm hover:bg-chili-700 active:scale-[0.98]'
              : 'cursor-not-allowed bg-stone-200 text-stone-500'
          "
          @click="emit('select', item)"
        >
          <template v-if="!item.is_available">
            <span>Habis</span>
          </template>
          <template v-else-if="!storeOpen">
            <span>Tutup</span>
          </template>
          <template v-else>
            <Plus class="h-4 w-4 stroke-[2.5]" />
            <span>Pesan</span>
          </template>
        </button>
      </div>
    </div>
  </article>
</template>
