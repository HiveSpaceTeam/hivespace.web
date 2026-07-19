import type { ApiRequestService, BuildApiUrl } from '../service.types'
import type {
  CreatePaymentAttemptRequest,
  CreatePaymentAttemptResponse,
  GetPaymentMethodsResponse,
  IPaymentService,
  PaymentDetail,
} from './payment.types'

const ENDPOINTS = {
  METHODS: '/payments/methods',
  DETAIL: (paymentId: string) => `/payments/${paymentId}`,
  BY_REFERENCE: (referenceNo: string) => `/payments/by-reference/${referenceNo}`,
  BY_ORDER: (orderId: string) => `/payments/by-order/${orderId}`,
  ATTEMPTS: (paymentId: string) => `/payments/${paymentId}/attempts`,
} as const

export interface PaymentServiceOptions {
  apiService: ApiRequestService
  buildApiUrl: BuildApiUrl
}

export const createPaymentService = (options: PaymentServiceOptions): IPaymentService => {
  const { apiService, buildApiUrl } = options

  return {
    getPaymentMethods: (): Promise<GetPaymentMethodsResponse> =>
      apiService.get<GetPaymentMethodsResponse>(buildApiUrl(ENDPOINTS.METHODS)),
    getPaymentDetail: (paymentId: string): Promise<PaymentDetail> =>
      apiService.get<PaymentDetail>(buildApiUrl(ENDPOINTS.DETAIL(paymentId))),
    getPaymentByReference: (referenceNo: string): Promise<PaymentDetail> =>
      apiService.get<PaymentDetail>(buildApiUrl(ENDPOINTS.BY_REFERENCE(referenceNo))),
    getPaymentByOrder: (orderId: string): Promise<PaymentDetail> =>
      apiService.get<PaymentDetail>(buildApiUrl(ENDPOINTS.BY_ORDER(orderId))),
    createPaymentAttempt: (
      paymentId: string,
      request: CreatePaymentAttemptRequest,
    ): Promise<CreatePaymentAttemptResponse> =>
      apiService.post<CreatePaymentAttemptResponse>(
        buildApiUrl(ENDPOINTS.ATTEMPTS(paymentId)),
        request,
      ),
  }
}
