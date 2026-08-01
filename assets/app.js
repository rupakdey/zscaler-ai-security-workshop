
(() => {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('zscalerLabTheme');
  const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = storedTheme || (preferDark ? 'dark' : 'light');
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const updateThemeLabel = () => {
    if (!themeBtn) return;
    const dark = root.dataset.theme === 'dark';
    themeBtn.textContent = dark ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.title = dark ? 'Light mode' : 'Dark mode';
  };
  updateThemeLabel();
  themeBtn?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zscalerLabTheme', root.dataset.theme);
    updateThemeLabel();
  });

  const allTasks = JSON.parse(document.body.dataset.allTasks || '[]');
  const stateKey = 'zscalerAiWorkshopTaskStateV1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(stateKey) || '{}'); } catch (_) { state = {}; }
  const checks = [...document.querySelectorAll('.task-check')];
  const updateProgress = () => {
    const done = allTasks.filter(id => state[id]).length;
    const pct = allTasks.length ? Math.round(done / allTasks.length * 100) : 0;
    document.querySelectorAll('[data-completion-fill]').forEach(el => el.style.width = pct + '%');
    document.querySelectorAll('[data-completion-text]').forEach(el => el.textContent = pct + '%');
    document.querySelectorAll('.nav-task').forEach(a => a.classList.toggle('complete', !!state[a.dataset.taskId]));
  };
  checks.forEach(chk => {
    const id = chk.dataset.taskId;
    chk.checked = !!state[id];
    chk.closest('.lab-section')?.classList.toggle('task-complete', chk.checked);
    chk.addEventListener('change', () => {
      state[id] = chk.checked;
      localStorage.setItem(stateKey, JSON.stringify(state));
      chk.closest('.lab-section')?.classList.toggle('task-complete', chk.checked);
      updateProgress();
    });
  });
  updateProgress();

  const sections = [...document.querySelectorAll('.lab-section[id]')];
  const sectionOrder = JSON.parse(document.body.dataset.sectionOrder || '[]');
  const pageIndex = Number(document.body.dataset.pageIndex || 0);
  const pageStartId = document.body.dataset.pageStartId || '';
  const pageCount = Number(document.body.dataset.pageCount || 1);
  const positionFill = document.querySelector('[data-position-fill]');
  const positionText = document.querySelector('[data-position-text]');
  const positionTitle = document.querySelector('[data-position-title]');
  const navLinks = [...document.querySelectorAll('.nav-task')];
  const setActive = (id, title) => {
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.taskId === id));
    const found = sectionOrder.indexOf(id);
    const fallback = sectionOrder.indexOf(pageStartId);
    const idx = found >= 0 ? found : Math.max(0, fallback);
    const pct = sectionOrder.length > 1 ? Math.round(idx / (sectionOrder.length - 1) * 100) : Math.round((pageIndex + 1) / pageCount * 100);
    if (positionFill) positionFill.style.width = pct + '%';
    if (positionText) positionText.textContent = pct + '% through guide';
    if (positionTitle) positionTitle.textContent = title || document.title;
  };
  if (sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id, visible.target.dataset.title);
    }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, .15, .5] });
    sections.forEach(s => observer.observe(s));
    setActive(sections[0].id, sections[0].dataset.title);
  }

  document.querySelectorAll('.copy-button').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.prompt-card');
      const text = [...card.querySelectorAll('p')].map(p => p.innerText).join('\n');
      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      const old = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => btn.textContent = old, 1200);
    });
  });

  // Persistent, browser-local workshop credential store. Values are never transmitted by this guide.
  const credentialKey = 'zscalerAiWorkshopCredentialsV1';
  const windowStatePrefix = 'ZSCALER_AI_LAB_V1:';
  const credentialInputs = [...document.querySelectorAll('[data-credential-key]')];
  const credentialStatus = document.querySelector('[data-credential-status]');
  let credentials = {};
  const readWindowCredentials = () => {
    try {
      if (!window.name.startsWith(windowStatePrefix)) return null;
      return JSON.parse(decodeURIComponent(window.name.slice(windowStatePrefix.length)));
    } catch (_) { return null; }
  };
  try { credentials = JSON.parse(localStorage.getItem(credentialKey) || '{}'); } catch (_) { credentials = {}; }
  const windowCredentials = readWindowCredentials();
  if (windowCredentials && typeof windowCredentials === 'object') credentials = windowCredentials;
  const writeCredentials = () => {
    try { localStorage.setItem(credentialKey, JSON.stringify(credentials)); } catch (_) {}
    try { window.name = windowStatePrefix + encodeURIComponent(JSON.stringify(credentials)); } catch (_) {}
    if (credentialStatus) {
      credentialStatus.textContent = 'Saved locally';
      clearTimeout(writeCredentials.statusTimer);
      writeCredentials.statusTimer = setTimeout(() => credentialStatus.textContent = '', 1300);
    }
  };
  credentialInputs.forEach(input => {
    const key = input.dataset.credentialKey;
    input.value = credentials[key] || '';
    input.addEventListener('input', () => { credentials[key] = input.value; writeCredentials(); });
  });
  document.querySelector('[data-credentials-clear]')?.addEventListener('click', () => {
    credentials = {};
    credentialInputs.forEach(input => input.value = '');
    try { localStorage.removeItem(credentialKey); } catch (_) {}
    try { window.name = windowStatePrefix + encodeURIComponent('{}'); } catch (_) {}
    if (credentialStatus) { credentialStatus.textContent = 'Cleared'; setTimeout(() => credentialStatus.textContent = '', 1300); }
  });

  const glossary = document.querySelector('.glossary-panel');
  const overlay = document.querySelector('.overlay');
  const setGlossary = open => {
    glossary?.classList.toggle('open', open); overlay?.classList.toggle('open', open);
    glossary?.setAttribute('aria-hidden', String(!open));
  };
  document.querySelectorAll('[data-glossary-open]').forEach(b => b.addEventListener('click', () => setGlossary(true)));
  document.querySelectorAll('[data-glossary-close]').forEach(b => b.addEventListener('click', () => setGlossary(false)));
  overlay?.addEventListener('click', () => { setGlossary(false); document.querySelector('.sidebar')?.classList.remove('open'); overlay.classList.remove('open'); });

  const side = document.querySelector('.sidebar');
  document.querySelector('[data-mobile-menu]')?.addEventListener('click', () => { side?.classList.toggle('open'); overlay?.classList.toggle('open', side?.classList.contains('open')); });

  const modal = document.querySelector('.image-modal');
  const modalImg = modal?.querySelector('img');
  document.querySelectorAll('figure img').forEach(img => img.addEventListener('click', () => {
    if (modal && modalImg) { modalImg.src = img.src; modalImg.alt = img.alt; modal.classList.add('open'); }
  }));
  modal?.addEventListener('click', e => { if (e.target === modal || e.target.matches('button')) modal.classList.remove('open'); });

  const back = document.querySelector('.back-top');
  window.addEventListener('scroll', () => back?.classList.toggle('show', scrollY > 700), { passive: true });
  back?.addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));

  const search = document.querySelector('[data-nav-search]');
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.nav-group').forEach(group => {
      const matches = !q || group.innerText.toLowerCase().includes(q);
      group.classList.toggle('hidden-by-search', !matches);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { setGlossary(false); modal?.classList.remove('open'); side?.classList.remove('open'); overlay?.classList.remove('open'); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search?.focus(); }
  });
})();
