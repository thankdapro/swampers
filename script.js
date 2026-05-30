// THE SWAMPERS — Interactivity

// Smooth-scroll handled by CSS; add scroll-spy + nav effects
function __swampersInit() {

  const navbar = document.querySelector('.navbar');

  // Add navbar shadow when scrolled
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.borderBottomColor = 'var(--swamp-light)';
      navbar.style.boxShadow = '0 4px 30px rgba(168, 192, 96, 0.2)';
    } else {
      navbar.style.borderBottomColor = '';
      navbar.style.boxShadow = '';
    }
  });

  // Fade-in on scroll for sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(section);
  });

  // Animated number counters
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased).toString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toString() + suffix;
    };
    requestAnimationFrame(step);
  };

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  // Paper lightbox modal
  const modal = document.getElementById('paperModal');
  if (modal) {
    const modalImg = modal.querySelector('.paper-modal-img');
    const modalCaption = modal.querySelector('.paper-modal-caption');
    const closeBtn = modal.querySelector('.paper-modal-close');

    const openModal = (src, caption) => {
      modalImg.src = src;
      modalImg.alt = caption;
      modalCaption.textContent = caption;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      setTimeout(() => { modalImg.src = ''; }, 250);
    };

    document.querySelectorAll('.paper-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const href = card.getAttribute('href');
        const name = card.querySelector('.paper-card-name')?.textContent || '';
        openModal(href, name);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  // Random small wobble for newspaper cards on hover entry
  document.querySelectorAll('.newspaper').forEach(paper => {
    const baseRotation = parseFloat(getComputedStyle(paper).transform);
    paper.addEventListener('mouseenter', () => {
      paper.style.zIndex = '10';
    });
    paper.addEventListener('mouseleave', () => {
      setTimeout(() => { paper.style.zIndex = ''; }, 250);
    });
  });

  // Click ripple on buttons (just for fun)
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Only prevent default for placeholder links
      if (btn.getAttribute('href') === '#') {
        e.preventDefault();
        const original = btn.textContent;
        btn.textContent = 'PLACEHOLDER — ADD LINK';
        setTimeout(() => { btn.textContent = original; }, 1500);
      }
    });
  });

  // (Logo click easter egg moved into toggle-aware version below)

  // Inject the floatUp keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-60px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // BETA BANNER — dismissible, persists in localStorage
  // ============================================
  const betaBanner = document.getElementById('betaBanner');
  const betaClose  = document.getElementById('betaBannerClose');
  const BETA_KEY = 'swampers.betaDismissed';
  if (betaBanner) {
    if (localStorage.getItem(BETA_KEY) === '1') {
      betaBanner.classList.add('is-hidden');
      document.body.classList.add('beta-dismissed');
    }
    betaClose?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      betaBanner.classList.add('is-hidden');
      document.body.classList.add('beta-dismissed');
      try { localStorage.setItem(BETA_KEY, '1'); } catch {}
    });
  }

  // ============================================
  // SETTINGS PANEL + 8 TOGGLES
  // ============================================
  const TOGGLES = [
    { id: 't-serious',     key: 'serious',     bodyClass: 'serious',     default: false },
    { id: 't-easter',      key: 'easter',      bodyClass: 'easter-on',   default: true  },
    { id: 't-dvd',         key: 'dvd',         bodyClass: 'dvd-on',      default: false },
    { id: 't-ads',         key: 'ads',         bodyClass: 'ads-on',      default: false },
    { id: 't-frog-cursor', key: 'frogCursor',  bodyClass: 'frog-cursor', default: false }
  ];

  const settingsBtn = document.getElementById('settingsBtn');
  const drawer = document.getElementById('settingsDrawer');
  const backdrop = document.getElementById('settingsBackdrop');
  const closeBtn = document.getElementById('settingsClose');
  const resetBtn = document.getElementById('settingsReset');

  const LS_KEY = 'swampers.settings';

  function loadSettings() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveSettings(s) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function applyToggle(t, value) {
    if (t.invertOff) {
      // For alliances: ON means default state, OFF means add alliances-off class
      document.body.classList.toggle(t.invertOff, !value);
      document.body.classList.toggle(t.bodyClass, value);
    } else {
      document.body.classList.toggle(t.bodyClass, value);
    }
  }

  // Initialize all toggles from storage (or defaults)
  const stored = loadSettings();
  TOGGLES.forEach(t => {
    const el = document.getElementById(t.id);
    if (!el) return;
    const value = stored.hasOwnProperty(t.key) ? stored[t.key] : t.default;
    el.checked = value;
    applyToggle(t, value);
    el.addEventListener('change', () => {
      applyToggle(t, el.checked);
      const current = loadSettings();
      current[t.key] = el.checked;
      saveSettings(current);
      onToggleChange(t.key, el.checked);
    });
  });

  // Drawer open/close
  function openDrawer() {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  settingsBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('is-open')) closeDrawer();
  });

  // Reset to defaults
  resetBtn?.addEventListener('click', () => {
    TOGGLES.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) {
        el.checked = t.default;
        applyToggle(t, t.default);
      }
    });
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    refreshTownStats();
  });

  // ============================================
  // DVD SPEED SLIDER
  // ============================================
  let dvdSpeedMultiplier = 1;
  const speedSlider = document.getElementById('t-dvd-speed');
  const speedValueEl = document.getElementById('dvdSpeedValue');
  if (speedSlider) {
    const stored = loadSettings();
    const initialSpeed = stored.dvdSpeed || 1;
    speedSlider.value = initialSpeed;
    dvdSpeedMultiplier = parseInt(initialSpeed, 10);
    if (speedValueEl) {
      speedValueEl.textContent = dvdSpeedMultiplier === 6 ? '!!' : dvdSpeedMultiplier + 'x';
    }
    speedSlider.addEventListener('input', () => {
      dvdSpeedMultiplier = parseInt(speedSlider.value, 10);
      if (speedValueEl) {
        speedValueEl.textContent = dvdSpeedMultiplier === 6 ? '!!' : dvdSpeedMultiplier + 'x';
      }
      const s = loadSettings();
      s.dvdSpeed = dvdSpeedMultiplier;
      saveSettings(s);
    });
  }

  // Map zoom slider
  const mapZoomSlider = document.getElementById('t-map-zoom');
  const mapZoomValueEl = document.getElementById('mapZoomValue');
  const mapZoomTarget = document.getElementById('mapZoom');
  function applyMapZoom(v) {
    if (mapZoomTarget) mapZoomTarget.style.setProperty('--map-scale', v);
    if (mapZoomValueEl) mapZoomValueEl.textContent = parseFloat(v).toFixed(1) + 'x';
  }
  if (mapZoomSlider) {
    const storedZoom = loadSettings().mapZoom || 1;
    mapZoomSlider.value = storedZoom;
    applyMapZoom(storedZoom);
    mapZoomSlider.addEventListener('input', () => {
      const v = parseFloat(mapZoomSlider.value);
      applyMapZoom(v);
      const s = loadSettings();
      s.mapZoom = v;
      saveSettings(s);
    });
  }

  function onToggleChange(key, value) {
    // Reserved for future cross-toggle reactions
  }

  // ============================================
  // EASTER EGGS
  // ============================================
  function easterOn() {
    const stored = loadSettings();
    return stored.hasOwnProperty('easter') ? stored.easter : true;
  }

  // (The frog ribbit logo click is already wired above. Guard it with easter check.)
  const logo = document.querySelector('.logo');
  const ribbits = ['*ribbit*', '*croak*', '*splash*', '*gloop*', '*BLORP*', '*shrek noises*'];
  if (logo) {
    let clickCount = 0;
    logo.addEventListener('click', (e) => {
      if (!easterOn()) return;
      clickCount++;
      const msg = document.createElement('div');
      msg.textContent = clickCount === 7 ? 'In Murk we Trust.' : ribbits[Math.floor(Math.random() * ribbits.length)];
      msg.style.cssText = `
        position: fixed;
        top: ${e.clientY}px;
        left: ${e.clientX}px;
        color: var(--swamp-glow, #a8c060);
        font-family: 'Press Start 2P', monospace;
        font-size: ${clickCount === 7 ? '1.4rem' : '1rem'};
        pointer-events: none;
        z-index: 9999;
        text-shadow: 0 0 12px currentColor;
        animation: floatUp 1.8s ease-out forwards;
      `;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 1800);
      if (clickCount === 7) clickCount = 0;
    });
  }

  // Konami code → secret Shrek motto overlay
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  document.addEventListener('keydown', (e) => {
    if (!easterOn()) { konamiIdx = 0; return; }
    if (e.key.toLowerCase() === konami[konamiIdx].toLowerCase() || e.key === konami[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konami.length) {
        konamiIdx = 0;
        triggerShrekOverlay();
      }
    } else {
      konamiIdx = 0;
    }
  });

  function triggerShrekOverlay() {
    const o = document.createElement('div');
    o.className = 'shrek-overlay';
    o.innerHTML = `
      <div class="shrek-motto">&ldquo;In Murk we Trust.&rdquo;</div>
      <div class="shrek-sub">Onions have layers. So do nations.</div>
    `;
    o.style.cssText = `
      position: fixed; inset: 0; z-index: 99998;
      background: radial-gradient(ellipse at center, rgba(120,180,60,0.35), rgba(13,26,13,0.95));
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
      text-align: center; padding: 24px; cursor: pointer;
      animation: fadeIn 0.6s ease both;
    `;
    document.body.appendChild(o);
    o.addEventListener('click', () => o.remove());
    setTimeout(() => o.remove(), 4500);
  }

  const shrekStyle = document.createElement('style');
  shrekStyle.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .shrek-motto {
      font-family: 'Press Start 2P', monospace;
      font-size: clamp(1.6rem, 6vw, 4rem);
      color: #c8ff70;
      text-shadow: 0 0 30px rgba(120,255,60,0.5), 4px 4px 0 #0a1408;
    }
    .shrek-sub {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: clamp(0.9rem, 2vw, 1.2rem);
      color: #b8c8a0;
      font-style: italic;
    }
  `;
  document.head.appendChild(shrekStyle);

  // ============================================
  // DVD BOUNCER (frog bouncing around screen)
  // ============================================
  // ============================================
  // DEDICATED MAP PAGE — drag-to-pan + zoom controls
  // ============================================
  const mapStage  = document.getElementById('mapStage');
  const mapPan    = document.getElementById('mapPan');
  const mctrlIn   = document.getElementById('mctrlIn');
  const mctrlOut  = document.getElementById('mctrlOut');
  const mctrlSlider = document.getElementById('mctrlSlider');
  const mctrlValue  = document.getElementById('mctrlValue');
  const mctrlReset  = document.getElementById('mctrlReset');

  if (mapStage && mapPan) {
    let scale = 1, panX = 0, panY = 0;
    let dragging = false, startX = 0, startY = 0, startPanX = 0, startPanY = 0;
    const MIN = 0.5, MAX = 3;

    function apply() {
      mapPan.style.setProperty('--map-scale', scale);
      mapPan.style.setProperty('--map-x', panX + 'px');
      mapPan.style.setProperty('--map-y', panY + 'px');
      if (mctrlSlider) mctrlSlider.value = scale;
      if (mctrlValue)  mctrlValue.textContent = scale.toFixed(1) + 'x';
    }
    function clampScale(v) { return Math.min(MAX, Math.max(MIN, v)); }

    apply();

    // Drag to pan
    mapStage.addEventListener('pointerdown', (e) => {
      dragging = true;
      mapStage.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      startPanX = panX; startPanY = panY;
      mapStage.style.cursor = 'grabbing';
    });
    mapStage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      panX = startPanX + (e.clientX - startX);
      panY = startPanY + (e.clientY - startY);
      apply();
    });
    function endDrag(e) {
      dragging = false;
      mapStage.style.cursor = '';
      try { mapStage.releasePointerCapture(e.pointerId); } catch {}
    }
    mapStage.addEventListener('pointerup', endDrag);
    mapStage.addEventListener('pointercancel', endDrag);
    mapStage.addEventListener('pointerleave', endDrag);

    // Scroll wheel to zoom
    mapStage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.12 : -0.12;
      scale = clampScale(scale + delta);
      apply();
    }, { passive: false });

    // Slider
    mctrlSlider?.addEventListener('input', () => {
      scale = clampScale(parseFloat(mctrlSlider.value));
      apply();
    });
    mctrlIn?.addEventListener('click', () => { scale = clampScale(scale + 0.25); apply(); });
    mctrlOut?.addEventListener('click', () => { scale = clampScale(scale - 0.25); apply(); });
    mctrlReset?.addEventListener('click', () => { scale = 1; panX = 0; panY = 0; apply(); });
  }

  const dvd = document.getElementById('dvdBouncer');
  if (dvd) {
    const palette = ['#a8c060','#c8ff70','#60c0ff','#ffcc40','#ff6060','#c8a0ff'];
    let x = 80, y = 120;
    const baseVx = 1.6, baseVy = 1.4;
    let dirX = 1, dirY = 1;
    let colorIdx = 0;
    function bounce() {
      if (!document.body.classList.contains('dvd-on')) {
        requestAnimationFrame(bounce);
        return;
      }
      const w = window.innerWidth - dvd.offsetWidth;
      const h = window.innerHeight - dvd.offsetHeight;
      const speed = dvdSpeedMultiplier;
      x += baseVx * speed * dirX;
      y += baseVy * speed * dirY;
      let hit = false;
      if (x <= 0)     { x = 0;  dirX = 1;  hit = true; }
      if (x >= w)     { x = w;  dirX = -1; hit = true; }
      if (y <= 0)     { y = 0;  dirY = 1;  hit = true; }
      if (y >= h)     { y = h;  dirY = -1; hit = true; }
      if (hit) {
        colorIdx = (colorIdx + 1) % palette.length;
        dvd.style.setProperty('--dvd-color', palette[colorIdx]);
        dvd.style.borderColor = palette[colorIdx];
        dvd.classList.add('dvd-flash');
        setTimeout(() => dvd.classList.remove('dvd-flash'), 400);
      }
      dvd.style.left = x + 'px';
      dvd.style.top  = y + 'px';
      requestAnimationFrame(bounce);
    }
    requestAnimationFrame(bounce);
  }

}

// Run init either when DOM is ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __swampersInit);
} else {
  __swampersInit();
}
