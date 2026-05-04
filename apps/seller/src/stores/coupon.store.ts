import { ref } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'
import { useAppStore } from '@hivespace/shared'
import type { PaginationMetadata } from '@hivespace/shared'
import { CouponStatus } from '@/types'
import type {
    CreateCouponRequest,
    UpdateCouponRequest,
    CouponDto,
    CouponSummaryDto,
    GetCouponListQuery,
} from '@/types'
import { couponService } from '@/services/coupon.service'

// ────────────────────────────────────────────────────────────
// Coupon Store
// Manages state and actions for the coupon creation flow.
//
// Pattern: store uses try/finally and re-throws on error so
// the calling component's try/catch can handle field-level
// validation errors via useFieldValidation (same as admin store).
// ────────────────────────────────────────────────────────────

export const useCouponStore = defineStore('coupon', () => {
    // ── State ─────────────────────────────────────────────────
    const createdCoupon = ref<CouponDto | null>(null)
    const currentCoupon = ref<CouponDto | null>(null)
    const coupons = ref<CouponSummaryDto[]>([])
    const pagination = ref<PaginationMetadata | null>(null)
    const isFetching = ref(false)
    const activeTab = ref<string>(String(CouponStatus.All))

    // ── Actions ───────────────────────────────────────────────

    /**
     * Call the Order Service to create a new coupon.
     * Shows a global loading indicator while in-flight.
     * Re-throws any API error so the component can handle
     * field-level validation via useFieldValidation.
     *
     * @param payload - Validated CreateCouponRequest body
     * @returns The created CouponDto on success
     * @throws ErrorResponse on failure
     */
    const createCoupon = async (payload: CreateCouponRequest): Promise<CouponDto> => {
        const appStore = useAppStore()

        try {
            appStore.setLoading(true)
            createdCoupon.value = null

            const result = await couponService.createCoupon(payload)
            createdCoupon.value = result
            return result
        } finally {
            appStore.setLoading(false)
        }
        // Note: errors intentionally re-thrown for the component to handle
    }

    /**
     * Call the Order Service to update an existing coupon.
     */
    const updateCoupon = async (payload: UpdateCouponRequest): Promise<CouponDto> => {
        const appStore = useAppStore()

        try {
            appStore.setLoading(true)

            const result = await couponService.updateCoupon(payload)
            currentCoupon.value = result // Update localized cache if we are editing
            return result
        } finally {
            appStore.setLoading(false)
        }
    }

    /** Reset transient state (call before re-opening the creation form) */
    const reset = () => {
        createdCoupon.value = null
        currentCoupon.value = null
    }

    /**
     * Fetch a paginated list of coupons with the given filters.
     */
    const fetchCoupons = async (params: GetCouponListQuery) => {
        const appStore = useAppStore()
        try {
            isFetching.value = true
            // we intentionally don't set global app loading here to allow for background refresh
            // or local skeleton loading states in components if desired.
            const result = await couponService.getCoupons(params)
            coupons.value = result.coupons || []
            pagination.value = result.pagination || null
            return result
        } catch (error) {
            appStore.notifyError(
                i18n.global.t('coupon.notifications.fetchError.title'),
                i18n.global.t('coupon.notifications.fetchError.message')
            )
            throw error
        } finally {
            isFetching.value = false
        }
    }

    /**
     * Fetch a single coupon by ID and cache it in currentCoupon.
     */
    const fetchCouponById = async (id: string): Promise<CouponDto> => {
        const appStore = useAppStore()
        try {
            appStore.setLoading(true)
            const result = await couponService.getCouponById(id)
            currentCoupon.value = result
            return result
        } finally {
            appStore.setLoading(false)
        }
    }

    /** Reset the coupons list to an empty array (e.g. on tab change before re-fetching). */
    const clearCoupons = () => {
        coupons.value = []
    }

    /**
     * Delete a coupon by ID and show a success notification.
     */
    const deleteCoupon = async (id: string): Promise<void> => {
        const appStore = useAppStore()
        try {
            appStore.setLoading(true)
            await couponService.deleteCoupon(id)
            appStore.notifySuccess(
                i18n.global.t('coupon.notifications.deleteSuccess.title'),
                i18n.global.t('coupon.notifications.deleteSuccess.message')
            )
        } finally {
            appStore.setLoading(false)
        }
    }

    /**
     * End a coupon by ID and show a success notification.
     */
    const endCoupon = async (id: string): Promise<void> => {
        const appStore = useAppStore()
        try {
            appStore.setLoading(true)
            await couponService.endCoupon(id)
            appStore.notifySuccess(
                i18n.global.t('coupon.notifications.endSuccess.title'),
                i18n.global.t('coupon.notifications.endSuccess.message')
            )
        } finally {
            appStore.setLoading(false)
        }
    }

    return {
        // state
        createdCoupon,
        currentCoupon,
        coupons,
        pagination,
        isFetching,
        // actions
        createCoupon,
        updateCoupon,
        fetchCoupons,
        fetchCouponById,
        deleteCoupon,
        endCoupon,
        clearCoupons,
        reset,
        activeTab,
    }
})
