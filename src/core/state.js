export const UI_PREFERENCE_STORAGE_KEY = 'gummy-os:ui-preferences/v1';

export const defaultState = Object.freeze({
  selectedSurface: 'guide',
  selectedReceiptFilter: '',
  deploymentMode: 'personal'
});

function deepClone(value) {
  return structuredClone(value);
}

export function loadState(storage = globalThis.localStorage) {
  if (!storage?.getItem) return deepClone(defaultState);
  try {
    const parsed = JSON.parse(storage.getItem(UI_PREFERENCE_STORAGE_KEY) || '{}');
    return {
      ...deepClone(defaultState),
      selectedSurface: typeof parsed.selectedSurface === 'string' ? parsed.selectedSurface : defaultState.selectedSurface,
      selectedReceiptFilter: typeof parsed.selectedReceiptFilter === 'string' ? parsed.selectedReceiptFilter : '',
      deploymentMode: parsed.deploymentMode === 'personal' ? 'personal' : defaultState.deploymentMode
    };
  } catch {
    return deepClone(defaultState);
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem?.(UI_PREFERENCE_STORAGE_KEY, JSON.stringify({
    selectedSurface: state.selectedSurface,
    selectedReceiptFilter: state.selectedReceiptFilter,
    deploymentMode: state.deploymentMode
  }));
}

export function createStore(initial = loadState(), storage = globalThis.localStorage) {
  let state = initial;
  const listeners = new Set();
  return {
    getState: () => state,
    setState(updater) {
      state = typeof updater === 'function' ? updater(state) : updater;
      saveState(state, storage);
      for (const listener of listeners) listener(state);
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      state = deepClone(defaultState);
      saveState(state, storage);
      for (const listener of listeners) listener(state);
    }
  };
}
