// ================= AUTH CHECK =================
const token = localStorage.getItem("token");
const shopName = localStorage.getItem("shopName");

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("index.html");
    return;
  }

  initPage();
});


// ================= HEADER =================
if (shopName) {
  document.getElementById("shopName").textContent =
    shopName + " - Products";
}

// ================= API BASE =================
const API_BASE = "http://localhost:5000/api";

// ================= FORM ELEMENTS =================
const nameInput = document.getElementById("productName");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");
const unitInput = document.getElementById("unit");
const addBtn = document.getElementById("addProductBtn");
const tableBody = document.getElementById("productsTable");

let editProductId = null;

function initPage() {
  loadProducts();
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
      throw new Error("Failed to load products");
    }

    const products = await res.json();
    renderProducts(products);

  } catch (err) {
    console.error("❌ Load products error:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center p-4 text-red-500">
          Failed to load products
        </td>
      </tr>`;
  }
}

// ================= RENDER PRODUCTS =================
function renderProducts(products) {
  tableBody.innerHTML = "";

  if (!products || products.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center p-4 text-gray-500">
          No products added yet
        </td>
      </tr>`;
    return;
  }

  products.forEach(p => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="border p-2">${p.name}</td>
      <td class="border p-2">₹ ${p.price}</td>
      <td class="border p-2">${p.stock}</td>
      <td class="border p-2">${p.unit}</td>
      <td class="border p-2 text-blue-600 cursor-pointer underline">
        Edit
      </td>
    `;

    row.querySelector("td:last-child")
      .addEventListener("click", () => startEdit(p));

    tableBody.appendChild(row);
  });
}

// ================= START EDIT =================
function startEdit(product) {
  editProductId = product._id;

  nameInput.value = product.name;
  priceInput.value = product.price;
  stockInput.value = product.stock;
  unitInput.value = product.unit;

  addBtn.textContent = "Update Product";
  addBtn.classList.remove("bg-blue-600");
  addBtn.classList.add("bg-green-600");
}

// ================= SAVE / UPDATE PRODUCT =================
addBtn.addEventListener("click", async () => {

  const payload = {
    name: nameInput.value.trim(),
    price: Number(priceInput.value),
    stock: Number(stockInput.value),
    unit: unitInput.value
  };

  if (!payload.name || payload.price <= 0 || payload.stock <= 0 || !payload.unit) {
    alert("Please fill all fields correctly");
    return;
  }

  try {
    const url = editProductId
      ? `${API_BASE}/products/${editProductId}`
      : `${API_BASE}/products`;

    const method = editProductId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    // 🔥 VERY IMPORTANT
    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Backend did not return JSON:", text);
      alert("Server error. Check backend logs.");
      return;
    }

    if (!res.ok) {
      alert(data.message || "Save failed");
      return;
    }

    resetForm();
    loadProducts();

  } catch (err) {
    console.error("❌ Save/update error:", err);
    alert("Network / server error");
  }
});

// ================= RESET FORM =================
function resetForm() {
  editProductId = null;

  nameInput.value = "";
  priceInput.value = "";
  stockInput.value = "";
  unitInput.value = "";

  addBtn.textContent = "Save Product";
  addBtn.classList.remove("bg-green-600");
  addBtn.classList.add("bg-blue-600");
}

// ================= LOGOUT =================
document.getElementById("logoutBtn")
  .addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

// ================= INIT =================

