import { App } from '@octokit/app';

const connections = new Map();

function configured() {
  return Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY && process.env.GITHUB_APP_SLUG);
}

function app() {
  return new App({ appId: process.env.GITHUB_APP_ID, privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n') });
}

async function octokit(session) {
  if (!configured() || !session?.githubInstallationId) throw new Error('GitHub App is not configured or installed.');
  return app().getInstallationOctokit(session.githubInstallationId);
}

export function installUrl(state) {
  if (!configured()) return null;
  return `https://github.com/apps/${encodeURIComponent(process.env.GITHUB_APP_SLUG)}/installations/new?state=${encodeURIComponent(state)}`;
}

export async function listRepositories(session) {
  const client = await octokit(session);
  const response = await client.request('GET /installation/repositories', { per_page: 100 });
  return response.data.repositories.filter(repo => repo.private).map(repo => ({ id: repo.id, fullName: repo.full_name, private: repo.private, defaultBranch: repo.default_branch }));
}

export async function connectBox(session, input) {
  const client = await octokit(session);
  const [owner, repo] = input.repository.split('/');
  const repository = (await client.request('GET /repos/{owner}/{repo}', { owner, repo })).data;
  if (!repository.private) throw new Error('Gummy Box requires a private repository.');
  const manifestPath = 'gummy-box/manifest.json';
  const existing = await client.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path: manifestPath, ref: 'gummy-box' }).catch(error => error.status === 404 ? null : Promise.reject(error));
  if (existing) {
    const manifest = JSON.parse(Buffer.from(existing.data.content, 'base64').toString());
    if (manifest.boxId !== input.boxId) throw new Error('Existing manifest conflicts with the Local Box ID.');
  }
  connections.set(input.boxId, { repository: input.repository, installationId: session.githubInstallationId, branch: 'gummy-box', root: 'gummy-box/' });
  return { providerType: 'github', revisionId: existing?.data.sha || repository.default_branch, contentHash: existing?.data.sha || '', status: 'committed', connection: connections.get(input.boxId), authoritative: false };
}

export async function syncBox(session, boxId, input) {
  const connection = connections.get(boxId);
  if (!connection) throw new Error('GitHub Box is not connected.');
  const client = await octokit(session);
  const [owner, repo] = connection.repository.split('/');
  const defaultRef = await client.request('GET /repos/{owner}/{repo}/git/ref/{ref}', { owner, repo, ref: `heads/${input.defaultBranch || 'main'}` });
  let branchRef = await client.request('GET /repos/{owner}/{repo}/git/ref/{ref}', { owner, repo, ref: 'heads/gummy-box' }).catch(error => error.status === 404 ? null : Promise.reject(error));
  if (!branchRef) {
    await client.request('POST /repos/{owner}/{repo}/git/refs', { owner, repo, ref: 'refs/heads/gummy-box', sha: defaultRef.data.object.sha });
    branchRef = { data: { object: { sha: defaultRef.data.object.sha } } };
  }
  const head = branchRef.data.object.sha;
  if (input.expectedHead && input.expectedHead !== head) return { providerType: 'github', revisionId: head, contentHash: '', status: 'ambiguous', conflict: true };
  const baseCommit = (await client.request('GET /repos/{owner}/{repo}/git/commits/{commit_sha}', { owner, repo, commit_sha: head })).data;
  const files = {
    'gummy-box/manifest.json': JSON.stringify({ schema: 'gummy.box-manifest/v0', boxId, protocolVersion: '0.2' }, null, 2),
    ...input.files
  };
  const tree = [];
  for (const [path, content] of Object.entries(files)) {
    const blob = await client.request('POST /repos/{owner}/{repo}/git/blobs', { owner, repo, content, encoding: 'utf-8' });
    tree.push({ path, mode: '100644', type: 'blob', sha: blob.data.sha });
  }
  const newTree = await client.request('POST /repos/{owner}/{repo}/git/trees', { owner, repo, base_tree: baseCommit.tree.sha, tree });
  const commit = await client.request('POST /repos/{owner}/{repo}/git/commits', { owner, repo, message: input.message || 'Sync Gummy Box', tree: newTree.data.sha, parents: [head] });
  try {
    await client.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', { owner, repo, ref: 'heads/gummy-box', sha: commit.data.sha, force: false });
  } catch (error) {
    if (error.status === 422 || error.status === 409) return { providerType: 'github', revisionId: head, contentHash: newTree.data.sha, status: 'ambiguous', conflict: true };
    throw error;
  }
  return { providerType: 'github', revisionId: commit.data.sha, contentHash: newTree.data.sha, status: 'committed' };
}

export function disconnectBox(boxId) {
  connections.delete(boxId);
  return { providerType: 'github', revisionId: 'disconnected', contentHash: '', status: 'committed', managementUrl: 'https://github.com/settings/installations' };
}
