export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (value !== false && value != null) node.setAttribute(key, String(value));
  }
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function button(label, className, onClick) {
  return el('button', { class: className, text: label, onclick: onClick, type: 'button' });
}

export function sectionHeading(title, description, actions = []) {
  return el('div', { class: 'section-heading' }, [
    el('div', {}, [el('h2', { text: title }), el('p', { text: description })]),
    el('div', { class: 'section-actions' }, actions)
  ]);
}

export function clear(node) {
  node.replaceChildren();
}
