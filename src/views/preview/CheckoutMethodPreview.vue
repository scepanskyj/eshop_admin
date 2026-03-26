<template>
  <div class="checkout-method-preview-page">
    <PageHeader
      :breadcrumbs="breadcrumbs"
      title="Checkout method (Figma preview)"
    />

    <p class="checkout-method-preview-page__hint">
      Local preview only — hash route:
      <code>#/preview/checkout-method</code>
    </p>

    <div class="checkout-method-preview-page__frame">
      <CheckoutMethodCard
        title="Pharmacy delivery"
        subtitle="Tomorrow by 13:00"
        price="0.49 €"
        show-favourite
        favourite-tooltip="We remember this option from your last checkout so you can pick it faster."
        :description="demoDescription"
        image-alt="Customer collecting a parcel from a locker"
        place-title="Pharmacy"
        place-address="ul. Bolesława Limowskiego 12"
        place-additional="Additional text"
        show-input
        input-label="Label text"
        :input-optional="true"
        :input-required="true"
        input-placeholder="Input value"
        v-model="demoInput"
        show-alert
        alert-title="This is an info alert."
        alert-text="Let the user know what he need to be informed about."
        button-label="Button label"
        express-label="Datum a čas doručení"
        express-value="Úterý, 18. 2. 2025 (zítra)       10:00 - 12:00"
        express-additional="Additional text"
        change-link-text="Change pharmacy"
        @click-change="onChangePharmacy"
      />
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/common/PageHeader.vue';
import CheckoutMethodCard from '@/components/checkout/CheckoutMethodCard.vue';

export default {
  name: 'CheckoutMethodPreview',
  components: { PageHeader, CheckoutMethodCard },
  data() {
    return {
      demoInput: '',
      demoDescription:
        'paga gli acquisiti tra 30€ e 2000€ in 3 rate senza interessi con PayPal. TAEG 0%',
      breadcrumbs: [
        { title: 'Payment section', disabled: true },
        { title: 'Preview', disabled: true },
        { title: 'Checkout method', disabled: true }
      ]
    };
  },
  methods: {
    onChangePharmacy() {
      window.alert('Change pharmacy (preview)');
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.checkout-method-preview-page {
  padding: tokens.$page-padding;
  max-width: 520px;
}

.checkout-method-preview-page__hint {
  font: tokens.$text-p2;
  color: tokens.$color-text-tertiary;
  margin-bottom: tokens.$space-md;

  code {
    font-size: 0.95em;
  }
}

.checkout-method-preview-page__frame {
  max-width: 400px;
}
</style>
