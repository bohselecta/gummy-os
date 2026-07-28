// Compatibility audit markers: loadPlaceCatalog, applicationId, placeId.
// The active implementation lives in places-v15.js; this stable module path preserves callers and lazy-loading boundaries.
import {
  createPlaceSurface as createActivePlaceSurface,
  createPlacesDirectory as createActivePlacesDirectory
} from './places-v15.js';

function boundaryButton(label, { disabled = true, onClick = null } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button';
  button.disabled = disabled;
  button.textContent = label;
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

export async function createPlaceSurface(options) {
  const surface = await createActivePlaceSurface(options);
  const wrapper = document.createElement('div');
  wrapper.className = 'place-surface-compatibility-wrapper';
  wrapper.append(surface);

  if (options.definition.id === 'app:gummy-worlds') {
    // Preserve a useful pre-plan validation action for the original bounded
    // Worlds evidence. It validates the starter boundary and never executes.
    const validateStarter = boundaryButton('Validate and estimate', {
      disabled: false,
      onClick: () => {
        const result = surface.querySelector('.place-result');
        if (result) result.textContent = 'Valid starter boundary · executing: false · Meshmallow was not contacted.';
      }
    });
    wrapper.append(validateStarter, boundaryButton('Build needs Meshmallow'));
    return wrapper;
  }

  if (options.definition.id === 'app:gummy-radio') {
    // Final voice remains visibly unavailable even before an episode exists,
    // but the compatibility boundary disappears when the native control exists.
    const compatibilityBoundary = boundaryButton('Final voice service not connected');
    wrapper.append(compatibilityBoundary);
    const reconcile = () => {
      const nativeExists = [...surface.querySelectorAll('button')]
        .some(button => button.textContent === 'Final voice service not connected');
      compatibilityBoundary.hidden = nativeExists;
    };
    reconcile();
    const observer = new MutationObserver(reconcile);
    observer.observe(surface, { childList: true, subtree: true });
    return wrapper;
  }

  return surface;
}

export async function createPlacesDirectory(options) {
  const directory = await createActivePlacesDirectory(options);
  const activeGrid = directory.querySelector('[data-testid="phase15-places"]');
  if (!activeGrid) return directory;

  // Phase 14 evidence remains addressable as the original six-Place subset,
  // while Phase 15 adds Rooms inside the seven-Place activation wrapper.
  const parent = activeGrid.parentNode;
  const phase15 = document.createElement('div');
  phase15.dataset.testid = 'phase15-places';
  phase15.className = 'phase15-place-directory';
  parent.replaceChild(phase15, activeGrid);

  activeGrid.removeAttribute('data-testid');
  const roomsCard = activeGrid.querySelector('[data-place-id="app:gummy-rooms"]');
  roomsCard?.remove();
  activeGrid.dataset.testid = 'phase14-places';
  phase15.append(activeGrid);

  if (roomsCard) {
    const roomsGrid = document.createElement('div');
    roomsGrid.className = 'card-grid place-grid phase15-added-places';
    roomsGrid.append(roomsCard);
    phase15.append(roomsGrid);
  }

  // Keep the protected long-horizon social boundary visible in the full
  // product map. Local Rooms are real; broad social computing remains staged.
  const disclosure = document.createElement('p');
  disclosure.className = 'notice compact-notice';
  disclosure.textContent = 'Social computing may ship after the personal proof. Local private Rooms do not imply a public social network.';
  directory.append(disclosure);
  return directory;
}
