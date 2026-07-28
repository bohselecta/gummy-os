import {
  previewTesterFeedback,
  recordCohortEvent,
  saveTesterFeedback,
  summarizeCohortEvents
} from '../core/living-actor.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (['checked', 'disabled', 'hidden'].includes(key)) node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function download(name, value) {
  const anchor = document.createElement('a');
  const url = URL.createObjectURL(new Blob([value], { type: 'application/json' }));
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function createTesterOperations({
  repository,
  session,
  commit,
  environment,
  announce
}) {
  const root = h('section', {
    class: 'tester-operations',
    dataset: { testid: 'tester-operations' }
  });
  const category = h('select', { 'aria-label': 'Feedback category' }, [
    h('option', { value: 'confusion', text: 'Confusion' }),
    h('option', { value: 'bug', text: 'Bug' }),
    h('option', { value: 'delight', text: 'Delight' }),
    h('option', { value: 'missing-capability', text: 'Missing capability' }),
    h('option', { value: 'trust-privacy', text: 'Trust / privacy' })
  ]);
  const note = h('textarea', {
    rows: '5',
    maxlength: '2000',
    placeholder: 'What happened? Avoid personal data, source contents, credentials, and chat text.',
    'aria-label': 'Tester feedback note'
  });
  const preview = h('div', {
    class: 'feedback-preview',
    hidden: true,
    'aria-live': 'polite'
  });
  let approvedPreview = null;

  const renderSummary = async () => {
    const summary = summarizeCohortEvents(await repository.all('cohortEvents'));
    const block = h('div', { class: 'cohort-summary', dataset: { testid: 'local-cohort-summary' } }, [
      h('h3', { text: 'This-browser cohort summary' }),
      h('p', { text: `${summary.totalEvents} bounded events. No network telemetry is sent.` }),
      h('dl', { class: 'facts' }, Object.entries(summary.counts).flatMap(([key, value]) => [
        h('dt', { text: key.replaceAll('-', ' ') }),
        h('dd', { text: String(value) })
      ])),
      h('p', { class: 'meta', text: `Excluded: ${summary.excluded.join(', ')}` }),
      h('button', { class: 'button', onclick: () => download(
        `gummy-local-cohort-${commit.slice(0, 12)}.json`,
        JSON.stringify(summary, null, 2)
      ) }, 'Export local summary')
    ]);
    root.querySelector('.cohort-summary')?.replaceWith(block);
    if (!root.querySelector('.cohort-summary')) root.append(block);
  };

  const review = h('button', {
    class: 'button',
    onclick: () => {
      try {
        approvedPreview = previewTesterFeedback({
          category: category.value,
          note: note.value,
          context: {
            buildCommit: commit,
            buildEnvironment: environment,
            surface: 'About / tester operations'
          }
        });
        preview.hidden = false;
        preview.replaceChildren(
          h('strong', { text: 'Review exactly what can be saved or submitted' }),
          h('p', { text: approvedPreview.note }),
          h('p', { class: 'meta', text: `Category ${approvedPreview.category} · ${approvedPreview.redactionCount} secret-like value(s) redacted` }),
          h('p', { class: 'boundary-note compact', text: `Always excluded: ${approvedPreview.excluded.join(', ')}` })
        );
      } catch (error) {
        approvedPreview = null;
        preview.hidden = false;
        preview.replaceChildren(h('p', { class: 'notice', text: error.message }));
      }
    }
  }, 'Preview & redact');

  const save = h('button', {
    class: 'button primary',
    onclick: async () => {
      if (!approvedPreview) {
        announce('Preview the redacted feedback before saving it.');
        return;
      }
      const { record, receipt } = await saveTesterFeedback(repository, approvedPreview);
      await recordCohortEvent(repository, 'feedback-submitted', { surface: 'About' });
      approvedPreview = null;
      note.value = '';
      preview.replaceChildren(
        h('strong', { text: 'Saved locally first' }),
        h('p', { text: `${record.id} · ${receipt.id}` }),
        h('p', { text: 'Nothing was sent remotely.' })
      );
      await renderSummary();
    }
  }, 'Save locally + Receipt');

  const submit = h('button', {
    class: 'button',
    onclick: async () => {
      const local = (await repository.all('testerFeedback'))
        .filter(item => item.status === 'local-only')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      if (!local) {
        announce('Save reviewed feedback locally before remote submission.');
        return;
      }
      const receipts = (await repository.all('receipts'))
        .filter(item => item.action === 'save-tester-feedback-locally' && item.resources.includes(local.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const response = await fetch('/api/v1/tester-feedback', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-gummy-csrf': session.csrf || sessionStorage.getItem('gummy-csrf') || ''
        },
        body: JSON.stringify({
          id: local.id,
          category: local.category,
          note: local.note,
          context: local.context,
          excluded: local.excluded,
          localReceiptId: receipts[0]?.id,
          approvedAt: new Date().toISOString()
        })
      });
      const result = await response.json();
      if (!response.ok) {
        announce(`Remote feedback blocked: ${result.message}`);
        return;
      }
      await repository.put('testerFeedback', {
        ...local,
        status: 'submitted',
        updatedAt: new Date().toISOString(),
        remote: result
      }, { validate: false });
      announce('Reviewed feedback submitted to the configured private destination.');
    }
  }, session.feedbackConfigured || session.testMode
    ? 'Submit latest saved feedback'
    : 'Remote destination unavailable');
  submit.disabled = !(session.feedbackConfigured || session.testMode);

  root.append(
    h('p', { class: 'eyebrow', text: 'Privacy-respecting tester operations' }),
    h('h2', { text: 'Feedback you can inspect before it leaves' }),
    h('p', { text: 'Feedback becomes a local record and Receipt first. Remote submission is a separate Human action and only targets a configured private destination.' }),
    h('div', { class: 'split' }, [
      h('label', { class: 'field' }, [h('span', { text: 'Category' }), category]),
      h('div', { class: 'card' }, [
        h('strong', { text: 'Build under test' }),
        h('p', { text: `${environment} · ${commit}` })
      ])
    ]),
    h('label', { class: 'field' }, [h('span', { text: 'Feedback note' }), note]),
    h('div', { class: 'button-row' }, [review, save, submit]),
    preview,
    h('div', { class: 'cohort-summary' })
  );
  await renderSummary();
  return root;
}
