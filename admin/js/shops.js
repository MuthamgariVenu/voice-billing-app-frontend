// ================= AUTH CHECK =================
const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
  window.location.href = "admin-login.html";
}

// ================= LOGOUT =================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "admin-login.html";
});

// ================= API BASE =================
fetch(`${API_BASE}/shops`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});


// ================= LOAD SHOPS =================
async function loadShops() {
  try {
    const res = await fetch(`${API_BASE}/admin/shops`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    const shops = await res.json();
    renderShops(shops);

  } catch (err) {
    console.error(err);
    alert("Failed to load shops");
  }
}

// ================= RENDER SHOPS =================
function renderShops(shops) {
  const tbody = document.getElementById("shopsTableBody");
  tbody.innerHTML = "";

  if (!shops || shops.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 text-gray-500">
          No shops found
        </td>
      </tr>
    `;
    return;
  }

  shops.forEach(shop => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="px-4 py-2">${shop.name}</td>
      <td class="px-4 py-2">${shop.code}</td>
      <td class="px-4 py-2 text-green-600">Active</td>
      <td class="px-4 py-2 space-x-3">
        <button
          class="text-blue-600"
          onclick="resetPassword('${shop.code}')">
          Reset Password
        </button>

        <button class="text-red-600">
          Disable
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ================= RESET USER PASSWORD =================
async function resetPassword(username) {
  const confirmReset = confirm(
    `Reset password for user ${username}?\n\n` +
    `New password will be last 4 digits of mobile.`
  );

  if (!confirmReset) return;

  try {
    const res = await fetch(
      `${API_BASE}/admin/users/${username}/reset-password`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Password reset failed");
      return;
    }

    alert(
      `Password Reset Successful ✅\n\n` +
      `Username: ${data.credentials.username}\n` +
      `New Password: ${data.credentials.password}`
    );

  } catch (err) {
    console.error(err);
    alert("Server error during password reset");
  }
}

// ================= CREATE SHOP =================
const modal = document.getElementById("createShopModal");
const openBtn = document.getElementById("openCreateModal");
const closeBtn = document.getElementById("closeModal");

openBtn.onclick = () => modal.classList.remove("hidden");
closeBtn.onclick = () => modal.classList.add("hidden");

document.getElementById("createShopForm").addEventListener("submit", async e => {
  e.preventDefault();

  const shopName = document.getElementById("shopName").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  try {
    const res = await fetch(`${API_BASE}/admin/shops`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        shopName,
        mobile
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // 🔥 SHOW CREDENTIALS TO ADMIN
    if (data.credentials) {
      alert(
        `Shop created successfully ✅\n\n` +
        `User Credentials:\n` +
        `Username: ${data.credentials.username}\n` +
        `Password: ${data.credentials.password}`
      );
    } else {
      alert("Shop created successfully ✅");
    }

    modal.classList.add("hidden");
    e.target.reset();
    loadShops();

  } catch (err) {
    console.error(err);
    alert("Create shop failed ❌");
  }
});

// ================= INIT =================
document.addEventListener("DOMContentLoaded", loadShops);
