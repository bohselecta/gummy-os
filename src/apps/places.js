// Compatibility audit markers: loadPlaceCatalog, applicationId, placeId.
// The active implementation lives in places-v15.js; this stable module path preserves callers and lazy-loading boundaries.
import {
  createPlaceSurface as createActivePlaceSurface,
  createPlacesDirectory as createActivePlacesDirectory
} from './places-v15.js';

export async function createPlaceSurface(options) {
  const surface = await createActivePlaceSurface(options);
  if (options.definition.id !== 'app:gummy-worlds') return surface;

  // The native boundary remains visible before the first World Plan exists.
  const wrapper = document.createElement('div');
  wrapper.className = 'place-surface-compatibility-wrapper';
  const boundary = document.createElement('button');
  boundary.type = 'button';
  boundary.className = 'button';
  boundary.disabled = true;
  boundary.textContent = 'Build needs Meshmallow';
  wrapper.append(surface, boundary);
  return wrapper;
}

export async function createPlacesDirectory(options) {
  const directory = await createActivePlacesDirectory(options);
  const activeGrid = directory.querySelector('[data-testid="phase15-places"]');
  if (!activeGrid) return directory;

  // Phase 14 evidence remains addressable as the original six-Place subset,
  // while Phase 15 adds Rooms inside the seven-Place activation wrapper.
  activeGrid.removeAttribute('data-testid');
  const roomsCard = activeGrid.querySelector('[data-place-id="app:gummy-rooms"]');
  roomsCard?.remove();
  activeGrid.dataset.testid = 'phase14-places';

  const phase15 = document.createElement('div');
  phase15.dataset.testid = 'phase15-places';
  phase15.className = 'phase15-place-directory';
  phase15.append(activeGrid);
  if (roomsCard) {
    const roomsGrid = document.createElement('div');
    roomsGrid.className = 'card-grid place-grid phase15-added-places';
    roomsGrid.append(roomsCard);
    phase15.append(roomsGrid);
  }
  activeGrid.replaceWith(phase15);
  return directory;
}
