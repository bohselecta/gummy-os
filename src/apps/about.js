import { el, sectionHeading } from '../core/dom.js';

export function createAboutApp() {
  const planes = [
    ['Experience Plane', 'Desktop, browser, files, companion, Snack identity'],
    ['Object & Graph Plane', 'Private objects, Bowls, Drops, social and project relationships'],
    ['Agent Plane', 'Provider-neutral planning, memory, model routing, and task orchestration'],
    ['Capability Plane', 'Least privilege, approvals, connector mediation, and revocation'],
    ['Runtime Plane', 'Web-native, Wasm, Linux compatibility, and governed cloud capsules'],
    ['Enterprise Plane', 'Organizations, policy packs, App Pack registry, audit, and deployment'],
    ['Federation Plane', 'Portable Snacks, object exchange, fork compatibility, and protocol discovery']
  ];
  const root = el('div');
  root.append(sectionHeading('Gummy 0.1', 'A personal AI computer, social protocol, and governed enterprise software habitat.'));
  root.append(el('div', { class: 'architecture-stack' }, planes.map(([name, description]) => el('article', { class: 'architecture-plane' }, [el('strong', { text: name }), el('span', { text: description })]))));
  root.append(el('p', { style: 'margin-top:18px;color:var(--muted);line-height:1.6;', text: 'Gummy stays free and useful for personal computing. Commercial value lives in governed integrations, verified Application Packs, enterprise deployment, certification, support, and OEM editions. Forks are expected; protocol compatibility is the leverage.' }));
  return { node: root };
}
