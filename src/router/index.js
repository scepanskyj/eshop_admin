import { createRouter, createWebHashHistory } from 'vue-router';

import PaymentMethodsOverview from '@/views/payments/PaymentMethodsOverview.vue';
import PaymentMethodDetail from '@/views/payments/PaymentMethodDetail.vue';
import PaymentRestrictions from '@/views/payments/PaymentRestrictions.vue';
import PaymentRestrictionDetail from '@/views/payments/PaymentRestrictionDetail.vue';
import PaymentFee from '@/views/payments/PaymentFee.vue';
import CheckoutMethodPreview from '@/views/preview/CheckoutMethodPreview.vue';
import paymentsStore from '@/store/paymentsStore';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: { name: 'PaymentMethodsOverview' } },
    { path: '/payments/methods', name: 'PaymentMethodsOverview', component: PaymentMethodsOverview },
    { path: '/payments/methods/create', name: 'PaymentMethodCreate', component: PaymentMethodDetail },
    { path: '/payments/methods/:code', name: 'PaymentMethodDetail', component: PaymentMethodDetail, props: true },
    { path: '/payments/restrictions', name: 'PaymentRestrictions', component: PaymentRestrictions },
    { path: '/payments/restrictions/create', name: 'PaymentRestrictionCreate', component: PaymentRestrictionDetail, props: { id: 'create' } },
    { path: '/payments/restrictions/:id', name: 'PaymentRestrictionDetail', component: PaymentRestrictionDetail, props: true },
    { path: '/payments/fee', name: 'PaymentFee', component: PaymentFee },
    {
      path: '/preview/checkout-method',
      name: 'CheckoutMethodPreview',
      component: CheckoutMethodPreview
    }
  ]
});

paymentsStore.init();

router.beforeEach((to, from, next) => {
  if (paymentsStore.dirty.shouldBlockNavigation()) {
    const ok = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
    if (!ok) return next(false);
    paymentsStore.dirty.clearAll();
  }
  return next();
});

export default router;
