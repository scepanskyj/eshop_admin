<template>
  <div class="page-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs" title="Payment fee" />

    <StickyActionsBar>
      <v-btn text @click="onReset">Reset</v-btn>
      <v-btn color="primary" @click="onSave">Save</v-btn>
    </StickyActionsBar>

    <v-card outlined class="mb-6">
      <v-card-title class="section-heading">General Settings</v-card-title>
      <v-divider />
      <v-card-text>
        <div class="field-block">
          <div class="control-label">Payment Fee Status</div>
          <div class="switch-control">
            <span class="switch-state" :class="{ 'switch-state--on': form.enabled }">
              {{ form.enabled ? 'Enabled' : 'Disabled' }}
            </span>
            <v-switch
              v-model="form.enabled"
              inset
              hide-details
              class="state-switch"
            />
          </div>
          <v-alert type="info" dense outlined class="mt-2 memo-alert">
            Changes take effect after saving.
          </v-alert>
        </div>

        <div class="field-block">
          <div class="control-label">Title</div>
          <v-text-field
            class="form-field"
            outlined
            v-model="form.title"
            placeholder="Payment Fee"
            hint="Displayed label shown to shoppers"
            persistent-hint
            hide-details="auto"
          />
        </div>

        <div class="field-block">
          <v-checkbox
            v-model="form.showDescription"
            label="Show description in checkout"
            hide-details
          />
        </div>

        <div class="field-block">
          <div class="control-label">Totals Sort Order</div>
          <v-text-field
            class="form-field"
            outlined
            v-model.number="form.totalsSortOrder"
            type="number"
            placeholder="35"
            hint="Position within order totals summary"
            persistent-hint
            hide-details="auto"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-expand-transition>
      <div>
        <v-card outlined class="mb-6" :class="{ 'card-disabled': !form.enabled }">
          <v-card-title class="section-heading">Payment Fee Settings</v-card-title>
          <v-divider />
          <v-card-text>
            <div class="field-block">
              <div class="control-label">Price Type</div>
              <v-select
                class="form-field"
                outlined
                v-model="form.priceType"
                :items="['Fixed price', 'Percent']"
                placeholder="Select price type"
                hint="Choose how the fee amount is calculated"
                persistent-hint
                hide-details="auto"
              />
            </div>

            <div class="field-flex">
              <div class="field-block">
                <div class="control-label">Minimum Order Amount</div>
                <v-text-field
                  class="form-field"
                  outlined
                  v-model.number="form.minAmount"
                  type="number"
                  placeholder="0"
                  hint="Minimum order amount to apply Payment Fee"
                  persistent-hint
                  hide-details="auto"
                />
              </div>
              <div class="field-block">
                <div class="control-label">Maximum Order Amount</div>
                <v-text-field
                  class="form-field"
                  outlined
                  v-model.number="form.maxAmount"
                  type="number"
                  placeholder="9999"
                  hint="Maximum order amount to apply Payment Fee"
                  persistent-hint
                  hide-details="auto"
                />
              </div>
            </div>

            <div class="field-block">
              <v-checkbox
                v-model="form.refundable"
                label="Refund fee when order is refunded"
                hide-details
              />
            </div>

            <div class="field-block">
              <div class="control-label">Payment Method Fee</div>
              <v-simple-table class="fee-table">
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th class="text-right" style="width: 150px">Fee Amount</th>
                    <th class="text-right" style="width: 80px">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in form.feeMatrix" :key="idx">
                    <td>
              <v-autocomplete
                class="form-field"
                outlined
                :items="methodOptions"
                v-model="row.methodCode"
                item-text="label"
                item-value="value"
                placeholder="Select payment method"
                hide-details="auto"
                dense
                clearable
              />
                    </td>
                    <td class="text-right">
                      <v-text-field
                        class="form-field"
                        outlined
                        v-model.number="row.amount"
                        type="number"
                        placeholder="0.00"
                        hint="Amount added when this method is selected"
                        persistent-hint
                        dense
                        hide-details="auto"
                      />
                    </td>
                    <td class="text-right">
                      <v-btn icon @click="form.feeMatrix.splice(idx, 1)">
                        <v-icon color="red">mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="!form.feeMatrix.length">
                    <td colspan="3" class="text-center grey--text text--darken-1 py-4">
                      No payment fee rows defined.
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
              <v-btn small color="secondary" class="mt-2 add-fee-btn" @click="addFeeRow">
                <v-icon left>mdi-plus</v-icon>
                Add Fee
              </v-btn>
            </div>

            <div class="field-block">
              <div class="control-label">Apply Payment Fee for Specific Customers</div>
              <v-select
                class="form-field"
                outlined
                v-model="form.segments"
                :items="segmentsOptions"
                multiple
                chips
                item-text="label"
                item-value="value"
                placeholder="Select customer groups"
                hint="Assign fee to selected customer groups"
                persistent-hint
                hide-details="auto"
              />
            </div>
          </v-card-text>
        </v-card>

        <v-card outlined :class="{ 'card-disabled': !form.enabled }">
          <v-card-title class="section-heading">Tax Settings</v-card-title>
          <v-divider />
          <v-card-text>
            <div class="field-block">
              <v-checkbox
                v-model="form.tax.calculate"
                label="Calculate tax on payment fee"
                hide-details
              />
            </div>
            <div class="field-block">
              <v-checkbox
                v-model="form.tax.included"
                label="Fee already includes tax"
                hide-details
              />
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-expand-transition>

    <v-snackbar v-model="snackbar.show">
      {{ snackbar.text }}
      <v-btn text @click="snackbar.show=false">Close</v-btn>
    </v-snackbar>
  </div>
 </template>

<script>
import StickyActionsBar from '@/components/common/StickyActionsBar.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import store from '@/store/paymentsStore';

export default {
  name: 'PaymentFee',
  components: { StickyActionsBar, PageHeader },
  data() {
    return {
      form: JSON.parse(JSON.stringify(store.state.fee)),
      original: JSON.parse(JSON.stringify(store.state.fee)),
      snackbar: { show: false, text: '' },
      suspendDirty: true
    };
  },
  created() {
    this.$nextTick(() => { this.suspendDirty = false; });
  },
  computed: {
    breadcrumbs() { return [ { text: 'Payment methods', disabled: true }, { text: 'Payment fee', disabled: true } ]; },
    methodOptions() {
      const base = (store.state.gateways || []).map(g => ({ label: `${g.title || g.code} - ${g.code}`, value: g.code }));
      const extras = [
        'No Payment Information Required - free',
        'Credit Card - payflowpro',
        'PayPal Express Checkout - paypal_express',
        'PayPal Payflow Link - payflow_link',
        'Google Pay - google_pay',
        'Apple Pay - apple_pay',
        'Amazon Pay - amazon_payment',
        'Bank Transfer Payment - banktransfer',
        'Cash on Delivery - cashondelivery'
      ].map(item => {
        const [label, value] = item.split(' - ');
        return { label: item, value: value || label };
      });
      const map = new Map();
      [...base, ...extras].forEach(opt => {
        if (!map.has(opt.value)) map.set(opt.value, opt);
      });
      return Array.from(map.values());
    },
    segmentsOptions() {
      return [
        { label: 'NOT LOGGED IN', value: 'not_logged_in' },
        { label: 'General', value: 'general' },
        { label: 'Wholesale', value: 'wholesale' },
        { label: 'Retailer', value: 'retailer' },
        { label: 'Limited account', value: 'limited_account' },
        { label: 'Full account', value: 'full_account' },
        { label: 'No group', value: 'no_group' },
        { label: 'Offline account', value: 'offline_account' },
        { label: 'Terminated account', value: 'terminated_account' }
      ];
    }
  },
  watch: {
    form: {
      deep: true,
      handler() {
        if (this.suspendDirty) return;
        store.dirty.set('feeForm', true);
      }
    }
  },
  methods: {
    addFeeRow() { this.form.feeMatrix.push({ methodCode: '', amount: 0 }); },
    onReset() {
      this.suspendDirty = true;
      this.form = JSON.parse(JSON.stringify(this.original));
      store.dirty.clear('feeForm');
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    onSave() {
      store.actions.updateFee(this.form);
      this.original = JSON.parse(JSON.stringify(this.form));
      this.suspendDirty = true;
      store.dirty.clear('feeForm');
      this.$nextTick(() => { this.suspendDirty = false; });
      this.snackbar = { show: true, text: 'Fee configuration saved' };
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;
@use '@/styles/form-fields.scss';

.page-wrapper {
  padding: tokens.$space-md;
}

.section-heading {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}


.field-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.field-flex .field-block {
  flex: 1 1 240px;
  margin-bottom: 0;
}

.field-block :deep(.v-input),
.field-flex :deep(.v-input) {
  max-width: 640px;
}


.switch-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-state {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
  min-width: 76px;
}

.switch-state--on {
  color: #2e7d32;
}

.state-switch {
  margin: 0;
}

.memo-alert {
  max-width: 320px;
  padding: 8px 12px;
}

.card-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.add-fee-btn {
  align-self: flex-start;
}

.fee-table {
  margin-top: 8px;
}

.fee-table tbody tr + tr {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.fee-table tbody tr td {
  padding-top: 16px;
  padding-bottom: 16px;
}

.fee-table tbody tr:first-child td {
  padding-top: 8px;
}

.fee-table tbody tr:last-child td {
  padding-bottom: 8px;
}

.fee-table tbody tr td:first-child,
.fee-table tbody tr td:nth-child(2) {
  padding-right: 16px;
}
</style>


