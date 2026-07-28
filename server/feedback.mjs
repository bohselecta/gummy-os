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

function configured(environment = process.env) {
  return Boolean(
    environment.GUMMY_FEEDBACK_REPOSITORY
    && (
      environment.GUMMY_FEEDBACK_GITHUB_TOKEN
      || (environment.GITHUB_APP_ID && environment.GITHUB_APP_PRIVATE_KEY)
    )
  );
}

async function installationClient(repository, environment = process.env) {
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) throw new Error('Feedback repository must be owner/repository.');
  const githubApp = new App({
    appId: environment.GITHUB_APP_ID,
    privateKey: environment.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n')
  });
  const installation = await githubApp.octokit.request('GET /repos/{owner}/{repo}/installation', { owner, repo });
  return { owner, repo, client: await githubApp.getInstallationOctokit(installation.data.id) };
}

async function tokenRequest(path, {
  method = 'GET',
  body,
  token,
  fetcher = fetch
}) {
  const response = await fetcher(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'x-github-api-version': '2022-11-28'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error('Private feedback tracker request failed.'), { status: response.status });
  return data;
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
  const environment = options.environment || process.env;
  if (!configured(environment)) {
    return { code: 503, body: { status: 'blocked', message: 'Private tester feedback destination is not configured.' } };
  }
  const repository = environment.GUMMY_FEEDBACK_REPOSITORY;
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) return { code: 422, body: { status: 'blocked', message: 'Private tester feedback destination is invalid.' } };
  let target;
  let createIssue;
  if (environment.GUMMY_FEEDBACK_GITHUB_TOKEN) {
    target = await tokenRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      token: environment.GUMMY_FEEDBACK_GITHUB_TOKEN,
      fetcher: options.fetcher
    });
    createIssue = body => tokenRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`, {
      method: 'POST',
      body,
      token: environment.GUMMY_FEEDBACK_GITHUB_TOKEN,
      fetcher: options.fetcher
    });
  } else {
    const installation = await installationClient(repository, environment);
    target = (await installation.client.request('GET /repos/{owner}/{repo}', { owner, repo })).data;
    createIssue = async body => (await installation.client.request('POST /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      ...body
    })).data;
  }
  if (!target.private) {
    return { code: 422, body: { status: 'blocked', message: 'Tester feedback destination must be private.' } };
  }
  const issue = await createIssue({
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
      remoteId: String(issue.number),
      remoteUrl: issue.html_url
    }
  };
}
