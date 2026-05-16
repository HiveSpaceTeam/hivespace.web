<template>
  <div class="relative" ref="multiSelectRef" :style="{ '--menu-width': menuWidthPx + 'px' }">
    <label
      v-if="props.label && props.variant === 'default'"
      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
      >{{ props.label }}</label
    >
    <div
      @click="toggleDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      role="button"
      tabindex="0"
      class="flex items-center w-full appearance-none rounded-lg transition-all"
      :class="[
        props.variant === 'filter'
          ? 'h-10 px-3 py-2 bg-white dark:bg-dark-900 border border-gray-200 dark:border-gray-800 shadow-theme-xs hover:border-gray-300 dark:hover:border-gray-700'
          : 'h-11 px-4 py-2.5 bg-transparent dark:bg-dark-900 border border-gray-300 dark:border-gray-700 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:focus:border-brand-800',
        isOpen ? 'text-gray-800 dark:text-white/90 ring-3 ring-brand-500/10 border-brand-300' : 'text-gray-800 dark:text-white/90',
      ]"
    >
      <!-- Icon Slot for Filter variant -->
      <div v-if="props.variant === 'filter'" class="flex-none text-gray-500 dark:text-gray-400 mr-2">
        <slot name="icon"></slot>
      </div>

      <!-- Label for Filter variant -->
      <span v-if="props.variant === 'filter'" class="text-sm font-medium text-gray-700 dark:text-gray-300 grow truncate">
        {{ props.label || placeholderText }}
      </span>

      <!-- Default variant placeholder -->
      <span v-else-if="selectedItems.length === 0" class="text-gray-400"> {{ placeholderText }} </span>

      <!-- Default variant chips -->
      <div v-if="props.variant === 'default'" class="flex items-center flex-auto gap-2 flex-nowrap overflow-hidden">
        <div
          v-for="item in visibleItems"
          :key="item.value"
          class="group flex items-center justify-center h-[30px] rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
        >
          <span>{{ item.label }}</span>
          <button
            @click.stop="removeItem(item)"
            class="pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400"
            aria-label="Remove item"
          >
            <CloseSmallIcon />
          </button>
        </div>
      </div>

      <!-- Summary / Badge area -->
      <div class="flex items-center gap-2 flex-none ml-auto pl-2">
        <div
          v-if="props.variant === 'default' && hiddenCount > 0"
          class="flex items-center justify-center h-5 min-w-5 rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white"
        >
          +{{ hiddenCount }}
        </div>
        <div
          v-else-if="props.variant === 'filter' && selectedItems.length > 0"
          class="flex items-center justify-center h-5 min-w-5 rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white"
        >
          {{ selectedItems.length }}
        </div>
        
        <ChevronDownIcon
          ref="chevronRef"
          class="text-gray-400 transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-40 right-0 mt-2 p-2 space-y-1 bg-white border border-gray-200 top-full rounded-2xl shadow-lg dark:border-gray-800 dark:bg-gray-dark w-[var(--menu-width)]"
      >
        <ul
          class="overflow-y-auto custom-scrollbar max-h-60"
          role="listbox"
          aria-multiselectable="true"
        >
          <li
            v-for="item in props.options"
            :key="item.value"
            role="option"
            :aria-selected="isSelected(item)"
          >
            <button
              type="button"
              @click="toggleItem(item)"
              :class="[
                'flex items-center w-full px-3 py-2 font-medium text-left text-gray-500 rounded-lg text-theme-xs transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300',
                isSelected(item) ? 'bg-gray-50 dark:bg-white/[0.03]' : '',
              ]"
            >
              <!-- Checkbox (Filter-style UI) -->
              <div 
                class="flex-none w-4 h-4 mr-3 rounded border transition-all flex items-center justify-center"
                :class="[
                  isSelected(item) 
                    ? 'bg-brand-500 border-brand-500' 
                    : 'bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700'
                ]"
              >
                <CheckIcon v-if="isSelected(item)" class="w-2.5 h-2.5 text-white" />
              </div>

              <div class="grow flex items-center justify-between min-w-0">
                <span class="truncate">{{ item.label }}</span>
                <span v-if="item.description" class="flex-none text-[10px] text-gray-400 font-normal uppercase tracking-wider ml-4">
                  {{ item.description }}
                </span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
  <!-- measurement container (hidden) used to measure chip widths -->
  <div ref="measureRef" class="pointer-events-none opacity-0 absolute left-[-9999px] top-[-9999px]">
    <div
      v-for="item in selectedItems"
      :key="item.value"
      class="inline-flex items-center h-[30px] rounded-full py-1 pl-2.5 pr-2 text-sm"
    >
      <span>{{ item.label }}</span>
      <div class="w-[22px]"></div>
      <!-- Space for CloseSmallIcon (14px) + pl-2 (8px) -->
    </div>
    <div
      ref="plusRef"
      class="inline-flex items-center h-5 min-w-5 rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white justify-center"
    >
      +99
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'

import CloseSmallIcon from '../../icons/CloseSmallIcon.vue'
import ChevronDownIcon from '../../icons/ChevronDownIcon.vue'
import CheckIcon from '../../icons/CheckIcon.vue'

interface Option {
  value: string | number
  label: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    options: Option[]
    modelValue?: Option[]
    label?: string
    placeholder?: string
    variant?: 'default' | 'filter'
  }>(),
  {
    modelValue: () => [],
    label: '',
    placeholder: 'Select items...',
    variant: 'default',
  },
)

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectedItems = ref<Option[]>(props.modelValue || [])
const multiSelectRef = ref<HTMLElement | null>(null)
const measureRef = ref<HTMLElement | null>(null)
const plusRef = ref<HTMLElement | null>(null)
const chevronRef = ref<HTMLElement | null>(null)

const visibleCount = ref<number>(selectedItems.value.length)

// Placeholder text computed property
const placeholderText = computed(() => props.placeholder)

// mirror BaseSelect width behaviour: measure trigger and set CSS var for menu width
const menuWidthPx = ref(0)

function updateMenuWidth() {
  if (!multiSelectRef.value) return
  const w = Math.round(multiSelectRef.value.getBoundingClientRect().width)
  // set menu width to exact trigger width so dropdown lines up with the input
  menuWidthPx.value = w || 0
  updateVisibleCount()
}

let ro: ResizeObserver | null = null

function handleClickOutside(event: Event) {
  if (multiSelectRef.value && !multiSelectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(async () => {
  await nextTick()
  updateMenuWidth()
  if (multiSelectRef.value && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => updateMenuWidth())
    ro.observe(multiSelectRef.value)
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  if (ro && multiSelectRef.value) ro.unobserve(multiSelectRef.value)
  document.removeEventListener('click', handleClickOutside)
})

// keep internal selectedItems in sync if parent changes modelValue
watch(
  () => props.modelValue,
  (v) => {
    selectedItems.value = v || []
    // recalc visible when items change
    nextTick(() => updateVisibleCount())
  },
)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const toggleItem = (item: Option) => {
  const index = selectedItems.value.findIndex((selected) => selected.value === item.value)
  if (index === -1) selectedItems.value.push(item)
  else selectedItems.value.splice(index, 1)
  emit('update:modelValue', selectedItems.value)
  nextTick(() => updateVisibleCount())
}

const removeItem = (item: Option) => {
  const index = selectedItems.value.findIndex((selected) => selected.value === item.value)
  if (index !== -1) {
    selectedItems.value.splice(index, 1)
    emit('update:modelValue', selectedItems.value)
    nextTick(() => updateVisibleCount())
  }
}

const isSelected = (item: Option) => {
  return selectedItems.value.some((selected) => selected.value === item.value)
}

function updateVisibleCount() {
  if (!multiSelectRef.value || !measureRef.value || !plusRef.value) return

  // Available width: total width - padding (32px) - chevron (20px) - margin (8px)
  const totalWidth = multiSelectRef.value.getBoundingClientRect().width
  const availableWidth = totalWidth - 60 // Safe margin for padding and chevron

  if (selectedItems.value.length === 0) {
    visibleCount.value = 0
    return
  }

  // Get all measurement chips (all divs except the one with ref="plusRef")
  const chips = Array.from(measureRef.value.children).filter(
    (el) => el !== plusRef.value,
  ) as HTMLElement[]
  const plusBadgeWidth = plusRef.value.getBoundingClientRect().width + 8 // 8 for gap

  let currentWidth = 0
  let count = 0

  for (let i = 0; i < selectedItems.value.length; i++) {
    const chip = chips[i]
    if (!chip) continue

    const chipWidth = chip.getBoundingClientRect().width + 8 // 8 for gap

    if (i === selectedItems.value.length - 1) {
      // Last item: don't need to worry about plus badge
      if (currentWidth + chipWidth <= availableWidth) {
        count++
      }
      break
    } else {
      // Not the last item: must account for plus badge if we hide subsequent items
      if (currentWidth + chipWidth + plusBadgeWidth <= availableWidth) {
        currentWidth += chipWidth
        count++
      } else {
        break
      }
    }
  }

  visibleCount.value = count
}

const visibleItems = computed(() => selectedItems.value.slice(0, visibleCount.value))
const hiddenCount = computed(() => Math.max(0, selectedItems.value.length - visibleCount.value))
</script>
