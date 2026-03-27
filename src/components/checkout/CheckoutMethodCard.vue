<template>
  <!-- checkout/method — Figma node 9363:63124 (1.2.0 Checkout-Components) -->
  <!-- Shell reserves top padding so the favourite row is not positioned with negative top (avoids clipping by overflow-y ancestors). -->
  <div
    class="checkout-method-card-shell"
    :class="{ 'checkout-method-card-shell--has-badge': showBadgeRow }"
  >
    <div v-if="showBadgeRow" class="checkout-method-card__favourite">
      <div class="checkout-method-card__favourite-cluster">
        <span class="checkout-method-card__favourite-text" :title="resolvedBadgeLabel">{{ resolvedBadgeLabel }}</span>
        <v-tooltip
          v-if="favouriteTooltip"
          location="bottom"
          :open-delay="150"
          class="checkout-method-card__favourite-tooltip-host checkout-method-card__favourite-tooltip-activator"
        >
          <template #activator="{ props: tipActivatorProps }">
            <button
              type="button"
              class="checkout-method-card__favourite-help"
              v-bind="tipActivatorProps"
              :aria-label="favouriteTooltipAria"
            >
              <v-icon class="checkout-method-card__favourite-icon" size="16" aria-hidden="true">
                mdi-information-outline
              </v-icon>
            </button>
          </template>
          <span class="checkout-method-card__favourite-tooltip-text">{{ favouriteTooltip }}</span>
        </v-tooltip>
      </div>
    </div>

    <div
      class="checkout-method-card"
      :class="{ 'checkout-method-card--restricted': restricted }"
    >
    <div class="checkout-method-card__main">
      <div class="checkout-method-card__logo-wrap">
        <slot name="logo">
          <div class="checkout-method-card__logo-figma" data-name="Logo">
            <div class="checkout-method-card__logo-inner">
              <img
                :src="spinnerBackgroundUrl"
                alt=""
                class="checkout-method-card__spinner-bg"
                width="22"
                height="22"
              />
              <img
                :src="spinningPartUrl"
                alt=""
                class="checkout-method-card__spinner-arc"
                width="21"
                height="12"
              />
            </div>
          </div>
        </slot>
      </div>

      <div class="checkout-method-card__texts">
        <div class="checkout-method-card__title">{{ title }}</div>
        <div v-if="subtitle" class="checkout-method-card__subtitle">{{ subtitle }}</div>
      </div>

      <div v-if="price != null && price !== ''" class="checkout-method-card__price">{{ price }}</div>

      <v-tooltip
        v-if="reasonTrailingTooltip"
        location="bottom"
        :open-delay="150"
        class="checkout-method-card__favourite-tooltip-host"
      >
        <template #activator="{ props: reasonTipProps }">
          <button
            type="button"
            class="checkout-method-card__favourite-help checkout-method-card__trailing-reason-btn"
            v-bind="reasonTipProps"
            aria-label="Restriction reason"
          >
            <v-icon class="checkout-method-card__favourite-icon" size="20" aria-hidden="true">
              mdi-information-outline
            </v-icon>
          </button>
        </template>
        <span class="checkout-method-card__favourite-tooltip-text">{{ reasonTrailingTooltip }}</span>
      </v-tooltip>
      <v-icon
        v-else-if="!restricted"
        class="checkout-method-card__chevron"
        size="20"
        aria-hidden="true"
      >
        mdi-chevron-right
      </v-icon>
    </div>

    <div v-if="showPartnerStrip" class="checkout-method-card__partners" data-name="Grouped methods">
      <slot name="partners">
        <div
          v-for="(p, i) in defaultPartnerItems"
          :key="i"
          class="checkout-method-card__partner"
        >
          <div class="checkout-method-card__partner-bg" :style="{ background: p.bg }">
            <img :src="p.src" alt="" class="checkout-method-card__partner-img" />
          </div>
        </div>
      </slot>
    </div>

    <p v-if="description" class="checkout-method-card__description">{{ description }}</p>

    <div v-if="resolvedImageSrc" class="checkout-method-card__image-wrap" data-name="image">
      <v-img
        :src="resolvedImageSrc"
        :alt="imageAlt"
        height="120"
        cover
        class="checkout-method-card__image"
      />
    </div>

    <div v-if="placeTitle || placeAddress || placeAdditional" class="checkout-method-card__place">
      <div v-if="placeTitle" class="checkout-method-card__place-title">{{ placeTitle }}</div>
      <div v-if="placeAddress" class="checkout-method-card__place-address">{{ placeAddress }}</div>
      <div v-if="placeAdditional" class="checkout-method-card__place-additional">{{ placeAdditional }}</div>
    </div>

    <div v-if="showInput" class="checkout-method-card__field">
      <Label v-if="inputLabel" class="checkout-method-card__input-label">
        <span>{{ inputLabel }}</span>
        <template v-if="inputOptional">
          <span class="checkout-method-card__label-muted"> • </span>
          <span class="checkout-method-card__label-muted">{{ optionalLabel }}</span>
        </template>
        <span v-if="inputRequired" class="checkout-method-card__label-required">*</span>
      </Label>
      <v-text-field
        v-model="inputModel"
        class="checkout-method-card__input checkout-method-card__figma-input"
        density="compact"
        variant="outlined"
        hide-details="auto"
        :placeholder="inputPlaceholder"
      />
    </div>

    <div
      v-if="showAlert && (alertTitle || alertText)"
      class="checkout-method-card__figma-alert"
      role="status"
    >
      <img
        :src="infoIconUrl"
        alt=""
        class="checkout-method-card__alert-leading-icon"
        width="24"
        height="24"
      />
      <div class="checkout-method-card__alert-copy">
        <p v-if="alertTitle" class="checkout-method-card__alert-title">{{ alertTitle }}</p>
        <p v-if="alertText" class="checkout-method-card__alert-body">{{ alertText }}</p>
      </div>
    </div>

    <v-btn
      v-if="buttonLabel"
      color="primary"
      block
      class="checkout-method-card__cta"
      height="40"
    >
      {{ buttonLabel }}
    </v-btn>

    <div v-if="expressLabel || expressValue || expressAdditional" class="checkout-method-card__express">
      <div v-if="expressLabel" class="checkout-method-card__express-label">{{ expressLabel }}</div>
      <div v-if="expressValue" class="checkout-method-card__express-value">{{ expressValue }}</div>
      <div v-if="expressAdditional" class="checkout-method-card__express-additional">{{ expressAdditional }}</div>
    </div>

    <button
      v-if="changeLinkText"
      type="button"
      class="checkout-method-card__link"
      @click="$emit('click-change')"
    >
      {{ changeLinkText }}
    </button>
    </div>
  </div>
</template>

<script>
import Label from '@/components/common/Label.vue';
import {
  spinnerBackground,
  spinningPart,
  heroImage,
  infoIcon,
  defaultPartnerLogos
} from '@/components/checkout/checkoutMethodFigmaAssets.js';

export default {
  name: 'CheckoutMethodCard',
  components: { Label },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    price: { type: String, default: '' },
    /** @deprecated Use checkoutBadgeMode === 'favourite' */
    showFavourite: { type: Boolean, default: false },
    /** none | favourite | promoted | recommended | legal */
    checkoutBadgeMode: {
      type: String,
      default: 'none',
      validator: (v) => ['none', 'favourite', 'promoted', 'recommended', 'legal'].includes(v)
    },
    /** Custom one-line label; when empty, a default per mode is used. */
    checkoutBadgeLabel: { type: String, default: '' },
    favouriteLabel: { type: String, default: 'Your favourite' },
    /** Tooltip copy next to the info icon (Figma info / Blue 50 surface). Set to empty string to hide tooltip. */
    favouriteTooltip: {
      type: String,
      default:
        'This delivery method is saved as your favourite based on your last order.'
    },
    /** Accessible name for the info control when tooltip is shown. */
    favouriteTooltipAria: { type: String, default: 'More about your favourite method' },
    description: { type: String, default: '' },
    /** When empty, uses hero PNG from Figma export (get_design_context). */
    imageSrc: { type: String, default: '' },
    /** When true and imageSrc is empty, do not fall back to the default hero image. */
    hideDefaultHeroImage: { type: Boolean, default: false },
    showPartnerStrip: { type: Boolean, default: true },
    imageAlt: { type: String, default: '' },
    placeTitle: { type: String, default: '' },
    placeAddress: { type: String, default: '' },
    placeAdditional: { type: String, default: '' },
    showInput: { type: Boolean, default: false },
    inputLabel: { type: String, default: '' },
    inputOptional: { type: Boolean, default: false },
    optionalLabel: { type: String, default: 'Optional' },
    inputRequired: { type: Boolean, default: false },
    inputPlaceholder: { type: String, default: '' },
    modelValue: { type: String, default: '' },
    showAlert: { type: Boolean, default: false },
    alertTitle: { type: String, default: '' },
    alertText: { type: String, default: '' },
    buttonLabel: { type: String, default: '' },
    expressLabel: { type: String, default: '' },
    expressValue: { type: String, default: '' },
    expressAdditional: { type: String, default: '' },
    changeLinkText: { type: String, default: '' },
    /** Restriction preview: gray fill + optional disabled styling from parent */
    restricted: { type: Boolean, default: false },
    /**
     * When set, replaces the trailing chevron with an info control + tooltip (restriction reason).
     */
    reasonTrailingTooltip: { type: String, default: '' }
  },
  emits: ['click-change', 'update:modelValue'],
  data() {
    return {
      spinnerBackgroundUrl: spinnerBackground,
      spinningPartUrl: spinningPart,
      infoIconUrl: infoIcon,
      defaultHeroUrl: heroImage,
      defaultPartnerItems: defaultPartnerLogos
    };
  },
  computed: {
    resolvedBadgeMode() {
      if (this.checkoutBadgeMode && this.checkoutBadgeMode !== 'none') {
        return this.checkoutBadgeMode;
      }
      if (this.showFavourite) return 'favourite';
      return 'none';
    },
    showBadgeRow() {
      return this.resolvedBadgeMode !== 'none';
    },
    resolvedBadgeLabel() {
      const custom = (this.checkoutBadgeLabel || '').trim();
      if (custom) return custom;
      if (this.resolvedBadgeMode === 'favourite' && (this.favouriteLabel || '').trim()) {
        return this.favouriteLabel.trim();
      }
      const defaults = {
        favourite: 'Your favourite',
        promoted: 'Promoted',
        recommended: 'Recommended',
        legal: 'Legal information'
      };
      return defaults[this.resolvedBadgeMode] || '';
    },
    resolvedImageSrc() {
      if (this.hideDefaultHeroImage && !this.imageSrc) return '';
      return this.imageSrc || this.defaultHeroUrl;
    },
    inputModel: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit('update:modelValue', v);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.checkout-method-card-shell {
  position: relative;
  max-width: 100%;
  box-sizing: border-box;
  font-family: 'Proxima Vara', tokens.$font-family-base, sans-serif;
  font-feature-settings: 'case', 'lnum', 'pnum';
  padding-top: 0;
}
.checkout-method-card-shell--has-badge {
  padding-top: 14px;
}

// Figma: white surface, #E2E2E2 border, 8px radius, px 12 py 10, gap 12
.checkout-method-card {
  position: relative;
  font-family: 'Proxima Vara', tokens.$font-family-base, sans-serif;
  font-feature-settings: 'case', 'lnum', 'pnum';
  overflow: visible;
  background: tokens.$color-gray-0;
  border: 1px solid tokens.$color-gray-100;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
}

.checkout-method-card--restricted {
  background: tokens.$color-gray-25;
}

.checkout-method-card__trailing-reason-btn {
  flex-shrink: 0;
}
.checkout-method-card__favourite {
  position: absolute;
  left: 44px;
  top: 0;
  right: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 2px 6px;
  border-radius: 0 0 4px 4px;
  z-index: 1;
  box-sizing: border-box;
  min-width: 0;
}

/* Full row width so label can use space up to the info icon (ellipsis only when needed). */
.checkout-method-card__favourite-cluster {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-width: 0;
}

.checkout-method-card__favourite-tooltip-activator {
  flex-shrink: 0;
}

.checkout-method-card__favourite-text {
  font-size: 13px;
  background: tokens.$color-gray-0;
  line-height: 16px;
  letter-spacing: 0.15px;
  color: tokens.$color-gray-600; // Text/Black/Tertiary #5E5E5E
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  font-weight: 500;
  font-variation-settings: 'wght' 515, 'wdth' 100;
}
.checkout-method-card__favourite-help {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: help;
  flex-shrink: 0;
  line-height: 0;
  border-radius: 2px;
  color: tokens.$color-gray-600;
  &:focus-visible {
    outline: 2px solid tokens.$color-gray-600;
    outline-offset: 2px;
  }
}
.checkout-method-card__favourite-icon {
  color: tokens.$color-gray-600 !important;
  flex-shrink: 0;
}
// Tooltip matches “Your favourite” typography colour (Text/Black/Tertiary) on a neutral surface.
.checkout-method-card__favourite-tooltip-host :deep(.v-overlay__content) {
  background: tokens.$color-gray-0 !important;
  color: tokens.$color-gray-600 !important;
  border: 1px solid tokens.$color-gray-100 !important;
  border-radius: 4px !important;
  padding: 8px 12px !important;
  max-width: min(280px, calc(100vw - 32px)) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  font-family: 'Proxima Vara', tokens.$font-family-base, sans-serif !important;
  font-feature-settings: 'case', 'lnum', 'pnum' !important;
}
.checkout-method-card__favourite-tooltip-text {
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.1px;
  color: tokens.$color-gray-600;
  display: block;
}

.checkout-method-card__main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  width: 100%;
}
.checkout-method-card__logo-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
}
.checkout-method-card__logo-figma {
  border-radius: 4px;
  overflow: hidden;
}
.checkout-method-card__logo-inner {
  position: relative;
  width: 32px;
  height: 32px;
  padding: 4px;
  box-sizing: border-box;
}
.checkout-method-card__spinner-bg {
  display: block;
  width: 22px;
  height: 22px;
}
.checkout-method-card__spinner-arc {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 20.485px;
  height: 12px;
  display: block;
}
.checkout-method-card__texts {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
}
// Title: 15px / 20px, weight 635
.checkout-method-card__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.08px;
  color: tokens.$color-gray-900;
}
.checkout-method-card__subtitle {
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: tokens.$color-green-600;
}
.checkout-method-card__price {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.08px;
  color: tokens.$color-gray-900;
  text-align: right;
  white-space: nowrap;
  flex-shrink: 0;
}
.checkout-method-card__chevron {
  flex-shrink: 0;
  color: tokens.$color-gray-600;
  opacity: 0.85;
}

.checkout-method-card__partners {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  width: 100%;
}
.checkout-method-card__partner {
  flex-shrink: 0;
}
.checkout-method-card__partner-bg {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkout-method-card__partner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.checkout-method-card__description {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: tokens.$color-gray-600;
}

.checkout-method-card__image-wrap {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #c6c6c6;
}
.checkout-method-card__image {
  border-radius: 6px;
}

.checkout-method-card__place {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 15px;
  line-height: 20px;
}
.checkout-method-card__place-title {
  font-weight: 600;
  letter-spacing: 0.08px;
  color: tokens.$color-gray-900;
}
.checkout-method-card__place-address {
  font-weight: 500;
  letter-spacing: 0.1px;
  color: tokens.$color-gray-900;
}
.checkout-method-card__place-additional {
  font-weight: 500;
  letter-spacing: 0.1px;
  color: tokens.$color-gray-600;
}

.checkout-method-card__field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.checkout-method-card__input-label {
  margin-bottom: 0;
}
.checkout-method-card__label-muted {
  color: tokens.$color-gray-600;
  font-weight: 500;
}
.checkout-method-card__label-required {
  color: #ba192a;
  font-weight: 500;
}
.checkout-method-card__input {
  max-width: 256px;
}

// Figma: border #757575, 40px height, inset shadow (node 9848+ text input)
.checkout-method-card__figma-input :deep(.v-field__outline) {
  border-color: #757575 !important;
}
.checkout-method-card__figma-input :deep(.v-field__outline__start) {
  border-radius: 4px 0 0 4px;
}
.checkout-method-card__figma-input :deep(.v-field__outline__end) {
  border-radius: 0 4px 4px 0;
}
.checkout-method-card__figma-input :deep(.v-field__field) {
  min-height: 40px;
  padding-inline: 8px;
  box-shadow:
    inset 0 1px 1.5px rgba(0, 0, 0, 0.06),
    inset 0 2px 3.5px rgba(0, 0, 0, 0.02),
    inset 0 4px 5px rgba(0, 0, 0, 0.04);
}
.checkout-method-card__figma-input :deep(.v-field__input) {
  font-size: 18px;
  font-weight: 400;
  line-height: 26px;
  letter-spacing: 0.05px;
}

/* Alert: Figma node 9848:10015 — bg #e5f1fe, left 4px #09629d */
.checkout-method-card__figma-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  background: #e5f1fe;
  border-left: 4px solid #09629d;
  box-sizing: border-box;
}
.checkout-method-card__alert-leading-icon {
  flex-shrink: 0;
  display: block;
}
.checkout-method-card__alert-copy {
  flex: 1 1 auto;
  min-width: 0;
  color: #021d35;
  font-size: 15px;
  line-height: 20px;
}
.checkout-method-card__alert-title {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.08px;
  color: #054979;
}
.checkout-method-card__alert-body {
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.1px;
  color: #021d35;
}
.checkout-method-card__alert-title + .checkout-method-card__alert-body {
  margin-top: 0;
}

// Primary button: green gradient
.checkout-method-card__cta {
  background: linear-gradient(180deg, tokens.$color-green-500 0%, tokens.$color-green-600 100%) !important;
  border: 1px solid tokens.$color-green-900 !important;
  color: #fff !important;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.15px;
  text-transform: none;
  border-radius: 4px;
}

.checkout-method-card__express {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 15px;
  line-height: 20px;
  font-weight: 500;
  letter-spacing: 0.1px;
}
.checkout-method-card__express-label {
  color: tokens.$color-gray-600;
}
.checkout-method-card__express-value {
  color: tokens.$color-gray-900;
  white-space: pre-wrap;
}
.checkout-method-card__express-additional {
  color: tokens.$color-gray-600;
}

.checkout-method-card__link {
  align-self: flex-start;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: #09629d;
  text-decoration: underline;
  text-align: left;
}
.checkout-method-card__link:hover {
  text-decoration-thickness: 2px;
}
</style>
