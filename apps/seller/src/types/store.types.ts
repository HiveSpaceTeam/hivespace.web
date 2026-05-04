export interface RegisterStoreRequest {
  storeName: string
  description?: string | null
  storeLogoFileId: string
  address: string
}

export interface RegisterStoreResponse {
  storeId: string
  storeName: string
  storeDescription: string | null
  storeLogo: string
  storeAddress: string
}
