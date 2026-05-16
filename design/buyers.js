(function () {
  const buyers = [
    { id: "BU-842184", name: "Linh Nguyen", email: "linh.nguyen@hivespace.vn", location: "Ho Chi Minh City", status: "active", orders: 48, spend: 18450000, lastActive: "5m ago", joined: "2023-08-14" },
    { id: "BU-842185", name: "An Tran", email: "an.tran@shopmail.vn", location: "Ha Noi", status: "unverified", orders: 2, spend: 580000, lastActive: "2h ago", joined: "2026-05-09" },
    { id: "BU-842186", name: "Bao Pham", email: "bao.pham@buyer.co", location: "Da Nang", status: "dormant", orders: 11, spend: 4250000, lastActive: "29d ago", joined: "2024-02-03" },
    { id: "BU-842187", name: "Trang Le", email: "trang.le@northstar.vn", location: "Can Tho", status: "active", orders: 73, spend: 26750000, lastActive: "14m ago", joined: "2022-11-26" },
    { id: "BU-842188", name: "Minh Vu", email: "minh.vu@citymail.vn", location: "Hai Phong", status: "suspended", orders: 19, spend: 6910000, lastActive: "3d ago", joined: "2023-12-09" },
    { id: "BU-842189", name: "Quynh Do", email: "quynh.do@lotus.vn", location: "Nha Trang", status: "active", orders: 32, spend: 12990000, lastActive: "31m ago", joined: "2024-07-18" },
    { id: "BU-842190", name: "Huy Bui", email: "huy.bui@beta.io", location: "Bien Hoa", status: "dormant", orders: 7, spend: 2130000, lastActive: "41d ago", joined: "2023-05-30" },
    { id: "BU-842191", name: "Gia Han", email: "gia.han@market.vn", location: "Ho Chi Minh City", status: "active", orders: 28, spend: 9400000, lastActive: "9m ago", joined: "2025-01-12" },
    { id: "BU-842192", name: "Phuc Ho", email: "phuc.ho@shop.vn", location: "Ha Noi", status: "unverified", orders: 1, spend: 145000, lastActive: "6h ago", joined: "2026-05-08" },
    { id: "BU-842193", name: "Yen Vo", email: "yen.vo@pearl.vn", location: "Vung Tau", status: "suspended", orders: 15, spend: 5020000, lastActive: "8d ago", joined: "2024-09-04" }
  ];

  const totalEl = document.getElementById("bu-stat-total");
  const activeEl = document.getElementById("bu-stat-active");
  const newEl = document.getElementById("bu-stat-new");
  const suspendedEl = document.getElementById("bu-stat-suspended");
  const queryEl = document.getElementById("bu-q");
  const tbodyEl = document.getElementById("bu-tbody");
  const statusButtons = Array.from(document.querySelectorAll(".cu-seg [data-status]"));
  const modalEl = document.getElementById("bu-suspend-modal");
  const modalNameEl = document.getElementById("bu-susp-name");
  const modalReasonEl = document.getElementById("bu-susp-reason");
  const modalNoteEl = document.getElementById("bu-susp-note");
  const modalConfirmEl = document.getElementById("bu-susp-confirm");
  const modalCloseEls = Array.from(document.querySelectorAll("#bu-suspend-modal [data-close-modal]"));

  if (!tbodyEl || !queryEl || statusButtons.length === 0) return;

  const state = {
    query: "",
    status: "all",
    selectedBuyerId: null
  };

  const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  });

  const integerFormatter = new Intl.NumberFormat("en-US");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function statusBadge(status) {
    const map = {
      active: { cls: "success", label: "Active", dot: "var(--success-500)" },
      unverified: { cls: "warning", label: "Unverified", dot: "var(--warning-500)" },
      suspended: { cls: "error", label: "Suspended", dot: "var(--error-500)" },
      dormant: { cls: "light", label: "Dormant", dot: "var(--gray-400)" }
    };
    return map[status] || map.active;
  }

  function filteredBuyers() {
    const q = state.query.trim().toLowerCase();
    return buyers.filter((buyer) => {
      const matchesStatus = state.status === "all" || buyer.status === state.status;
      const haystack = `${buyer.name} ${buyer.email} ${buyer.location} ${buyer.id}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesStatus && matchesQuery;
    });
  }

  function updateStats() {
    const activeCount = buyers.filter((buyer) => buyer.status === "active").length;
    const suspendedCount = buyers.filter((buyer) => buyer.status === "suspended").length;
    const newTodayCount = buyers.filter((buyer) => buyer.joined === "2026-05-09").length;

    totalEl.textContent = "842,184";
    activeEl.textContent = integerFormatter.format(activeCount + 841900);
    newEl.textContent = integerFormatter.format(newTodayCount + 286);
    suspendedEl.textContent = integerFormatter.format(suspendedCount + 317);
  }

  function renderRows() {
    const rows = filteredBuyers();

    tbodyEl.innerHTML = rows.map((buyer) => {
      const badge = statusBadge(buyer.status);
      const primaryAction = buyer.status === "suspended"
        ? `<button class="hs-btn sm hs-btn-outline" data-action="reinstate" data-buyer-id="${buyer.id}">Reinstate</button>`
        : `<button class="hs-btn sm hs-btn-outline" data-action="suspend" data-buyer-id="${buyer.id}">Suspend</button>`;

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:12px; min-width:0;">
              <div style="width:40px; height:40px; border-radius:9999px; background:var(--brand-50); color:var(--brand-700); display:inline-flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">
                ${escapeHtml(buyer.name.split(" ").map((part) => part[0]).slice(0, 2).join(""))}
              </div>
              <div style="min-width:0;">
                <div style="font-weight:600; color:var(--gray-900); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(buyer.name)}</div>
                <div style="font-size:12px; color:var(--gray-500); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(buyer.email)} · ${escapeHtml(buyer.id)}</div>
              </div>
            </div>
          </td>
          <td><span class="hs-badge sm hs-badge-${badge.cls}"><span class="stat-dot" style="background:${badge.dot}"></span>${badge.label}</span></td>
          <td>${integerFormatter.format(buyer.orders)}</td>
          <td>${currencyFormatter.format(buyer.spend)}</td>
          <td>${escapeHtml(buyer.lastActive)}</td>
          <td>${escapeHtml(buyer.joined)}</td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:8px;">
              <button class="hs-btn sm hs-btn-outline" data-action="inspect" data-buyer-id="${buyer.id}">Inspect</button>
              ${primaryAction}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (rows.length === 0) {
      tbodyEl.innerHTML = `
        <tr>
          <td colspan="7" style="padding:32px; text-align:center; color:var(--gray-500);">
            No buyers match the current filters.
          </td>
        </tr>
      `;
    }
  }

  function openSuspendModal(buyerId) {
    const buyer = buyers.find((entry) => entry.id === buyerId);
    if (!buyer || !modalEl) return;
    state.selectedBuyerId = buyer.id;
    modalNameEl.textContent = `${buyer.name} · ${buyer.id}`;
    modalReasonEl.selectedIndex = 0;
    modalNoteEl.value = "";
    modalEl.classList.add("show");
  }

  function closeSuspendModal() {
    if (!modalEl) return;
    modalEl.classList.remove("show");
    state.selectedBuyerId = null;
  }

  function showToastMessage(message) {
    if (typeof window.showToast === "function") {
      window.showToast(message);
      return;
    }

    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-msg");
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  statusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      statusButtons.forEach((entry) => entry.classList.remove("active"));
      button.classList.add("active");
      state.status = button.dataset.status || "all";
      renderRows();
    });
  });

  queryEl.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderRows();
  });

  tbodyEl.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const buyerId = target.getAttribute("data-buyer-id");
    const action = target.getAttribute("data-action");
    const buyer = buyers.find((entry) => entry.id === buyerId);
    if (!buyer) return;

    if (action === "suspend") {
      openSuspendModal(buyerId);
      return;
    }

    if (action === "reinstate") {
      buyer.status = "active";
      updateStats();
      renderRows();
      showToastMessage(`Buyer restored · ${buyer.name}`);
      return;
    }

    if (action === "inspect") {
      showToastMessage(`Opened buyer profile · ${buyer.name}`);
    }
  });

  modalCloseEls.forEach((button) => {
    button.addEventListener("click", closeSuspendModal);
  });

  if (modalEl) {
    modalEl.addEventListener("click", (event) => {
      if (event.target === modalEl) closeSuspendModal();
    });
  }

  modalConfirmEl?.addEventListener("click", () => {
    const buyer = buyers.find((entry) => entry.id === state.selectedBuyerId);
    if (!buyer) return;

    buyer.status = "suspended";
    closeSuspendModal();
    updateStats();
    renderRows();

    const reason = modalReasonEl.value ? ` · ${modalReasonEl.value}` : "";
    showToastMessage(`Buyer suspended · ${buyer.name}${reason}`);
  });

  document.querySelectorAll('[data-view="buyers"] .hs-btn').forEach((button) => {
    if (button.textContent.includes("Export")) {
      button.addEventListener("click", () => showToastMessage("Buyer export queued"));
    }
  });

  updateStats();
  renderRows();
})();
