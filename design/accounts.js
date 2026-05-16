/* ============================================================
   HiveSpace · Admin · Accounts page logic
   Vanilla JS. Reuses .al-toast from audit_log.css if loaded.
   ============================================================ */
(function () {
  'use strict';

  // ---------- Vietnamese fixture data ----------
  const ROLES = [
    { id:'superadmin',  name:'Super Admin',     desc:'Full platform access · break-glass only' },
    { id:'admin',       name:'Platform Admin',  desc:'Manage merchants, configuration, audit' },
    { id:'finance',     name:'Finance',         desc:'Payouts, fees, reconciliation, refunds' },
    { id:'compliance',  name:'Compliance',      desc:'KYC / KYB review, document approval' },
    { id:'risk',        name:'Risk',            desc:'Fraud rules, blocks, dispute review' },
    { id:'support',     name:'Customer Support',desc:'Read-only, customer issue handling' },
  ];
  const COLORS = ['#465fff','#7a5af8','#ee46bc','#f79009','#0ba5ec','#12b76a','#fb6514','#3641f5'];
  const ACCOUNTS = [
    ['u_anhtuan', 'Nguyễn Anh Tuấn',  'anhtuan@hivespace.vn',     'superadmin', 'active',    true,  3,   'Hà Nội',         '113.160.92.14'],
    ['u_thumai',  'Trần Thu Mai',     'thumai@hivespace.vn',      'compliance', 'active',    true,  60,  'Hà Nội',         '14.241.180.22'],
    ['u_quochuy', 'Phạm Quốc Huy',    'quochuy@hivespace.vn',     'finance',    'active',    true,  18,  'TP. Hồ Chí Minh','171.224.45.7'],
    ['u_honghai', 'Lê Hồng Hải',      'honghai@hivespace.vn',     'risk',       'active',    true,  45,  'Đà Nẵng',        '125.235.18.91'],
    ['u_dinhbao', 'Vũ Đình Bảo',      'dinhbao@hivespace.vn',     'admin',      'active',    true,  12,  'Hà Nội',         '113.160.92.14'],
    ['u_thuhang', 'Đặng Thu Hằng',    'thuhang@hivespace.vn',     'support',    'active',    true,  120, 'TP. Hồ Chí Minh','203.205.77.14'],
    ['u_minhanh', 'Bùi Minh Anh',     'minhanh@hivespace.vn',     'support',    'active',    false, 240, 'Hải Phòng',      '210.245.32.150'],
    ['u_quynhmy', 'Hoàng Quỳnh My',   'quynhmy@hivespace.vn',     'finance',    'active',    true,  300, 'TP. Hồ Chí Minh','171.224.45.7'],
    ['u_levanthang','Lê Văn Thắng',   'levanthang@hivespace.vn',  'admin',      'invited',   false, null,'—',              '—'],
    ['u_phamquynh','Phạm Quỳnh Trang','phamquynh@hivespace.vn',   'compliance', 'invited',   false, null,'—',              '—'],
    ['u_nguyenthihoa','Nguyễn Thị Hoa','nguyenthihoa@hivespace.vn','support',   'active',    true,  60*8,'Cần Thơ',        '125.235.18.91'],
    ['u_dangtan',  'Đặng Tấn Dũng',   'dangtan@hivespace.vn',     'risk',       'locked',    true,  60*36,'Hà Nội',        '113.160.92.14'],
    ['u_truongmai','Trương Hoàng Mai','truongmai@hivespace.vn',   'support',    'active',    true,  90,  'Đà Nẵng',        '210.245.32.150'],
    ['u_dovanlam', 'Đỗ Văn Lâm',      'dovanlam@hivespace.vn',    'finance',    'active',    true,  6,   'TP. Hồ Chí Minh','171.224.45.7'],
    ['u_nghiemha', 'Nghiêm Hà Linh',  'nghiemha@hivespace.vn',    'admin',      'suspended', false, 60*24*9,'Hà Nội',     '203.205.77.14'],
    ['u_phamlong', 'Phạm Hữu Long',   'phamlong@hivespace.vn',    'compliance', 'active',    true,  15,  'Hà Nội',         '14.241.180.22'],
    ['u_buihai',   'Bùi Đình Hải',    'buihai@hivespace.vn',      'support',    'active',    true,  300, 'Hải Phòng',      '210.245.32.150'],
    ['u_caongoc',  'Cao Bích Ngọc',   'caongoc@hivespace.vn',     'admin',      'active',    true,  10,  'TP. Hồ Chí Minh','203.205.77.14'],
    ['u_tranminh', 'Trần Hoàng Minh', 'tranminh@hivespace.vn',    'support',    'invited',   false, null,'—',              '—'],
    ['u_lyngoc',   'Lý Bảo Ngọc',     'lyngoc@hivespace.vn',      'finance',    'active',    true,  240, 'Đà Nẵng',        '125.235.18.91'],
    ['u_vutuan',   'Vũ Anh Tuấn',     'vutuan@hivespace.vn',      'risk',       'active',    true,  35,  'Hà Nội',         '14.241.180.22'],
    ['u_phantai',  'Phan Đức Tài',    'phantai@hivespace.vn',     'support',    'active',    true,  4*60,'TP. Hồ Chí Minh','171.224.45.7'],
    ['u_dolan',    'Đỗ Hương Lan',    'dolan@hivespace.vn',       'compliance', 'active',    true,  20,  'Cần Thơ',        '125.235.18.91'],
    ['u_kieuminh', 'Kiều Tuấn Minh',  'kieuminh@hivespace.vn',    'admin',      'active',    true,  90,  'Hà Nội',         '113.160.92.14'],
    ['u_huynhmai', 'Huỳnh Phương Mai','huynhmai@hivespace.vn',    'support',    'locked',    true,  60*48,'Hải Phòng',     '210.245.32.150'],
  ].map((a, i) => ({
    id: a[0], name: a[1], email: a[2], role: a[3], status: a[4],
    mfa: a[5], lastSeenMin: a[6], city: a[7], ip: a[8],
    color: COLORS[i % COLORS.length],
    createdAt: new Date(Date.now() - (i * 17 + 5) * 86400e3),
  }));

  const PERMS = [
    ['accounts.read', 'View accounts'],
    ['accounts.write', 'Create / edit accounts'],
    ['merchants.suspend', 'Suspend merchants'],
    ['payments.refund', 'Issue refunds'],
    ['config.write', 'Edit platform configuration'],
    ['audit.export', 'Export audit log'],
    ['kyb.approve', 'Approve KYB submissions'],
    ['risk.rules', 'Edit risk rules'],
  ];
  const ROLE_PERMS = {
    superadmin: PERMS.map(p => p[0]),
    admin: ['accounts.read','accounts.write','merchants.suspend','config.write','audit.export'],
    finance: ['accounts.read','payments.refund','audit.export'],
    compliance: ['accounts.read','kyb.approve','audit.export'],
    risk: ['accounts.read','merchants.suspend','risk.rules','audit.export'],
    support: ['accounts.read'],
  };

  // ---------- Helpers ----------
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function initials(name) { return name.split(' ').filter(Boolean).slice(-2).map(s => s[0]).join('').toUpperCase(); }
  function relMin(min) {
    if (min == null) return '—';
    if (min < 1) return 'vừa xong';
    if (min < 60) return `${min}m trước`;
    if (min < 60*24) return `${Math.floor(min/60)}h trước`;
    return `${Math.floor(min/(60*24))}d trước`;
  }
  function fmtDate(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

  // ---------- DOM ----------
  const root = document.querySelector('[data-view="accounts"]');
  if (!root) return;

  const tbody     = root.querySelector('#ac-tbody');
  const countLbl  = root.querySelector('#ac-count');
  const searchEl  = root.querySelector('#ac-q');
  const railList  = root.querySelector('#ac-rail-list');
  const selAllCb  = root.querySelector('#ac-sel-all');
  const bulkBar   = root.querySelector('#ac-bulk');
  const bulkCount = root.querySelector('#ac-bulk-count');
  const bulkClear = root.querySelector('#ac-bulk-clear');
  const inviteBtn = root.querySelector('#ac-invite');
  const inviteModal = root.querySelector('#ac-invite-modal');
  const drawerWrap  = root.querySelector('#ac-content');
  const drawer      = root.querySelector('#ac-drawer');
  const drawerHead  = root.querySelector('#ac-drawer-head');
  const drawerTabs  = root.querySelectorAll('[data-ac-drawer-tab]');
  const drawerPanes = root.querySelectorAll('[data-ac-drawer-pane]');
  const drawerFoot  = root.querySelector('#ac-drawer-foot');
  const paneOverview = root.querySelector('#ac-pane-overview');
  const panePerms    = root.querySelector('#ac-pane-perms');
  const paneActivity = root.querySelector('#ac-pane-activity');
  const stats = {
    total: root.querySelector('#ac-stat-total'),
    active: root.querySelector('#ac-stat-active'),
    invited: root.querySelector('#ac-stat-invited'),
    flagged: root.querySelector('#ac-stat-flagged'),
  };
  // Reuse audit-log toast if present, otherwise no-op
  const toast = document.querySelector('#al-toast');

  const state = {
    q: '',
    role: 'all',  // role id or 'all'
    status: 'all',// 'all' | 'active' | 'invited' | 'suspended' | 'locked'
    selected: new Set(),
    drawerId: null,
  };

  // ---------- Render: stats ----------
  function renderStats() {
    stats.total.textContent  = ACCOUNTS.length.toLocaleString('vi-VN');
    stats.active.textContent = ACCOUNTS.filter(a => a.status === 'active').length.toLocaleString('vi-VN');
    stats.invited.textContent= ACCOUNTS.filter(a => a.status === 'invited').length.toLocaleString('vi-VN');
    stats.flagged.textContent= ACCOUNTS.filter(a => a.status === 'suspended' || a.status === 'locked' || !a.mfa).length.toLocaleString('vi-VN');
  }

  // ---------- Render: roles rail ----------
  function renderRail() {
    const counts = ROLES.map(r => ({ ...r, count: ACCOUNTS.filter(a => a.role === r.id).length }));
    const allCount = ACCOUNTS.length;
    const items = [
      { id: 'all', name: 'All accounts', desc: 'Every admin user', count: allCount, color: 'var(--gray-400)' },
      ...counts.map(r => ({
        id: r.id, name: r.name, desc: r.desc, count: r.count,
        color: r.id === 'superadmin' ? 'var(--theme-purple-500)'
            : r.id === 'admin'      ? 'var(--brand-500)'
            : r.id === 'finance'    ? 'var(--success-500)'
            : r.id === 'compliance' ? 'var(--warning-500)'
            : r.id === 'risk'       ? 'var(--theme-pink-500)'
            : 'var(--info-500)'
      }))
    ];
    railList.innerHTML = items.map(i => `
      <div class="ac-rail-item ${state.role === i.id ? 'active' : ''}" data-role="${i.id}">
        <span class="dot" style="background:${i.color}"></span>
        <div class="l">
          <div class="n">${escapeHtml(i.name)}</div>
          <div class="d">${escapeHtml(i.desc)}</div>
        </div>
        <span class="c">${i.count}</span>
      </div>
    `).join('');
    railList.querySelectorAll('[data-role]').forEach(el => {
      el.addEventListener('click', () => {
        state.role = el.dataset.role;
        renderRail(); renderTable();
      });
    });
  }

  // ---------- Filter ----------
  function getFiltered() {
    const q = state.q;
    return ACCOUNTS.filter(a => {
      if (state.role !== 'all' && a.role !== state.role) return false;
      if (state.status !== 'all' && a.status !== state.status) return false;
      if (q) {
        const hay = (a.name + ' ' + a.email + ' ' + a.city + ' ' + a.ip).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // ---------- Render: table ----------
  function renderTable() {
    const filtered = getFiltered();
    countLbl.textContent = filtered.length.toLocaleString('vi-VN');
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="ac-empty">
        <div class="icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg></div>
        <div class="t">No accounts match these filters</div>
        <div>Try clearing filters or inviting a new admin.</div>
      </div></td></tr>`;
      return;
    }
    const role = id => ROLES.find(r => r.id === id) || { name: id };
    tbody.innerHTML = filtered.map(a => `
      <tr data-id="${a.id}" class="${state.drawerId === a.id ? 'selected' : ''}">
        <td style="width:40px;"><input type="checkbox" class="ac-cb ac-row-cb" data-id="${a.id}" ${state.selected.has(a.id) ? 'checked' : ''}></td>
        <td>
          <div class="ac-actor">
            <span class="ac-avatar" style="background:${a.color}">${initials(a.name)}</span>
            <div style="min-width:0;">
              <div class="name">${escapeHtml(a.name)}</div>
              <div class="email">${escapeHtml(a.email)}</div>
            </div>
          </div>
        </td>
        <td><span class="ac-role-pill" data-role="${a.role}"><span class="sd"></span>${escapeHtml(role(a.role).name)}</span></td>
        <td><span class="ac-status" data-status="${a.status}"><span class="sd"></span>${a.status[0].toUpperCase()+a.status.slice(1)}</span></td>
        <td>${a.mfa
            ? `<span class="ac-mfa"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Enabled</span>`
            : `<span class="ac-mfa off"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/><line x1="3" y1="3" x2="21" y2="21"/></svg>Disabled</span>`
          }</td>
        <td class="ac-time-cell">${a.lastSeenMin == null ? '—' : relMin(a.lastSeenMin)}<span class="rel">${escapeHtml(a.city)}</span></td>
        <td style="font-family:var(--font-mono); font-size:12px; color: var(--gray-500);">${escapeHtml(a.ip)}</td>
        <td style="text-align:right;">
          <div class="ac-row-actions">
            <button class="ac-icon-btn" data-quick="reset" data-id="${a.id}" title="Send password reset">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <button class="ac-icon-btn" data-quick="more" data-id="${a.id}" title="More">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.matches('.ac-cb, .ac-icon-btn, .ac-icon-btn *')) return;
        openDrawer(tr.dataset.id);
      });
    });
    tbody.querySelectorAll('.ac-row-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) state.selected.add(cb.dataset.id);
        else state.selected.delete(cb.dataset.id);
        renderBulk();
      });
    });
    tbody.querySelectorAll('[data-quick="reset"]').forEach(b => {
      b.addEventListener('click', () => showToast(`Password reset email sent to ${ACCOUNTS.find(a=>a.id===b.dataset.id).email}`));
    });

    // Sync select-all
    if (selAllCb) {
      const ids = filtered.map(a => a.id);
      const allChecked = ids.length > 0 && ids.every(id => state.selected.has(id));
      const someChecked = ids.some(id => state.selected.has(id));
      selAllCb.checked = allChecked;
      selAllCb.indeterminate = !allChecked && someChecked;
    }
  }

  // ---------- Bulk bar ----------
  function renderBulk() {
    const n = state.selected.size;
    bulkBar.classList.toggle('show', n > 0);
    bulkCount.textContent = n + ' selected';
    // Sync row checkboxes (in case selection cleared)
    tbody.querySelectorAll('.ac-row-cb').forEach(cb => { cb.checked = state.selected.has(cb.dataset.id); });
  }
  bulkClear.addEventListener('click', () => { state.selected.clear(); renderBulk(); });
  root.querySelector('#ac-bulk-suspend').addEventListener('click', () => {
    state.selected.forEach(id => { const a = ACCOUNTS.find(x => x.id === id); if (a) a.status = 'suspended'; });
    showToast(`Suspended ${state.selected.size} account${state.selected.size===1?'':'s'}`);
    state.selected.clear();
    renderStats(); renderRail(); renderTable(); renderBulk();
  });
  root.querySelector('#ac-bulk-reset').addEventListener('click', () => {
    showToast(`Sent password reset to ${state.selected.size} accounts`);
    state.selected.clear(); renderBulk();
  });

  // ---------- Drawer ----------
  function openDrawer(id) {
    const a = ACCOUNTS.find(x => x.id === id);
    if (!a) return;
    state.drawerId = id;
    drawerWrap.dataset.drawer = 'open';
    const role = ROLES.find(r => r.id === a.role) || { name: a.role };

    drawerHead.innerHTML = `
      <div style="display:flex; gap:14px; align-items:center; min-width:0;">
        <span class="ac-avatar" style="width:48px; height:48px; font-size:14px; background:${a.color}">${initials(a.name)}</span>
        <div style="min-width:0;">
          <h3 style="margin:0; line-height:1.2;">${escapeHtml(a.name)}</h3>
          <div style="font-size:12px; color: var(--gray-500); margin-top:2px;">${escapeHtml(a.email)} · <span class="ac-role-pill" data-role="${a.role}" style="margin-left:4px;"><span class="sd"></span>${escapeHtml(role.name)}</span></div>
        </div>
      </div>
      <button class="ac-close" id="ac-drawer-close" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    drawerHead.querySelector('#ac-drawer-close').addEventListener('click', closeDrawer);

    // Overview
    paneOverview.innerHTML = `
      <div class="ac-detail-row"><div class="k">Status</div><div class="v"><span class="ac-status" data-status="${a.status}"><span class="sd"></span>${a.status[0].toUpperCase()+a.status.slice(1)}</span></div></div>
      <div class="ac-detail-row"><div class="k">Account ID</div><div class="v" style="font-family:var(--font-mono); font-size:12px;">${escapeHtml(a.id)}</div></div>
      <div class="ac-detail-row"><div class="k">Email</div><div class="v">${escapeHtml(a.email)}</div></div>
      <div class="ac-detail-row"><div class="k">Role</div><div class="v"><span class="ac-role-pill" data-role="${a.role}"><span class="sd"></span>${escapeHtml(role.name)}</span><div style="font-size:12px; color:var(--gray-500); margin-top:4px;">${escapeHtml(role.desc || '')}</div></div></div>
      <div class="ac-detail-row"><div class="k">2FA</div><div class="v"><span class="ac-mfa ${a.mfa ? '' : 'off'}">${a.mfa ? 'Enabled · TOTP authenticator' : 'Disabled — login not protected'}</span></div></div>
      <div class="ac-detail-row"><div class="k">Last seen</div><div class="v">${relMin(a.lastSeenMin)} <span style="color:var(--gray-500);">· ${escapeHtml(a.city)}</span></div></div>
      <div class="ac-detail-row"><div class="k">Last IP</div><div class="v" style="font-family:var(--font-mono); font-size:12px;">${escapeHtml(a.ip)}</div></div>
      <div class="ac-detail-row"><div class="k">Member since</div><div class="v">${fmtDate(a.createdAt)}</div></div>
    `;

    // Permissions
    const granted = new Set(ROLE_PERMS[a.role] || []);
    panePerms.innerHTML = `
      <div style="font-size:12px; color: var(--gray-500); margin-bottom: 10px;">Permissions are inherited from <b style="color:var(--gray-900);">${escapeHtml(role.name)}</b>. Toggling individual permissions creates a per-account override.</div>
      <div class="ac-perm-grid">
        ${PERMS.map(([id, label]) => `
          <div class="ac-perm-row">
            <div>
              <div class="pn">${escapeHtml(label)}</div>
              <div class="pd" style="font-family: var(--font-mono);">${escapeHtml(id)}</div>
            </div>
            <div class="ac-toggle ${granted.has(id) ? 'on' : ''}" data-perm="${id}"></div>
          </div>
        `).join('')}
      </div>`;
    panePerms.querySelectorAll('[data-perm]').forEach(t => {
      t.addEventListener('click', () => {
        t.classList.toggle('on');
        showToast(`Permission ${t.dataset.perm} ${t.classList.contains('on') ? 'granted' : 'revoked'}`);
      });
    });

    // Activity
    const activities = generateActivity(a);
    paneActivity.innerHTML = `<div class="ac-act-list">${activities.map(act => `
      <div class="ac-act-item">
        <span class="ac-act-dot ${act.kind}">${actIcon(act.kind)}</span>
        <div class="ac-act-text">${act.text}</div>
        <div class="ac-act-time">${act.time}</div>
      </div>
    `).join('')}</div>`;

    // Footer
    drawerFoot.innerHTML = `
      <div style="font-size:12px; color: var(--gray-500);">${a.status === 'active' ? 'Account in good standing' : a.status === 'invited' ? 'Invitation sent · awaiting acceptance' : a.status === 'locked' ? 'Locked after failed sign-ins' : 'Suspended by admin action'}</div>
      <div style="display:flex; gap:8px;">
        <button class="hs-btn sm hs-btn-outline" id="ac-impersonate">Impersonate</button>
        ${a.status === 'suspended'
          ? '<button class="hs-btn sm hs-btn-primary" id="ac-reactivate">Reactivate</button>'
          : '<button class="hs-btn sm hs-btn-danger" id="ac-suspend">Suspend</button>'}
      </div>`;
    const susp = drawerFoot.querySelector('#ac-suspend');
    if (susp) susp.addEventListener('click', () => { a.status = 'suspended'; openDrawer(a.id); renderTable(); renderStats(); showToast(`Suspended ${a.name}`); });
    const react = drawerFoot.querySelector('#ac-reactivate');
    if (react) react.addEventListener('click', () => { a.status = 'active'; openDrawer(a.id); renderTable(); renderStats(); showToast(`Reactivated ${a.name}`); });
    drawerFoot.querySelector('#ac-impersonate').addEventListener('click', () => {
      showToast(`Impersonation session would start for ${a.name} (audited)`);
    });

    // Reset tabs
    drawerTabs.forEach((t, i) => t.classList.toggle('active', i === 0));
    drawerPanes.forEach((p, i) => p.classList.toggle('active', i === 0));

    // Highlight selected row
    tbody.querySelectorAll('tr').forEach(tr => tr.classList.toggle('selected', tr.dataset.id === id));
  }
  function closeDrawer() {
    state.drawerId = null;
    drawerWrap.dataset.drawer = 'closed';
    tbody.querySelectorAll('tr.selected').forEach(tr => tr.classList.remove('selected'));
  }
  drawerTabs.forEach(t => {
    t.addEventListener('click', () => {
      drawerTabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      drawerPanes.forEach(p => p.classList.toggle('active', p.dataset.acDrawerPane === t.dataset.acDrawerTab));
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.drawerId) closeDrawer();
  });

  function generateActivity(a) {
    const out = [];
    if (a.status === 'invited') {
      out.push({ kind:'brand', text:`Invited as <b>${escapeHtml((ROLES.find(r=>r.id===a.role)||{}).name||a.role)}</b> by Nguyễn Anh Tuấn`, time:'2d ago' });
      return out;
    }
    out.push({ kind:'brand', text:`Signed in from <b>${escapeHtml(a.city)}</b> · ${escapeHtml(a.ip)}`, time: relMin(a.lastSeenMin) });
    if (a.role === 'finance') out.push({ kind:'success', text:`Approved <b>14 payouts</b> totaling ₫512.300.000`, time:'2h ago' });
    if (a.role === 'compliance') out.push({ kind:'success', text:`Approved KYB for <b>Mỹ Phẩm Sài Gòn</b>`, time:'5h ago' });
    if (a.role === 'risk') out.push({ kind:'warn', text:`Suspended merchant <b>Shop Hoa Anh Đào</b> (fraud signals)`, time:'1d ago' });
    if (a.role === 'admin') out.push({ kind:'brand', text:`Updated platform commission to <b>5.2%</b>`, time:'1d ago' });
    if (!a.mfa) out.push({ kind:'error', text:`<b>2FA disabled</b> — flagged for follow-up by security`, time:'3d ago' });
    if (a.status === 'locked') out.push({ kind:'error', text:`Auto-locked after <b>5 failed sign-in attempts</b>`, time: relMin(a.lastSeenMin) });
    out.push({ kind:'brand', text:`Account created`, time: fmtDate(a.createdAt) });
    return out;
  }
  function actIcon(kind) {
    const m = {
      brand:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      warn:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
      error:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      success: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    };
    return m[kind] || '';
  }

  // ---------- Filters wiring ----------
  let qTimer;
  searchEl.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = searchEl.value.trim().toLowerCase(); renderTable(); }, 100);
  });
  root.querySelectorAll('[data-status]').forEach(b => {
    b.addEventListener('click', () => {
      root.querySelectorAll('[data-status]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.status = b.dataset.status;
      renderTable();
    });
  });

  // Select all
  selAllCb.addEventListener('change', () => {
    const filtered = getFiltered();
    if (selAllCb.checked) filtered.forEach(a => state.selected.add(a.id));
    else filtered.forEach(a => state.selected.delete(a.id));
    renderTable(); renderBulk();
  });

  // Invite modal
  inviteBtn.addEventListener('click', () => inviteModal.classList.add('open'));
  inviteModal.addEventListener('click', (e) => {
    if (e.target === inviteModal || e.target.closest('[data-close]')) inviteModal.classList.remove('open');
  });
  inviteModal.querySelector('#ac-invite-send').addEventListener('click', () => {
    const name = inviteModal.querySelector('#ac-inv-name').value.trim() || 'Anh Tuấn (mới)';
    const email = inviteModal.querySelector('#ac-inv-email').value.trim() || 'nguoimoi@hivespace.vn';
    const role = inviteModal.querySelector('#ac-inv-role').value;
    const newAcc = {
      id: 'u_new' + Date.now(), name, email, role,
      status: 'invited', mfa: false, lastSeenMin: null, city: '—', ip: '—',
      color: COLORS[ACCOUNTS.length % COLORS.length], createdAt: new Date(),
    };
    ACCOUNTS.unshift(newAcc);
    inviteModal.classList.remove('open');
    inviteModal.querySelector('#ac-inv-name').value = '';
    inviteModal.querySelector('#ac-inv-email').value = '';
    renderStats(); renderRail(); renderTable();
    showToast(`Invitation sent to ${email}`);
  });

  // Toast (reuses #al-toast if present, else fallback)
  let toastTimer;
  function showToast(msg) {
    if (toast) {
      toast.querySelector('.msg').textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    }
  }

  // ---------- Initial ----------
  renderStats();
  renderRail();
  renderTable();
})();
