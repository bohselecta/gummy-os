import { mkdir, writeFile } from 'node:fs/promises';
import {
  addRanchDayRoster,
  compileActorPlan,
  createInitialProductionRuntime,
  createProduction,
  invokeCapabilityAdapter,
  makeProduction,
  previewProductionRun,
  revokeActorRelationship,
  saveProductionActorConfiguration,
  sha256
} from '../src/core/production-runtime.js';

let runtime = createInitialProductionRuntime();
const created = createProduction(runtime);
runtime = addRanchDayRoster(created.runtime, created.production.id);
for (const actorId of ['actor:imagehoss', 'actor:3d-bee', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage']) {
  runtime = (await saveProductionActorConfiguration(runtime, created.production.id, actorId, {})).runtime;
}
runtime = compileActorPlan(runtime, created.production.id).runtime;
const completed = await makeProduction(runtime, created.production.id, { approvedBy: 'human:hayden' });
runtime = completed.runtime;
const historicalCounts = {
  runs: runtime.productionRuns.length,
  returns: runtime.returns.length,
  receipts: runtime.receipts.length
};
runtime = revokeActorRelationship(runtime, 'link:hoyt-videoboss-private-family').runtime;
const futurePreview = previewProductionRun(runtime, created.production.id);
const nativeDenial = await invokeCapabilityAdapter({
  agent: { id: 'agent:native-unavailable', runtimeClass: 'linux-native', providerClass: 'native', locality: 'local' },
  mold: null,
  lease: null,
  grant: null,
  envelope: null,
  configuration: {},
  production: {},
  run: {}
});

const evidence = {
  schema: 'gummy.acceptance-evidence/v0',
  generatedAt: new Date().toISOString(),
  referenceProduction: runtime.productions.find(item => item.id === created.production.id),
  serviceActors: runtime.actors.filter(item => item.kind === 'service'),
  actorPlan: runtime.actorPlans[0],
  productionRun: runtime.productionRuns[0],
  examples: {
    contextEnvelope: runtime.contextEnvelopes.find(item => item.targetActorId === 'actor:videoboss'),
    workOrder: runtime.workOrders.find(item => item.target.actorId === 'actor:videoboss'),
    taskLease: runtime.taskLeases.find(item => item.actorId === 'actor:videoboss'),
    grant: runtime.grants.find(item => item.actorId === 'actor:videoboss'),
    return: runtime.returns.find(item => item.actorId === 'actor:videoboss'),
    receipt: runtime.receipts.find(item => item.actorId === 'actor:videoboss' && item.action === 'production-run.node-completed')
  },
  hashes: {
    sources: await Promise.all(runtime.gummies.filter(item => item.status === 'source').map(async item => ({
      id: item.id,
      declared: item.hash,
      recomputed: await sha256(item.content),
      byteIdentical: await sha256(item.content) === item.hash
    }))),
    results: runtime.gummies.filter(item => item.status === 'result').map(item => ({ id: item.id, hash: item.hash, operatingAgentId: item.operatingAgentId })),
    runManifest: runtime.productionRuns[0].manifestHash
  },
  revocation: {
    relationship: runtime.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family'),
    historicalCounts,
    countsAfterRevocation: {
      runs: runtime.productionRuns.length,
      returns: runtime.returns.length,
      receipts: runtime.receipts.length
    },
    futureRunBlockers: futurePreview.blockers
  },
  nativeBoundary: nativeDenial,
  truthfulLimitations: [
    'All service execution uses deterministic structured browser reference adapters.',
    'No external ImageHoss, 3D-Bee, VideoBoss, ProjectComposer, or GummyStorage provider was invoked.',
    'Authoritative persistence is local to the browser origin; cross-device synchronization is not implemented.',
    'Native execution remains unavailable and deny-by-default.'
  ]
};

await mkdir('evidence', { recursive: true });
await writeFile('evidence/ranch-day-runtime-evidence.json', `${JSON.stringify(evidence, null, 2)}\n`);
console.log('Wrote evidence/ranch-day-runtime-evidence.json');
