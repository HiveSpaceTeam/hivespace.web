<template>
  <AppShell>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        {{ pageTitle }}
      </h2>
    </div>

    <div class="space-y-6 pb-24">
      <!-- Thông tin cơ bản (Basic Info) -->
      <ComponentCard :title="$t('coupon.detail.basicInfo.title')">
        <div class="space-y-6">
          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300">{{
              $t('coupon.detail.basicInfo.type') }}</label>
            <div class="w-3/4">
              <div
                class="inline-flex items-center gap-2 p-3 pr-6 border border-brand-500 bg-brand-50 dark:bg-brand-900/20 rounded-md relative overflow-hidden">
                <span class="text-brand-500 w-5 h-5">
                  <BoxIcon />
                </span>
                <span class="text-brand-700 font-medium whitespace-pre-wrap">
                  {{
                    form.type === CouponType.ENTIRE_SHOP ? $t('coupon.detail.basicInfo.typeEntireShop') :
                      form.type === CouponType.SPECIFIC_PRODUCTS ? $t('coupon.detail.basicInfo.typeSpecificProducts') :
                        $t('coupon.creationGateway.privateCoupon.title')
                  }}
                </span>
                <!-- small triangle corner for selected state -->
                <div
                  class="absolute top-0 right-0 w-0 h-0 border-t-24 border-l-24 border-t-brand-500 border-l-transparent">
                  <CheckIcon class="absolute -top-[23px] -left-[11px] w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-start">
            <div class="w-1/4">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                {{ $t('coupon.detail.basicInfo.programName') }}
                <span class="text-red-500 ml-0.5">*</span>
              </label>
            </div>
            <div class="w-3/4">
              <Input v-model="form.name" type="text" maxlength="100" showCount :error="errors.name"
                :disabled="isViewOnly" @update:modelValue="validateName" @blur="validateName" />
              <p class="text-xs text-gray-500 mt-1">{{ $t('coupon.detail.basicInfo.programNameHint') }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('coupon.detail.basicInfo.couponCode') }}
              <span class="text-red-500 ml-0.5">*</span>
            </label>
            <div class="w-3/4">
              <!-- Code is editable in Ongoing (user may correct it) and always in create/upcoming -->
              <Input v-model="form.code" type="text" maxlength="5" showCount :prefix="form.prefix"
                inputClass="uppercase" :error="errors.code" :disabled="isViewOnly" @update:modelValue="validateCode"
                @blur="validateCode" />
              <p class="text-xs text-gray-500 mt-1">{{ $t('coupon.detail.basicInfo.couponCodePrefix') }}</p>
              <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">{{
                $t('coupon.detail.basicInfo.couponCodeFull') }}: {{ form.prefix }}{{ form.code }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('coupon.detail.basicInfo.usagePeriod') }}
              <span class="text-red-500 ml-0.5">*</span>
            </label>
            <div>
              <div class="flex items-center gap-2">
                <!-- Start date: always locked when editing (ongoing or expired) -->
                <div class="flex-1">
                  <DateTimePicker v-model="form.startDate" :placeholder="$t('coupon.detail.basicInfo.startDatePlaceholder')" format="iso"
                    :disabled="isViewOnly || isOngoing" @update:modelValue="validateStartDateTime" />
                  <p v-if="errors.startDateTime" class="text-xs text-red-600 mt-1">{{ errors.startDateTime }}</p>
                </div>
                <span class="text-gray-400">—</span>
                <!-- End date: editable in Ongoing and Upcoming; locked in Expired -->
                <div class="flex-1">
                  <DateTimePicker v-model="form.endDate" :placeholder="$t('coupon.detail.basicInfo.endDatePlaceholder')" format="iso" :disabled="isViewOnly"
                    @update:modelValue="validateEndDateTime" />
                  <p v-if="errors.endDateTime" class="text-xs text-red-600 mt-1">{{ errors.endDateTime }}</p>
                </div>
              </div>
              <div class="mt-4" v-if="form.type !== CouponType.PRIVATE">
                <!-- Early save: editable only if earlySaveDate hasn't passed yet (or in create mode) -->
                <Checkbox v-model="form.allowEarlySave" :disabled="isViewOnly || !canEditEarlySave"
                  :label="form.allowEarlySave ? $t('coupon.detail.basicInfo.displayEarlyTime') : $t('coupon.detail.basicInfo.allowEarlySave')" />
                <div v-if="form.allowEarlySave" class="mt-2 pl-7 max-w-sm">
                  <DateTimePicker v-model="form.earlySaveDate" :placeholder="$t('coupon.detail.basicInfo.earlySaveDatePlaceholder')" format="iso"
                    :disabled="isViewOnly || !canEditEarlySave" :error="errors.earlySaveDateTime"
                    @update:modelValue="validateEarlySaveDateTime" />
                  <p v-if="!errors.earlySaveDateTime" class="text-xs text-gray-500 mt-2">{{
                    $t('coupon.detail.basicInfo.earlySaveHint') }}</p>
                  <p v-else class="text-xs text-red-600 mt-1">{{ errors.earlySaveDateTime }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      <!-- Thiết lập mã giảm giá (Discount Settings) -->
      <ComponentCard :title="$t('coupon.detail.discountSettings.title')">
        <div class="space-y-6">
          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{{
              $t('coupon.detail.discountSettings.rewardType') }}</label>
            <div class="w-3/4 flex gap-6">
              <RadioGroup name="rewardType" v-model="form.rewardType" :options="rewardTypeOptions"
                direction="horizontal" class="mt-2 text-brand-500" />
            </div>
          </div>

          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              {{ $t('coupon.detail.discountSettings.currency') }}
              <span class="text-red-500 ml-0.5">*</span>
            </label>
            <div class="w-3/16">
              <Select v-model="form.currency" :options="currencyOptions" :disabled="isViewOnly || isOngoing" />
            </div>
          </div>

          <!-- Smart coupon toggle ignored for minimal viable logic, focusing on main fields -->

          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              {{ $t('coupon.detail.discountSettings.discountType') }}
              <span class="text-red-500 ml-0.5">*</span>
            </label>
            <div class="w-3/4 flex gap-4">
              <div class="w-1/4">
                <Select v-model="form.discountType" :options="discountTypeOptions" :disabled="isEditMode" />
              </div>
              <div class="w-3/4">
                <div :class="['flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500',
                  errors.discountAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
                  isLocked ? 'opacity-70 bg-gray-50/50 dark:bg-gray-800/10 cursor-not-allowed' : '']">
                  <span v-if="form.discountType === DiscountType.FixedAmount"
                    class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 px-3 py-2.5 border-r border-gray-300 dark:border-gray-700 block font-medium h-full">
                    {{ currencySymbol }}
                  </span>
                  <Input v-model="discountAmountDisplay" @input="discountAmountHandleInput"
                    @blur="(e) => { discountAmountHandleBlur(e); validateDiscountAmount() }"
                    @focus="discountAmountHandleFocus" class="flex-1" :disabled="isViewOnly || isOngoing"
                    inputClass="border-transparent shadow-none rounded-none bg-transparent focus:ring-0 focus:border-transparent" />
                  <span class="px-3 py-2.5 text-brand-600 border-l border-gray-300 dark:border-gray-700 font-medium"
                    v-if="form.discountType === DiscountType.Percentage">{{
                      $t('coupon.detail.discountSettings.discountTypePercentageSuffix') }}</span>
                </div>
                <p v-if="errors.discountAmount" class="text-xs text-red-600 mt-1">{{ errors.discountAmount }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-start" v-if="form.discountType === DiscountType.Percentage">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{{
              $t('coupon.detail.discountSettings.maxDiscount') }}</label>
            <div class="w-3/4 space-y-3">
              <div class="flex gap-6 mt-2">
                <RadioGroup name="hasMaxDiscount" v-model="form.hasMaxDiscount" :options="hasMaxDiscountOptions"
                  @update:model-value="changeHasMaxDiscount" direction="horizontal" class="text-brand-500" />
              </div>
              <!-- conditionally show input if limit -->
              <div v-if="form.hasMaxDiscount" :class="['flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500',
                errors.maxDiscountAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
                isLocked ? 'opacity-70 bg-gray-50/50 dark:bg-gray-800/10 cursor-not-allowed' : '']">
                <span
                  class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 px-3 py-2.5 border-r border-gray-300 dark:border-gray-700 block font-medium h-full">{{
                    currencySymbol }}</span>
                <Input v-model="maxDiscountAmountDisplay" @input="maxDiscountAmountHandleInput"
                  @blur="(e) => { maxDiscountAmountHandleBlur(e); validateMaxDiscountAmount() }"
                  @focus="maxDiscountAmountHandleFocus" class="flex-1" :disabled="isViewOnly || isOngoing"
                  inputClass="border-transparent shadow-none rounded-none bg-transparent focus:ring-0 focus:border-transparent" />
              </div>
              <p v-if="errors.maxDiscountAmount && form.hasMaxDiscount" class="text-xs text-red-600 mt-1">{{
                errors.maxDiscountAmount }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              {{ $t('coupon.detail.discountSettings.minOrderValue') }}
              <span class="text-red-500 ml-0.5">*</span>
            </label>
            <div class="w-3/4">
              <div :class="['flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500',
                errors.minOrderAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
                isLocked ? 'opacity-70 bg-gray-50/50 dark:bg-gray-800/10 cursor-not-allowed' : '']">
                <span
                  class="bg-gray-50 dark:bg-gray-800/50 text-gray-500 px-3 py-2.5 border-r border-gray-300 dark:border-gray-700 block font-medium h-full">{{
                    currencySymbol }}</span>
                <Input v-model="minOrderValueDisplay" @input="minOrderValueHandleInput"
                  @blur="(e) => { minOrderValueHandleBlur(e); validateMinOrderAmount() }"
                  @focus="minOrderValueHandleFocus" class="flex-1" :disabled="isViewOnly || isOngoing"
                  inputClass="border-transparent shadow-none rounded-none bg-transparent focus:ring-0 focus:border-transparent" />
              </div>
              <p v-if="errors.minOrderAmount" class="text-xs text-red-600 mt-1">{{ errors.minOrderAmount }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="w-1/4">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1 mt-2">
                {{ $t('coupon.detail.discountSettings.totalMaxUsages') }}
                <span class="text-red-500 ml-0.5">*</span>
              </label>
            </div>
            <!-- Usage quantity: editable even in Ongoing; locked in Expired -->
            <div class="w-3/4">
              <Input v-model="totalUsagesDisplay" @input="totalUsagesHandleInput"
                @blur="(e) => { totalUsagesHandleBlur(e); validateMaxUsageCount() }" @focus="totalUsagesHandleFocus"
                :disabled="isViewOnly" :error="errors.maxUsageCount" />
              <p class="text-xs text-gray-500 mt-1">{{ $t('coupon.detail.discountSettings.totalMaxUsagesHint') }}</p>
            </div>
          </div>

          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
              {{ $t('coupon.detail.discountSettings.maxUsagesPerBuyer') }}
              <span class="text-red-500 ml-0.5">*</span>
            </label>
            <div class="w-3/4">
              <Input v-model="maxUsagesPerBuyerDisplay" @input="maxUsagesPerBuyerHandleInput"
                @blur="(e) => { maxUsagesPerBuyerHandleBlur(e); validateMaxUsagePerUser() }"
                @focus="maxUsagesPerBuyerHandleFocus" :disabled="isEditMode" :error="errors.maxUsagePerUser" />
            </div>
          </div>
        </div>
      </ComponentCard>

      <!-- Hiển thị mã giảm giá và các sản phẩm áp dụng (Display & Products) -->
      <ComponentCard :title="$t('coupon.detail.displayAndProducts.title')">
        <div class="space-y-6">
          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{{
              $t('coupon.detail.displayAndProducts.displaySettings') }}</label>
            <div class="w-3/4 space-y-4">
              <div v-if="form.type === CouponType.PRIVATE" class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {{ $t('coupon.detail.displayAndProducts.displayCodeOnlyFixed') }}
              </div>
              <RadioGroup v-else name="displaySettings" v-model="form.displaySettings" :options="displaySettingsOptions"
                direction="vertical" class="mt-2 text-brand-500" />
            </div>
          </div>

          <div class="flex items-start">
            <label class="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{{
              $t('coupon.detail.displayAndProducts.applicableProducts') }}</label>
            <div class="w-3/4 mt-2">
              <div v-if="form.type === CouponType.PRIVATE">
                <RadioGroup name="applicableProductsType" v-model="form.applicableProductsType"
                  @update:model-value="changeApplicableProductOption" :options="applicableProductsTypeOptions"
                  direction="vertical" class="text-brand-500" />
              </div>
              <div v-else-if="form.type === CouponType.ENTIRE_SHOP" class="text-sm text-gray-700 dark:text-gray-300">
                {{ $t('coupon.detail.displayAndProducts.allProducts') }}
              </div>

              <div v-if="isSpecificProducts" class="space-y-4"
                :class="{ 'mt-4 pl-6': form.type === CouponType.PRIVATE }">
                <!-- Header part: count and add button -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400" v-if="selectedProductIds.length > 0">
                    {{ $t('coupon.detail.displayAndProducts.productsSelected', { count: selectedProductIds.length }) }}
                  </span>
                  <Button variant="primary-outline" :start-icon="BigPlusIcon" size="md"
                    :disabled="isViewOnly || isOngoing" @click="handleAddProducts">
                    {{ $t('coupon.detail.displayAndProducts.addProducts') }}
                  </Button>
                </div>

                <!-- Products Table -->
                <div v-if="selectedProductIds.length > 0"
                  class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto w-full custom-scrollbar">
                  <table class="w-full text-left bg-white dark:bg-gray-900" style="min-width: 500px">
                    <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th
                          class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap w-1/2">
                          {{ $t('coupon.detail.displayAndProducts.table.products') }}
                        </th>
                        <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {{ $t('coupon.detail.displayAndProducts.table.originalPrice') }}
                        </th>
                        <th class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {{ $t('coupon.detail.displayAndProducts.table.stock') }}
                        </th>
                        <th
                          class="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap w-20 text-center">
                          {{ $t('coupon.detail.displayAndProducts.table.action') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-for="product in selectedProductsDetailed" :key="product.id"
                        class="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td class="px-4 py-4 min-w-[200px]">
                          <div class="flex items-start gap-3">
                            <img :src="product.image"
                              class="w-10 h-10 rounded bg-gray-100 object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
                            <div class="flex items-center h-10">
                              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                                {{ product.name }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-4 align-middle text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {{ formatPrice(product.priceMin, product.priceMax) }}
                        </td>
                        <td class="px-4 py-4 align-middle text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {{ product.stock }}
                        </td>
                        <td class="px-4 py-4 align-middle text-center">
                          <Button variant="outline" size="sm" iconOnly :disabled="isViewOnly || isOngoing"
                            @click="removeProduct(product.id)"
                            class="text-gray-400 hover:text-red-500 hover:border-red-500 dark:hover:text-red-500">
                            <template #icon>
                              <TrashIcon class="w-4 h-4" />
                            </template>
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

    </div>

    <!-- Sticky Footer Actions -->
    <div
      class="fixed bottom-0 left-0 right-0 lg:left-[290px] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3 z-50">
      <!-- Common / non-field API error banner -->
      <div v-if="errors.common.length > 0"
        class="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        <div class="font-medium">{{ $t('common.error') }}</div>
        <template v-if="errors.common.length === 1">
          <div>{{ errors.common[0] }}</div>
        </template>
        <template v-else>
          <ul class="mt-1 ml-4 list-disc list-inside space-y-1">
            <li v-for="(err, i) in errors.common" :key="i">{{ err }}</li>
          </ul>
        </template>
      </div>

      <!-- Expired: read-only view — only Back button -->
      <div v-if="isViewOnly" class="flex justify-end">
        <Button variant="outline" @click="$router.push('/marketing/coupons')">
          {{ $t('coupon.detail.actions.backToList') }}
        </Button>
      </div>

      <!-- Create / Upcoming / Ongoing: Cancel + Save -->
      <div v-else class="flex justify-end gap-4">
        <Button variant="outline" @click="$router.push('/marketing/coupons')">
          {{ $t('coupon.detail.actions.cancel') }}
        </Button>
        <Button color="primary" @click="submitForm">
          {{ $t('coupon.detail.actions.confirm') }}
        </Button>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, toRef, watch, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  AppShell,
  ComponentCard,
  Button,
  Input,
  Select,
  RadioGroup,
  DateTimePicker,
  useNumberInputFormatter,
  Checkbox,
  useModal,
  useAppStore,
  useFieldValidation,
  BigPlusIcon,
  BoxIcon,
  CheckIcon,
  TrashIcon,
  type ErrorResponse,
} from '@hivespace/shared'
import { CouponType, DiscountType, CouponScope, RewardType, CouponStatus } from '@/types'
import type { CreateCouponRequest, UpdateCouponRequest, CouponDto } from '@/types'
import { useCouponStore } from '@/stores/coupon.store'
import SelectProductsModal from '@/pages/Marketing/Popups/SelectProductsModal.vue'
import { useCouponValidation, type CouponFormErrors, type CouponFormData } from '@/composables'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const couponStore = useCouponStore()
const { handleFieldValidationErrors, clearFieldErrors } = useFieldValidation()

// ── Route-mode detection ───────────────────────────────────────
// detail/:id  → edit/view mode  (couponId is set)
// create?copyId=... → duplicate mode  (isDuplicate is true)
// create?type=...   → create mode
const couponId = computed(() => route.params.id as string | undefined)
const copyId = computed(() => route.query.copyId as string | undefined)
const isEditMode = computed(() => !!couponId.value)
const isDuplicate = computed(() => !!copyId.value)

// ── Status-aware read-only logic (edit mode only) ─────────────
const currentCouponStatus = ref<CouponStatus | null>(null)

// Expired → full read-only, only "Back to List" button
const isViewOnly = computed(() => isEditMode.value && currentCouponStatus.value === CouponStatus.Expired)

// Ongoing → editable fields: name, code, end date, early save (if future), usage quantity
const isOngoing = computed(() => isEditMode.value && currentCouponStatus.value === CouponStatus.Ongoing)

// Early save is editable unless the coupon has already started displaying to buyers.
// Rule: lock only when earlySaveDate is SET and has already passed.
// - null  → never configured; seller can still enable + set a future date (Upcoming or Ongoing)
// - future → display hasn't started yet; still adjustable
// - past  → coupon is already showing early to buyers; no longer editable
const canEditEarlySave = computed(() => {
  if (!isEditMode.value) return true // Create/Duplicate mode: always editable

  // If it was already displaying early when we loaded the page, lock it.
  if (form.value.initialEarlySavePassed) return false

  // Rule: If it was null at load time, it is editable (even in Ongoing as per user request).
  return true
})

const isLocked = computed(() => isViewOnly.value || isOngoing.value)

const pageTitle = computed(() => {
  if (isEditMode.value) return t('coupon.detail.titleEdit')
  return t('coupon.detail.titleCreate')
})

// Keys match the backend validator's source field names (PascalCase → camelCase
// mapping handled by useFieldValidation) so backend errors are auto-mapped too.

const errors = reactive<CouponFormErrors>({
  common: [],
  name: '',
  code: '',
  startDateTime: '',
  endDateTime: '',
  discountAmount: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  maxUsageCount: '',
  maxUsagePerUser: '',
  earlySaveDateTime: '',
})

const defaultStartTime = new Date(Date.now() + 10 * 60000)
const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60000)

const formTypeParam = Number(route.query.type)
let initialType = CouponType.ENTIRE_SHOP
if (formTypeParam === CouponType.SPECIFIC_PRODUCTS) initialType = CouponType.SPECIFIC_PRODUCTS
if (formTypeParam === CouponType.PRIVATE) initialType = CouponType.PRIVATE

const form = ref<CouponFormData>({
  type: initialType,
  name: '',
  prefix: 'SHOP',
  code: '',
  startDate: defaultStartTime.toISOString(),
  endDate: defaultEndTime.toISOString(),
  allowEarlySave: false,
  earlySaveDate: new Date(defaultStartTime.getTime() - 10 * 60000).toISOString(),

  rewardType: RewardType.Discount,
  discountType: DiscountType.FixedAmount,
  discountAmount: '',
  hasMaxDiscount: true,
  maxDiscountAmount: '',
  minOrderValue: '',
  totalUsages: '',
  maxUsagesPerBuyer: '1',

  displaySettings: false, // false = public (isHidden=false), true = code only (isHidden=true)
  currency: 'VND',
  applicableProductsType: CouponType.ENTIRE_SHOP,
  initialEarlySavePassed: false,
})

/** Captures the startDate value as loaded from the server so validation can
 * distinguish between "user changed the date" and "date is unchanged from saved state". */
const initialStartDate = ref<string>('')

const isSpecificProducts = computed(() => {
  return form.value.type === CouponType.SPECIFIC_PRODUCTS || (form.value.type === CouponType.PRIVATE && form.value.applicableProductsType === CouponType.SPECIFIC_PRODUCTS)
})

const discountAmountRef = toRef(form.value, 'discountAmount')
const discountFormatter = useNumberInputFormatter(discountAmountRef, locale.value)
const { displayValue: discountAmountDisplay, handleInput: discountAmountHandleInput, handleBlur: discountAmountHandleBlur, handleFocus: discountAmountHandleFocus } = discountFormatter

// re-init string formatter when i18n locale changes
watch(locale, () => {
  discountAmountDisplay.value = discountFormatter.formatNumber(form.value.discountAmount)
})

const maxDiscountAmountRef = toRef(form.value, 'maxDiscountAmount')
const { displayValue: maxDiscountAmountDisplay, handleInput: maxDiscountAmountHandleInput, handleBlur: maxDiscountAmountHandleBlur, handleFocus: maxDiscountAmountHandleFocus } = useNumberInputFormatter(maxDiscountAmountRef, locale.value)

const minOrderValueRef = toRef(form.value, 'minOrderValue')
const { displayValue: minOrderValueDisplay, handleInput: minOrderValueHandleInput, handleBlur: minOrderValueHandleBlur, handleFocus: minOrderValueHandleFocus } = useNumberInputFormatter(minOrderValueRef, locale.value)

const totalUsagesRef = toRef(form.value, 'totalUsages')
const { displayValue: totalUsagesDisplay, handleInput: totalUsagesHandleInput, handleBlur: totalUsagesHandleBlur, handleFocus: totalUsagesHandleFocus } = useNumberInputFormatter(totalUsagesRef, locale.value)

const maxUsagesPerBuyerRef = toRef(form.value, 'maxUsagesPerBuyer')
const { displayValue: maxUsagesPerBuyerDisplay, handleInput: maxUsagesPerBuyerHandleInput, handleBlur: maxUsagesPerBuyerHandleBlur, handleFocus: maxUsagesPerBuyerHandleFocus } = useNumberInputFormatter(maxUsagesPerBuyerRef, locale.value)

const currencySymbol = computed(() => {
  if (form.value.currency === 'VND') return 'đ'
  if (form.value.currency === 'USD') return '$'
  if (form.value.currency === 'EUR') return '€'
  return form.value.currency
})

const currencyOptions = computed(() => [
  { label: 'VND', value: 'VND' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
])

const displaySettingsOptions = computed(() => {
  const locked = isEditMode.value
  return [
    { label: t('coupon.detail.displayAndProducts.displayPublic'), value: false, disabled: locked },
    {
      label: t('coupon.detail.displayAndProducts.displayCodeOnly'),
      value: true,
      description: t('coupon.detail.displayAndProducts.displayCodeOnlyHint'),
      disabled: locked,
    },
  ]
})

const applicableProductsTypeOptions = computed(() => {
  const locked = isViewOnly.value || isOngoing.value
  return [
    {
      label: t('coupon.detail.displayAndProducts.allProducts'),
      value: CouponType.ENTIRE_SHOP,
      description: t('coupon.detail.displayAndProducts.allProductsDescription'),
      disabled: locked,
    },
    {
      label: t('coupon.detail.displayAndProducts.specificProducts'),
      value: CouponType.SPECIFIC_PRODUCTS,
      disabled: locked,
    },
  ]
})

const rewardTypeOptions = computed(() => {
  const locked = isEditMode.value
  return [
    { label: t('coupon.detail.discountSettings.rewardTypeDiscount'), value: RewardType.Discount, disabled: locked },
    { label: t('coupon.detail.discountSettings.rewardTypeCoin'), value: RewardType.Coin, disabled: locked },
  ]
})

const hasMaxDiscountOptions = computed(() => {
  const locked = isViewOnly.value || isOngoing.value
  return [
    { label: t('coupon.detail.discountSettings.maxDiscountLimit'), value: true, disabled: locked },
    { label: t('coupon.detail.discountSettings.maxDiscountNoLimit'), value: false, disabled: locked },
  ]
})

const discountTypeOptions = computed(() => [
  { label: t('coupon.detail.discountSettings.discountTypeFixed'), value: DiscountType.FixedAmount },
  { label: t('coupon.detail.discountSettings.discountTypePercentage'), value: DiscountType.Percentage },
])

const { openModal } = useModal()
const selectedProductIds = ref<number[]>([])
type SelectProductsModalResult = number[] | null

const handleAddProducts = async () => {
  const result = await openModal<SelectProductsModalResult>(SelectProductsModal, {
    title: t('coupon.detail.selectProductsModal.title'),
    maxWidth: '1000px',
    alreadySelected: selectedProductIds.value,
  })

  // Null is emitted when cancelled. A number array is emitted when confirmed.
  if (Array.isArray(result)) {
    selectedProductIds.value = result
    console.log("Selected products updated:", selectedProductIds.value)
  }
}

// Mock data sync to match Modal display
const mockProductsDB = [
  {
    id: 56900158122,
    name: 'xvsdthne5r7jne',
    image: '',
    sales: 0,
    priceMin: 1000,
    priceMax: 1000,
    stock: 48,
  },
  {
    id: 29717641908,
    name: 'Computers & Accessories',
    image: '',
    sales: 0,
    priceMin: 1000,
    priceMax: 2000,
    stock: 42,
  },
  {
    id: 29268188867,
    name: 'Computers & AccessoriesComputers & ...',
    image: '',
    sales: 0,
    priceMin: 1000000,
    priceMax: 1000000,
    stock: 123,
  },
]

const selectedProductsDetailed = computed(() => {
  return selectedProductIds.value
    .map(id => mockProductsDB.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
})

const formatPrice = (min: number, max: number) => {
  if (min === max) return `₫${min.toLocaleString('vi-VN')}`
  return `₫${min.toLocaleString('vi-VN')}-₫${max.toLocaleString('vi-VN')}`
}

const removeProduct = (id: number) => {
  const index = selectedProductIds.value.indexOf(id)
  if (index > -1) {
    selectedProductIds.value.splice(index, 1)
  }
}

const changeApplicableProductOption = () => {
  selectedProductIds.value = []
}

const changeHasMaxDiscount = () => {
  if (!form.value.hasMaxDiscount) {
    form.value.maxDiscountAmount = ''
  }
}

// ─────────────────────────────────────────────────────────────────
// ── Client-Side Field Validators ────────────────────────────────────────────────
// Rules mirror CreateCouponCommandValidator on the backend.
// ─────────────────────────────────────────────────────────────────

const {
  validateName,
  validateCode,
  validateStartDateTime,
  validateEndDateTime,
  validateEarlySaveDateTime,
  validateDiscountAmount,
  validateMaxDiscountAmount,
  validateMinOrderAmount,
  validateMaxUsageCount,
  validateMaxUsagePerUser,
  validateAllFields,
} = useCouponValidation(form, errors, t, isEditMode, initialStartDate)

// Watchers for numeric fields to clear validation errors dynamically when corrected
watch(() => form.value.discountAmount, () => {
  if (errors.discountAmount) validateDiscountAmount()
})

watch(() => form.value.maxDiscountAmount, () => {
  if (errors.maxDiscountAmount) validateMaxDiscountAmount()
})

watch(() => form.value.minOrderValue, () => {
  if (errors.minOrderAmount) validateMinOrderAmount()
})

watch(() => form.value.totalUsages, () => {
  if (errors.maxUsageCount) validateMaxUsageCount()
})

watch(() => form.value.maxUsagesPerBuyer, () => {
  if (errors.maxUsagePerUser) validateMaxUsagePerUser()
})

watch(() => form.value.allowEarlySave, (val) => {
  if (!val) {
    form.value.earlySaveDate = ''
  }
})

// ── Helper: populate form from a CouponDto ───────────────────
const populateFormFromDto = (dto: CouponDto) => {
  // Track status for edit-mode field locking
  if (!isDuplicate.value) {
    currentCouponStatus.value = dto.status ?? null
  }
  // Infer CouponType from dto properties
  let couponType = CouponType.ENTIRE_SHOP
  if (dto.isHidden) couponType = CouponType.PRIVATE
  else if (dto.applicableProductIds && dto.applicableProductIds.length > 0) couponType = CouponType.SPECIFIC_PRODUCTS

  form.value.type = couponType
  form.value.name = dto.name

  // Extract prefix (first 4 characters)
  const prefix = isDuplicate.value ? 'SHOP' : dto.code.substring(0, 4)
  form.value.prefix = prefix

  // Edit mode: pre-fill the editable part (after the 4-char prefix).
  // Duplicate/Create: clear it so user must pick a new one.
  form.value.code = isEditMode.value ? dto.code.substring(4) : ''
  form.value.startDate = isDuplicate.value ? defaultStartTime.toISOString() : dto.startDateTime.toString()
  // Record the loaded start date so validators can detect user-driven changes
  initialStartDate.value = form.value.startDate
  form.value.endDate = isDuplicate.value ? defaultEndTime.toISOString() : dto.endDateTime.toString()
  form.value.allowEarlySave = !!dto.earlySaveDateTime
  if (dto.earlySaveDateTime) {
    form.value.earlySaveDate = dto.earlySaveDateTime.toString()
    // Track if it had already passed at load time for validation purposes
    form.value.initialEarlySavePassed = new Date(dto.earlySaveDateTime) <= new Date()
  } else {
    form.value.initialEarlySavePassed = false
  }
  form.value.discountType = dto.discountType
  form.value.currency = dto.discountCurrency || 'VND'
  form.value.discountAmount = dto.discountType === DiscountType.FixedAmount
    ? String(dto.discountAmount ?? '')
    : String(dto.discountPercentage ?? '')
  form.value.hasMaxDiscount = !!dto.maxDiscountAmount
  form.value.maxDiscountAmount = String(dto.maxDiscountAmount ?? '')
  form.value.minOrderValue = String(dto.minOrderAmount ?? '')
  form.value.totalUsages = String(dto.maxUsageCount ?? '')
  form.value.maxUsagesPerBuyer = String(dto.maxUsagePerUser ?? '1')
  form.value.displaySettings = dto.isHidden && couponType !== CouponType.PRIVATE
  selectedProductIds.value = [...(dto.applicableProductIds as number[] ?? [])]
}

// ── On mount: load coupon in edit or duplicate mode ───────────
onMounted(async () => {
  const id = couponId.value || copyId.value
  if (!id) return
  try {
    const dto = await couponStore.fetchCouponById(id)
    // In duplicate mode, clear the code so the user picks a new one
    populateFormFromDto(dto)
  } catch {
    appStore.notifyError(
      t('coupon.detail.notifications.loadError.title', 'Error'),
      t('coupon.detail.notifications.loadError.message', 'Failed to load coupon details.')
    )
    router.push('/marketing/coupons')
  }
})

const submitForm = async () => {
  // ── Clear previous errors before each attempt ─────────────
  clearFieldErrors(errors)

  // ── Client-side validation (mirrors CreateCouponCommandValidator) ──
  if (!validateAllFields()) {
    return
  }

  // ── Build the request payload ──────────────────────────────
  // discountType is already a DiscountType enum value from the form
  const discountType = form.value.discountType

  // displaySettings is already the boolean isHidden value
  // true = hidden/private (code only), false = public
  const isHidden = form.value.type === CouponType.PRIVATE || form.value.displaySettings

  // The scope always maps to ItemPrice for seller coupons
  const scope = CouponScope.ItemPrice

  // Parse numeric string values (formatter keeps them as raw strings)
  const discountAmountNum = Number(form.value.discountAmount) || 0
  const discountPercentageNum = form.value.discountType === DiscountType.Percentage
    ? Number(form.value.discountAmount) || 0
    : undefined
  const maxDiscountAmountNum = form.value.hasMaxDiscount
    ? (Number(form.value.maxDiscountAmount) || undefined)
    : undefined
  const minOrderAmountNum = Number(form.value.minOrderValue) || 0
  const maxUsageCountNum = Number(form.value.totalUsages) || 0
  const maxUsagePerUserNum = Number(form.value.maxUsagesPerBuyer) || 1

  // Prefix + code (backend stores the full code)
  const fullCode = `${form.value.prefix}${form.value.code.toUpperCase()}`

  try {
    if (isEditMode.value && couponId.value) {
      // ── Update Mode ───────────────────────────────────────
      const updatePayload: UpdateCouponRequest = {
        id: couponId.value,
        code: fullCode,
        name: form.value.name,
        startDateTime: form.value.startDate,
        endDateTime: form.value.endDate,
        earlySaveDateTime: form.value.allowEarlySave ? form.value.earlySaveDate : null,

        discountCurrency: form.value.currency,
        discountAmount: discountType === DiscountType.FixedAmount ? (discountAmountNum || null) : null,
        discountPercentage: discountPercentageNum ?? null,
        maxDiscountAmount: maxDiscountAmountNum ?? null,
        minOrderAmount: minOrderAmountNum,

        maxUsageCount: maxUsageCountNum,

        applicableProductIds: selectedProductIds.value,
      }

      await couponStore.updateCoupon(updatePayload)

      appStore.notifySuccess(
        t('coupon.detail.notifications.updateSuccess.title', 'Success'),
        t('coupon.detail.notifications.updateSuccess.message', 'Coupon updated successfully.'),
      )
    } else {
      // ── Create Mode ───────────────────────────────────────
      const createPayload: CreateCouponRequest = {
        code: fullCode,
        name: form.value.name,
        startDateTime: form.value.startDate,
        endDateTime: form.value.endDate,
        earlySaveDateTime: form.value.allowEarlySave ? form.value.earlySaveDate : null,

        discountType,
        discountAmount: discountType === DiscountType.FixedAmount ? (discountAmountNum || null) : null,
        discountCurrency: form.value.currency,
        discountPercentage: discountPercentageNum ?? null,
        maxDiscountAmount: maxDiscountAmountNum ?? null,
        minOrderAmount: minOrderAmountNum,

        scope,

        maxUsageCount: maxUsageCountNum,
        maxUsagePerUser: maxUsagePerUserNum,

        isHidden,

        applicableProductIds: selectedProductIds.value,
        applicableCategoryIds: [],
      }

      await couponStore.createCoupon(createPayload)

      appStore.notifySuccess(
        t('coupon.detail.notifications.createSuccess.title'),
        t('coupon.detail.notifications.createSuccess.message'),
      )
    }

    router.push('/marketing/coupons')
  } catch (error: unknown) {
    // Handle structured API error response (field-level + common errors)
    const errorData = error as ErrorResponse

    const hasFieldErrors = handleFieldValidationErrors(errorData, errors)

    // Only show a generic toast when the error wasn't mapped to any field
    if (!hasFieldErrors) {
      const errorTitle = isEditMode.value
        ? t('coupon.detail.notifications.updateError.title', 'Update Failed')
        : t('coupon.detail.notifications.createError.title')
      const errorMessage = isEditMode.value
        ? t('coupon.detail.notifications.updateError.message', 'Could not update coupon.')
        : t('coupon.detail.notifications.createError.message')

      appStore.notifyError(errorTitle, errorMessage)
    }
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
