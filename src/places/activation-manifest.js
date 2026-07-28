export const PLACE_ACTIVATION_OVERLAYS = Object.freeze({
  'app:gummy-channels': Object.freeze({
    schema: 'gummy.place-descriptor/v2',
    coreAvailability: 'available',
    coreCapabilities: ['channel-guide.manage', 'watch-groups.manage', 'family-room.compose', 'premiere-draft.prepare'],
    capabilityStates: Object.freeze([
      capability('channel-guide.manage', 'Channel guide', 'available', ['browser'], [], false, '$0 local', 'Create and maintain local channel, episode, favorite, and guide records.'),
      capability('watch-groups.manage', 'Watch groups', 'available', ['browser'], [], false, '$0 local', 'Create Human-defined watch groups without an algorithmic feed.'),
      capability('family-room.compose', 'Family Room notes', 'available', ['browser'], [], false, '$0 local', 'Create bounded bulletin notes; no open chat is implied.'),
      capability('premiere-draft.prepare', 'Premiere drafts', 'approval-required', ['browser'], ['Human guide-placement approval'], false, '$0 local', 'Prepare and approve a local premiere draft without publishing it.'),
      capability('channel.publish', 'Remote channel publication', 'remote-service-required', ['remote'], ['Authenticated Channels service', 'moderation gates'], true, 'provider/service dependent', 'Remote publication remains unavailable until the Channels service and moderation system are verified.')
    ]),
    connectionRoutes: Object.freeze([
      route('android', null, 'needs-setup'),
      route('remote-service', null, 'needs-setup')
    ]),
    lastVerifiedAt: null,
    migration: migration(['app:gummy-channels', 'VidFam TV'])
  }),
  'app:gummy-wardrobe': Object.freeze({
    schema: 'gummy.place-descriptor/v2',
    coreAvailability: 'available',
    coreCapabilities: ['wardrobe.items.manage', 'outfit.compose', 'availability.update', 'outfit.export'],
    capabilityStates: Object.freeze([
      capability('wardrobe.items.manage', 'Owned wardrobe', 'available', ['browser'], [], false, '$0 local', 'Add, edit, organize, and remove confirmed owned items.'),
      capability('outfit.compose', 'Dress Me', 'available', ['browser'], ['At least one available owned item'], false, '$0 local', 'Compile and save one owned-item-first outfit.'),
      capability('availability.update', 'Temporary availability', 'available', ['browser'], [], false, '$0 local', 'Mark an item unavailable without turning it into a dislike.'),
      capability('outfit.export', 'Selected outfit export', 'approval-required', ['browser'], ['Human selects an outfit'], false, '$0 local', 'Export only the selected outfit and its item references.'),
      capability('item.capture.camera', 'Camera-aware capture', 'mobile-companion-required', ['mobile'], ['Installed capture companion'], false, '$0 local or disclosed provider', 'Manual item entry works now; camera classification needs a mobile capture capability.'),
      capability('shopping.checkout', 'Checkout', 'blocked', ['remote'], [], true, 'not offered', 'Wardrobe has no checkout or autonomous purchase capability.')
    ]),
    connectionRoutes: Object.freeze([route('pwa', null, 'available'), route('mobile-companion', null, 'needs-setup')]),
    lastVerifiedAt: null,
    migration: migration(['app:gummy-wardrobe', 'Dressing Suite'])
  }),
  'app:gummy-house': Object.freeze({
    schema: 'gummy.place-descriptor/v2',
    coreAvailability: 'available',
    coreCapabilities: ['house.projection.manage', 'intent.preview', 'two-note.commit', 'house.export'],
    capabilityStates: Object.freeze([
      capability('house.projection.manage', 'House project memory', 'available', ['browser'], [], false, '$0 local', 'Maintain a scoped local projection of rooms, observations, and projects.'),
      capability('intent.preview', 'Intent Gate', 'available', ['browser'], ['Selected House nodes'], false, '$0 local', 'Preview exactly what crosses the Scope Wall.'),
      capability('two-note.commit', 'Two-note commit', 'approval-required', ['browser'], ['Intent note', 'Consequence note'], false, '$0 local', 'Commit intent and consequence together with a Place receipt.'),
      capability('house.export', 'Scoped House export', 'approval-required', ['browser'], ['Human selection'], false, '$0 local', 'Export selected House records without address or ambient photos.'),
      capability('homewright.open', 'Full House workbench', 'remote-service-required', ['remote'], ['Verified allowlisted HomeWright deployment'], false, '$0 unless disclosed otherwise', 'The local House core works now; the full HomeWright workbench route still needs production binding.')
    ]),
    connectionRoutes: Object.freeze([route('web', null, 'needs-setup')]),
    lastVerifiedAt: null,
    migration: migration(['app:gummy-house', 'Homewright'])
  }),
  'app:gummy-worlds': Object.freeze({
    schema: 'gummy.place-descriptor/v2',
    coreAvailability: 'available',
    coreCapabilities: ['world-plan.manage', 'world.validate', 'world.estimate', 'world.inspect', 'world.package', 'world.duplicate', 'sit.preview'],
    capabilityStates: Object.freeze([
      capability('world-plan.manage', 'World Plans', 'available', ['browser'], [], false, '$0 local', 'Create and edit structured World Plans.'),
      capability('world.validate', 'Validate world', 'available', ['browser'], ['Verified rights-declared sources'], false, '$0 local', 'Validate sources, operations, and constraints without execution.'),
      capability('world.estimate', 'Estimate world', 'available', ['browser'], ['Valid World Plan'], false, '$0 local', 'Compute a bounded local estimate; no provider is contacted.'),
      capability('world.inspect', 'Inspect world', 'available', ['browser'], ['Saved World Plan'], false, '$0 local', 'Inspect the exact structured plan and history.'),
      capability('world.package', 'Package world', 'approval-required', ['browser'], ['Valid World Plan'], false, '$0 local', 'Export a versioned World Plan package.'),
      capability('world.duplicate', 'Duplicate world', 'available', ['browser'], ['Saved World Plan'], false, '$0 local', 'Create an isolated revision-one copy.'),
      capability('sit.preview', 'Sit experience preview', 'available', ['browser'], ['Sit-mode plan'], false, '$0 local', 'Preview the supported Sit experience configuration.'),
      capability('make_world', 'Build editable 3D world', 'local-runtime-required', ['local'], ['Authenticated Meshmallow supervisor', 'Human-approved exact plan'], true, 'bounded estimate', 'Only real scene construction requires Meshmallow.'),
      capability('walk.preview', 'Walk experience', 'approval-required', ['browser', 'local'], ['Separate navigation/performance/accessibility acceptance'], false, '$0 local before build', 'Walk remains a separately gated experience.')
    ]),
    connectionRoutes: Object.freeze([route('web', null, 'needs-setup'), route('local-bridge', 'http://127.0.0.1:5214', 'needs-setup')]),
    lastVerifiedAt: null,
    migration: migration(['app:gummy-worlds', 'VideoWorlds'])
  }),
  'app:gummy-table': Object.freeze({
    schema: 'gummy.place-descriptor/v2',
    coreAvailability: 'available',
    coreCapabilities: ['table.manage', 'invite.manage', 'rsvp.manage', 'rules.acknowledge', 'dishes.manage', 'pantry.gift', 'table.export'],
    capabilityStates: Object.freeze([
      capability('table.manage', 'Private Tables', 'available', ['browser'], [], false, '$0 local', 'Create and preserve an invite-only Table.'),
      capability('invite.manage', 'Scoped invitations', 'available', ['browser'], ['Host action'], false, '$0 local', 'Create private local invitation records; no discovery is created.'),
      capability('rsvp.manage', 'RSVPs', 'available', ['browser'], ['Invitation'], false, '$0 local', 'Record yes, no, or maybe for an invited participant.'),
      capability('rules.acknowledge', 'Table Rules', 'available', ['browser'], [], false, '$0 local', 'Record rule acknowledgement without ideological profiling.'),
      capability('dishes.manage', 'Dish board', 'available', ['browser'], [], false, '$0 local', 'Coordinate dishes for the selected Table.'),
      capability('pantry.gift', 'Pantry gifts', 'available', ['browser'], [], false, '$0 local', 'Record gifts without balance, debt, score, or exchange rate.'),
      capability('table.export', 'Private Table export', 'approval-required', ['browser'], ['Host selection'], false, '$0 local', 'Export the selected Table without an exact address.'),
      capability('address.release', 'Exact address grant', 'remote-service-required', ['remote'], ['Verified phone', 'Host approval', 'Gathering-specific service grant'], true, '$0 service', 'Gummy cannot substitute a generic Grant for the civic address service.')
    ]),
    connectionRoutes: Object.freeze([route('pwa', null, 'available'), route('remote-service', null, 'needs-setup')]),
    lastVerifiedAt: null,
    migration: migration(['app:gummy-table', 'Easy Food'])
  }),
  'app:gummy-radio': Object.freeze({
    schema: 'gummy.place-descriptor/v2',
    coreAvailability: 'available',
    coreCapabilities: ['source-package.import', 'script.revise', 'script.approve', 'speech.preview', 'episode.export'],
    capabilityStates: Object.freeze([
      capability('source-package.import', 'Scoped source import', 'available', ['browser'], ['Revisioned source package'], false, '$0 local', 'Import only exact selected sources and exclusions.'),
      capability('script.revise', 'Revisioned script', 'available', ['browser'], ['Episode project'], false, '$0 local', 'Create revisions and invalidate stale approvals.'),
      capability('script.approve', 'Script approval', 'approval-required', ['browser'], ['Exact revision'], false, '$0 local', 'Approve the exact script revision.'),
      capability('speech.preview', 'Browser speech preview', 'available', ['browser'], ['Approved script'], false, '$0 local', 'Preview synthetic browser speech; it is not final audio.'),
      capability('episode.export', 'Private episode export', 'approval-required', ['browser'], ['Approved script', 'Scoped sources'], false, '$0 local', 'Export a private episode package without publishing it.'),
      capability('voice.render', 'Final generated voice', 'remote-service-required', ['remote'], ['Voice/likeness approval', 'Authenticated renderer'], true, 'provider dependent', 'Final generated audio requires a separate approved renderer.'),
      capability('episode.publish', 'Public publishing', 'blocked', ['remote'], ['Accepted publication system'], true, 'not offered', 'Public publication is not part of the current release.')
    ]),
    connectionRoutes: Object.freeze([route('web', null, 'needs-setup')]),
    lastVerifiedAt: null,
    migration: migration(['app:gummy-radio', 'TalkPrint Studio', 'AfterCast'])
  }),
  'app:gummy-rooms': Object.freeze({
    schema: 'gummy.place-descriptor/v2',
    coreAvailability: 'available',
    coreCapabilities: ['room.local.create', 'room.local.join', 'queue.manage', 'thread.manage', 'gummy.share'],
    capabilityStates: Object.freeze([
      capability('room.local.create', 'Create private room', 'available', ['browser'], [], false, '$0 local', 'Create a private local room owned by this browser.'),
      capability('room.local.join', 'Join from another tab', 'available', ['browser'], ['BroadcastChannel support'], false, '$0 local', 'Join the same local room from another tab without claiming remote identity.'),
      capability('queue.manage', 'Fair queue', 'available', ['browser'], ['Room participants'], false, '$0 local', 'Maintain a deterministic round-robin queue.'),
      capability('thread.manage', 'Isolated threads', 'available', ['browser'], ['Room'], false, '$0 local', 'Create room-scoped threads without merging private chats.'),
      capability('gummy.share', 'Share selected Gummies', 'approval-required', ['browser'], ['Explicit selected Gummy'], false, '$0 local', 'Share only selected Gummy references.'),
      capability('room.remote', 'Remote room service', 'remote-service-required', ['remote'], ['Authenticated room service'], true, 'service dependent', 'Remote rooms and live media remain separately unavailable.')
    ]),
    connectionRoutes: Object.freeze([route('web', null, 'available'), route('remote-service', null, 'needs-setup')]),
    lastVerifiedAt: null,
    migration: migration(['app:gummy-rooms', 'gummy2.rooms/legacy'])
  })
});

function capability(id, label, availability, locality, requires, startsExecution, costModel, releaseTruth) {
  return Object.freeze({ id, label, availability, locality: Object.freeze(locality), requires: Object.freeze(requires), startsExecution, costModel, releaseTruth });
}

function route(kind, routeValue, status) {
  return Object.freeze({ kind, route: routeValue, status, allowlistedOrigin: routeValue?.startsWith('https://') ? new URL(routeValue).origin : null });
}

function migration(legacyIds) {
  return Object.freeze({ fromSchema: 'gummy.place-descriptor/v1', legacyIds: Object.freeze(legacyIds), completedAt: null });
}

export function activatePlaceDescriptor(descriptor) {
  const overlay = PLACE_ACTIVATION_OVERLAYS[descriptor?.id];
  if (!overlay) return descriptor;
  return Object.freeze({
    ...structuredClone(descriptor),
    ...structuredClone(overlay),
    releaseTruth: releaseSummary(descriptor.id)
  });
}

function releaseSummary(placeId) {
  const summaries = {
    'app:gummy-channels': 'The local guide, watch groups, Family Room notes, and premiere drafts work now. Remote publication still needs the Channels service.',
    'app:gummy-wardrobe': 'Owned-item management, outfit composition, temporary availability, history, and selected-outfit export work locally. Camera classification needs a companion.',
    'app:gummy-house': 'Scoped House memory, Intent Gate, two-note commits, and exports work locally. The full HomeWright workbench route still needs binding.',
    'app:gummy-worlds': 'World planning, Sit preview, validation, estimates, inspection, duplication, and packages work locally. Only real 3D construction needs Meshmallow.',
    'app:gummy-table': 'Private Table planning, invitations, RSVPs, rules, dishes, Pantry gifts, and export work locally. Exact-address release needs the verified service.',
    'app:gummy-radio': 'Scoped sources, revisioned scripts, approvals, browser speech, and private episode export work locally. Final voice and publishing remain separate.',
    'app:gummy-rooms': 'Private local rooms, second-tab joining, fair queues, threads, and selected Gummy sharing work locally. Remote rooms and live media need a service.'
  };
  return summaries[placeId] || 'Place capability state is available through its declared runtime.';
}
