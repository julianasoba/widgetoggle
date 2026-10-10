/* Theme Toggle Widget v0.1.1 — framework-free embeddable widget */
(() => {
  'use strict';
  if (window.ThemeToggleWidget) return;

  const MODES = ['light', 'dark', 'system'];
  const VARIANTS = ['segmented', 'cycle', 'switch'];
  const supplied = window.ThemeToggleWidgetConfig || {};
  const config = {
    storageKey: 'theme-mode', defaultMode: 'system', groupLabel: 'Site theme',
    ...supplied,
    labels: { light: 'Light', dark: 'Dark', system: 'System', ...(supplied.labels || {}) }
  };
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const widgets = new Map();
  const validMode = value => MODES.includes(value);
  const storage = {
    get() { try { return localStorage.getItem(config.storageKey); } catch (_) { return null; } },
    set(value) { try { localStorage.setItem(config.storageKey, value); } catch (_) {} }
  };
  const icons = {
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/></svg>',
    system: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>'
  };
  const saved = storage.get();
  let mode = validMode(saved) ? saved : (validMode(config.defaultMode) ? config.defaultMode : 'system');
  const resolveTheme = (value = mode) => value === 'system' ? (media.matches ? 'dark' : 'light') : value;

  const css = `
    :host { --tt-size:40px; --tt-accent:#111322; --tt-active-fg:#fff; --tt-border:color-mix(in srgb,currentColor 28%,transparent); --tt-hover:color-mix(in srgb,currentColor 10%,transparent); --tt-speed:.2s; display:inline-flex; vertical-align:middle; color:inherit; font:inherit; line-height:1; }
    :host([data-size="sm"]) { --tt-size:32px; } :host([data-size="lg"]) { --tt-size:48px; }
    :host([data-theme="dark"]) { --tt-accent:#fff; --tt-active-fg:#111322; }
    @media(pointer:coarse){:host(:not([data-size])){--tt-size:44px;}}
    *{box-sizing:border-box} button{border:0;margin:0;color:inherit;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
    button:focus-visible{outline:2px solid var(--tt-accent);outline-offset:3px}
    svg{display:block;width:calc(var(--tt-size)*.5);height:calc(var(--tt-size)*.5);fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
    .buttons{display:inline-flex;align-items:center;gap:2px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;min-width:var(--tt-size);height:var(--tt-size);padding:0 calc(var(--tt-size)*.25);border-radius:999px;background:transparent;transition:background var(--tt-speed),color var(--tt-speed)}.btn:hover{background:var(--tt-hover)}
    .label{font-size:calc(var(--tt-size)*.32);white-space:nowrap}:host(:not([data-label])) .label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .segmented{padding:3px;border:1px solid var(--tt-border);border-radius:999px}.segmented .btn{height:calc(var(--tt-size) - 8px);min-width:calc(var(--tt-size) - 8px)}.segmented .btn[aria-pressed="true"]{background:var(--tt-accent);color:var(--tt-active-fg)}
    .cycle .btn{border:1px solid var(--tt-border)}
    .switch{position:relative;width:calc(var(--tt-size)*1.8);height:var(--tt-size);padding:0;border:1px solid var(--tt-border);border-radius:999px;background:transparent;transition:background var(--tt-speed)}.switch[aria-checked="true"]{background:color-mix(in srgb,var(--tt-accent) 22%,transparent)}
    .thumb{position:absolute;top:50%;left:3px;display:grid;place-items:center;width:calc(var(--tt-size) - 10px);height:calc(var(--tt-size) - 10px);border-radius:50%;background:var(--tt-accent);color:var(--tt-active-fg);transform:translateY(-50%);transition:left var(--tt-speed) cubic-bezier(.3,.7,.3,1)}.switch[aria-checked="true"] .thumb{left:calc(100% - 3px - (var(--tt-size) - 10px))}.thumb svg{width:56%;height:56%}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important}}
  `;
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function applyTheme(emit = true) {
    const theme = resolveTheme();
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-mode', mode);
    root.style.colorScheme = theme;
    for (const [element, update] of widgets) {
      if (element.isConnected) { element.setAttribute('data-theme', theme); update(); }
      else widgets.delete(element);
    }
    if (emit) document.dispatchEvent(new CustomEvent('themechange', { detail: { mode, theme } }));
  }
  function setMode(next) { if (!validMode(next)) return; mode = next; storage.set(next); applyTheme(); }
  function build(element) {
    if (element.dataset.ttReady === 'true') return;
    element.dataset.ttReady = 'true';
    const variant = VARIANTS.includes(element.dataset.variant) ? element.dataset.variant : 'segmented';
    const requested = (element.dataset.modes || '').split(',').map(s => s.trim()).filter(validMode);
    const modes = requested.length ? [...new Set(requested)] : MODES;
    const shadow = element.shadowRoot || element.attachShadow({ mode: 'open' });
    const style = document.createElement('style'); style.textContent = css; shadow.appendChild(style);
    const wrapper = document.createElement('div'); wrapper.className = 'buttons';
    if (variant === 'segmented') { wrapper.classList.add('segmented'); wrapper.setAttribute('role','group'); wrapper.setAttribute('aria-label',config.groupLabel); }
    if (variant === 'cycle') wrapper.classList.add('cycle');
    if (element.dataset.size) element.setAttribute('data-size', element.dataset.size);
    if (element.hasAttribute('data-label')) element.setAttribute('data-label','');
    element.setAttribute('data-theme', resolveTheme());
    let update;
    if (variant === 'segmented') {
      wrapper.innerHTML = modes.map(name => `<button type="button" class="btn" data-mode="${name}" aria-pressed="false" title="${escapeHTML(config.labels[name])}" aria-label="${escapeHTML(config.labels[name])}">${icons[name]}<span class="label">${escapeHTML(config.labels[name])}</span></button>`).join('');
      wrapper.addEventListener('click', event => { const button = event.target.closest('[data-mode]'); if (button) setMode(button.dataset.mode); });
      update = () => wrapper.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    } else if (variant === 'cycle') {
      wrapper.innerHTML = '<button type="button" class="btn"><span class="icon"></span><span class="label"></span></button>';
      const button = wrapper.querySelector('button'), icon = wrapper.querySelector('.icon'), label = wrapper.querySelector('.label');
      button.addEventListener('click', () => {
        const index = modes.indexOf(mode);
        const next = index === -1
          ? (modes.find(m => m !== resolveTheme()) ?? modes[0])
          : modes[(index + 1) % modes.length];
        setMode(next);
      });
      update = () => {
        const theme = resolveTheme(); // 'light' | 'dark' — nunca mostra o ícone "system"
        const text = mode === 'system' ? `${config.labels.system} (${config.labels[theme]})` : config.labels[theme];
        icon.innerHTML = icons[theme];
        label.textContent = config.labels[theme];
        button.dataset.auto = String(mode === 'system'); // útil para estilizar o modo automático
        button.setAttribute('aria-label', `${config.groupLabel}: ${text}. Activate to change.`);
        button.title = `${config.groupLabel}: ${text}`;
      };
    } else {
      wrapper.innerHTML = `<button type="button" class="switch" role="switch" aria-checked="false" aria-label="${escapeHTML(config.labels.dark)}"><span class="thumb">${icons.light}</span></button>`;
      const button = wrapper.querySelector('button');
      button.addEventListener('click', () => setMode(resolveTheme() === 'dark' ? 'light' : 'dark'));
      update = () => {
        const dark = resolveTheme() === 'dark';
        button.setAttribute('aria-checked', String(dark));
        button.setAttribute('aria-label', dark ? config.labels.light : config.labels.dark);
        wrapper.querySelector('.thumb').innerHTML = icons[dark ? 'dark' : 'light'];
      };
    }
    shadow.appendChild(wrapper); widgets.set(element, update); update();
  }
  function init(scope = document) { if (scope.matches && scope.matches('[data-theme-toggle]')) build(scope); if (scope.querySelectorAll) scope.querySelectorAll('[data-theme-toggle]').forEach(build); }
  applyTheme(false);
  const onSystemChange = () => { if (mode === 'system') applyTheme(); };
  if (media.addEventListener) media.addEventListener('change', onSystemChange); else if (media.addListener) media.addListener(onSystemChange);
  window.addEventListener('storage', event => { if (event.key !== config.storageKey) return; mode = validMode(event.newValue) ? event.newValue : config.defaultMode; applyTheme(); });
  function start() { init(); if (document.body) new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) init(node); }))).observe(document.body, { childList:true, subtree:true }); }
  window.ThemeToggleWidget = { init, set:setMode, toggle:() => setMode(resolveTheme() === 'dark' ? 'light' : 'dark'), get mode(){return mode;}, get theme(){return resolveTheme();} };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true }); else start();
})();
