const STORAGE_KEY = 'gummy-os:v0.1';

export const defaultState = {
  snack: {
    id: 'snack:hayden',
    name: 'Hayden',
    handle: '@hayden',
    flavor: 'electric citrus',
    shape: 'squircle',
    colors: { primary: '#7c5cff', secondary: '#ff7cc8', accent: '#75f0c8' },
    companion: 'Gummy',
    visibility: 'private'
  },
  files: [
    { id: 'file:welcome', name: 'Welcome to Gummy.md', type: 'markdown', project: 'Gummy', content: 'Gummy is a computer you can open. Drag this file onto the companion to work with it.' },
    { id: 'file:protocol', name: 'Protocol Zero.md', type: 'markdown', project: 'Gummy', content: 'Snack, Object Space, Pack, Broker, Capsule, Receipt, Graph.' },
    { id: 'file:enterprise', name: 'Enterprise Habitat.md', type: 'markdown', project: 'Gummy', content: 'A governed place where agents can operate vendor software under signed rules.' }
  ],
  graph: {
    snacks: [
      { id: 'snack:hayden', name: 'Hayden', handle: '@hayden', flavor: 'electric citrus', shape: 'squircle', colors: ['#7c5cff', '#ff7cc8'], relation: 'self' },
      { id: 'snack:zeke', name: 'Zeke', handle: '@zeke', flavor: 'blue raspberry', shape: 'orb', colors: ['#4bc5ff', '#4464ff'], relation: 'companion' },
      { id: 'snack:studio', name: 'Gummy Studio', handle: '@gummy', flavor: 'strawberry cloud', shape: 'bean', colors: ['#ff6fae', '#ffd166'], relation: 'following' }
    ],
    bowls: [
      { id: 'bowl:builders', name: 'Gummy Builders', visibility: 'invite', members: 3, description: 'People and agents building protocol-compatible Gummy editions.' },
      { id: 'bowl:family', name: 'Family Bowl', visibility: 'private', members: 1, description: 'A private place for shared photos, plans, and household agents.' }
    ],
    drops: [
      { id: 'drop:welcome', author: '@hayden', title: 'The computer is finally a place again.', scope: 'Gummy Builders', kind: 'note', forks: 2, createdAt: new Date().toISOString() }
    ],
    links: [
      { from: 'snack:hayden', to: 'snack:zeke', relation: 'delegates-to', scope: 'personal' },
      { from: 'snack:hayden', to: 'bowl:builders', relation: 'member-of', scope: 'invite' }
    ]
  },
  enterprise: {
    organization: { id: 'org:gummy-labs', name: 'Gummy Labs', deployment: 'dedicated-cloud', dataRegion: 'US', seats: 12 },
    policies: {
      externalNetwork: 'approval',
      destructiveActions: 'confirm',
      modelRouting: 'organization-approved',
      receiptRetentionDays: 365,
      publicSharing: 'disabled'
    },
    appPacks: [
      { id: 'pack:publishing-demo', name: 'Publishing Workbench', vendor: 'Example Vendor', status: 'verified', capabilities: 5 },
      { id: 'pack:finance-demo', name: 'Finance Desk', vendor: 'Example Vendor', status: 'review', capabilities: 8 }
    ],
    runtimes: [
      { id: 'runtime:web', name: 'Web-native pool', status: 'ready', isolation: 'origin' },
      { id: 'runtime:wasm', name: 'Wasm capsule pool', status: 'planned', isolation: 'process' },
      { id: 'runtime:linux', name: 'Linux compatibility pool', status: 'planned', isolation: 'vm' }
    ]
  },
  receipts: [],
  selectedFileId: null,
  settings: { modelProvider: 'demo', deploymentMode: 'personal' }
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return deepClone(defaultState);
  try {
    const parsed = JSON.parse(raw);
    return {
      ...deepClone(defaultState),
      ...parsed,
      snack: { ...deepClone(defaultState.snack), ...parsed.snack },
      graph: { ...deepClone(defaultState.graph), ...parsed.graph },
      enterprise: { ...deepClone(defaultState.enterprise), ...parsed.enterprise }
    };
  } catch {
    return deepClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createStore(initial = loadState()) {
  let state = initial;
  const listeners = new Set();
  return {
    getState: () => state,
    setState(updater) {
      state = typeof updater === 'function' ? updater(state) : updater;
      saveState(state);
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      state = deepClone(defaultState);
      saveState(state);
      for (const listener of listeners) listener(state);
    }
  };
}
