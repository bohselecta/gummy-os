import { sha256 } from '../core/hash.js';
import { createReceipt } from '../core/records.js';

export async function createBrowserSurface({ h, repository }) {
  const stateId = 'browser-state:actor:hayden';
  const saved = await repository.get('meta', stateId);
  const browserState = saved || {
    id: stateId,
    ownerActorId: 'actor:hayden',
    allowedLinks: [],
    history: [],
    updatedAt: new Date().toISOString()
  };
  const input = h('input', { value: 'https://example.com', 'aria-label': 'External URL' });
  const label = h('input', { value: 'Example', 'aria-label': 'Saved link label' });
  const selectedText = h('textarea', {
    rows: '4',
    'aria-label': 'Selected text to attach',
    placeholder: 'Paste only the text you explicitly selected. Gummy never reads the embedded page.'
  });
  const frame = h('iframe', {
    title: 'Isolated external preview',
    sandbox: 'allow-scripts allow-forms allow-popups',
    referrerpolicy: 'strict-origin-when-cross-origin',
    hidden: true
  });
  const output = h('p', {
    class: 'notice compact-notice',
    role: 'status',
    text: 'Save an HTTPS link before opening it.'
  });
  const savedList = h('div', { class: 'record-list' });
  const historyList = h('div', { class: 'record-list' });
  const savedHeading = h('h3');
  const historyHeading = h('h3');

  const persist = async () => {
    browserState.updatedAt = new Date().toISOString();
    await repository.put('meta', browserState);
  };
  const exactUrl = () => {
    const url = new URL(input.value.trim());
    if (url.protocol !== 'https:') throw new Error('Only valid HTTPS addresses can be saved or opened.');
    return url.toString();
  };
  const renderLists = () => {
    savedHeading.textContent = `Saved links (${browserState.allowedLinks.length})`;
    historyHeading.textContent = `Private history (${browserState.history.length})`;
    savedList.replaceChildren(...browserState.allowedLinks.map(link => h('article', { class: 'record-row' }, [
      h('div', {}, [h('strong', { text: link.label }), h('small', { text: link.url })]),
      h('button', {
        class: 'button',
        onclick: () => {
          input.value = link.url;
          label.value = link.label;
        }
      }, 'Use')
    ])));
    historyList.replaceChildren(...browserState.history.slice().reverse().map(entry => h('article', { class: 'record-row' }, [
      h('div', {}, [
        h('strong', { text: entry.label }),
        h('small', { text: entry.url }),
        h('small', { text: entry.openedAt })
      ]),
      h('button', {
        class: 'button',
        onclick: () => {
          input.value = entry.url;
          label.value = entry.label;
        }
      }, 'Use')
    ])));
  };

  const openPreview = async () => {
    try {
      const url = exactUrl();
      const allowed = browserState.allowedLinks.find(link => link.url === url);
      if (!allowed) throw new Error('Save this exact link first. Only your allowlisted links can open here.');
      frame.src = url;
      frame.hidden = false;
      browserState.history.push({ url, label: allowed.label, openedAt: new Date().toISOString() });
      browserState.history = browserState.history.slice(-50);
      await persist();
      await createReceipt(repository, {
        action: 'open-allowlisted-browser-link',
        resources: [url],
        capabilities: ['browser:sandboxed-frame'],
        reversible: true,
        evidence: {
          sandbox: 'allow-scripts allow-forms allow-popups',
          sameOriginPrivileges: false,
          ambientScraping: false
        },
        detail: 'Opened one Human-allowlisted HTTPS link in a sandbox without same-origin privileges.'
      });
      output.textContent = 'Opened the saved link in an isolated frame. Page content is not readable by Gummy.';
      renderLists();
    } catch (error) {
      output.textContent = error.message;
    }
  };

  const attachSelection = async () => {
    try {
      const url = exactUrl();
      if (!browserState.allowedLinks.some(link => link.url === url)) {
        throw new Error('Save this exact link before attaching a selection from it.');
      }
      const text = selectedText.value.trim();
      if (!text) throw new Error('Paste the exact selected text you want to keep.');
      const now = new Date().toISOString();
      const inlineText = `${label.value.trim() || new URL(url).hostname}\n${url}\n\n${text}`;
      const gummy = {
        schema: 'gummy.gummy/v0',
        id: `gummy:browser-selection:${crypto.randomUUID()}`,
        kind: 'note',
        title: `${label.value.trim() || new URL(url).hostname} selection`,
        ownerActorId: 'actor:hayden',
        creatorActorId: 'actor:hayden',
        visibility: 'private',
        revision: 1,
        content: {
          mediaType: 'text/plain',
          inlineText,
          sizeBytes: new TextEncoder().encode(inlineText).byteLength
        },
        hash: { algorithm: 'sha256', value: await sha256(inlineText) },
        capabilities: ['read'],
        quarantine: {
          status: 'contained-approved',
          source: url,
          classification: 'Human-selected browser text',
          decidedByHumanId: 'human:hayden',
          decidedAt: now,
          nativeAuthority: false
        },
        provenance: { sourceUrl: url, ambientScraping: false },
        createdAt: now,
        updatedAt: now
      };
      await repository.putValidated('gummies', gummy);
      const receipt = await createReceipt(repository, {
        action: 'attach-browser-selection',
        resources: [url, gummy.id],
        resultGummyIds: [gummy.id],
        capabilities: ['gummy.create'],
        reversible: true,
        evidence: { sourceHash: gummy.hash.value, ambientScraping: false },
        detail: 'Created a private Gummy from only the text the Human pasted into the selection field.'
      });
      gummy.provenance.receiptIds = [receipt.id];
      await repository.putValidated('gummies', gummy);
      selectedText.value = '';
      output.textContent = `Saved “${gummy.title}” in Gummy Box. No embedded-page content was read.`;
    } catch (error) {
      output.textContent = error.message;
    }
  };

  renderLists();
  return h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Isolated navigation' }),
    h('h2', { text: 'Gummy Browser' }),
    h('p', {
      class: 'notice',
      text: 'External pages open only after you save the exact HTTPS link. The sandbox has no same-origin privileges. Gummy records your local history but never reads or scrapes the embedded page.'
    }),
    h('label', { class: 'field' }, [h('span', { text: 'HTTPS address' }), input]),
    h('label', { class: 'field' }, [h('span', { text: 'Saved link label' }), label]),
    h('div', { class: 'button-row' }, [
      h('button', { class: 'button', onclick: async () => {
        try {
          const url = exactUrl();
          const existing = browserState.allowedLinks.find(link => link.url === url);
          if (existing) existing.label = label.value.trim() || new URL(url).hostname;
          else {
            browserState.allowedLinks.push({
              url,
              label: label.value.trim() || new URL(url).hostname,
              savedAt: new Date().toISOString()
            });
          }
          await persist();
          output.textContent = 'Saved this exact HTTPS link to your private Browser allowlist.';
          renderLists();
        } catch (error) {
          output.textContent = error.message;
        }
      } }, 'Save exact link'),
      h('button', { class: 'button primary', onclick: () => void openPreview() }, 'Open isolated preview')
    ]),
    output,
    frame,
    h('section', { class: 'card' }, [
      h('h3', { text: 'Attach a Human-selected passage' }),
      h('p', {
        text: 'Paste only the passage you selected. Gummy does not receive iframe DOM access or ambient page content.'
      }),
      selectedText,
      h('button', { class: 'button', onclick: () => void attachSelection() }, 'Attach selection as a Gummy')
    ]),
    h('section', { class: 'card' }, [savedHeading, savedList]),
    h('section', { class: 'card' }, [
      h('div', { class: 'button-row' }, [
        historyHeading,
        h('button', { class: 'button', onclick: async () => {
          browserState.history = [];
          await persist();
          output.textContent = 'Cleared only your Browser history. Saved links and Gummies were preserved.';
          renderLists();
        } }, 'Clear private history')
      ]),
      historyList
    ])
  ]);
}
