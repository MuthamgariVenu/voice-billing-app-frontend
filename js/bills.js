// ================= GLOBAL =================
const API_BASE = "http://localhost:5000/api";
let token = null;

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token");
  const shopName = localStorage.getItem("shopName");

  // 🔐 AUTH CHECK
  if (!token) {
    window.location.replace("login.html");
    return;
  }

  // 🏪 SHOP NAME
  const shopEl = document.getElementById("shopName");
  if (shopEl && shopName) {
    shopEl.textContent = shopName;
  }

  // 🚪 LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.replace("login.html");
    });
  }

  initPage();
});

// ================= INIT =================
function initPage() {
  loadProducts();
  loadBills();
}

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      alert("Failed to load products");
      return;
    }

    const products = await res.json();
    renderProducts(products);

  } catch (err) {
    console.error("Load products error:", err);
  }
}

// ================= RENDER PRODUCTS =================
function renderProducts(products) {
  const tbody = document.getElementById("productsTableBody");
  tbody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="border p-2">${p.name}</td>
      <td class="border p-2">₹ ${p.price}</td>
      <td class="border p-2">${p.stock}</td>
      <td class="border p-2">
        <input
          type="number"
          min="0"
          max="${p.stock}"
          value="0"
          data-id="${p._id}"
          data-price="${p.price}"
          class="qtyInput border px-2 py-1 w-20"
        />
      </td>
      <td class="border p-2">₹ <span class="rowTotal">0</span></td>
    `;

    tbody.appendChild(tr);
  });

  attachQtyListeners();
}

// ================= QTY HANDLING =================
function attachQtyListeners() {
  document.querySelectorAll(".qtyInput").forEach(input => {
    input.addEventListener("input", () => {
      const qty = Number(input.value);
      const price = Number(input.dataset.price);
      const total = qty * price;

      input.closest("tr").querySelector(".rowTotal").textContent = total;
      updateGrandTotal();
    });
  });
}

// ================= GRAND TOTAL =================
function updateGrandTotal() {
  let total = 0;
  document.querySelectorAll(".rowTotal").forEach(el => {
    total += Number(el.textContent);
  });

  document.getElementById("grandTotal").textContent = total;
}

// ================= CREATE BILL =================
document.getElementById("createBillBtn").addEventListener("click", async () => {
  const items = [];

  document.querySelectorAll(".qtyInput").forEach(input => {
    const qty = Number(input.value);
    if (qty > 0) {
      items.push({
        productId: input.dataset.id,
        qty
      });
    }
  });

  if (!items.length) {
    alert("Please select at least one product");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/bills/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Bill creation failed");
      return;
    }

    alert("✅ Bill created successfully");
    resetBillUI();
    loadBills();

  } catch (err) {
    console.error("Create bill error:", err);
    alert("Server error");
  }
});

// ================= RESET BILL =================
document.getElementById("refreshBillBtn").addEventListener("click", resetBillUI);

function resetBillUI() {
  document.querySelectorAll(".qtyInput").forEach(input => {
    input.value = 0;
    input.dispatchEvent(new Event("input"));
  });
}

// ================= LOAD BILL HISTORY =================
async function loadBills() {
  try {
    const res = await fetch(`${API_BASE}/bills/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) return;

    const bills = await res.json();
    renderBills(bills);

  } catch (err) {
    console.error("Load bills error:", err);
  }
}

// ================= RENDER BILLS =================
function renderBills(bills) {
  const container = document.getElementById("billsContainer");

  if (!bills.length) {
    container.innerHTML = "<p class='text-gray-500'>No bills found</p>";
    return;
  }

  let html = `
    <table class="w-full border text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">Bill ID</th>
          <th class="border p-2">Total</th>
          <th class="border p-2">Date</th>
          <th class="border p-2">PDF</th>
        </tr>
      </thead>
      <tbody>
  `;

  bills.forEach(b => {
    html += `
      <tr>
        <td class="border p-2">${b._id}</td>
        <td class="border p-2">₹ ${b.totalAmount}</td>
        <td class="border p-2">${new Date(b.createdAt).toLocaleString()}</td>
        <td class="border p-2 text-center">
          <button
            class="text-blue-600 underline"
            onclick="downloadPDF('${b._id}')"
          >
            Download
          </button>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

// ================= PDF DOWNLOAD (FINAL FIX) =================
window.downloadPDF = async (billId) => {
  try {
    const res = await fetch(`${API_BASE}/bills/${billId}/pdf`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("PDF Error:", errText);
      alert("Failed to download PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `bill_${billId}.pdf`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("PDF download error:", err);
    alert("Failed to download PDF");
  }
};
