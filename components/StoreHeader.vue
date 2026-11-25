<script setup lang="ts">
import { Clock, ExternalLink, Flame, MapPin, ShieldCheck, UtensilsCrossed } from 'lucide-vue-next'
import type { StoreSettings } from '~/types'

const props = defineProps<{
  store: StoreSettings
}>()

const hasMapsUrl = computed(() => Boolean(props.store.maps_url && props.store.maps_url.trim().length > 0))
</script>

<template>
  <header class="relative">
    <!-- Hero Banner -->
    <div class="relative overflow-hidden bg-charcoal-900">
      <img
        src="/images/hero-bakso.jpg"
        alt="Hidangan Bakso Berkah hangat menggugah selera"
        class="absolute inset-0 h-full w-full object-cover object-center opacity-50 scale-[1.01]"
      >
      <div class="absolute inset-0 bg-gradient-to-b from-charcoal-900/80 via-chili-900/70 to-charcoal-900/95" />
      <div class="absolute inset-0 bg-culinary-pattern opacity-40" />

      <div class="relative mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-7">
        <!-- Top Navigation Strip -->
        <div class="flex items-center justify-between gap-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-chili-600 text-amber-300 shadow-sm">
              <UtensilsCrossed class="h-3.5 w-3.5" />
            </span>
            <span class="text-xs font-semibold tracking-wide text-amber-100">Warung Kuliner Nusantara</span>
          </div>

          <NuxtLink
            to="/admin"
            class="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/20"
          >
            <ShieldCheck class="h-3.5 w-3.5 text-amber-300" />
            <span>Admin / Kasir</span>
          </NuxtLink>
        </div>

        <!-- Hero Headline -->
        <div class="mt-7 max-w-2xl sm:mt-10">
          <div class="mb-3 flex flex-wrap items-center gap-2.5">
            <span
              class="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold shadow-sm"
              :class="
                store.is_open
                  ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40 backdrop-blur-md'
                  : 'bg-red-500/25 text-red-100 ring-1 ring-red-400/40 backdrop-blur-md'
              "
            >
              <span
                class="h-2 w-2 rounded-full"
                :class="store.is_open ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'"
              />
              {{ store.is_open ? 'Buka Sekarang — Siap Melayani' : 'Warung Sedang Tutup' }}
            </span>

            <span class="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-300/30 backdrop-blur-md">
              <Flame class="h-3.5 w-3.5 text-amber-300" />
              Kaldu Sapi Asli &amp; Segar
            </span>
          </div>

          <h1 class="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {{ store.store_name }}
          </h1>
          <p class="mt-2.5 text-base font-medium text-amber-100/95 sm:text-lg md:text-xl">
            {{ store.tagline }}
          </p>
        </div>
      </div>
    </div>

    <!-- Overlapping Store Info Card -->
    <div class="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
      <div class="rounded-2xl border border-cream-300/80 bg-white p-4 shadow-warm-md sm:p-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-2">
            <!-- Opening Hours -->
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amberwarm-100 text-amberwarm-700">
                <Clock class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                  Jam Operasional
                </p>
                <p class="mt-0.5 text-sm font-semibold text-charcoal-900">
                  {{ store.open_hours }}
                </p>
              </div>
            </div>

            <!-- Address -->
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chili-50 text-chili-600">
                <MapPin class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                  Lokasi Warung
                </p>
                <p class="mt-0.5 text-sm font-medium leading-snug text-charcoal-800">
                  {{ store.address }}
                </p>
              </div>
            </div>
          </div>

          <!-- Conditional Google Maps Button (hidden cleanly when empty) -->
          <div v-if="hasMapsUrl" class="shrink-0 border-t border-cream-200 pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
            <a
              :href="store.maps_url!"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-chili-200 bg-chili-50 px-4 py-2.5 text-sm font-bold text-chili-700 transition hover:bg-chili-600 hover:text-white md:w-auto"
            >
              <MapPin class="h-4 w-4" />
              <span>Buka di Google Maps</span>
              <ExternalLink class="h-3.5 w-3.5 opacity-75" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
