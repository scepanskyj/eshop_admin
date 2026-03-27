<template>
  <div class="restriction-methods-preview">
    <p v-if="!gateways.length" class="restriction-methods-preview__empty">
      No payment methods for this country.
    </p>
    <div v-else class="restriction-methods-preview__scroll">
      <div class="restriction-methods-preview__stack">
        <div
          v-for="gw in gateways"
          :key="gw.code"
          class="restriction-preview-card-wrap"
          :class="wrapClasses(gw)"
        >
          <CheckoutMethodCard
            :title="gw.title || gw.code"
            :description="descriptionForGateway(gw)"
            :price="priceForGateway(gw)"
            :checkout-badge-mode="gw.checkoutBadgeMode || 'none'"
            :checkout-badge-label="gw.checkoutBadgeLabel || ''"
            :favourite-tooltip="tooltipForGateway(gw)"
            favourite-tooltip-aria="More about this label"
            :show-partner-strip="false"
            hide-default-hero-image
            :restricted="restrictedPreview(gw)"
            :reason-trailing-tooltip="reasonTrailingTooltipForGateway(gw)"
          >
            <template v-if="iconSrcForGateway(gw)" #logo>
              <div class="checkout-method-card__logo-figma" data-name="Logo">
                <div class="checkout-method-card__logo-inner">
                  <img
                    :src="iconSrcForGateway(gw)"
                    alt=""
                    class="payment-method-preview-icon-img"
                    width="32"
                    height="32"
                  />
                </div>
              </div>
            </template>
          </CheckoutMethodCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CheckoutMethodCard from '@/components/checkout/CheckoutMethodCard.vue';
import { resolveWebCheckoutIcon } from '@/utils/paymentMethodWebIcon';
import tenantStore from '@/store/tenantStore';

export default {
  name: 'RestrictionMethodsListPreview',
  components: { CheckoutMethodCard },
  props: {
    gateways: {
      type: Array,
      default: () => []
    },
    /** Payment method codes targeted by this restriction */
    restrictedCodes: {
      type: Array,
      default: () => []
    },
    reason: {
      type: String,
      default: ''
    },
    showWhenApplied: {
      type: Boolean,
      default: false
    },
    showInTooltip: {
      type: Boolean,
      default: false
    },
    /** When true, treat the rule as matching so restricted methods show customer-facing state */
    assumeRuleApplies: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    restrictedSet() {
      return new Set(this.restrictedCodes || []);
    },
    reasonPlain() {
      const raw = this.reason || '';
      if (!raw) return '';
      return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    },
    tenantCode() {
      return (tenantStore.state.current || '').toUpperCase();
    }
  },
  methods: {
    isRestricted(code) {
      return this.restrictedSet.has(code);
    },
    restrictedPreview(gw) {
      return this.isRestricted(gw.code) && this.assumeRuleApplies;
    },
    wrapClasses(gw) {
      return {
        'restriction-preview-card-wrap--free-price': this.priceIsGreenForGateway(gw)
      };
    },
    iconSrcForGateway(gw) {
      return resolveWebCheckoutIcon(gw, { disabled: this.restrictedPreview(gw) });
    },
    reasonTrailingTooltipForGateway(gw) {
      if (
        !this.restrictedPreview(gw) ||
        !this.showWhenApplied ||
        !this.reasonPlain ||
        !this.showInTooltip
      ) {
        return '';
      }
      return this.reasonPlain;
    },
    tooltipForGateway(gw) {
      if (!gw?.checkoutBadgeTooltipEnabled) return '';
      return (gw.checkoutBadgeTooltip || '').trim();
    },
    feeConfigured(gw) {
      if (!gw?.feeEnabled || !gw?.feeSettings) return false;
      const amt = Number(gw.feeSettings.amount);
      return !Number.isNaN(amt) && amt > 0;
    },
    /** Mirrors payment method detail checkout preview pricing. */
    priceLineForGateway(gw) {
      if (this.feeConfigured(gw)) {
        const amt = Number(gw.feeSettings.amount);
        const code = gw.currency || 'EUR';
        try {
          return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(amt);
        } catch {
          return String(amt);
        }
      }
      const cc = this.tenantCode;
      const freeMap = {
        CZ: 'Zdarma',
        SK: 'Zadarmo',
        PL: '',
        RO: 'Gratis',
        IT: 'Gratis'
      };
      if (Object.prototype.hasOwnProperty.call(freeMap, cc)) {
        return freeMap[cc];
      }
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: gw.currency || 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(0);
      } catch {
        return '0.00 €';
      }
    },
    priceIsGreenForGateway(gw) {
      if (this.restrictedPreview(gw) || this.feeConfigured(gw)) return false;
      const cc = this.tenantCode;
      return ['CZ', 'SK', 'RO', 'IT'].includes(cc);
    },
    priceForGateway(gw) {
      if (this.restrictedPreview(gw)) return '';
      return this.priceLineForGateway(gw);
    },
    descriptionForGateway(gw) {
      if (!this.restrictedPreview(gw)) return gw.description || '';
      if (this.showWhenApplied && this.reasonPlain && !this.showInTooltip) return this.reasonPlain;
      return gw.description || '';
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.restriction-methods-preview__empty {
  font: tokens.$text-p2;
  color: tokens.$color-text-tertiary;
  margin: 0;
}

.restriction-methods-preview__scroll {
  max-height: min(70vh, 720px);
  overflow-y: auto;
  padding-right: 2px;
  margin-right: -2px;
}

.restriction-methods-preview__stack {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
}

.restriction-preview-card-wrap {
  min-width: 328px;
  max-width: 400px;
}

.restriction-preview-card-wrap :deep(.checkout-method-card__logo-inner) {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.restriction-preview-card-wrap :deep(.payment-method-preview-icon-img) {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.restriction-preview-card-wrap--free-price :deep(.checkout-method-card__price) {
  color: tokens.$color-green-600;
}

.restriction-preview-card-wrap :deep(.checkout-method-card--restricted .checkout-method-card__title) {
  color: tokens.$color-gray-600;
}
</style>
