import Vue from 'vue';
import Router from 'vue-router';

import PaymentMethodsOverview from '@/views/payments/PaymentMethodsOverview.vue';
import GatewaysList from '@/views/payments/GatewaysList.vue';
import GatewayDetail from '@/views/payments/GatewayDetail.vue';
import PaymentMethodDetail from '@/views/payments/PaymentMethodDetail.vue';
import PaymentRestrictions from '@/views/payments/PaymentRestrictions.vue';
import PaymentFee from '@/views/payments/PaymentFee.vue';
import paymentsStore from '@/store/paymentsStore';

Vue.use(Router);

const router = new Router({
  mode: 'hash',
  routes: [
    { path: '/', redirect: { name: 'PaymentMethodsOverview' } },
    { path: '/payments/methods', name: 'PaymentMethodsOverview', component: PaymentMethodsOverview },
    { path: '/payments/methods/create', name: 'PaymentMethodCreate', component: PaymentMethodDetail },
    { path: '/payments/methods/:code', name: 'PaymentMethodDetail', component: PaymentMethodDetail, props: true },
    { path: '/gateways', name: 'GatewaysList', component: GatewaysList },
    { path: '/gateways/create', name: 'GatewayCreate', component: GatewayDetail },
    { path: '/gateways/:code', name: 'GatewayDetail', component: GatewayDetail, props: true },
    { path: '/payments/restrictions', name: 'PaymentRestrictions', component: PaymentRestrictions },
    { path: '/payments/fee', name: 'PaymentFee', component: PaymentFee }
  ]
});

// Initialize store (seed from mocks if needed)
paymentsStore.init();

// Global dirty-guard
router.beforeEach((to, from, next) => {
  if (paymentsStore.dirty.shouldBlockNavigation()) {
    const ok = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
    if (!ok) return next(false);
    paymentsStore.dirty.clearAll();
  }
  return next();
});

export default router;


