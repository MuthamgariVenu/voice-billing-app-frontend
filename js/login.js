// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  // ================= AUTH CHECK =================
  const existingToken = localStorage.getItem("token");

  if (existingToken) {
    window.location.replace("bills.html");
    return;
  }

  // ================= ELEMENTS =================
  const loginBtn = document.getElementById("loginBtn");
  const usernameInput = document.getElementById("email"); // mobile / username
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");

  // ================= LOGIN HANDLER =================
  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

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
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "Login failed");
        return;
      }

      // ✅ SAVE AUTH DATA
      localStorage.setItem("token", data.token);

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

});
