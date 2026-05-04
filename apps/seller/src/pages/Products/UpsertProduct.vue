<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 pb-24">
      <div class="space-y-6">
        <ComponentCard :title="$t('product.basicInfo')">
          <div class="space-y-6">
            <!-- Text Input -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {{ $t('product.productName') }}
              </label>
              <input type="text" :placeholder="$t('product.productName')" v-model="product.name"
                class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
            </div>

            <!-- Select Input -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {{ $t('product.productCategory') }}
              </label>
              <Select
                v-model="formData.selectInput"
                :options="categoryOptions"
                :placeholder="$t('product.pleaseSelect')"
                :disabled="isLoadingCategories"
                @change="onChangeCategory"
              />
              <!-- Error message for categories -->
              <div v-if="categoriesError" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ categoriesError }}
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {{ $t('product.productDescription') }}
              </label>
              <QuillEditor :style="'height:350px'" ref="quillRef" :modules="modules" toolbar="full" />
            </div>
          </div>
        </ComponentCard>
        <ComponentCard :title="$t('product.categoryAttributes')">
          <!-- Dynamic category attributes rendering -->
          <div v-if="isLoadingAttributes" class="flex items-center justify-center py-8">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('common.loading') }} {{ $t('product.attributes') }}...
            </div>
          </div>

          <div v-else-if="attributesError" class="text-sm text-red-600 dark:text-red-400 py-4">
            {{ attributesError }}
          </div>

          <div v-else-if="categoryAttributes.length === 0 && formData.selectInput"
            class="text-sm text-gray-500 dark:text-gray-400 py-4">
            {{ $t('product.noAttributesFound') }}
          </div>

          <div v-else-if="!formData.selectInput" class="text-sm text-gray-500 dark:text-gray-400 py-4">
            {{ $t('product.selectCategoryFirst') }}
          </div>

          <div v-else class="space-y-6">
            <div v-for="attribute in categoryAttributes" :key="attribute.id" class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
                {{ attribute.name }}
                <span v-if="attribute.isMandatory" class="text-red-500 ml-1">*</span>
              </label>
              <!-- Textbox -->
              <template v-if="attribute.inputType === 1">
                <!-- Single textbox -->
                <div>
                  <Input v-model="attributeValues[attribute.id]" :placeholder="$t('product.enterValue')" />
                </div>
              </template>

              <!-- Dropdown -->
              <template v-else-if="attribute.inputType === 2">
                <!-- Single select -->
                <div v-if="attribute.maxValueCount === 1">
                  <Select v-model="attributeValues[attribute.id]" :options="attributeOptionsMap[attribute.id] || []"
                    :placeholder="$t('product.pleaseSelect')" />
                </div>
                <!-- Multi select -->
                <div v-else>
                  <MultipleSelect v-model="attributeMultiValues[attribute.id]"
                    :options="attributeOptionsMap[attribute.id] || []" :placeholder="$t('product.pleaseSelect')" />
                </div>
              </template>

              <!-- Fallback to textbox if unknown inputType -->
              <template v-else>
                <Input v-model="attributeValues[attribute.id]" :placeholder="$t('product.enterValue')" />
              </template>
            </div>
          </div>
        </ComponentCard>
      </div>
      <div class="space-y-6">
        <ComponentCard :title="$t('product.salesInfo')">
          <div class="space-y-6">
            <div class="product-variants-container space-y-6">
              <div v-for="(productVariant, variantIndex) in product.variants" :key="variantIndex">
                <div class="space-y-3">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      {{ $t('product.variant') }}
                    </label>
                    <input type="text" :placeholder="$t('product.fill')" v-model="productVariant.name"
                      class="w-full dark:bg-dark-900 h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      {{ $t('product.option') }}
                    </label>
                    <div class="space-y-2">
                      <div v-for="(option, optionIndex) in productVariant.options" :key="option.optionId">
                        <input @input="onChangeVariantOption(variantIndex, optionIndex)" type="text"
                          :placeholder="$t('product.fill')" v-model="option.value"
                          class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button @click="onClickAddNewVariant" size="sm" variant="outline" :startIcon="PlusIcon">
              {{ $t('product.addNewVariant') }}
            </Button>
            <div v-show="product.variants?.length > 0"
              class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
              <div class="max-w-full overflow-x-auto custom-scrollbar">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                      <th v-for="(variant, variantIndex) in product.variants" class="px-5 py-3 text-left w-1/8 sm:px-6"
                        :key="variantIndex">
                        <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                          {{
                            variant.name || $t('product.variantGroup') + ' ' + (variantIndex + 1)
                          }}
                        </p>
                      </th>
                      <th class="px-5 py-3 text-left w-1/8 sm:px-6">
                        <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                          {{ $t('product.price') }}
                        </p>
                      </th>
                      <th class="px-5 py-3 text-left w-1/8 sm:px-6">
                        <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                          {{ $t('product.inventory') }}
                        </p>
                      </th>
                      <th class="px-5 py-3 text-left w-1/8 sm:px-6">
                        <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                          {{ $t('product.sku') }}
                        </p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(group, groupIndex) in groupedSkus" :key="groupIndex">
                      <tr v-for="(productSku, skuIndex) in group.skus" :key="productSku.id"
                        class="border-b border-gray-200 dark:border-gray-700">
                        <template v-for="(variant, variantIndex) in product.variants" :key="variantIndex">
                          <!-- First column with rowspan for grouping -->
                          <td v-if="variantIndex === 0 && skuIndex === 0"
                            class="px-5 py-4 sm:px-6 border-l-4 border-l-blue-500 bg-gray-50/30 dark:bg-gray-800/20"
                            :rowspan="group.skus.length">
                            <div class="text-sm font-semibold text-gray-900 dark:text-white">
                              {{ getVariantValueBySKU(productSku, variant) }}
                            </div>
                          </td>
                          <!-- Other columns -->
                          <td v-else-if="variantIndex > 0" class="px-5 py-4 sm:px-6">
                            <div class="text-sm text-gray-900 dark:text-white">
                              {{ getVariantValueBySKU(productSku, variant) }}
                            </div>
                          </td>
                        </template>

                        <td class="px-5 py-4 sm:px-6">
                          <input type="text" v-model="productSku.price.amount"
                            class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                        </td>

                        <td class="px-5 py-4 sm:px-6">
                          <input type="text" v-model="productSku.quantity"
                            class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                        </td>
                        <td class="px-5 py-4 sm:px-6">
                          <input type="text" v-model="productSku.skuNo"
                            class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="space-y-6" v-if="product.variants.length == 0">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  {{ $t('product.inventory') }}
                </label>
                <input type="text" :placeholder="$t('product.typeHere')" :value="getProductNoVariantsQuantity()"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  {{ $t('product.price') }}
                </label>
                <input type="text" :placeholder="$t('product.typeHere')" :value="getProductNoVariantsPrice()"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
              </div>
            </div>
          </div>
        </ComponentCard>
        <ComponentCard  v-if="product.skus && product.skus.length > 0 && product.variants.length > 0"  :title="$t('product.imagesBySku')">
          <div
            class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div class="max-w-full overflow-x-auto custom-scrollbar">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="px-5 py-3 text-left w-1/3 sm:px-6">
                      <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        {{ $t('product.variantCombination') }}
                      </p>
                    </th>
                    <th class="px-5 py-3 text-left w-1/3 sm:px-6">
                      <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        {{ $t('product.image') }}
                      </p>
                      <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {{
                          $t('product.imageRequirements', {
                            size: '500px x 500px',
                            formats: '.jpg, .png',
                            maxSize: '10 MB',
                          })
                        }}
                      </p>
                    </th>
                    <th class="px-5 py-3 text-right w-1/3 sm:px-6">
                      <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        {{ $t('common.actions') }}
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="productSku in product.skus"
                    :key="getSkuKey(productSku)"
                    class="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td class="px-5 py-4 sm:px-6 align-top">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ getSkuDisplayName(productSku) || $t('product.defaultSku') }}
                      </div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                      <div class="space-y-3">
                        <div
                          v-if="productSku.images && productSku.images.length"
                          class="flex flex-wrap gap-2"
                        >
                          <div
                            v-for="image in productSku.images"
                            :key="image.fileId"
                            class="group relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                          >
                            <img
                              :src="image.fileId"
                              :alt="getSkuDisplayName(productSku) || $t('product.defaultSku')"
                              class="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              :aria-label="t('product.previewImage')"
                              @click.stop="
                                onPreviewSkuImage(
                                  image.fileId,
                                  getSkuDisplayName(productSku) || $t('product.defaultSku'),
                                )
                              "
                            >
                              <EyeIcon class="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <FileInput
                          :model-value="getSkuImageFile(productSku)"
                          @update:modelValue="(file) => onSkuImageChange(productSku, file)"
                          accept="image/jpeg,image/png"
                          :max-size="10 * 1024 * 1024"
                          preview-direction="right"
                          preview-size="md"
                          preview-shape="square"
                          :button-text="$t('product.uploadSkuImage')"
                          :help-text="$t('product.uploadSkuImageHelp')"
                          :error="skuImageErrors[getSkuKey(productSku)]"
                        />
                      </div>
                    </td>
                    <td class="px-5 py-4 sm:px-6">
                      <div class="flex justify-end">
                        <button
                          type="button"
                          class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
                          @click="clearSkuImage(productSku)"
                        >
                          <TrashIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ComponentCard>
        <ComponentCard v-else-if="product?.skus?.length>0" :title="$t('product.productImages')">
          <div class="space-y-3">
            <div v-if="product.skus && product.skus.length && product.skus[0].images && product.skus[0].images.length" class="flex flex-wrap gap-2">
              <div v-for="image in product.skus[0].images" :key="image.fileId"
                class="group relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img :src="image.fileId" :alt="$t('product.defaultSku')"
                  class="w-full h-full object-cover" />
                <button type="button"
                  class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  :aria-label="t('product.previewImage')" @click.stop="
                    onPreviewSkuImage(
                      image.fileId,
                      getSkuDisplayName(product.skus[0]) || $t('product.defaultSku'),
                    )
                    ">
                  <EyeIcon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <FileInput :model-value="getSkuImageFile(product.skus[0])"
              @update:modelValue="(file) => onSkuImageChange(product.skus[0], file)" accept="image/jpeg,image/png"
              :max-size="10 * 1024 * 1024" preview-direction="right" preview-size="md" preview-shape="square"
              :button-text="$t('product.uploadSkuImage')" :help-text="$t('product.uploadSkuImageHelp')"
              />
          </div>
        </ComponentCard>
      </div>
    </div>

    <div
      v-if="isImagePreviewOpen && previewImageUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="closeImagePreview"
    >
      <div class="relative w-full max-w-3xl mx-4">
        <button
          type="button"
          class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-medium text-white hover:bg-black focus:outline-hidden focus:ring-2 focus:ring-white/60"
          :aria-label="t('product.closeImage')"
          @click.stop="closeImagePreview"
        >
          ×
        </button>
        <img
          :src="previewImageUrl"
          :alt="previewImageAlt || t('product.previewImage')"
          class="w-full max-h-[80vh] rounded-lg bg-white object-contain"
        />
      </div>
    </div>

    <div
      class="toolbar fixed bottom-0 left-0 w-full flex justify-end gap-3 p-4 bg-white dark:bg-gray-900 shadow-lg z-40"
    >
      <Button variant="outline" size="sm" @click="onCancel" className="min-w-[90px]">
        {{ $t('common.cancel') }}
      </Button>
      <Button variant="primary" size="sm" @click="onSave" className="min-w-[90px]">
        {{ $t('common.save') }}
      </Button>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Button, Select, Input, PageBreadcrumb, ComponentCard, MultipleSelect, FileInput } from '@hivespace/shared'
import { AppShell } from '@hivespace/shared'
import { QuillEditor } from '@vueup/vue-quill'
import ImageUploader from 'quill-image-uploader'
import { EyeIcon, PlusIcon, TrashIcon } from '@hivespace/shared'
import { useAppStore } from '@hivespace/shared'
import { useProductStore } from '@/stores'
import type {
  CreateProductRequest,
  ProductVariant,
  ProductSku,
  ProductAttributeSelection,
  Product,
  ProductImage,
} from '@/types'

const appStore = useAppStore()
const productStore = useProductStore()
const { t } = useI18n()
const {
  categories,
  categoryAttributes,
  isLoadingCategories,
  isLoadingAttributes,
} = storeToRefs(productStore)

const route = useRoute()
const router = useRouter()
const editingProductId = ref<string | null>(null)

const currentPageTitle = computed(() =>
  editingProductId.value ? t('product.editProduct') : t('product.createProduct'),
)
const categoryOptions = computed(() =>
  categories.value.map((category) => ({
    value: category.id,
    label: category.name,
  })),
)
const formData = ref<{ input?: string; selectInput?: string }>({})
const product = ref<Product>({
  name: '',
  category: '',
  variants: [],
  skus: [],
  images: [],
})
const quillRef = ref<{
  setHTML: (html: string) => void
  getHTML: () => string
} | null>(null)

const categoriesError = ref<string | null>(null)

// Category attributes reactive data
const attributesError = ref<string | null>(null)
// For single-value attributes and textbox multi entries
const attributeValues = ref<Record<string, string>>({})
// For dropdown multi-select attributes (expects Option[])
const attributeMultiValues = ref<Record<string, { value: string | number; label: string }[]>>({})
// Options per attribute (for dropdowns). Shape: { [attributeId]: { value, label }[] }
const attributeOptionsMap = ref<Record<string, { value: string | number; label: string }[]>>({})

// SKU image upload & preview state
const skuImages = ref<Record<string, File | null>>({})
const skuImageErrors = ref<Record<string, string>>({})
const isImagePreviewOpen = ref(false)
const previewImageUrl = ref<string | null>(null)
const previewImageAlt = ref<string>('')

// Product image state (for when there are no SKUs)
const productImageFiles = ref<File[]>([])
const existingProductImages = ref<ProductImage[]>([])
const productImageErrors = ref<string[]>([])

const modules = ref({
  name: 'imageUploader',
  module: ImageUploader,
  options: {
    upload: (file: File) => {
      return new Promise(() => {
        const formData = new FormData()
        formData.append('image', file)
      })
    },
  },
})

const  variantIdCounter = ref(1)
const  skuIdCounter = ref(1)

const onClickAddNewVariant = () => {
  const defaultVariantValue = {
    id: variantIdCounter.value++,
    name: '',
    options: [
      {
        optionId: crypto.randomUUID(),
        value: '',
      },
    ],
  }
  if (product.value.variants) {
    product.value.variants.push(defaultVariantValue)
  } else {
    product.value.variants = [defaultVariantValue]
  }
}
const onChangeVariantOption = (variantIndex: number, optionIndex: number) => {
  if (!product.value?.variants?.[variantIndex]?.options) return
  let isOptionAdded = false
  if (optionIndex == product.value.variants[variantIndex].options.length - 1) {
    product.value.variants[variantIndex].options.push({
      optionId: crypto.randomUUID(),
      value: '',
    })
    isOptionAdded = true
  }

  const option = product.value.variants[variantIndex].options[optionIndex]
  const productVariant = product.value.variants[variantIndex]

  if (!option?.value) return

  updateProductSkus(productVariant, option, isOptionAdded)
}

const updateProductSkus = (
  productVariant: ProductVariant,
  option: { optionId: string; value: string },
  isOptionAdded: boolean,
) => {
  if (!product.value.skus) product.value.skus = []

  if (!isOptionAdded) {
    product.value.skus.forEach((productSku) => {
      const foundOption = productSku.skuVariants.find((x) => x.optionId == option.optionId)
      if (foundOption) {
        foundOption.value = option.value
      }
    })
    return
  }

  // Find all variants
  const variants = product.value.variants || []
  // Build an array of arrays of options for each variant
  const optionsList = variants.map((v) =>
    (v.options || []).filter(
      (o) =>
        o.value &&
        o.value.trim() !== '' &&
        (o.optionId == option.optionId || productVariant.id !== v.id),
    ),
  )
  // If unknown variant has no options, do nothing
  if (optionsList.some((opts) => opts.length === 0)) return

  // Helper: cartesian product
  function cartesian<T>(arr: T[][]): T[][] {
    return arr.reduce((a: T[][], b: T[]) => a.flatMap((d) => b.map((e) => [...d, e])), [
      [],
    ] as T[][])
  }

  // Build all possible combinations
  const combinations = cartesian(optionsList)

  // Add new SKUs for new combinations
  combinations.forEach((combo) => {
    // Build skuVariants for this combo
    const skuVariants = combo.map((o: { optionId: string; value: string }, idx: number) => ({
      variantName: variants[idx].name,
      value: o.value,
      optionId: o.optionId,
    }))
    // Add to productSkus
    product.value.skus.push({
      id: skuIdCounter.value++,
      skuVariants,
      price: { amount: 0, currency: 0 },
    })
  })
  product.value.skus = product.value.skus.filter(
    (productSku) => productSku.skuVariants.length === product.value.variants.length,
  )
}

const getSkuKey = (productSku: ProductSku): string => {
  if (productSku.id) return String(productSku.id)
  if (productSku.key) return productSku.key
  if (productSku.skuNo) return String(productSku.skuNo)
  return productSku.skuVariants
    .map((variant) => `${variant.variantName}:${variant.optionId}:${variant.value}`)
    .join('|')
}

const getSkuDisplayName = (productSku: ProductSku) => {
  if (!product.value.variants || product.value.variants.length === 0) {
    return productSku.skuNo || ''
  }

  const parts = product.value.variants
    .map((variant) => getVariantValueBySKU(productSku, variant))
    .filter((val) => val && val.trim() !== '')

  return parts.join(' - ')
}

const getVariantValueBySKU = (productSku: ProductSku, variant: ProductVariant) => {
  if (!productSku || !Array.isArray(productSku.skuVariants) || !variant) return ''
  const variantName = variant.name
  const matched = productSku.skuVariants.find((sv) => sv.variantName === variantName)
  return matched?.value || ''
}

// Group SKUs by variant combinations for proper visual grouping
const groupedSkus = computed(() => {
  if (!product.value.skus || product.value.skus.length === 0) return []

  // Group by first variant value to create visual blocks
  const groups = new Map<string, ProductSku[]>()

  product.value.skus.forEach((sku) => {
    const firstVariantValue = product.value.variants?.[0]
      ? getVariantValueBySKU(sku, product.value.variants[0])
      : 'default'

    if (!groups.has(firstVariantValue)) {
      groups.set(firstVariantValue, [])
    }
    groups.get(firstVariantValue)!.push(sku)
  })

  // Convert to array format and sort
  return Array.from(groups.entries()).map(([key, skus]) => ({
    key,
    skus: skus.sort((a, b) => {
      // Sort by all variant values in order
      for (let i = 0; i < product.value.variants.length; i++) {
        const variantA = getVariantValueBySKU(a, product.value.variants[i])
        const variantB = getVariantValueBySKU(b, product.value.variants[i])
        if (variantA !== variantB) {
          return variantA.localeCompare(variantB)
        }
      }
      return 0
    }),
  }))
})

const getSkuImageFile = (productSku: ProductSku): File | null => {
  const key = getSkuKey(productSku)
  return skuImages.value[key] || null
}

const onSkuImageChange = (productSku: ProductSku, file: File | null) => {
  const key = getSkuKey(productSku)
  skuImages.value[key] = file
  skuImageErrors.value[key] = ''

  if (file) {
    productSku.imageFileName = file.name
  } else {
    delete productSku.imageFileName
  }
}

const clearSkuImage = (productSku: ProductSku) => {
  const key = getSkuKey(productSku)
  skuImages.value[key] = null
  delete skuImageErrors.value[key]
  delete productSku.imageFileName
}

const onPreviewSkuImage = (imageUrl: string, altText: string) => {
  previewImageUrl.value = imageUrl
  previewImageAlt.value = altText
  isImagePreviewOpen.value = true
}

const closeImagePreview = () => {
  isImagePreviewOpen.value = false
  previewImageUrl.value = null
  previewImageAlt.value = ''
}

// Fetch categories from API
const fetchCategories = async () => {
  try {
    categoriesError.value = null
    await productStore.fetchCategories()
  } catch (error: unknown) {
    categoriesError.value = (error as Error)?.message || t('product.errors.failedToLoadCategories')
    appStore.notifyError(
      t('common.error'),
      categoriesError.value || t('product.errors.failedToLoadCategories'),
    )
  }
}

// Fetch category attributes from API
const fetchCategoryAttributes = async (categoryId: string) => {
  if (!categoryId) {
    productStore.clearCategoryAttributes()
    attributeValues.value = {}
    return
  }

  try {
    attributesError.value = null
    const fetchedAttributes = await productStore.fetchCategoryAttributes(categoryId)

    // Map backend values -> Select/MultipleSelect options per attribute
    const optionsMap: Record<string, { value: string | number; label: string }[]> = {}
    const multiMap: Record<string, { value: string | number; label: string }[]> = {}
    fetchedAttributes.forEach((attr) => {
      if (attr.inputType === 2) {
        const opts = (attr.values || [])
          // .filter((v) => v.isActive)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((v) => ({ value: v.id, label: v.displayName || v.name }))
        optionsMap[attr.id] = opts
        if (attr.maxValueCount > 1) multiMap[attr.id] = []
      }
    })
    attributeOptionsMap.value = optionsMap
    attributeMultiValues.value = multiMap
    // Initialize attribute values
    const initialValues: Record<string, string> = {}
    fetchedAttributes.forEach((attr) => {
      // Textbox single/multi or Dropdown single
      if (attr.inputType === 2 && attr.maxValueCount > 1) {
        // handled via attributeMultiValues
        return
      } else initialValues[attr.id] = ''
    })
    attributeValues.value = initialValues
  } catch (error: unknown) {
    attributesError.value =
      (error as Error)?.message || t('product.errors.failedToLoadCategoryAttributes')
    appStore.notifyError(
      t('common.error'),
      attributesError.value || t('product.errors.failedToLoadCategoryAttributes'),
    )
  }
}

// Load categories on component mount
onMounted(async () => {
  fetchCategories()
  await initFromRoute()
})

const initFromRoute = async () => {
  const idParam = route.params.id
  if (typeof idParam === 'string' && idParam) {
    editingProductId.value = idParam
    await loadProductDetails(idParam)

  } else {
    editingProductId.value = null
    resetForm()

  }
}

watch(
  () => route.params.id,
  async () => {
    await initFromRoute()
  },
)
const getProductNoVariantsPrice = (): number | string => {
  if (product.value.skus && product.value.skus.length > 0) {
    return product.value.skus[0].price.amount
  }
  return ''
}
const getProductNoVariantsQuantity = (): number | string => {
  if (product.value.skus && product.value.skus.length > 0) {
    return product.value.skus[0].quantity || ''
  }
  return ''
}
const loadProductDetails = async (id: string) => {
  try {
    const loaded = (await productStore.fetchProductById(id)) as Product & {
      categories?: Array<{ categoryId: string }>
      description?: string
      variants?: ProductVariant[]
      skus?: ProductSku[]
      attributes?: Array<{
        attributeId: string
        selectedValueIds?: string[]
        freeTextValue?: string | null
      }>
      images?: ProductImage[]
    }
    // Map loaded product into local form model
    product.value.name = loaded.name
    // category id may be located via loaded.categories[0]?.categoryId
    // Using first category as the selected category for now
    const firstCategoryId = loaded.categories?.[0]?.categoryId || ''
    formData.value.selectInput = firstCategoryId
    // Description
    if (quillRef.value?.setHTML && loaded.description) {
      quillRef.value.setHTML(loaded.description)
    }
    // Variants & SKUs (ensure shapes align with local types)
    product.value.variants = loaded.variants || []
    product.value.skus = loaded.skus || []
    
    // Load existing images for product
    existingProductImages.value = loaded.images || []
    productImageFiles.value = []
    
    // Load attributes data into UI state from product attributes
    if (firstCategoryId) {
      await fetchCategoryAttributes(firstCategoryId)

      const loadedAttributes = loaded.attributes || []

      // Build attributeValues and attributeMultiValues based on inputType and maxValueCount
      const values: Record<string, string> = { ...attributeValues.value }
      const multiValues: Record<string, { value: string | number; label: string }[]> = {
        ...attributeMultiValues.value,
      }

      for (const attr of loadedAttributes) {
        const attrId = attr.attributeId
        const categoryAttr = categoryAttributes.value.find((a) => a.id === attrId)
        if (!categoryAttr) continue

        if (categoryAttr.inputType === 2) {
          // Dropdown
          if (categoryAttr.maxValueCount > 1) {
            const ids = attr.selectedValueIds || []
            const opts = attributeOptionsMap.value[attrId] || []
            multiValues[attrId] = opts.filter((o) => ids.includes(String(o.value)))
          } else {
            const idVal =
              attr.selectedValueIds && attr.selectedValueIds[0]
                ? attr.selectedValueIds[0]
                : ''
            values[attrId] = idVal
          }
        } else {
          // Textbox or other -> use freeTextValue
          values[attrId] = attr.freeTextValue ? String(attr.freeTextValue) : ''
        }
      }
      attributeValues.value = values
      attributeMultiValues.value = multiValues
    }
  } catch (error: unknown) {
    appStore.notifyError(
      t('common.error'),
      (error as Error)?.message || t('product.errors.failedToLoadProductDetails'),
    )
  }
}

const resetForm = () => {
  // Reset base product model
  product.value = {
    name: '',
    category: '',
    variants: [],
    skus: [],
    images: [],
  }
  // Reset category selection and attributes UI state
  formData.value.selectInput = ''
  categoryAttributes.value = []
  attributeValues.value = {}
  attributeMultiValues.value = {}
  attributeOptionsMap.value = {}
  // Reset images state
  productImageFiles.value = []
  existingProductImages.value = []
  productImageErrors.value = []
  // Clear editor content if available
  if (quillRef.value?.setHTML) {
    quillRef.value.setHTML('')
  }
}

const onCancel = () => {
  router.push('/product/list')
}
const onSave = async () => {
  try {
    // Compose product payload from form
    // Build attributes selection payload per backend: { attributeId, selectedValueIds, freeTextValue }
    const selectedAttributes: ProductAttributeSelection[] = []
    categoryAttributes.value.forEach((attr) => {
      if (attr.inputType === 2) {
        if (attr.maxValueCount > 1) {
          const selected = attributeMultiValues.value[attr.id] || []
          const selectedValueIds = selected
            .map((o) => String(o.value))
            .filter((v) => v && v.trim() !== '')
          if (selectedValueIds.length > 0) {
            selectedAttributes.push({ attributeId: attr.id, selectedValueIds })
          }
        } else {
          const raw = attributeValues.value[attr.id]
          const val = Array.isArray(raw) ? raw[0] : raw
          const selectedValueId = val ? String(val) : ''
          if (selectedValueId) {
            selectedAttributes.push({ attributeId: attr.id, selectedValueIds: [selectedValueId] })
          }
        }
        return
      }

      const raw = attributeValues.value[attr.id]
      let freeTextValue: string | null = null
      if (Array.isArray(raw)) {
        const firstNonEmpty = raw.find((v) => String(v).trim() !== '')
        freeTextValue = firstNonEmpty ? String(firstNonEmpty) : null
      } else if (raw && String(raw).trim() !== '') {
        freeTextValue = String(raw)
      }
      if (freeTextValue) {
        selectedAttributes.push({ attributeId: attr.id, freeTextValue })
      }
    })

    // Build images array for product (existing + newly uploaded)
    const productImages: ProductImage[] = [
      ...existingProductImages.value,
      // For new uploads, we store File objects temporarily - backend will handle them
      ...productImageFiles.value.map((file) => ({
        fileId: file.name,
      })),
    ]

    const payload: CreateProductRequest = {
      name: product.value.name || '',
      category: formData.value.selectInput || '',
      description: quillRef.value?.getHTML ? quillRef.value.getHTML() : '',
      variants: product.value.variants,
      skus: product.value.skus,
      attributes: selectedAttributes,
    }
    
    // Note: Images handling would typically involve:
    // 1. Uploading image files to a media service
    // 2. Getting back file IDs/URLs
    // 3. Including those in the final payload
    // For now, images structure is preserved but actual upload would need backend integration
    if (productImages.length > 0) {
      (payload as any).images = productImages
    }
    
    if (editingProductId.value) {
      await productStore.updateProduct(editingProductId.value, payload)
      appStore.notifySuccess(t('common.success'), t('product.success.productUpdatedSuccessfully'))
      router.push('/product/list')
    } else {
      await productStore.createProduct(payload)
      appStore.notifySuccess(t('common.success'), t('product.success.productSavedSuccessfully'))
      router.push('/product/list')
    }
    // Optionally, reset form or navigate
  } catch (error: unknown) {
    appStore.notifyError(
      t('common.error'),
      (error as Error)?.message || t('product.errors.failedToSaveProduct'),
    )
  }
}

const onChangeCategory = () => {
  if (formData.value.selectInput) {
    fetchCategoryAttributes(formData.value.selectInput)
  } else {
    productStore.clearCategoryAttributes()
    attributeValues.value = {}
  }
}
</script>
<style scoped>
:deep(.ql-toolbar.ql-snow) {
  margin-bottom: 0px;
}
</style>
