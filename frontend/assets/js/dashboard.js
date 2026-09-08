/* =========================================================
   IRONLOG — dashboard logic
   ========================================================= */

const PAGE_SIZE = 8;

const state = {
  mode: "all",
  page: 0,
  allRows: [],   // full unfiltered/filtered result set for the current mode
};

document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();

  document.getElementById("ownerEmailLabel").textContent = Auth.getEmail();
  document.getElementById("logoutBtn").addEventListener("click", Auth.logout.bind(Auth));

  initRandomIdentity();
  initFilterTabs();
  document.getElementById("resetFilterBtn").addEventListener("click", () => switchMode("all"));

  document.getElementById("filterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.page = 0;
    runQuery();
  });

  initAddMember();

  await loadStats();
  await switchMode("all");
});

/* ---------------- add / edit member (shared modal) ---------------- */
let editingMemberId = null;
let memberFormModal = null;

function initAddMember() {
  memberFormModal = new bootstrap.Modal(document.getElementById("addMemberModal"));
  const form = document.getElementById("addMemberForm");
  const errorBox = document.getElementById("addMemberError");
  const submitBtn = document.getElementById("addMemberSubmitBtn");
  const submitText = document.getElementById("addMemberSubmitText");
  const spinner = document.getElementById("addMemberSpinner");

  document.getElementById("addMemberBtn").addEventListener("click", () => openMemberForm(null));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      name: val("nm_name"),
      email: val("nm_email"),
      age: parseInt(val("nm_age"), 10),
      gender: val("nm_gender"),
      membershipPlan: val("nm_plan"),
      status: val("nm_status"),
      joiningDate: val("nm_join"),
      expiryDate: val("nm_expiry"),
    };

    const isEdit = !!editingMemberId;
    submitBtn.disabled = true;
    submitText.textContent = isEdit ? "Updating…" : "Saving…";
    spinner.style.display = "inline-block";

    try {
      if (isEdit) {
        await apiFetch(`/api/members/${editingMemberId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(`${payload.name} was updated.`);
      } else {
        await apiFetch("/api/members", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(`${payload.name} was added successfully.`);
      }

      memberFormModal.hide();
      await loadStats();
      await runQuery();
    } catch (err) {
      errorBox.textContent = err.message || "Could not save this member.";
      errorBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = isEdit ? "Update member" : "Save member";
      spinner.style.display = "none";
    }
  });
}

// data === null -> add mode. data === a member object -> edit mode, pre-filled.
function openMemberForm(data) {
  const form = document.getElementById("addMemberForm");
  form.reset();
  document.getElementById("addMemberError").style.display = "none";
  editingMemberId = data ? data.id : null;

  document.getElementById("memberFormTitle").textContent = data ? "Update member" : "Add new member";
  document.getElementById("addMemberSubmitText").textContent = data ? "Update member" : "Save member";

  if (data) {
    document.getElementById("nm_name").value = data.name || "";
    document.getElementById("nm_email").value = data.email || "";
    document.getElementById("nm_age").value = data.age ?? "";
    document.getElementById("nm_gender").value = data.gender || "";
    document.getElementById("nm_plan").value = data.membershipPlan || "";
    document.getElementById("nm_status").value = data.status || "Active";
    document.getElementById("nm_join").value = data.joiningDate || todayISO();
    document.getElementById("nm_expiry").value = data.expiryDate || addDaysISO(30);
  } else {
    document.getElementById("nm_join").value = todayISO();
    document.getElementById("nm_expiry").value = addDaysISO(30);
  }

  memberFormModal.show();
}

/* ---------------- delete member ---------------- */
async function deleteMemberRow(id, name) {
  if (!confirm(`Remove ${name} from your member list? This can't be undone.`)) return;

  try {
    await apiFetch(`/api/members/${id}`, { method: "DELETE" });
    showToast(`${name} was removed.`);
    await loadStats();
    await runQuery();
  } catch (err) {
    showToast(err.message || "Could not delete this member.");
  }
}

/* ---------------- stable gym identity ---------------- */
const DEFAULT_GYM_IDENTITY = {
  name: "IRONLOG",
  tagline: "A professional fitness community built around strength, consistency, and long-term progress.",
  photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=320&q=80"
};

function getGymIdentity() {
  // Branding is fixed for this application. Do not read an old/random
  // gym name from localStorage, otherwise "YOUR GYM NAME" can reappear.
  return { ...DEFAULT_GYM_IDENTITY };
}

function applyGymIdentity() {
  const identity = getGymIdentity();
  document.getElementById("gymNameDisplay").textContent = identity.name;
  document.getElementById("gymAboutDisplay").textContent = identity.tagline;
  document.getElementById("ownerPhoto").src = identity.photo;
}

function initRandomIdentity() {
  applyGymIdentity();
  const shuffle = document.getElementById("shuffleIdentityBtn");
  if (shuffle) shuffle.remove();
}

/* ---------------- stats ---------------- */
async function loadStats() {
  try {
    const [totalPage, active, expired, expiring] = await Promise.all([
      apiFetch(`/api/members?page=0&size=1`),
      apiFetch(`/api/members/status?status=Active`),
      apiFetch(`/api/members/status?status=Expired`),
      apiFetch(`/api/members/expiring?startDate=${todayISO()}&endDate=${addDaysISO(7)}`),
    ]);

    document.getElementById("statTotal").textContent = totalPage.totalElements ?? "0";
    document.getElementById("statActive").textContent = active.length;
    document.getElementById("statExpired").textContent = expired.length;
    document.getElementById("statExpiring").textContent = expiring.length;
  } catch (err) {
    showToast(err.message);
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysISO(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/* ---------------- filter tabs & dynamic fields ---------------- */
const FIELD_TEMPLATES = {
  all: () => ``,
  search: () => `
    <label class="form-label">Member name</label>
    <input type="text" class="form-control" id="f_name" placeholder="e.g. Priya" required>
  `,
  status: () => `
    <label class="form-label">Status</label>
    <select class="form-select" id="f_status">
      <option value="Active">Active</option>
      <option value="Expired">Expired</option>
    </select>
  `,
  plan: () => `
    <label class="form-label">Membership plan</label>
    <input type="text" class="form-control" id="f_plan" placeholder="e.g. Gold, Monthly, Annual" required>
  `,
  gender: () => `
    <label class="form-label">Gender</label>
    <select class="form-select" id="f_gender">
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
  `,
  age: () => `
    <label class="form-label">Exact age</label>
    <input type="number" min="0" class="form-control" id="f_age" placeholder="e.g. 28" required>
  `,
  agerange: () => `
    <div class="row gx-2">
      <div class="col-6">
        <label class="form-label">Min age</label>
        <input type="number" min="0" class="form-control" id="f_minAge" value="18" required>
      </div>
      <div class="col-6">
        <label class="form-label">Max age</label>
        <input type="number" min="0" class="form-control" id="f_maxAge" value="60" required>
      </div>
    </div>
  `,
  recent: () => `
    <label class="form-label">Joined after</label>
    <input type="date" class="form-control" id="f_date" value="${addDaysISO(-30)}" required>
  `,
  expiring: () => `
    <div class="row gx-2">
      <div class="col-6">
        <label class="form-label">From</label>
        <input type="date" class="form-control" id="f_start" value="${todayISO()}" required>
      </div>
      <div class="col-6">
        <label class="form-label">To</label>
        <input type="date" class="form-control" id="f_end" value="${addDaysISO(7)}" required>
      </div>
    </div>
  `,
};

function initFilterTabs() {
  document.querySelectorAll("#filterTabs .nav-link").forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
  });
}

async function switchMode(mode) {
  state.mode = mode;
  state.page = 0;

  document.querySelectorAll("#filterTabs .nav-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  document.getElementById("filterFields").innerHTML = FIELD_TEMPLATES[mode]();
  await runQuery();
}

/* ---------------- query dispatch ---------------- */
async function runQuery() {
  setLoading(true);
  try {
    let rows = [];

    switch (state.mode) {
      case "all": {
        const page = await apiFetch(`/api/members?page=0&size=1000`);
        rows = page.content || [];
        break;
      }
      case "search": {
        const name = val("f_name");
        if (!name) return finishEmptyPrompt("Type a name to search.");
        rows = await apiFetch(`/api/members/search?name=${encodeURIComponent(name)}`);
        break;
      }
      case "status": {
        rows = await apiFetch(`/api/members/status?status=${encodeURIComponent(val("f_status"))}`);
        break;
      }
      case "plan": {
        const plan = val("f_plan");
        if (!plan) return finishEmptyPrompt("Enter a plan to filter by.");
        rows = await apiFetch(`/api/members/plan?plan=${encodeURIComponent(plan)}`);
        break;
      }
      case "gender": {
        rows = await apiFetch(`/api/members/gender?gender=${encodeURIComponent(val("f_gender"))}`);
        break;
      }
      case "age": {
        const age = val("f_age");
        if (age === "") return finishEmptyPrompt("Enter an age to filter by.");
        rows = await apiFetch(`/api/members/age?age=${encodeURIComponent(age)}`);
        break;
      }
      case "agerange": {
        rows = await apiFetch(`/api/members/age-range?minAge=${val("f_minAge")}&maxAge=${val("f_maxAge")}`);
        break;
      }
      case "recent": {
        rows = await apiFetch(`/api/members/recent?date=${val("f_date")}`);
        break;
      }
      case "expiring": {
        rows = await apiFetch(`/api/members/expiring?startDate=${val("f_start")}&endDate=${val("f_end")}`);
        break;
      }
    }

    state.allRows = rows;
    renderPage();
  } catch (err) {
    showToast(err.message);
    state.allRows = [];
    renderPage();
  } finally {
    setLoading(false);
  }
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function finishEmptyPrompt(message) {
  state.allRows = [];
  renderPage();
  setLoading(false);
  document.getElementById("emptyState").innerHTML = `<i class="bi bi-cursor d-block mb-2"></i>${escapeHtml(message)}`;
  document.getElementById("emptyState").style.display = "block";
}

/* ---------------- rendering ---------------- */
function setLoading(isLoading) {
  document.getElementById("loadingRow").style.display = isLoading ? "block" : "none";
  if (isLoading) {
    document.getElementById("emptyState").style.display = "none";
  }
}

function renderPage() {
  const total = state.allRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages - 1);

  const start = state.page * PAGE_SIZE;
  const pageRows = state.allRows.slice(start, start + PAGE_SIZE);

  document.getElementById("resultCount").textContent = total
    ? `${total} member${total === 1 ? "" : "s"} found`
    : "";

  const emptyState = document.getElementById("emptyState");
  emptyState.innerHTML = `<i class="bi bi-search d-block mb-2"></i>No members match this filter yet.`;
  emptyState.style.display = total === 0 ? "block" : "none";

  renderTable(pageRows);
  renderCards(pageRows);
  renderPagination(totalPages);
}

function statusBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "active") return "active";
  if (s === "expired") return "expired";
  return "other";
}

function renderTable(rows) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = rows.map((m) => `
    <tr>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.email)}</td>
      <td>${m.age ?? "—"}</td>
      <td>${escapeHtml(m.gender || "—")}</td>
      <td>${escapeHtml(m.membershipPlan || "—")}</td>
      <td>${m.joiningDate || "—"}</td>
      <td>${m.expiryDate || "—"}</td>
      <td><span class="badge-status ${statusBadgeClass(m.status)}">${escapeHtml(m.status || "—")}</span></td>
      <td class="text-end">
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-line" title="View" onclick='openMemberModal(${JSON.stringify(m).replace(/'/g, "&apos;")})'>
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-line" title="Edit" onclick='openMemberForm(${JSON.stringify(m).replace(/'/g, "&apos;")})'>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-line" title="Delete" onclick='deleteMemberRow(${m.id}, ${JSON.stringify(m.name).replace(/'/g, "&apos;")})'>
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderCards(rows) {
  const list = document.getElementById("cardList");
  list.innerHTML = rows.map((m) => {
    const mJson = JSON.stringify(m).replace(/'/g, "&apos;");
    const mName = JSON.stringify(m.name).replace(/'/g, "&apos;");
    return `
    <div class="member-card">
      <div class="d-flex justify-content-between align-items-start" role="button" onclick='openMemberModal(${mJson})'>
        <div>
          <div class="m-name">${escapeHtml(m.name)}</div>
          <div class="m-meta">${escapeHtml(m.email)}</div>
        </div>
        <span class="badge-status ${statusBadgeClass(m.status)}">${escapeHtml(m.status || "—")}</span>
      </div>
      <div class="m-meta mt-2" role="button" onclick='openMemberModal(${mJson})'>
        ${m.age ?? "—"} yrs · ${escapeHtml(m.gender || "—")} · ${escapeHtml(m.membershipPlan || "—")}
      </div>
      <div class="m-meta mb-2">Expires ${m.expiryDate || "—"}</div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-line flex-grow-1" onclick='openMemberForm(${mJson})'><i class="bi bi-pencil me-1"></i>Edit</button>
        <button class="btn btn-sm btn-outline-line flex-grow-1" onclick='deleteMemberRow(${m.id}, ${mName})'><i class="bi bi-trash me-1"></i>Delete</button>
      </div>
    </div>
  `;
  }).join("");
}

function renderPagination(totalPages) {
  const controls = (idPrefix) => {
    if (totalPages <= 1) return "";
    let items = "";
    for (let i = 0; i < totalPages; i++) {
      items += `<li class="page-item ${i === state.page ? "active" : ""}">
        <button class="page-link" data-page="${i}">${i + 1}</button>
      </li>`;
    }
    return `
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item ${state.page === 0 ? "disabled" : ""}">
            <button class="page-link" data-page="${state.page - 1}"><i class="bi bi-chevron-left"></i></button>
          </li>
          ${items}
          <li class="page-item ${state.page === totalPages - 1 ? "disabled" : ""}">
            <button class="page-link" data-page="${state.page + 1}"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    `;
  };

  document.getElementById("pagingControlsTop").innerHTML = controls("top");
  document.getElementById("pagingControlsBottom").innerHTML = controls("bottom");

  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.dataset.page, 10);
      if (Number.isNaN(p) || p < 0 || p >= totalPages) return;
      state.page = p;
      renderPage();
      document.querySelector(".results-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---------------- member modal ---------------- */
function openMemberModal(m) {
  document.getElementById("memberModalBody").innerHTML = `
    <div class="member-profile">
      <div class="member-profile-icon"><i class="bi bi-person"></i></div>
      <div class="member-profile-main">
        <h3>${escapeHtml(m.name)}</h3>
        <p><i class="bi bi-envelope me-1"></i>${escapeHtml(m.email)}</p>
      </div>
      <span class="badge-status ${statusBadgeClass(m.status)}">${escapeHtml(m.status || "—")}</span>
    </div>

    <div class="member-detail-grid">
      <div class="member-detail-card"><span class="k">Age</span><strong>${m.age ?? "—"} <small>years</small></strong></div>
      <div class="member-detail-card"><span class="k">Gender</span><strong>${escapeHtml(m.gender || "—")}</strong></div>
      <div class="member-detail-card"><span class="k">Membership</span><strong>${escapeHtml(m.membershipPlan || "—")}</strong></div>
      <div class="member-detail-card"><span class="k">Member ID</span><strong>#${m.id}</strong></div>
    </div>

    <div class="member-dates">
      <div class="member-date-row">
        <div class="date-icon"><i class="bi bi-calendar-plus"></i></div>
        <div><span>Joined</span><strong>${m.joiningDate || "—"}</strong></div>
      </div>
      <div class="member-date-row">
        <div class="date-icon"><i class="bi bi-calendar-check"></i></div>
        <div><span>Membership expires</span><strong>${m.expiryDate || "—"}</strong></div>
      </div>
    </div>
  `;
  new bootstrap.Modal(document.getElementById("memberModal")).show();
}

/* ---------------- toast + utils ---------------- */
function showToast(message) {
  document.getElementById("mainToastBody").textContent = message;
  new bootstrap.Toast(document.getElementById("mainToast")).show();
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
