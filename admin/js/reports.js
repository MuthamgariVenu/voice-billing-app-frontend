// ================= AUTH GUARD =================
const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
  window.location.href = "admin-login.html";
}

// ================= LOGOUT =================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  });
}

// ================= API BASE =================
const API_BASE = "http://localhost:5000/api";

// ================= DOM ELEMENTS =================
const tableBody = document.getElementById("reportsTableBody");

const totalCountEl = document.getElementById("totalCount");
const activeCountEl = document.getElementById("activeCount");
const inactiveCountEl = document.getElementById("inactiveCount");

const fromDateEl = document.getElementById("fromDate");
const toDateEl = document.getElementById("toDate");
const statusFilterEl = document.getElementById("statusFilter");
const applyFiltersBtn = document.getElementById("applyFilters");

// ================= LOAD REPORTS =================
async function loadReports() {
  try {
    const res = await fetch(`${API_BASE}/admin/shops`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to load reports");
    }

    const shops = await res.json();

    applyFilters(shops);

  } catch (err) {
    console.error("Reports load error:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-6 text-red-500">
          Failed to load reports
        </td>
      </tr>
    `;
  }
}

// ================= APPLY FILTERS =================
function applyFilters(shops) {
  let filtered = [...shops];

  // ---- Date filter ----
  const fromDate = fromDateEl.value ? new Date(fromDateEl.value) : null;
  const toDate = toDateEl.value ? new Date(toDateEl.value) : null;

  if (fromDate) {
    filtered = filtered.filter(s =>
      new Date(s.createdAt) >= fromDate
    );
  }

  if (toDate) {
    filtered = filtered.filter(s =>
      new Date(s.createdAt) <= toDate
    );
  }

  // ---- Status filter ----
  const status = statusFilterEl.value;

  if (status === "active") {
    filtered = filtered.filter(s => s.isActive === true);
  }

  if (status === "inactive") {
    filtered = filtered.filter(s => s.isActive === false);
  }

  renderSummary(filtered);
  renderTable(filtered);
}

// ================= SUMMARY =================
function renderSummary(shops) {
  const total = shops.length;
  const active = shops.filter(s => s.isActive).length;
  const inactive = total - active;

  totalCountEl.textContent = total;
  activeCountEl.textContent = active;
  inactiveCountEl.textContent = inactive;
}

// ================= TABLE =================
function renderTable(shops) {
  tableBody.innerHTML = "";

  if (shops.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-6 text-gray-500">
          No data found
        </td>
      </tr>
    `;
    return;
  }

  shops.forEach(shop => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="px-4 py-3">${shop.name || "-"}</td>
      <td class="px-4 py-3">${shop.code || "-"}</td>
      <td class="px-4 py-3">
        <span class="${
          shop.isActive ? "text-green-600" : "text-red-600"
        }">
          ${shop.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td class="px-4 py-3">
        ${shop.createdAt
          ? new Date(shop.createdAt).toLocaleDateString()
          : "-"
        }
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// ================= FILTER BUTTON =================
applyFiltersBtn.addEventListener("click", loadReports);

// ================= INIT =================
document.addEventListener("DOMContentLoaded", loadReports);
