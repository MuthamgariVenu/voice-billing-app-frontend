// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // ✅ Already logged in → go to app
  if (token) {
    window.location.replace("bills.html");
    return;
  }
});

// ================= ELEMENTS =================
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email"); // mobile number
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");

// ================= LOGIN HANDLER =================
loginBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // 🔥 important (stop form submit)

  const username = emailInput.value.trim(); // 🔥 FIX: email → username
  const password = passwordInput.value.trim();

  // ✅ Basic validation
  if (!username || !password) {
    showError("Mobile number and password required");
    return;
  }

  hideError();

  try {
    
     const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,   // 🔥 FIXED
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Login failed");
      return;
    }

    // ✅ SAVE AUTH DATA
    localStorage.setItem("token", data.token);

    // Optional (if backend sends shopName later)
    if (data.shopName) {
      localStorage.setItem("shopName", data.shopName);
    }

    // ✅ REDIRECT
    window.location.replace("bills.html");

  } catch (err) {
    console.error("Login error:", err);
    showError("Server error. Try again.");
  }
});

// ================= HELPERS =================
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function hideError() {
  errorMsg.classList.add("hidden");
}
