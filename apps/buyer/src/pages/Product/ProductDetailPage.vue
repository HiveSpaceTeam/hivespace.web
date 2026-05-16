<template>
  <div class="product-detail-page">
    <div class="container">
      <!-- Left: Image Gallery -->
      <div class="image-gallery">
        <div class="main-image">
          <div class="image-frame">
            <div class="image-container">
              <img :src="getImageSrc(currentImage)" width="368" height="368" loading="eager" alt="product" />
            </div>
          </div>
          <div class="thumbnail-list">
            <div class="thumbnail-slider">
              <button @click="setPrevActiveImage" class="nav-btn prev" :class="{ disabled: activeImageIndex === 0 }">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M12.0899 14.5899C11.7645 14.9153 11.2368 14.9153 10.9114 14.5899L5.91139 9.58991C5.58596 9.26447 5.58596 8.73683 5.91139 8.4114L10.9114 3.41139C11.2368 3.08596 11.7645 3.08596 12.0899 3.41139C12.4153 3.73683 12.4153 4.26447 12.0899 4.58991L7.67916 9.00065L12.0899 13.4114C12.4153 13.7368 12.4153 14.2645 12.0899 14.5899Z"
                    fill="#0A68FF"></path>
                </svg>
              </button>
              <div class="thumbnails">
                <div class="thumbnail-track">
                  <a v-for="(image, index) in displayedProductImages" :key="index"
                    :class="{ active: index === activeImageIndex }" @click="setActiveImage(index)">
                    <img width="47" height="47" :alt="`product-img-${index}`" :src="getImageSrc(image)" />
                  </a>
                </div>
              </div>
              <button @click="setNextActiveImage" class="nav-btn next"
                :class="{ disabled: activeImageIndex === displayedProductImages.length - 1 }">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M5.91107 3.41107C6.23651 3.08563 6.76414 3.08563 7.08958 3.41107L12.0896 8.41107C12.415 8.73651 12.415 9.26415 12.0896 9.58958L7.08958 14.5896C6.76414 14.915 6.23651 14.915 5.91107 14.5896C5.58563 14.2641 5.58563 13.7365 5.91107 13.4111L10.3218 9.00033L5.91107 4.58958C5.58563 4.26414 5.58563 3.73651 5.91107 3.41₁₀₇Z"
                    fill="#0A68FF"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Center: Main Content -->
      <div class="main-content">
        <!-- Product Header -->
        <div class="product-details">
          <div class="badges">
            <picture>
              <img src="https://salt.tikicdn.com/ts/upload/be/67/48/04a82ab8df178e1a13bde38316081865.png" width="91"
                height="20" alt="freeship_xtra" />
            </picture>
            <picture>
              <img src="https://salt.tikicdn.com/ts/ta/b1/3f/4e/cc3d0a2dd751a7b06dd97d868d6afa56.png" width="114"
                height="20" alt="return_policy" />
            </picture>
            <span class="brand">{{ $t('storefront.productDetail.brand') }}:
              <a href="#">{{ store.name }}</a></span>
          </div>
          <h1 class="product-title">{{ productDetail.name }}</h1>
          <div class="price-section">
            <span class="price">{{ formatPrice(getCurrentPrice()) }}</span>
          </div>

          <!-- Variants -->
          <div v-if="productDetail.variants.length > 0" class="variants">
            <div class="variant-group">
              <p class="variant-label">{{ productDetail.variants[0]?.name }}</p>
              <div class="variant-options">
                <div v-for="(option, index) in productDetail.variants[0]?.options" :key="index"
                  :class="{ active: selectedOptions.option1 === option.value }" @click="selectOption1(option)">
                  <div class="color-option">
                    <img :src="getOptionImage(option)" width="42" height="42" alt="option" />
                    <span>{{ option.value }}</span>
                  </div>
                  <img v-if="selectedOptions.option1 === option.value" class="selected-indicator"
                    src="https://salt.tikicdn.com/ts/upload/6d/62/b9/ac9f3bebb724a308d710c0a605fe057d.png"
                    alt="Selected" width="13" height="13" />
                </div>
              </div>
            </div>
            <div v-if="productDetail.variants[1]" class="variant-group">
              <p class="variant-label">{{ productDetail.variants[1]?.name }}</p>
              <div class="variant-options">
                <div v-for="(option, index) in productDetail.variants[1]?.options" :key="index"
                  :class="{ active: selectedOptions.option2 === option.value }" @click="selectSize(option)">
                  <span>{{ option.value }}</span>
                  <img v-if="selectedOptions.option2 === option.value" class="selected-indicator"
                    src="https://salt.tikicdn.com/ts/upload/6d/62/b9/ac9f3bebb724a308d710c0a605fe057d.png"
                    alt="Selected" width="13" height="13" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="section">
          <h3>{{ $t('storefront.productDetail.shippingInfo') }}</h3>
          <div class="shipping-address">
            <span>{{ $t('storefront.productDetail.defaultAddress') }}: {{ defaultAddressText }}</span>
            <span class="change-link">{{ $t('storefront.productDetail.change') }}</span>
          </div>
          <div class="shipping-details">
            <div class="shipping-item">
              <div class="shipping-header">
                <img src="https://salt.tikicdn.com/ts/upload/14/11/46/13b71dceb805fb57ce37d57585bc3762.png" alt=""
                  height="16" width="32" />
                <span class="highlight">Giao Thứ Sáu</span>
              </div>
              <div class="shipping-fee">
                <span>{{ $t('storefront.productDetail.date') }} 20/03: <span class="free">{{
                  $t('storefront.productDetail.free') }}</span><del>38.000₫</del></span>
              </div>
            </div>
          </div>
          <div class="freeship-info">
            <img src="https://salt.tikicdn.com/ts/upload/f7/85/80/51da5722c3cfa1d6d93644188d07c51a.png" width="79"
              height="16" alt="freeship-icon" />
            <span>Freeship 15k đơn từ 45k, Freeship 30k đơn từ 100k</span>
          </div>
        </div>

        <!-- Discounts -->
        <div class="section">
          <h3>{{ $t('storefront.productDetail.discounts') }}</h3>
          <div class="discounts">
            <div class="discount-header">
              <span>3 {{ $t('storefront.productDetail.discountCodes') }}</span>
              <div class="discount-codes">
                <span class="code">{{ $t('storefront.productDetail.decrease') }} 20%</span>
                <span class="code">{{ $t('storefront.productDetail.decrease') }} 8K</span>
              </div>
            </div>
            <img src="https://salt.tikicdn.com/ts/upload/16/42/c1/23a144e53aadf0357f6cd2c98b525902.png" width="24"
              height="24" alt="right-icon" />
          </div>
        </div>

        <!-- Additional Services -->
        <!-- <div class="section">
          <h3>Dịch vụ bổ sung</h3>
          <div class="service-item">
            <img src="https://salt.tikicdn.com/ts/upload/73/4d/f7/f86e767bffc14aa3d6abed348630100b.png"
              alt="tikicard-icon" height="40" width="40" />
            <div class="service-content">
              <div>Ưu đãi đến 600k với thẻ TikiCard</div>
              <div class="link">Đăng ký</div>
            </div>
          </div>
          <div class="service-item">
            <img src="https://salt.tikicdn.com/ts/upload/2a/27/6a/7bbba1f6c93a1a42a3c314e7b5825f4c.png"
              alt="installment-icon" height="40" width="40" />
            <div class="service-content">
              <div>Mua trước trả sau</div>
              <div class="link">Đăng ký</div>
            </div>
          </div>
        </div> -->

        <!-- Similar Products -->
        <div class="section">
          <h3>{{ $t('storefront.productDetail.similarProducts') }}</h3>
          <div class="similar-products">
            <button @click="handlePrevSimilarProducts" class="nav-btn prev " :class="{ disabled: pageIndex === 1 }">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12.0899 14.5899C11.7645 14.9153 11.2368 14.9153 10.9114 14.5899L5.91139 9.58991C5.58596 9.26447 5.58596 8.73683 5.91139 8.4114L10.9114 3.41139C11.2368 3.08596 11.7645 3.08596 12.0899 3.41139C12.4153 3.73683 12.4153 4.26447 12.0899 4.58991L7.67916 9.00065L12.0899 13.4114C12.4153 13.7368 12.4153 14.2645 12.0899 14.5899Z"
                  fill="#0A68FF"></path>
              </svg>
            </button>
            <div class="products-grid">
              <div class="products-container">
                <div class="product-grid">
                  <div v-for="(sp, index) in similarProducts" :key="index" class="product-card">
                    <a :href="`/product?pid=${sp.id}`">
                      <div class="product-image">
                        <img :src="sp.imageURL" :alt="sp.name" />
                      </div>
                      <div class="product-card-info">
                        <h4>{{ sp.name }}</h4>
                        <div class="card-price">
                          {{ formatPrice(sp.price) }}
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
                <div class="pagination">
                  <div v-for="(_, index) in 4" :key="index" class="dot "
                    :class="{ active: index === pageIndex - 1 }"></div>

                </div>
              </div>
            </div>
            <button @click="handleNextSimilarProducts" class="nav-btn next"
              :class="{ disabled: pageIndex * pageSize >= totalCount || pageIndex === 4 }">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M5.91107 3.41107C6.23651 3.08563 6.76414 3.08563 7.08958 3.41107L12.0896 8.41107C12.415 8.73651 12.415 9.26415 12.0896 9.58958L7.08958 14.5896C6.76414 14.915 6.23651 14.915 5.91107 14.5896C5.58563 14.2641 5.58563 13.7365 5.91107 13.4111L10.3218 9.00033L5.91107 4.58958C5.58563 4.26414 5.58563 3.73651 5.91107 3.41107Z"
                  fill="#0A68FF"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Warranty Info (dynamic from attributes grouped by groupName="Bảo hành") -->
        <div v-if="warrantyAttributes.length > 0" class="section">
          <h3>{{ $t('storefront.productDetail.warrantyInfo') }}</h3>
          <div class="product-specs">
            <div class="spec-row" v-for="(item, index) in warrantyAttributes" :key="index">
              <span class="spec-label">{{ item.attributeName }}</span>
              <span class="spec-value">{{
                item.freeTextValue || item.nameValue.join(", ")
                }}</span>
            </div>
          </div>
        </div>

        <!-- Benefits -->
        <div class="section">
          <h3>{{ $t('storefront.productDetail.benefits') }}</h3>
          <div class="benefits-list">
            <div class="benefit-item">
              <img alt="check-icon"
                src="https://salt.tikicdn.com/ts/upload/c5/37/ee/76c708d43e377343e82baee8a0340297.png" height="20"
                width="20" />
              <span>{{ $t('storefront.productDetail.inspectionAllowed') }}</span>
            </div>
            <div class="benefit-item">
              <img alt="refund-icon"
                src="https://salt.tikicdn.com/ts/upload/ea/02/b4/b024e431ec433e6c85d4734aaf35bd65.png" height="20"
                width="20" />
              <span v-html="$t('storefront.productDetail.refundPolicy')"></span>
            </div>
            <div class="benefit-item">
              <img alt="return-icon"
                src="https://salt.tikicdn.com/ts/upload/d8/c7/a5/1cd5bd2f27f9bd74b2c340b8e27c4d82.png" height="20"
                width="20" />
              <span>{{ $t('storefront.productDetail.freeReturn') }}</span>
              <!-- <span class="link">{{ $t('storefront.productDetail.details') }}</span> -->
            </div>
          </div>
        </div>

        <!-- Product Specs (dynamic from attributes grouped by groupName="Thông tin chi tiết") -->
        <div v-if="specAttributes.length > 0" class="section">
          <h3>{{ $t('storefront.productDetail.specifications') }}</h3>
          <div class="product-specs">
            <div class="spec-row" v-for="(item, index) in specAttributes" :key="index">
              <span class="spec-label">{{ item.attributeName }}</span>
              <span class="spec-value">{{
                item.freeTextValue || item.nameValue.join(", ")
                }}</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="section">
          <h3>{{ $t('storefront.productDetail.description') }}</h3>
          <div class="description" :class="{ collapsed: !descriptionExpanded }" v-html="productDetail.description">
          </div>
          <button class="toggle-btn" @click="toggleDescription">
            {{ descriptionExpanded ? $t('storefront.productDetail.collapse') : $t('storefront.productDetail.expand') }}
          </button>
        </div>
      </div>

      <!-- Right: Sidebar -->
      <div class="sidebar">
        <div class="store-info">
          <!-- Store Header -->
          <div class="store-header">
            <a href="#" @click.prevent>
              <img v-if="store.logo" :src="store.logo" class="store-logo" width="40" height="40" :alt="store.name" />
              <div v-else class="store-logo-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                    fill="#ccc" />
                </svg>
              </div>
            </a>
            <div class="store-details">
              <a href="#" @click.prevent class="store-name">{{ store.name }}</a>
              <div class="store-rating">
                <span>{{ store.rating }}</span>
                <img alt="star-icon"
                  src="https://salt.tikicdn.com/ts/upload/e3/f0/86/efd76e1d41c00ad8ebb7287c66b559fd.png" width="16"
                  height="16" />
                <span>({{ store.reviewCount }} {{ $t('storefront.productDetail.reviews') }})</span>
              </div>
            </div>
            <button class="chat-btn">
              <img alt="chat-icon"
                src="https://salt.tikicdn.com/ts/upload/8b/82/74/cf2c041938ace329ab11fbc38da3275b.png" height="20"
                width="20" />
            </button>
          </div>

          <!-- Selected Variant / Current Image -->
          <div class="selected-variant">
            <img class="variant-image" :src="getImageSrc(currentImage)" width="40" height="40" alt="variant" />
            <span v-if="hasVariants">
              {{ getSelectedOption1Value()
              }}<span v-if="getSelectedOption2Value()">, {{ getSelectedOption2Value() }}</span>
            </span>
            <span v-else class="variant-name-short">{{
              productDetail.name
              }}</span>
          </div>

          <!-- Quantity and Price -->
          <div class="quantity-price">
            <div class="quantity-selector">
              <label>{{ $t('storefront.productDetail.quantity') }}</label>
              <div class="quantity-controls">
                <button @click="decreaseQuantity" :disabled="quantity <= 1">
                  -
                </button>
                <input type="text" v-model="quantity" readonly />
                <button @click="increaseQuantity">+</button>
              </div>
            </div>
            <div class="total-price">
              <span>{{ $t('storefront.productDetail.subtotal') }}</span>
              <span class="total-amount">{{
                formatPrice(getCurrentPrice() * quantity)
                }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="buy-now">{{ $t('storefront.productDetail.buyNow') }}</button>
            <button class="add-cart" @click="addToCart">{{ $t('storefront.productDetail.addCart') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from 'pinia'
import { useRoute } from "vue-router";
import type {
  ProductImage,
  ProductSkuImage,
  ProductVariantOption,
} from "@/types";
import { useI18n } from 'vue-i18n'
import { useAddressStore, useCartStore, useProductStore } from '@/stores'

const activeImageIndex = ref(0);
const selectedOptions = ref<Record<string, string | null>>({
  option1: null,
  option2: null,
});
const quantity = ref(1);
const descriptionExpanded = ref(false);
const route = useRoute();
const pageIndex = ref(1)
const pageSize = ref(8)
const { t } = useI18n()
const productStore = useProductStore()
const cartStore = useCartStore()
const addressStore = useAddressStore()
const { productDetail, similarProducts, similarTotalCount: totalCount } = storeToRefs(productStore)
const { defaultAddress } = storeToRefs(addressStore)
const hasVariants = computed(() => productDetail.value.variants.length > 0);
const store = computed(() => ({
  name: productDetail.value.currentSeller?.storeName || t('storefront.productDetail.fallbackStoreName'),
  logo: productDetail.value.currentSeller?.logoUrl || '',
  rating: '4.0',
  reviewCount: 165,
}))
const defaultAddressText = computed(() => {
  const address = defaultAddress.value
  if (!address) {
    return t('storefront.productDetail.noDefaultAddress')
  }

  return [address.street, address.commune, address.province, address.country]
    .filter(Boolean)
    .join(', ')
})

const getImageSrc = (image?: ProductImage | ProductSkuImage | null) =>
  image?.imageUrl || image?.fileId || ''

const displayedProductImages = computed(() => {
  // Match SKU by variant value strings (SkuVariant.value maps to ProductVariantOption.value)
  const skuImages = productDetail.value.skus.find(
    (sku) =>
      sku.skuVariants.some(
        (v) => v.value === selectedOptions.value.option1,
      ) &&
      (!selectedOptions.value.option2 ||
        sku.skuVariants.some(
          (v) => v.value === selectedOptions.value.option2,
        )),
  )?.images;

  if (skuImages && skuImages.length > 0) return skuImages;

  const firstSkuImages = productDetail.value.skus[0]?.images;
  if (firstSkuImages && firstSkuImages.length > 0) return firstSkuImages;

  return productDetail.value.images || [];
});

const warrantyAttributes = computed(() =>
  productDetail.value.attributes.filter((a) => a.groupName === "Bảo hành"),
);

const specAttributes = computed(() =>
  productDetail.value.attributes.filter(
    (a) => a.groupName === "Thông tin chi tiết",
  ),
);

const currentImage = computed(
  () => displayedProductImages.value[activeImageIndex.value],
);

const setActiveImage = (index: number) => {
  activeImageIndex.value = index;
};
const setNextActiveImage = () => {
  if (activeImageIndex.value < displayedProductImages.value.length - 1) {
    activeImageIndex.value++;
  }
};
const setPrevActiveImage = () => {
  if (activeImageIndex.value > 0) {
    activeImageIndex.value--;
  }
};

const handlePrevSimilarProducts = () => {

  if (pageIndex.value > 1) {
    pageIndex.value -= 1
    fetchSimilarProducts()
  }
};

const handleNextSimilarProducts = () => {
  // Placeholder for pagination logic
  if (pageIndex.value * pageSize.value < totalCount.value) {
    pageIndex.value += 1
    fetchSimilarProducts()
  }
};

const selectOption1 = (option: ProductVariantOption) => {
  selectedOptions.value.option1 = option.value;
};
const selectSize = (option: ProductVariantOption) => {
  selectedOptions.value.option2 = option.value;
};

const getSelectedOption1Value = () => selectedOptions.value.option1 ?? "";
const getSelectedOption2Value = () => selectedOptions.value.option2 ?? "";

const getCurrentPrice = () => {
  if (hasVariants.value) {
    const sku = productDetail.value.skus.find(
      (sku) =>
        sku.skuVariants.some(
          (v) => v.value === selectedOptions.value.option1,
        ) &&
        (!selectedOptions.value.option2 ||
          sku.skuVariants.some(
            (v) => v.value === selectedOptions.value.option2,
          )),
    );
    if (sku) return sku.price.amount;
  }
  return productDetail.value.skus[0]?.price.amount ?? 0;
};

const getOptionImage = (option: ProductVariantOption) => {
  const sku = productDetail.value.skus.find((x) =>
    x.skuVariants.some((s) => s.value === option.value),
  );
  return getImageSrc(sku?.images?.[0]);
};

const increaseQuantity = () => {
  quantity.value++;
};
const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};
const addToCart = async () => {
  if (!productDetail.value.id || !productDetail.value.skus[0]?.id) {
    return
  }

  await cartStore.addItem({
    productId: productDetail.value.id,
    skuId: productDetail.value.skus[0]?.id,
    quantity: quantity.value,
  });
};
const fetchSimilarProducts = async () => {
  await productStore.fetchSimilarProducts({
    page: pageIndex.value,
    pageSize: pageSize.value,
  })
}

const toggleDescription = () => {
  descriptionExpanded.value = !descriptionExpanded.value;
};
const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "₫";

onMounted(async () => {
  productStore.resetProductDetail()
  const id = route.query.pid as string;
  await productStore.fetchProductDetail(id);

  selectedOptions.value.option1 =
    productDetail.value.variants[0]?.options[0]?.value ?? null;
  selectedOptions.value.option2 =
    productDetail.value.variants[1]?.options[0]?.value ?? null;
  await fetchSimilarProducts();
  await fetchDefaultAddress();
});
const fetchDefaultAddress = async () => {
  await addressStore.fetchDefaultAddress()
/*

  if (!address) {
    defaultAddress.value = "Chưa có địa chỉ";
    return;
  }

  const {
    street,
    commune,
    province,
    country
  } = address;

  defaultAddress.value = [
    street,
    commune,
    province,
    country
  ]
    .filter(Boolean) // loại bỏ null/undefined
    .join(", ");
*/
};

</script>

<style scoped>
.product-detail-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 16px 0;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* ─── Image Gallery ─── */
.image-gallery {
  width: 400px;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 16px;
  position: sticky;
  top: 158px;
}

.main-image {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-frame {
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.image-container {
  width: 368px;
  height: 368px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbnail-slider {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thumbnails {
  flex: 1;
  overflow: hidden;
}

.thumbnail-track {
  display: flex;
  gap: 8px;
}

.thumbnail-track a {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  display: block;
}

.thumbnail-track a.active {
  border-color: #0a68ff;
}

.thumbnail-track img {
  width: 47px;
  height: 47px;
  object-fit: cover;
  display: block;
}

.nav-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
  transition: all 0.2s;
}

.nav-btn:hover:not(.disabled) {
  background: #f0f8ff;
  border-color: #0a68ff;
}

.nav-btn.disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* ─── Main Content ─── */
.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Product Details Card */
.product-details {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.badges img {
  height: 20px;
}

.brand {
  color: #808089;
  font-size: 13px;
}

.brand a {
  color: #0a68ff;
  text-decoration: none;
}

.product-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  color: #27272a;
  margin: 8px 0 12px;
}

.price-section {
  margin-bottom: 8px;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: #27272a;
}

/* Variants */
.variants {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.variant-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variant-label {
  font-size: 14px;
  font-weight: 600;
  color: #27272a;
  margin: 0;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variant-options>div {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.variant-options>div.active {
  border-color: #0a68ff;
  background: #f0f8ff;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-option img {
  width: 42px;
  height: 42px;
  border-radius: 4px;
  object-fit: cover;
}

.selected-indicator {
  width: 13px;
  height: 13px;
  position: absolute;
  top: -4px;
  right: -4px;
}

/* ─── Sections ─── */
.section {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.section h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #27272a;
}

/* Shipping */
.shipping-address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #27272a;
}

.change-link {
  color: #0a68ff;
  cursor: pointer;
  font-size: 14px;
}

.shipping-details {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.shipping-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shipping-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight {
  font-weight: 600;
  color: #00ab56;
  font-size: 14px;
}

.shipping-fee {
  font-size: 14px;
  color: #27272a;
}

.free {
  color: #00ab56;
}

.freeship-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0 0;
  font-size: 13px;
  color: #808089;
}

/* Discounts */
.discounts {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.discount-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #27272a;
}

.discount-codes {
  display: flex;
  gap: 8px;
}

.code {
  background: #fff2f2;
  color: #d0011b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px dashed #d0011b;
}

/* Services */
.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
}

.service-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.service-item img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.service-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: #27272a;
}

.service-content .link {
  color: #0a68ff;
  font-size: 13px;
}

/* Similar Products */
.similar-products {
  display: flex;
  align-items: center;
  gap: 8px;
}

.products-grid {
  flex: 1;
  overflow: hidden;
}

.products-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.product-card a {
  text-decoration: none;
  color: inherit;
  display: block;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: box-shadow 0.2s;
}

.product-card a:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.product-image {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f8f8f8;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card-info {
  padding: 6px;
}

.product-card-info h4 {
  font-size: 11px;
  line-height: 1.4;
  color: #27272a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.card-price {
  font-weight: 600;
  color: #27272a;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 16px;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.dot.active {
  width: 24px;
  background: #0a68ff;
}

/* Warranty & Benefits */
.warranty-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #27272a;
}

.benefits-list {
  display: flex;
  flex-direction: column;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #27272a;
  border-bottom: 1px solid #f5f5f5;
}

.benefit-item:last-child {
  border-bottom: none;
}

.benefit-item img {
  flex-shrink: 0;
}

/* Specs */
.product-specs {
  display: flex;
  flex-direction: column;
}

.spec-row {
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  color: #808089;
}

.spec-value {
  font-weight: 500;
  color: #27272a;
}

/* Description */
.description {
  overflow: hidden;
  line-height: 1.7;
  font-size: 14px;
  color: #27272a;
}

.description.collapsed {
  max-height: 200px;
}

.toggle-btn {
  color: #0a68ff;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  text-decoration: underline;
  border: none;
  background: none;
  padding: 0;
}

/* ─── Sidebar ─── */
.sidebar {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 158px;
}

.store-info {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.store-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.store-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e0e0e0;
}

.store-logo-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.store-details {
  flex: 1;
  min-width: 0;
}

.store-name {
  font-size: 14px;
  font-weight: 600;
  color: #27272a;
  text-decoration: none;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 13px;
  color: #27272a;
}

.chat-btn {
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}

/* Selected Variant */
.selected-variant {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #27272a;
}

.variant-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.variant-name-short {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.4;
}

/* Quantity & Price */
.quantity-price {
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.quantity-selector label {
  font-size: 14px;
  font-weight: 500;
  color: #27272a;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-controls button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.quantity-controls button:hover:not(:disabled) {
  background: #e9ecef;
}

.quantity-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.quantity-controls input {
  width: 48px;
  height: 32px;
  border: none;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background: white;
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #27272a;
}

.total-amount {
  font-weight: 700;
  font-size: 16px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.buy-now,
.add-cart,
.installment {
  border: none;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 100%;
}

.buy-now {
  background: #0a68ff;
  color: white;
}

.buy-now:hover {
  background: #0056cc;
}

.add-cart {
  background: white;
  color: #0a68ff;
  border: 1px solid #0a68ff;
}

.add-cart:hover {
  background: #f0f8ff;
}

.installment {
  background: white;
  color: #0a68ff;
  border: 1px solid #0a68ff;
}

.installment:hover {
  background: #f0f8ff;
}

/* Links */
.link {
  color: #0a68ff;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1024px) {
  .container {
    flex-wrap: wrap;
  }

  .image-gallery {
    width: 100%;
    position: static;
  }

  .sidebar {
    width: 100%;
  }

  .store-info {
    position: static;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .image-container {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
  }
}
</style>

<style>
/* ─── Dark mode ─── */
.dark .product-detail-page {
  background: #1a1a2e;
}

/* Gallery */
.dark .image-gallery {
  background: #16213e;
}

.dark .nav-btn {
  background: #1e293b;
  border-color: #334155;
}

.dark .nav-btn:hover:not(.disabled) {
  background: #1e3a5f;
  border-color: #0a68ff;
}

/* Product details card */
.dark .product-details {
  background: #16213e;
}

.dark .brand {
  color: #9ca3af;
}

.dark .product-title {
  color: #e5e7eb;
}

.dark .price {
  color: #e5e7eb;
}

.dark .variant-label {
  color: #e5e7eb;
}

.dark .variant-options>div {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

.dark .variant-options>div.active {
  border-color: #0a68ff;
  background: #1e3a5f;
}

/* Sections */
.dark .section {
  background: #16213e;
}

.dark .section h3 {
  color: #e5e7eb;
}

.dark .shipping-address {
  border-bottom-color: #334155;
  color: #d1d5db;
}

.dark .shipping-details {
  border-bottom-color: #334155;
}

.dark .shipping-fee {
  color: #d1d5db;
}

.dark .freeship-info {
  color: #9ca3af;
}

.dark .discount-header {
  color: #d1d5db;
}

.dark .code {
  background: rgba(208, 1, 27, 0.15);
  color: #fca5a5;
  border-color: #fca5a5;
}

.dark .service-item {
  border-bottom-color: #334155;
}

.dark .service-content {
  color: #d1d5db;
}

/* Similar products */
.dark .product-card a {
  border-color: #334155;
}

.dark .product-image {
  background: #1e293b;
}

.dark .product-card-info h4 {
  color: #d1d5db;
}

.dark .card-price {
  color: #d1d5db;
}

.dark .dot {
  background: rgba(255, 255, 255, 0.15);
}

.dark .dot.active {
  background: #0a68ff;
}

/* Benefits */
.dark .benefit-item {
  border-bottom-color: #334155;
  color: #d1d5db;
}

/* Specs */
.dark .spec-row {
  border-bottom-color: #334155;
}

.dark .spec-label {
  color: #9ca3af;
}

.dark .spec-value {
  color: #d1d5db;
}

/* Description */
.dark .description {
  color: #d1d5db;
}

/* Sidebar */
.dark .store-info {
  background: #16213e;
}

.dark .store-header {
  border-bottom-color: #334155;
}

.dark .store-logo {
  border-color: #475569;
}

.dark .store-logo-placeholder {
  background: #334155;
}

.dark .store-name {
  color: #e5e7eb;
}

.dark .store-rating {
  color: #d1d5db;
}

.dark .chat-btn {
  background: #1e293b;
  border-color: #334155;
}

.dark .selected-variant {
  border-bottom-color: #334155;
  color: #d1d5db;
}

.dark .variant-image {
  border-color: #475569;
}

.dark .quantity-price {
  border-bottom-color: #334155;
}

.dark .quantity-selector label {
  color: #d1d5db;
}

.dark .quantity-controls {
  border-color: #475569;
}

.dark .quantity-controls button {
  background: #1e293b;
  color: #e5e7eb;
}

.dark .quantity-controls button:hover:not(:disabled) {
  background: #334155;
}

.dark .quantity-controls input {
  background: #0f172a;
  color: #e5e7eb;
  border-left-color: #475569;
  border-right-color: #475569;
}

.dark .total-price {
  color: #d1d5db;
}

.dark .add-cart,
.dark .installment {
  background: transparent;
  color: #60a5fa;
  border-color: #60a5fa;
}

.dark .add-cart:hover,
.dark .installment:hover {
  background: rgba(96, 165, 250, 0.1);
}

.dark .warranty-info {
  color: #d1d5db;
}
</style>
