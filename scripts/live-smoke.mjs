import { transformExecution } from '../server/execution.mjs';
import { connectBox, listRepositories, syncBox } from '../server/github.mjs';
import { CAPABILITIES, SOURCE_TEXT, makeGrant, personalRecords } from '../src/core/records.js';
import { sha256 } from '../src/core/hash.js';

const required = [
  'OPENAI_API_KEY', 'OPENAI_INPUT_USD_PER_MILLION', 'OPENAI_OUTPUT_USD_PER_MILLION',
  'GITHUB_APP_ID', 'GITHUB_APP_PRIVATE_KEY', 'GITHUB_APP_SLUG',
  'GITHUB_INSTALLATION_ID', 'GITHUB_TEST_REPOSITORY'
];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  console.error(`Live acceptance is opt-in. Configure: ${missing.join(', ')}`);
  process.exit(2);
}

delete process.env.GUMMY_TEST_MODE;
const timestamp = new Date().toISOString();
const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
const sourceHash = await sha256(SOURCE_TEXT);
const records = personalRecords({ sourceHash, byteRef: '/live-smoke/source' });
const lease = {
  schema: 'gummy.task-lease/v0', id: `lease:live-${crypto.randomUUID()}`,
  humanAuthorityId: records.human.id, actorId: records.actor.id, agentId: records.agent.id,
  moldId: records.mold.id, masterControlId: records.masterControl.id, taskId: records.workOrder.id,
  scope: { gummyIds: [records.gummy.id], capabilities: CAPABILITIES },
  mode: 'exclusive', status: 'active', issuedAt: timestamp, expiresAt
};
const grants = [
  makeGrant({ action: 'gummy.read', resource: records.gummy.id, leaseId: lease.id }),
  makeGrant({ action: 'transform.bounded', resource: records.workOrder.id, leaseId: lease.id }),
  makeGrant({ action: 'gummy.create', resource: 'box:hayden/artifacts', leaseId: lease.id })
];
const execution = await transformExecution({
  human: records.human, actor: records.actor, agent: records.agent, mold: records.mold,
  masterControl: records.masterControl, workOrder: records.workOrder, taskLease: lease, grants,
  source: { id: records.gummy.id, mediaType: 'text/markdown', title: records.gummy.title },
  sourceText: SOURCE_TEXT, sourceHash, idempotencyKey: `${records.workOrder.id}:${lease.id}`
});
if (execution.code !== 200 || execution.body.status !== 'completed') throw new Error(`Live OpenAI transformation failed: ${execution.body.message}`);

const githubSession = { githubInstallationId: Number(process.env.GITHUB_INSTALLATION_ID) };
const repositories = await listRepositories(githubSession);
const selected = repositories.find(item => item.fullName === process.env.GITHUB_TEST_REPOSITORY);
if (!selected?.private) throw new Error('GITHUB_TEST_REPOSITORY is not an installed private repository.');
await connectBox(githubSession, { boxId: 'box:hayden', repository: selected.fullName });
const sync = await syncBox(githubSession, 'box:hayden', {
  defaultBranch: selected.defaultBranch,
  files: {
    'gummy-box/receipts/live-acceptance.json': JSON.stringify({
      schema: 'gummy.live-acceptance/v0',
      status: 'completed',
      provider: execution.body.provider,
      model: execution.body.model,
      requestId: execution.body.requestId,
      sourceHash,
      completedAt: new Date().toISOString()
    }, null, 2)
  },
  message: 'Record live standalone Gummy OS acceptance'
});
if (sync.status !== 'committed') throw new Error('Live GitHub round trip did not commit cleanly; reconcile remote head before retry.');
console.log(JSON.stringify({
  status: 'completed',
  openai: { model: execution.body.model, requestId: execution.body.requestId },
  github: { repository: selected.fullName, revisionId: sync.revisionId }
}, null, 2));
