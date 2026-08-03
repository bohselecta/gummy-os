const phraseRules = Object.freeze([
  [/\bdraft\s+pull\s+request(s)?\b/gi, 'Work in Progress$1'],
  [/\bpull\s+request(s)?\b/gi, 'Proposed Update$1'],
  [/\bmerge\s+request(s)?\b/gi, 'Proposed Update$1'],
  [/\bmerge\s+conflict(s)?\b/gi, 'Editing Collision$1'],
  [/\bdetached\s+head\b/gi, 'System Tracking Error'],
  [/\bgithub\s+actions?\b/gi, 'Automated Safety Checks'],
  [/\bcontinuous\s+integration\b/gi, 'Automated Safety Checks'],
  [/\bci\s*\/\s*cd\b/gi, 'Automated Safety Checks and Launches'],
  [/\bdefault\s+branch\b/gi, 'Official Version'],
  [/\bmain\s+branch\b/gi, 'Official Version'],
  [/\bmaster\s+branch\b/gi, 'Official Version'],
  [/\bbranch\s+(?:main|master)\b/gi, 'Official Version'],
  [/\bnon[- ]fast[- ]forward\b/gi, 'Editing Collision'],
  [/\bpush\s+rejected\b/gi, 'Upload blocked by newer work'],
  [/\bbuild\s+artifact(s)?\b/gi, 'Assembled Package$1'],
  [/\bpersonal\s+access\s+token\b/gi, 'Private Access Key'],
  [/\bversion\s+control\b/gi, 'Project History'],
  [/\bgithub\b/gi, 'Project Service'],
  [/\bgit\b/gi, 'Project Service']
]);

const technicalRules = Object.freeze([
  [/\brepositories\b/gi, 'Project Folders'],
  [/\brepository\b/gi, 'Project Folder'],
  [/\brepos\b/gi, 'Project Folders'],
  [/\brepo\b/gi, 'Project Folder'],
  [/\bcommits\b/gi, 'Save Points'],
  [/\bcommit\b/gi, 'Save Point'],
  [/\bclones\b/gi, 'Downloaded Copies'],
  [/\bclone\b/gi, 'Download a Copy'],
  [/\bforks\b/gi, 'Personal Copies'],
  [/\bfork\b/gi, 'Make a Personal Copy'],
  [/\bblobs\b/gi, 'Files'],
  [/\bblob\b/gi, 'File'],
  [/\bworking\s+tree\b/gi, 'Current Project Files'],
  [/\bworktree\b/gi, 'Current Project Files'],
  [/\bstaging\s+area\b/gi, 'Next Save'],
  [/\bstaged\s+changes\b/gi, 'Changes Selected for the Next Save'],
  [/\borigin\b/gi, 'Connected Project Service'],
  [/\bupstream\b/gi, 'Connected Project Service'],
  [/\bbranches\b/gi, 'Draft Versions'],
  [/\bbranch\b/gi, 'Draft Version'],
  [/\bcheckout\b/gi, 'Switch To'],
  [/\bstash(?:ed|es|ing)?\b/gi, match => match.toLowerCase().endsWith('ed') ? 'Set Aside' : 'Set Aside'],
  [/\btags\b/gi, 'Named Releases'],
  [/\btag\b/gi, 'Named Release'],
  [/\bdraft\s+pr\b/gi, 'Work in Progress'],
  [/\bprs\b/gi, 'Proposed Updates'],
  [/\bpr\b/gi, 'Proposed Update'],
  [/\bmergeable\b/gi, 'Ready to Combine'],
  [/\bunmerged\b/gi, 'Pending Approval'],
  [/\bmerges\b/gi, 'Approvals and Combinations'],
  [/\bmerge\b/gi, 'Approve and Combine'],
  [/\brebase(?:d|s|ing)?\b/gi, 'Rebuild the Update History'],
  [/\brevert(?:ed|s|ing)?\b/gi, 'Undo'],
  [/\bblame\b/gi, 'File History'],
  [/\bworkflow\s+runs?\b/gi, 'Safety Check Runs'],
  [/\bworkflows\b/gi, 'Automated Safety Checks'],
  [/\bworkflow\b/gi, 'Automated Safety Check'],
  [/\bpipelines\b/gi, 'Automated Assembly Lines'],
  [/\bpipeline\b/gi, 'Automated Assembly Line'],
  [/\brunners\b/gi, 'Automation Workers'],
  [/\brunner\b/gi, 'Automation Worker'],
  [/\bbuilds\b/gi, 'Assemblies'],
  [/\bbuild\b/gi, 'Assembly'],
  [/\bdeployments\b/gi, 'Launches'],
  [/\bdeployment\b/gi, 'Launch'],
  [/\bdeploy\b/gi, 'Launch'],
  [/\bwebhooks\b/gi, 'Automatic Project Notifications'],
  [/\bwebhook\b/gi, 'Automatic Project Notification']
]);

const contextualRules = Object.freeze([
  [/\bpush(?:ed|es|ing)?\b/gi, 'Upload'],
  [/\bpull(?:ed|s|ing)?\b/gi, 'Download Updates'],
  [/\bissues\b/gi, 'To-Dos and Problems'],
  [/\bissue\b/gi, 'To-Do or Problem']
]);

export const FORBIDDEN_PROJECT_TERMS = Object.freeze([
  'git', 'github', 'version control', 'repository', 'repo', 'commit', 'push',
  'pull request', 'pr', 'branch', 'checkout', 'stash', 'merge conflict',
  'detached head', 'rebase', 'blame', 'workflow', 'github actions', 'ci/cd',
  'pipeline', 'deployment'
]);

export const PROJECT_OPERATION_STATES = Object.freeze({
  clean: 'Everything is saved',
  dirty: 'Unsaved project changes',
  ahead: 'Updates ready to upload',
  behind: 'Newer updates are available',
  diverged: 'Two versions need to be reconciled',
  draft: 'Work in Progress',
  open: 'Pending Approval',
  mergeable: 'Ready to Combine',
  merged: 'Approved and Combined',
  checks_pending: 'Safety checks are running',
  checks_passed: 'Safety checks passed',
  checks_failed: 'Safety checks need attention',
  deployed: 'Live',
  deployment_pending: 'Launch in progress',
  deployment_failed: 'Launch needs attention'
});

export const PROJECT_ERROR_MESSAGES = Object.freeze({
  editing_collision: {
    kind: 'editing_collision',
    title: 'Editing collision',
    summary: 'Someone else updated this project while we were working. Your work is safe. We need to refresh the Project Folder and reconcile the overlapping changes before saving again.',
    workSafe: true,
    nextAction: { id: 'refresh-and-reconcile', label: 'Refresh and reconcile' },
    approvalRequired: true,
    retryable: true
  },
  safety_check_failed: {
    kind: 'safety_check_failed',
    title: 'Safety check needs attention',
    summary: 'The automated safety checks found something that should be fixed before this update becomes official.',
    workSafe: true,
    nextAction: { id: 'inspect-and-prepare-fix', label: 'Show the problem and prepare a fix' },
    approvalRequired: false,
    retryable: true
  },
  missing_item: {
    kind: 'missing_item',
    title: 'Item not found',
    summary: 'I cannot find that file or Project Folder. It may have been moved, removed, renamed, or made private.',
    workSafe: true,
    nextAction: { id: 'search-again', label: 'Search again' },
    approvalRequired: false,
    retryable: false
  },
  access_denied: {
    kind: 'access_denied',
    title: 'Access needs to be restored',
    summary: 'We do not currently have the digital keys needed to change this project. You may have been signed out or the owner may need to grant access.',
    workSafe: true,
    nextAction: { id: 'reconnect-access', label: 'Reconnect access' },
    approvalRequired: true,
    retryable: true
  },
  moving_too_fast: {
    kind: 'moving_too_fast',
    title: 'The service needs a moment',
    summary: 'We are sending updates faster than the connected service can process them. Your work is safe. We can retry after a short pause.',
    workSafe: true,
    nextAction: { id: 'retry-automatically', label: 'Retry automatically', retryAfterSeconds: 60 },
    approvalRequired: false,
    retryable: true
  },
  system_hiccup: {
    kind: 'system_hiccup',
    title: 'Temporary service hiccup',
    summary: 'The connected project service is temporarily unavailable. Your local work is safe, and nothing needs to be recreated.',
    workSafe: true,
    nextAction: { id: 'retry-when-ready', label: 'Retry when the service recovers' },
    approvalRequired: false,
    retryable: true
  },
  system_tracking_error: {
    kind: 'system_tracking_error',
    title: 'Project tracking needs repair',
    summary: 'The current files are no longer attached to an active Draft Version. Your files are still present. We need to return them to a recent Save Point before continuing.',
    workSafe: true,
    nextAction: { id: 'repair-project-tracking', label: 'Repair project tracking' },
    approvalRequired: true,
    retryable: true
  },
  unknown: {
    kind: 'unknown',
    title: 'Project operation could not finish',
    summary: 'The system could not finish that project operation. Your existing work has not been discarded.',
    workSafe: true,
    nextAction: { id: 'inspect-and-retry', label: 'Inspect safely and try again' },
    approvalRequired: false,
    retryable: true
  }
});

function readableStatus(errorLike) {
  return Number(errorLike?.status || errorLike?.statusCode || errorLike?.code || 0);
}

function technicalText(errorLike) {
  return [
    errorLike?.message,
    errorLike?.stderr,
    errorLike?.error,
    errorLike?.cause?.message,
    typeof errorLike === 'string' ? errorLike : ''
  ].filter(Boolean).join(' ').toLowerCase();
}

export function classifyProjectError(errorLike) {
  const status = readableStatus(errorLike);
  const text = technicalText(errorLike);
  if (status === 409 || /non[- ]fast[- ]forward|fetch first|push rejected|merge conflict|reference update failed/.test(text)) return 'editing_collision';
  if (/detached\s+head|not currently on a branch/.test(text)) return 'system_tracking_error';
  if (/check run|workflow|runner|build failed|exit code 1|test failed|lint failed/.test(text)) return 'safety_check_failed';
  if (status === 404 || /not found|unknown revision|does not exist/.test(text)) return 'missing_item';
  if (status === 401 || status === 403 || /permission|forbidden|unauthorized|authentication|bad credentials/.test(text)) return 'access_denied';
  if (status === 429 || /rate limit|too many requests|secondary rate/.test(text)) return 'moving_too_fast';
  if (status >= 500 || /service unavailable|internal server|temporarily unavailable|gateway timeout/.test(text)) return 'system_hiccup';
  return 'unknown';
}

export function humanizeProjectError(errorLike, overrides = {}) {
  const kind = overrides.kind || classifyProjectError(errorLike);
  const base = PROJECT_ERROR_MESSAGES[kind] || PROJECT_ERROR_MESSAGES.unknown;
  return {
    status: 'blocked',
    ...base,
    ...overrides,
    nextAction: { ...base.nextAction, ...(overrides.nextAction || {}) }
  };
}

export function translateProjectText(input, { aggressive = false } = {}) {
  if (typeof input !== 'string' || input.length === 0) return input;
  let output = input;
  for (const [pattern, replacement] of phraseRules) output = output.replace(pattern, replacement);
  for (const [pattern, replacement] of technicalRules) output = output.replace(pattern, replacement);
  if (aggressive) for (const [pattern, replacement] of contextualRules) output = output.replace(pattern, replacement);
  return output;
}

export function normalizeProjectOperation({
  status = 'completed',
  summary,
  detail,
  workSafe = true,
  nextAction = null,
  approvalRequired = false,
  retryable = false,
  receiptId = null,
  data = null
} = {}) {
  return {
    status,
    summary: translateProjectText(summary || 'Project operation completed.'),
    ...(detail ? { detail: translateProjectText(detail) } : {}),
    workSafe: Boolean(workSafe),
    nextAction,
    approvalRequired: Boolean(approvalRequired),
    retryable: Boolean(retryable),
    ...(receiptId ? { receiptId } : {}),
    ...(data ? { data } : {})
  };
}

function shouldSkipTextNode(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  return Boolean(parent.closest('script, style, code, pre, textarea, [data-technical-copy], [contenteditable="true"]'));
}

function rewriteTextNode(node) {
  if (shouldSkipTextNode(node)) return;
  const translated = translateProjectText(node.nodeValue, { aggressive: true });
  if (translated !== node.nodeValue) node.nodeValue = translated;
}

function rewriteAttributes(element) {
  if (!(element instanceof Element) || element.matches('[data-technical-copy]')) return;
  for (const name of ['aria-label', 'aria-description', 'title', 'placeholder', 'alt']) {
    if (!element.hasAttribute(name)) continue;
    const current = element.getAttribute(name);
    const translated = translateProjectText(current, { aggressive: true });
    if (translated !== current) element.setAttribute(name, translated);
  }
}

function rewriteSubtree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    rewriteTextNode(root);
    return;
  }
  if (!(root instanceof Element || root instanceof Document || root instanceof DocumentFragment)) return;
  if (root instanceof Element) rewriteAttributes(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) rewriteTextNode(node);
    else rewriteAttributes(node);
  }
}

export function installProjectLanguageFirewall({ root = document.documentElement } = {}) {
  rewriteSubtree(root);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') rewriteTextNode(record.target);
      for (const node of record.addedNodes) rewriteSubtree(node);
      if (record.type === 'attributes') rewriteAttributes(record.target);
    }
  });
  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-label', 'aria-description', 'title', 'placeholder', 'alt']
  });
  return () => observer.disconnect();
}
