document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");

  errorEl.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || "Login failed";
      errorEl.classList.remove("hidden");
      return;
    }

    // ✅ SAVE TOKEN
    localStorage.setItem("token", data.token);

    // 👉 redirect to dashboard
    window.location.href = "dashboard.html";

  } catch (err) {
    errorEl.textContent = "Server error. Try again.";
    errorEl.classList.remove("hidden");
  }
});
