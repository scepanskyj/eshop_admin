/**
 * User-created example rules stored in localStorage per country.
 * Structure: { [countryCode]: [{ id, name, description, paymentMethods, groups?, conditionRoot?, showWhenApplied, showInTooltip, reason }] }
 */
import { isClauseNode } from '@/utils/conditionClause';

const USER_EXAMPLES_STORAGE_KEY = 'esa.userExampleRules';
const HIDDEN_STATIC_PRESETS_KEY = 'esa.hiddenStaticPresets';

function loadAll() {
  try {
    const raw = localStorage.getItem(USER_EXAMPLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(USER_EXAMPLES_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Could not save user example rules', e);
  }
}

/** Get user examples for a country */
export function getUserExamples(countryCode) {
  const data = loadAll();
  return Array.isArray(data[countryCode]) ? data[countryCode] : [];
}

/** Add a user example for a country */
export function addUserExample(countryCode, ruleData) {
  const data = loadAll();
  const list = Array.isArray(data[countryCode]) ? [...data[countryCode]] : [];
  const id = 'user-' + Date.now();
  list.push({
    id,
    name: ruleData.name || '',
    description: ruleData.description || '',
    paymentMethods: Array.isArray(ruleData.paymentMethods) ? ruleData.paymentMethods : [],
    groups: ruleData.groups && ruleData.groups.length ? JSON.parse(JSON.stringify(ruleData.groups)) : [],
    conditionRoot: isClauseNode(ruleData.conditionRoot)
      ? JSON.parse(JSON.stringify(ruleData.conditionRoot))
      : null,
    showWhenApplied: ruleData.showWhenApplied ?? false,
    showInTooltip: ruleData.showInTooltip ?? false,
    reason: ruleData.reason || ''
  });
  data[countryCode] = list;
  saveAll(data);
  return id;
}

/** Remove a user example by id */
export function removeUserExample(countryCode, id) {
  const data = loadAll();
  const list = Array.isArray(data[countryCode]) ? data[countryCode].filter(r => r.id !== id) : [];
  data[countryCode] = list;
  saveAll(data);
}

function loadHiddenStatic() {
  try {
    const raw = localStorage.getItem(HIDDEN_STATIC_PRESETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveHiddenStatic(data) {
  try {
    localStorage.setItem(HIDDEN_STATIC_PRESETS_KEY, JSON.stringify(data));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Could not save hidden static presets', e);
  }
}

/** Get hidden static preset names for a country */
export function getHiddenStaticPresets(countryCode) {
  const data = loadHiddenStatic();
  return Array.isArray(data[countryCode]) ? data[countryCode] : [];
}

/** Hide a static preset (by name) for a country */
export function hideStaticPreset(countryCode, presetName) {
  const data = loadHiddenStatic();
  const list = Array.isArray(data[countryCode]) ? [...data[countryCode]] : [];
  if (!list.includes(presetName)) {
    list.push(presetName);
    data[countryCode] = list;
    saveHiddenStatic(data);
  }
}
