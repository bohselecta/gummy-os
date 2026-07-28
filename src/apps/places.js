// Compatibility audit markers: loadPlaceCatalog, applicationId, placeId.
// The active implementation lives in places-v15.js; this stable module path preserves callers and lazy-loading boundaries.
export { createPlaceSurface, createPlacesDirectory } from './places-v15.js';
