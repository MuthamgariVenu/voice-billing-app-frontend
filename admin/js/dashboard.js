document.addEventListener("DOMContentLoaded", () => {

  // ================= AUTH CHECK =================
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    window.location.href = "admin-login.html";
    return;
  }

  // ================= LOGOUT =================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "admin-login.html";
    });
  }

  // ================= LOAD DASHBOARD =================
  async function loadDashboard() {
    try {
      const res = await fetch(`${API_BASE}/admin/shops`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      const shops = await res.json();

      if (!res.ok) {
        throw new Error(shops.message || "Failed to load dashboard data");
      }

      const total = shops.length;
      const active = shops.filter(s => s.isActive).length;
      const inactive = total - active;

      // ================= COUNTS =================
      document.getElementById("totalShops").textContent = total;
      document.getElementById("activeShops").textContent = active;
      document.getElementById("inactiveShops").textContent = inactive;

      // ================= PIE CHART =================
      new Chart(document.getElementById("statusChart"), {
        type: "pie",
        data: {
          labels: ["Active", "Inactive"],
          datasets: [{
            data: [active, inactive],
            backgroundColor: ["#16a34a", "#dc2626"]
          }]
        }
      });

      // ================= BAR CHART =================
      new Chart(document.getElementById("shopsBarChart"), {
        type: "bar",
        data: {
          labels: ["Active Shops", "Inactive Shops"],
          datasets: [{
            label: "Number of Shops",
            data: [active, inactive],
            backgroundColor: ["#22c55e", "#ef4444"]
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });

    } catch (err) {
      console.error("Dashboard error:", err);
    }
  }

  // ================= INIT =================
  loadDashboard();

});
