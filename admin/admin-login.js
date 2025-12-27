document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const errorMsg = document.getElementById("errorMsg");

  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";

    if (!username || !password) {
      errorMsg.textContent = "Please enter username and password";
      errorMsg.classList.remove("hidden");
      return;
    }

    try {
      // 🔥 API_BASE comes from config.js
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || "Invalid admin credentials";
        errorMsg.classList.remove("hidden");
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("adminToken", data.token);

      // ✅ REDIRECT
      window.location.href = "admin-dashboard.html";

    } catch (err) {
      console.error("Admin login error:", err);
      errorMsg.textContent = "Server error. Please try again later.";
      errorMsg.classList.remove("hidden");
    }
  });
});
