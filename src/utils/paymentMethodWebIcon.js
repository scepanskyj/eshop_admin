import { resolveIconPath } from '@/utils/iconPath';

/**
 * Resolve web checkout icon URL for a payment method gateway.
 * Mirrors {@link PaymentMethodsOverview#getGatewayIcon} when `disabled` is true:
 * `iconWebDisabled` → `disabledIcon` → `*-disabled.svg` next to active icon → fallbacks.
 *
 * @param {object} gateway
 * @param {{ disabled?: boolean }} [options]
 * @returns {string} Resolved URL for `<img src>` or empty
 */
export function resolveWebCheckoutIcon(gateway, { disabled = false } = {}) {
  if (!gateway) return '';
  const pick = (val) => {
    if (!val) return '';
    return resolveIconPath(typeof val === 'string' ? val : val.value);
  };
  if (disabled) {
    const direct = pick(gateway.iconWebDisabled) || pick(gateway.disabledIcon);
    if (direct) return direct;
    const active = gateway.iconWeb || gateway.icon;
    if (typeof active === 'string' && /\.svg$/i.test(active)) {
      const disabledPath = active.replace(/\.svg$/i, '-disabled.svg');
      if (disabledPath !== active) {
        const derived = pick(disabledPath);
        if (derived) return derived;
      }
    }
    return pick(gateway.iconWeb) || pick(gateway.icon) || pick('/icons/default.svg');
  }
  return pick(gateway.iconWeb) || pick(gateway.icon) || pick('/icons/default.svg');
}
