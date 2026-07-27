/**
 * @typedef {'gummy.utility.attach'|'gummy.utility.agent'|'gummy.utility.bowl'|'gummy.utility.deliver'|'gummy.utility.setup'|'gummy.utility.vision'|'gummy.utility.progress'} GummyUtilityTileId
 * @typedef {{id:GummyUtilityTileId,label:string,description:string,sourcePath:string,sourceHash:string,derivatives:Readonly<Record<'64'|'96'|'192',string>>,allowedSurfaces:readonly string[],forbiddenSemantics:readonly string[]}} GummyUtilityTile
 */

const root = '/brand/gummy/utility-tiles';
const forbidden = Object.freeze([
  'Actor identity',
  'Human identity',
  'Agent authority',
  'permission',
  'risk',
  'status color',
  'specialist application logo',
  'Gummy or Glopper mascot'
]);

/** @type {Readonly<Record<GummyUtilityTileId, GummyUtilityTile>>} */
export const gummyUtilityTiles = Object.freeze({
  'gummy.utility.attach': tile('gummy.utility.attach', 'Attach Gummy', 'Import or bind a source Gummy or reference.', 'cliptogummy-tile.png', 'f9ffadebdb81951141628c289d4a1a4ee7fc77557f2f0f0ab3a51399c07bb5e0', 'attach', ['Production setup', 'Gummy shelf', 'drag proxy', 'drop preview']),
  'gummy.utility.agent': tile('gummy.utility.agent', 'Agent Runtime', 'Inspect the actual executor beneath an Actor.', 'gummybot-tile.png', '94976c05d310742d8aafcd05640675cc861eca98f8ef157d3efae3ef1814198f', 'agent', ['Master Control', 'Agent Runtime disclosure']),
  'gummy.utility.bowl': tile('gummy.utility.bowl', 'Bowl', 'Open or identify a shared working environment.', 'gummybowl-tile.png', 'a87e6af9749c17b839d62f49f199ee9a3ab9f6459dc1f8cfb39ae1587e681c1f', 'bowl', ['Bowl launcher', 'Production environment', 'empty state']),
  'gummy.utility.deliver': tile('gummy.utility.deliver', 'Deliver', 'Propose a Return, export, handoff, or preservation action.', 'gummyexport-tile.png', '58b8c6164405fc0a8ce48e09113d40bd6b3996a34bb8f04cde3e2433c7119dc5', 'deliver', ['Return', 'export', 'downstream handoff', 'storage proposal']),
  'gummy.utility.setup': tile('gummy.utility.setup', 'Production Setup', 'Configure a Production, Actor Plan, or ProjectComposer stage.', 'gummylayout-tile.png', '3e393dfff3ceb072606dc5659a2a09af991a89137a6295561cd0cd1293c3a4ea', 'setup', ['Production setup rail', 'ProjectComposer', 'Actor Plan']),
  'gummy.utility.vision': tile('gummy.utility.vision', 'Inspect', 'Preview or inspect a visual reference or result.', 'gummyvision-tile.png', '2fbf61e196a263f05655eb2045af9e0b6841ff27688bbeab42cf0f44cfe9c0b4', 'vision', ['preview', 'reference inspection', 'ImageHoss-adjacent operation']),
  'gummy.utility.progress': tile('gummy.utility.progress', 'Gummy Working', 'Show queued or running progress with text.', 'loading-wheel.png', 'f59615d2757845a10c217f047f78f2ee95fdc010445f19aa0ac16ab16a27f558', 'progress', ['queued state', 'running state', 'reduced-motion static progress'])
});

function tile(id, label, description, sourceFile, sourceHash, slug, allowedSurfaces) {
  return Object.freeze({
    id,
    label,
    description,
    sourcePath: `/design/source/gummy-utility-tiles-legacy/${sourceFile}`,
    sourceHash,
    derivatives: Object.freeze({
      64: `${root}/${slug}-64.webp`,
      96: `${root}/${slug}-96.webp`,
      192: `${root}/${slug}-192.webp`
    }),
    allowedSurfaces: Object.freeze(allowedSurfaces),
    forbiddenSemantics: forbidden
  });
}

/** @param {GummyUtilityTileId} id */
export function utilityTile(id) {
  const asset = gummyUtilityTiles[id];
  if (!asset) throw new Error(`Unknown Gummy utility tile: ${id}`);
  return asset;
}
