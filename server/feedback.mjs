import { App } from '@octokit/app';
import { z } from 'zod';

const feedbackInput = z.object({
  id: z.string().startsWith('feedback:'),
  category: z.enum(['confusion', 'bug', 'delight', 'missing-capability', 'trust-privacy']),
  note: z.string().min(1).max(2_000),
  context: z.object({
    buildCommit: z.string().max(64),
    buildEnvironment: z.string().max(32),
    surface: z.string().max(80)
  }),
  excluded: z.array(z.string()).min(1),
  localReceiptId: z.string().startsWith('receipt:'),
  approvedAt: z.string()
});

function configured() {
  return Boolean(
    process.env.GITHUB_APP_ID
    && process.env.GITHUB_APP_PRIVATE_KEY
    && process.env.GUMMY_FEEDBACK_REPOSITORY
  );
}

async function installationClient(repository) {
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) throw new Error('Feedback repository must be owner/repository.');
  const githubApp = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n')
  });
  const installation = await githubApp.octokit.request('GET /repos/{owner}/{repo}/installation', { owner, repo });
  return { owner, repo, client: await githubApp.getInstallationOctokit(installation.data.id) };
}

export async function submitTesterFeedback(rawInput, options = {}) {
  const parsed = feedbackInput.safeParse(rawInput);
  if (!parsed.success) return { code: 400, body: { status: 'blocked', message: 'Feedback envelope failed validation.' } };
  const input = parsed.data;
  if (Date.parse(input.approvedAt) > Date.now() || Date.now() - Date.parse(input.approvedAt) > 15 * 60 * 1000) {
    return { code: 422, body: { status: 'blocked', message: 'Feedback approval is missing or expired.' } };
  }
  const testMode = options.testMode ?? process.env.GUMMY_TEST_MODE === '1';
  if (testMode) {
    return {
      code: 200,
      body: {
        status: 'submitted',
        destination: 'private test feedback repository (mocked)',
        remoteId: `mock:${input.id}`,
        remoteUrl: null
      }
    };
  }
  if (!configured()) {
    return { code: 503, body: { status: 'blocked', message: 'Private tester feedback destination is not configured.' } };
  }
  const repository = process.env.GUMMY_FEEDBACK_REPOSITORY;
  const { owner, repo, client } = await installationClient(repository);
  const target = (await client.request('GET /repos/{owner}/{repo}', { owner, repo })).data;
  if (!target.private) {
    return { code: 422, body: { status: 'blocked', message: 'Tester feedback destination must be private.' } };
  }
  const issue = await client.request('POST /repos/{owner}/{repo}/issues', {
    owner,
    repo,
    title: `[Tester feedback] ${input.category}`,
    body: [
      `Category: ${input.category}`,
      `Build: ${input.context.buildCommit}`,
      `Environment: ${input.context.buildEnvironment}`,
      `Surface: ${input.context.surface}`,
      `Local receipt: ${input.localReceiptId}`,
      '',
      input.note,
      '',
      `Excluded locally: ${input.excluded.join(', ')}`
    ].join('\n'),
    labels: ['tester-feedback']
  });
  return {
    code: 200,
    body: {
      status: 'submitted',
      destination: repository,
      remoteId: String(issue.data.number),
      remoteUrl: issue.data.html_url
    }
  };
}
