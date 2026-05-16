/* ============================================================
   HiveSpace · Admin · Audit Log — interactive logic
   Vanilla JS (no framework). All state lives in module locals.
   ============================================================ */
(function () {
  'use strict';

  // ---------- Vietnamese fixture data ----------
  const ACTORS = [
    { id: 'u_anhtuan', name: 'Nguyễn Anh Tuấn',  role: 'System Admin',     email: 'anhtuan@hivespace.vn',     color: '#465fff' },
    { id: 'u_thumai',  name: 'Trần Thu Mai',     role: 'Compliance Lead',  email: 'thumai@hivespace.vn',      color: '#7a5af8' },
    { id: 'u_quochuy', name: 'Phạm Quốc Huy',    role: 'Finance Auditor',  email: 'quochuy@hivespace.vn',     color: '#ee46bc' },
    { id: 'u_honghai', name: 'Lê Hồng Hải',      role: 'Risk Officer',     email: 'honghai@hivespace.vn',     color: '#f79009' },
    { id: 'u_dinhbao', name: 'Vũ Đình Bảo',      role: 'Platform Admin',   email: 'dinhbao@hivespace.vn',     color: '#0ba5ec' },
    { id: 'u_thuhang', name: 'Đặng Thu Hằng',    role: 'Customer Support', email: 'thuhang@hivespace.vn',     color: '#12b76a' },
    { id: 'm_hoaanh',  name: 'Shop Hoa Anh Đào', role: 'Merchant',         email: 'shop@hoaanhdao.vn',        color: '#fb6514', isMerchant: true },
    { id: 'm_minhchau',name: 'Điện Tử Minh Châu',role: 'Merchant Mall',    email: 'sales@minhchau.vn',        color: '#3641f5', isMerchant: true },
    { id: 's_system',  name: 'HiveSpace System', role: 'Automated',        email: 'system@hivespace.vn',      color: '#667085', isSystem: true },
  ];

  const IPS = ['113.160.92.14', '14.241.180.22', '171.224.45.7', '125.235.18.91', '210.245.32.150', '203.205.77.14'];
  const CITIES = ['Hà Nội, VN', 'TP. Hồ Chí Minh, VN', 'Đà Nẵng, VN', 'Hải Phòng, VN', 'Cần Thơ, VN'];
  const UAS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/124.0',
    'Mozilla/5.0 (Windows NT 10.0) Firefox/115.0',
    'HiveSpace-Mobile/3.4.1 (iOS 17.4; iPhone)',
    'HiveSpace-CLI/2.1.0 (linux)',
  ];

  // Action templates: builders that produce a complete event
  const TEMPLATES = [
    { sev: 'critical', surface: 'admin',
      action: 'merchant.suspend',
      title: a => `Suspended merchant <b>${pick(['Shop Hoa Anh Đào', 'Điện Tử Phúc Long', 'Thời Trang Bảo Linh'])}</b>`,
      resource: () => ({ type: 'Merchant', id: `MRC-${rnd(10000,99999)}`, label: pick(['Shop Hoa Anh Đào', 'Điện Tử Phúc Long']) }),
      diff: () => [['status','active','suspended'],['payouts_paused',false,true]] },
    { sev: 'warning', surface: 'admin',
      action: 'role.escalate',
      title: a => `Granted role <b>Finance Auditor</b> to ${pick(['nguyenthihoa@hivespace.vn','levanthang@hivespace.vn','phamquynh@hivespace.vn'])}`,
      resource: () => ({ type: 'IAM Role', id: `ROLE-${rnd(100,999)}`, label: 'Finance Auditor' }),
      diff: () => [['roles','["support"]','["support","finance.auditor"]']] },
    { sev: 'warning', surface: 'admin',
      action: 'config.update',
      title: a => `Changed platform commission from <b>4.5%</b> → <b>5.2%</b>`,
      resource: () => ({ type: 'Configuration', id: 'commission.platform_fee_pct', label: 'Platform commission' }),
      diff: () => [['platform_fee_pct',4.5,5.2],['effective_at','2026-05-01','2026-06-01']] },
    { sev: 'info', surface: 'admin',
      action: 'kyb.approve',
      title: a => `Approved KYB submission for <b>${pick(['Mỹ Phẩm Sài Gòn', 'Thực Phẩm Sạch Hà Nội', 'Đồ Gỗ An Phú'])}</b>`,
      resource: () => ({ type: 'KYB Case', id: `KYB-${rnd(100000,999999)}`, label: 'Business verification' }),
      diff: () => [['kyb_status','pending_review','approved']] },
    { sev: 'success', surface: 'admin',
      action: 'export.audit',
      title: a => `Exported <b>12,487</b> merchant records (CSV)`,
      resource: () => ({ type: 'Export Job', id: `JOB-${rnd(1000,9999)}`, label: 'Merchant export' }),
      diff: () => [] },
    { sev: 'critical', surface: 'system',
      action: 'auth.lockout',
      title: a => `Auto-locked account after <b>5 failed sign-ins</b> from ${pick(IPS)}`,
      resource: () => ({ type: 'Account', id: `ACT-${rnd(10000,99999)}`, label: 'shop@quynhmy.vn' }),
      diff: () => [['lock_status','none','locked_24h'],['failed_attempts',2,5]] },
    { sev: 'warning', surface: 'system',
      action: 'payment.provider_error',
      title: a => `VNPay returned <b>502</b> for <b>${rnd(8,40)}</b> requests in 5min`,
      resource: () => ({ type: 'Provider', id: 'vnpay', label: 'VNPay gateway' }),
      diff: () => [['error_rate_5m','0.4%','12.3%']] },
    { sev: 'info', surface: 'seller',
      action: 'product.delist',
      title: a => `Delisted product <b>${pick(['iPhone 15 Pro Max 256GB','Áo dài thêu tay cao cấp','Tai nghe Sony WH-1000XM5','Bộ son lì YSL Rouge'])}</b>`,
      resource: () => ({ type: 'Product', id: `PRD-${rnd(1000000,9999999)}`, label: 'Listing removed' }),
      diff: () => [['listing_state','active','removed'],['removal_reason','','counterfeit_report']] },
    { sev: 'warning', surface: 'seller',
      action: 'order.refund',
      title: a => `Refunded order <b>#HVS-${rnd(20260000,20269999)}</b> · ₫${(rnd(150,5800)*1000).toLocaleString('vi-VN')}`,
      resource: () => ({ type: 'Order', id: `HVS-${rnd(20260000,20269999)}`, label: 'Customer refund' }),
      diff: () => [['order_status','delivered','refunded']] },
    { sev: 'info', surface: 'seller',
      action: 'apikey.rotate',
      title: a => `Rotated API key for merchant <b>thoitrangbaolong</b>`,
      resource: () => ({ type: 'API Key', id: `KEY-${rnd(100000,999999)}`, label: 'Storefront API' }),
      diff: () => [['key_id','sk_live_…a812','sk_live_…f04c'],['expires_at','2026-08-01','2027-05-01']] },
    { sev: 'info', surface: 'storefront',
      action: 'profile.update',
      title: a => `Customer updated shipping address (${pick(CITIES)})`,
      resource: () => ({ type: 'Customer', id: `CUS-${rnd(100000,999999)}`, label: 'buyer profile' }),
      diff: () => [['default_address','Q.1, HCM','Q.7, HCM']] },
    { sev: 'critical', surface: 'storefront',
      action: 'fraud.block',
      title: a => `Blocked checkout from suspected card-testing pattern`,
      resource: () => ({ type: 'Session', id: `SES-${rnd(100000,999999)}`, label: 'high-risk' }),
      diff: () => [['risk_score',32,94]] },
  ];

  // ---------- Helpers ----------
  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[rnd(0, arr.length - 1)]; }
  function pad(n) { return String(n).padStart(2, '0'); }

  function formatTime(d) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  function formatDate(d) {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
  function relTime(d) {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 5) return 'vừa xong';
    if (s < 60) return `${s}s trước`;
    if (s < 3600) return `${Math.floor(s/60)}m trước`;
    if (s < 86400) return `${Math.floor(s/3600)}h trước`;
    return `${Math.floor(s/86400)}d trước`;
  }
  function initials(name) {
    return name.split(' ').filter(Boolean).slice(-2).map(s => s[0]).join('').toUpperCase();
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Build an event from a template
  function buildEvent(tpl, when) {
    const actor = tpl.surface === 'system'
      ? ACTORS.find(a => a.isSystem)
      : pick(ACTORS.filter(a => !a.isSystem && !a.isMerchant));
    const e = {
      id: `EVT-${Date.now().toString(36)}-${rnd(100,999)}`,
      time: when || new Date(),
      actor: actor,
      action: tpl.action,
      sev: tpl.sev,
      surface: tpl.surface,
      titleHtml: tpl.title(actor),
      resource: tpl.resource(),
      diff: tpl.diff(),
      ip: pick(IPS),
      city: pick(CITIES),
      ua: pick(UAS),
      status: 'open',
    };
    return e;
  }

  // ---------- Initial seed ----------
  const events = [];
  (function seed() {
    const now = new Date();
    // Seed 60 events spread over last 24h, weighted toward recent
    for (let i = 0; i < 60; i++) {
      const minutesAgo = Math.floor(Math.pow(Math.random(), 1.6) * 1440);
      const when = new Date(now.getTime() - minutesAgo * 60000);
      const tpl = pick(TEMPLATES);
      events.push(buildEvent(tpl, when));
    }
    events.sort((a, b) => b.time - a.time);
  })();

  // ---------- DOM refs ----------
  const root = document.querySelector('[data-view="audit-log"]');
  if (!root) return;

  const tbody         = root.querySelector('#al-tbody');
  const tlBody        = root.querySelector('#al-tl-body');
  const tableCard     = root.querySelector('#al-table-card');
  const timelineCard  = root.querySelector('#al-timeline-card');
  const countLbl      = root.querySelector('#al-count');
  const liveBtn       = root.querySelector('#al-live');
  const streamLbl     = root.querySelector('#al-stream');
  const searchInput   = root.querySelector('#al-q');
  const chipsWrap     = root.querySelector('#al-chips');
  const drawerWrap    = root.querySelector('#al-content');
  const drawerHead    = root.querySelector('#al-drawer-head');
  const drawerTabs    = root.querySelectorAll('[data-drawer-tab]');
  const drawerPanes   = root.querySelectorAll('[data-drawer-pane]');
  const drawerOverview= root.querySelector('#al-pane-overview');
  const drawerDiff    = root.querySelector('#al-pane-diff');
  const drawerJson    = root.querySelector('#al-pane-json');
  const drawerRelated = root.querySelector('#al-pane-related');
  const drawerFoot    = root.querySelector('#al-drawer-foot');
  const exportBtn     = root.querySelector('#al-export');
  const modalOverlay  = root.querySelector('#al-export-modal');
  const themeBtn      = document.querySelector('#al-theme-toggle');
  const densityChart  = root.querySelector('#al-density-chart');
  const densityAxis   = root.querySelector('#al-density-axis');
  const statsEls = {
    today:    root.querySelector('#stat-today'),
    crit:     root.querySelector('#stat-crit'),
    actors:   root.querySelector('#stat-actors'),
    failed:   root.querySelector('#stat-failed'),
  };
  const toast = document.querySelector('#al-toast');

  // ---------- Filter state ----------
  const state = {
    q: '',
    timeRange: '24h',   // '1h' | '24h' | '7d' | '30d'
    surfaces: new Set(),// empty = all
    severities: new Set(),
    actors: new Set(),
    selectedId: null,
    page: 1,
    pageSize: 20,
    view: 'table',      // 'table' | 'timeline'
    live: true,
  };

  // ---------- Filter dropdowns ----------
  function setupPopover(btnId, popId, key, options, optionLabel) {
    const btn = root.querySelector('#' + btnId);
    const pop = root.querySelector('#' + popId);
    if (!btn || !pop) return;
    pop.innerHTML = options.map(o => `
      <label class="al-pop-item">
        <input type="checkbox" data-val="${escapeHtml(o.val)}" ${state[key].has(o.val) ? 'checked' : ''}>
        <span>${escapeHtml(optionLabel ? optionLabel(o) : o.label)}</span>
        ${o.meta ? `<span class="meta">${escapeHtml(o.meta)}</span>` : ''}
      </label>`).join('');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other popovers
      root.querySelectorAll('.al-pop.open').forEach(p => { if (p !== pop) p.classList.remove('open'); });
      pop.classList.toggle('open');
    });
    pop.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) state[key].add(cb.dataset.val);
        else state[key].delete(cb.dataset.val);
        renderCount(btn, state[key].size);
        render();
      });
    });
  }
  function renderCount(btn, n) {
    let c = btn.querySelector('.count');
    if (n > 0) {
      if (!c) {
        c = document.createElement('span');
        c.className = 'count';
        btn.appendChild(c);
      }
      c.textContent = n;
    } else if (c) {
      c.remove();
    }
  }
  document.addEventListener('click', () => {
    root.querySelectorAll('.al-pop.open').forEach(p => p.classList.remove('open'));
  });

  setupPopover('flt-surface', 'pop-surface', 'surfaces', [
    { val:'admin', label:'Admin Portal', meta:'platform' },
    { val:'seller', label:'Seller Center', meta:'merchant' },
    { val:'storefront', label:'Storefront', meta:'shopper' },
    { val:'system', label:'System / Automated', meta:'auto' },
  ]);
  setupPopover('flt-sev', 'pop-sev', 'severities', [
    { val:'critical', label:'● Critical' },
    { val:'warning',  label:'● Warning' },
    { val:'info',     label:'● Info' },
    { val:'success',  label:'● Success' },
  ]);
  setupPopover('flt-actor', 'pop-actor', 'actors',
    ACTORS.map(a => ({ val:a.id, label:a.name, meta:a.role })));

  // Time range segmented
  root.querySelectorAll('[data-time]').forEach(b => {
    b.addEventListener('click', () => {
      root.querySelectorAll('[data-time]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.timeRange = b.dataset.time;
      render();
    });
  });

  // View toggle
  root.querySelectorAll('[data-view-mode]').forEach(b => {
    b.addEventListener('click', () => {
      root.querySelectorAll('[data-view-mode]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.view = b.dataset.viewMode;
      tableCard.style.display = state.view === 'table' ? '' : 'none';
      timelineCard.style.display = state.view === 'timeline' ? '' : 'none';
      render();
    });
  });

  // Search
  let qTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = searchInput.value.trim().toLowerCase(); state.page = 1; render(); }, 100);
  });

  // Live toggle
  liveBtn.addEventListener('click', () => {
    state.live = !state.live;
    liveBtn.dataset.state = state.live ? 'on' : 'off';
    liveBtn.lastChild.textContent = state.live ? ' Live' : ' Paused';
    streamLbl.dataset.state = liveBtn.dataset.state;
    streamLbl.querySelector('.s-label').textContent = state.live ? 'Streaming' : 'Paused';
    showToast(state.live ? 'Live stream resumed' : 'Live stream paused');
  });

  // Theme toggle
  function applyTheme(t) {
    document.body.dataset.theme = t === 'dark' ? 'dark' : '';
    themeBtn.innerHTML = t === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    try { localStorage.setItem('hs-theme', t); } catch (e) {}
  }
  if (themeBtn) {
    let saved = 'light';
    try { saved = localStorage.getItem('hs-theme') || 'light'; } catch (e) {}
    applyTheme(saved);
    themeBtn.addEventListener('click', () => {
      applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  // Drawer close (close button is rendered dynamically inside openDrawer)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault(); searchInput.focus();
    }
  });

  // Drawer tabs
  drawerTabs.forEach(t => {
    t.addEventListener('click', () => {
      drawerTabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      drawerPanes.forEach(p => p.classList.toggle('active', p.dataset.drawerPane === t.dataset.drawerTab));
    });
  });

  // Export modal
  exportBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay || e.target.closest('[data-close]')) modalOverlay.classList.remove('open');
  });
  modalOverlay.querySelectorAll('.al-fmt-card').forEach(c => {
    c.addEventListener('click', () => {
      modalOverlay.querySelectorAll('.al-fmt-card').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
  });
  modalOverlay.querySelector('#al-export-go').addEventListener('click', () => {
    const fmt = modalOverlay.querySelector('.al-fmt-card.active').dataset.fmt;
    modalOverlay.classList.remove('open');
    showToast(`Exporting ${getFiltered().length.toLocaleString('vi-VN')} events as ${fmt.toUpperCase()}`);
  });

  // Clear-all chips
  chipsWrap.addEventListener('click', (e) => {
    if (e.target.dataset.chipKey) {
      const k = e.target.dataset.chipKey;
      const v = e.target.dataset.chipVal;
      if (k === 'q') { state.q = ''; searchInput.value = ''; }
      else if (state[k] && state[k].has(v)) {
        state[k].delete(v);
        const cb = root.querySelector(`#pop-${k === 'surfaces' ? 'surface' : k === 'severities' ? 'sev' : 'actor'} input[data-val="${v}"]`);
        if (cb) cb.checked = false;
        renderCount(root.querySelector(`#flt-${k === 'surfaces' ? 'surface' : k === 'severities' ? 'sev' : 'actor'}`), state[k].size);
      }
      render();
    } else if (e.target.classList.contains('al-chips-clear')) {
      state.q = ''; searchInput.value = '';
      ['surfaces','severities','actors'].forEach(k => {
        state[k].clear();
        const sel = root.querySelector(`#pop-${k === 'surfaces' ? 'surface' : k === 'severities' ? 'sev' : 'actor'}`);
        if (sel) sel.querySelectorAll('input').forEach(cb => cb.checked = false);
        renderCount(root.querySelector(`#flt-${k === 'surfaces' ? 'surface' : k === 'severities' ? 'sev' : 'actor'}`), 0);
      });
      render();
    }
  });

  // ---------- Filtering / paging ----------
  function getFiltered() {
    const now = Date.now();
    const cutoff = state.timeRange === '1h'  ? now - 3600e3
                : state.timeRange === '24h' ? now - 86400e3
                : state.timeRange === '7d'  ? now - 7 * 86400e3
                : now - 30 * 86400e3;
    return events.filter(e => {
      if (e.time.getTime() < cutoff) return false;
      if (state.surfaces.size && !state.surfaces.has(e.surface)) return false;
      if (state.severities.size && !state.severities.has(e.sev)) return false;
      if (state.actors.size && !state.actors.has(e.actor.id)) return false;
      if (state.q) {
        const hay = (e.actor.name + ' ' + e.action + ' ' + e.titleHtml + ' ' + e.resource.id + ' ' + e.resource.label + ' ' + e.ip).toLowerCase();
        if (!hay.includes(state.q)) return false;
      }
      return true;
    });
  }

  // ---------- Render ----------
  function render() {
    const filtered = getFiltered();
    countLbl.textContent = filtered.length.toLocaleString('vi-VN');
    renderChips();
    renderStats(filtered);
    renderDensity(filtered);

    if (state.view === 'table') {
      renderTable(filtered);
    } else {
      renderTimeline(filtered);
    }
  }

  function renderStats(filtered) {
    const today = filtered.length;
    const crit = filtered.filter(e => e.sev === 'critical').length;
    const actorSet = new Set(filtered.map(e => e.actor.id));
    const failed = filtered.filter(e => e.action === 'auth.lockout' || e.action === 'fraud.block').length;
    statsEls.today.textContent = today.toLocaleString('vi-VN');
    statsEls.crit.textContent  = crit.toLocaleString('vi-VN');
    statsEls.actors.textContent= actorSet.size.toLocaleString('vi-VN');
    statsEls.failed.textContent= failed.toLocaleString('vi-VN');
  }

  function renderDensity(filtered) {
    // 24 buckets covering the time range
    const now = Date.now();
    const span = state.timeRange === '1h'  ? 3600e3
              : state.timeRange === '24h' ? 86400e3
              : state.timeRange === '7d'  ? 7 * 86400e3
              : 30 * 86400e3;
    const buckets = 24;
    const bw = span / buckets;
    const counts = new Array(buckets).fill(0);
    const crits  = new Array(buckets).fill(false);
    filtered.forEach(e => {
      const idx = Math.min(buckets - 1, Math.floor((now - bw - (now - span - e.time.getTime())) / bw));
      const i = Math.min(buckets - 1, Math.max(0, Math.floor((e.time.getTime() - (now - span)) / bw)));
      counts[i]++;
      if (e.sev === 'critical') crits[i] = true;
    });
    const max = Math.max(1, ...counts);
    densityChart.innerHTML = counts.map((c, i) =>
      `<div class="al-bar ${crits[i] ? 'has-critical' : ''}" style="height:${Math.max(4, (c / max) * 56)}px" title="${c} events"></div>`
    ).join('');
    // axis labels (left, mid, right)
    const fmtAxis = (msAgo) => {
      const d = new Date(now - msAgo);
      if (span <= 3600e3) return formatTime(d);
      if (span <= 86400e3) return `${pad(d.getHours())}:00`;
      return `${pad(d.getDate())}/${pad(d.getMonth()+1)}`;
    };
    densityAxis.innerHTML =
      `<span>${fmtAxis(span)}</span>` +
      `<span>${fmtAxis(span/2)}</span>` +
      `<span>now</span>`;
  }

  function renderChips() {
    const parts = [];
    if (state.q) parts.push(chip('q', state.q, `“${state.q}”`));
    state.surfaces.forEach(v => parts.push(chip('surfaces', v, `Surface: ${v}`)));
    state.severities.forEach(v => parts.push(chip('severities', v, `Severity: ${v}`)));
    state.actors.forEach(v => {
      const a = ACTORS.find(x => x.id === v);
      parts.push(chip('actors', v, `Actor: ${a ? a.name : v}`));
    });
    if (parts.length === 0) {
      chipsWrap.innerHTML = `<span style="font-size:12px;color:var(--gray-400);">No filters active · showing all events in range</span>`;
    } else {
      chipsWrap.innerHTML = parts.join('') + `<button class="al-chips-clear">Clear all</button>`;
    }
  }
  function chip(k, v, label) {
    return `<span class="al-chip">${escapeHtml(label)}<span class="x" data-chip-key="${k}" data-chip-val="${escapeHtml(v)}">×</span></span>`;
  }

  function renderTable(filtered) {
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="al-empty">
        <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <div class="t">No events match these filters</div>
        <div>Try widening the time range or clearing a filter.</div>
      </div></td></tr>`;
      return;
    }
    const slice = filtered.slice(0, state.pageSize);
    tbody.innerHTML = slice.map(e => `
      <tr data-id="${e.id}" class="${state.selectedId === e.id ? 'selected' : ''}">
        <td class="al-time-cell">${formatTime(e.time)}<span class="rel">${relTime(e.time)}</span></td>
        <td><div class="al-actor">
          <span class="al-avatar" style="background:${e.actor.color}">${initials(e.actor.name)}</span>
          <div style="min-width:0;">
            <div class="name">${escapeHtml(e.actor.name)}</div>
            <div class="role">${escapeHtml(e.actor.role)}</div>
          </div>
        </div></td>
        <td>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <span class="al-action">${escapeHtml(e.action)}</span>
            <span style="font-size:13px; color:inherit;">${e.titleHtml}</span>
          </div>
        </td>
        <td><span class="al-surface-pill" data-surface="${e.surface}"><span class="sd"></span>${e.surface[0].toUpperCase()+e.surface.slice(1)}</span></td>
        <td><span class="al-sev" data-sev="${e.sev}"><span class="sd"></span>${e.sev}</span></td>
        <td class="al-ip">${e.ip}</td>
      </tr>
    `).join('');
    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', () => openDrawer(tr.dataset.id));
    });
  }

  function renderTimeline(filtered) {
    if (filtered.length === 0) {
      tlBody.innerHTML = `<div class="al-empty"><div class="t">No events match these filters</div></div>`;
      return;
    }
    // Group by date
    const groups = {};
    filtered.slice(0, 60).forEach(e => {
      const k = formatDate(e.time);
      (groups[k] = groups[k] || []).push(e);
    });
    const html = Object.entries(groups).map(([day, list]) => `
      <div class="al-tl-day">${day}</div>
      ${list.map(e => `
        <div class="al-tl-row" data-id="${e.id}">
          <div class="al-tl-time">${formatTime(e.time)}</div>
          <div class="al-tl-marker" data-sev="${e.sev}">${markerIcon(e.sev)}</div>
          <div class="al-tl-body">
            <div class="al-tl-title">${e.titleHtml}</div>
            <div class="al-tl-meta">
              <span class="al-action">${escapeHtml(e.action)}</span>
              <span>by <b style="color:inherit">${escapeHtml(e.actor.name)}</b></span>
              <span>·</span><span>${escapeHtml(e.ip)}</span>
              <span>·</span><span>${escapeHtml(e.city)}</span>
            </div>
          </div>
          <div class="al-tl-side">
            <span class="al-surface-pill" data-surface="${e.surface}"><span class="sd"></span>${e.surface[0].toUpperCase()+e.surface.slice(1)}</span>
          </div>
        </div>
      `).join('')}
    `).join('');
    tlBody.innerHTML = html;
    tlBody.querySelectorAll('[data-id]').forEach(r => {
      r.addEventListener('click', () => openDrawer(r.dataset.id));
    });
  }

  function markerIcon(sev) {
    const ic = {
      critical: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      warning:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      info:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      success:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    };
    return ic[sev] || '';
  }

  // ---------- Drawer ----------
  function openDrawer(id) {
    const e = events.find(x => x.id === id);
    if (!e) return;
    state.selectedId = id;
    drawerWrap.dataset.drawer = 'open';

    drawerHead.innerHTML = `
      <div style="min-width:0;">
        <h3>
          <span class="al-sev" data-sev="${e.sev}"><span class="sd"></span>${e.sev}</span>
          <span style="font-weight:600;">${escapeHtml(e.action)}</span>
        </h3>
        <div class="meta">${e.id} · ${formatDate(e.time)} ${formatTime(e.time)}</div>
      </div>
      <button class="al-close" id="al-drawer-close" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    drawerHead.querySelector('#al-drawer-close').addEventListener('click', closeDrawer);

    // Overview pane
    drawerOverview.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; padding-bottom:14px; border-bottom:1px solid var(--gray-100);">
        <span class="al-avatar" style="background:${e.actor.color}; width:40px; height:40px; font-size:14px;">${initials(e.actor.name)}</span>
        <div style="min-width:0;">
          <div style="font-size:14px; font-weight:600;">${escapeHtml(e.actor.name)}</div>
          <div style="font-size:12px; color:var(--gray-500);">${escapeHtml(e.actor.role)} · ${escapeHtml(e.actor.email)}</div>
        </div>
      </div>
      <div style="padding:8px 0 0;">
        <div class="al-detail-row"><div class="k">Event</div><div class="v">${e.titleHtml}</div></div>
        <div class="al-detail-row"><div class="k">Resource</div><div class="v"><b>${escapeHtml(e.resource.label)}</b><br><span style="font-family:var(--font-mono); font-size:12px; color:var(--gray-500);">${escapeHtml(e.resource.type)} · ${escapeHtml(e.resource.id)}</span></div></div>
        <div class="al-detail-row"><div class="k">Surface</div><div class="v"><span class="al-surface-pill" data-surface="${e.surface}"><span class="sd"></span>${e.surface[0].toUpperCase()+e.surface.slice(1)}</span></div></div>
        <div class="al-detail-row"><div class="k">When</div><div class="v">${formatDate(e.time)} ${formatTime(e.time)} <span style="color:var(--gray-500);">· ${relTime(e.time)}</span></div></div>
        <div class="al-detail-row"><div class="k">IP / Geo</div><div class="v" style="font-family:var(--font-mono); font-size:12px;">${escapeHtml(e.ip)}<br><span style="font-family:inherit; color:var(--gray-500);">${escapeHtml(e.city)}</span></div></div>
        <div class="al-detail-row"><div class="k">User-Agent</div><div class="v" style="font-family:var(--font-mono); font-size:11px; color:var(--gray-500); word-break:break-all;">${escapeHtml(e.ua)}</div></div>
      </div>`;

    // Diff pane
    if (e.diff && e.diff.length > 0) {
      drawerDiff.innerHTML = `<div class="al-diff">${e.diff.map(([k, before, after]) => `
        <div class="line rem"><span class="gut">-</span><span><b>${escapeHtml(k)}</b>: ${escapeHtml(JSON.stringify(before))}</span></div>
        <div class="line add"><span class="gut">+</span><span><b>${escapeHtml(k)}</b>: ${escapeHtml(JSON.stringify(after))}</span></div>
      `).join('')}</div>`;
    } else {
      drawerDiff.innerHTML = `<div class="al-empty" style="padding:32px 0;"><div class="t">No state change</div><div>This event was a read or notification.</div></div>`;
    }

    // JSON pane
    const json = {
      id: e.id, time: e.time.toISOString(), action: e.action, severity: e.sev,
      surface: e.surface,
      actor: { id: e.actor.id, name: e.actor.name, role: e.actor.role, email: e.actor.email },
      resource: e.resource,
      diff: e.diff,
      request: { ip: e.ip, geo: e.city, user_agent: e.ua },
    };
    drawerJson.innerHTML = `<div class="al-json">${syntaxJson(JSON.stringify(json, null, 2))}</div>`;

    // Related — same actor or same resource type, within 1 hour
    const related = events.filter(x => x.id !== e.id && (x.actor.id === e.actor.id || x.resource.type === e.resource.type)
      && Math.abs(x.time - e.time) < 3600e3).slice(0, 6);
    drawerRelated.innerHTML = related.length === 0
      ? `<div class="al-empty" style="padding:32px 0;"><div class="t">No related events</div><div>Nothing nearby in time, actor, or resource.</div></div>`
      : `<div class="al-related">${related.map(r => `
          <div class="item" data-rid="${r.id}">
            <span class="when">${formatTime(r.time)}</span>
            <div class="what"><b style="color:inherit;">${escapeHtml(r.actor.name)}</b> · ${r.titleHtml}</div>
          </div>
        `).join('')}</div>`;
    drawerRelated.querySelectorAll('[data-rid]').forEach(it => {
      it.addEventListener('click', () => openDrawer(it.dataset.rid));
    });

    // Footer
    drawerFoot.innerHTML = `
      <span class="al-status-badge" data-status="${e.status}">${e.status === 'open' ? '● Awaiting review' : e.status === 'reviewed' ? '✓ Reviewed' : '⚐ Flagged'}</span>
      <div style="display:flex; gap:8px;">
        <button class="hs-btn sm hs-btn-outline" id="al-flag">Flag</button>
        <button class="hs-btn sm hs-btn-primary" id="al-reviewed">${e.status === 'reviewed' ? 'Reopen' : 'Mark reviewed'}</button>
      </div>`;
    drawerFoot.querySelector('#al-flag').addEventListener('click', () => {
      e.status = e.status === 'flagged' ? 'open' : 'flagged';
      openDrawer(e.id);
      showToast(e.status === 'flagged' ? 'Event flagged for follow-up' : 'Flag removed');
    });
    drawerFoot.querySelector('#al-reviewed').addEventListener('click', () => {
      e.status = e.status === 'reviewed' ? 'open' : 'reviewed';
      openDrawer(e.id);
      showToast(e.status === 'reviewed' ? 'Marked as reviewed' : 'Marked as open');
    });

    // Reset tabs
    drawerTabs.forEach((t, i) => t.classList.toggle('active', i === 0));
    drawerPanes.forEach((p, i) => p.classList.toggle('active', i === 0));

    // Highlight selected row
    if (state.view === 'table') {
      tbody.querySelectorAll('tr').forEach(tr => tr.classList.toggle('selected', tr.dataset.id === id));
    }
  }

  function syntaxJson(s) {
    return escapeHtml(s)
      .replace(/(&quot;[^&]+&quot;)(\s*:)/g, '<span class="k">$1</span>$2')
      .replace(/:\s*(&quot;[^&]*&quot;)/g, ': <span class="s">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="n">$1</span>');
  }

  function closeDrawer() {
    state.selectedId = null;
    drawerWrap.dataset.drawer = 'closed';
    if (state.view === 'table') {
      tbody.querySelectorAll('tr.selected').forEach(tr => tr.classList.remove('selected'));
    }
  }

  // ---------- Toast ----------
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector('.msg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ---------- Live event simulator ----------
  function tickLive() {
    if (!state.live) return;
    const tpl = pick(TEMPLATES);
    const e = buildEvent(tpl, new Date());
    events.unshift(e);
    if (events.length > 500) events.length = 500;

    // Only re-render if the audit log view is active
    const viewActive = root.classList.contains('active');
    if (!viewActive) return;

    if (state.view === 'table') {
      const filtered = getFiltered();
      countLbl.textContent = filtered.length.toLocaleString('vi-VN');
      renderStats(filtered);
      renderDensity(filtered);
      // Insert new row at top with NEW animation if it passes filters
      if (filtered[0] && filtered[0].id === e.id) {
        renderTable(filtered);
        const firstRow = tbody.querySelector('tr');
        if (firstRow) firstRow.classList.add('is-new');
        setTimeout(() => firstRow && firstRow.classList.remove('is-new'), 1500);
      }
    } else {
      render();
    }
  }
  setInterval(tickLive, 4500);

  // ---------- Initial render ----------
  // Hide timeline view by default
  timelineCard.style.display = 'none';
  render();

  // Expose for debugging
  window.__auditLog = { events, state, render };
})();
