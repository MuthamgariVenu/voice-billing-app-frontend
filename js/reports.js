document.addEventListener("DOMContentLoaded", () => {

  // ================= AUTH =================
  const token = localStorage.getItem("token");
  const shopName = localStorage.getItem("shopName");

  if (!token) {
    window.location.replace("index.html");
    return;
  }

  // ================= HEADER =================
  if (shopName) {
    document.getElementById("shopName").textContent =
      shopName + " - Reports";
  }

  // ================= ELEMENTS =================
  const loadBtn = document.getElementById("loadReportBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const voiceStatus = document.getElementById("voiceStatus");

  const reportBox = document.getElementById("reportBox");
  const reportDate = document.getElementById("reportDate");
  const totalBills = document.getElementById("totalBills");
  const totalSales = document.getElementById("totalSales");
  const status = document.getElementById("status");

  // ================= INIT =================
  loadTodayReport();

  // ================= LOAD REPORT =================
  async function loadTodayReport() {
    status.textContent = "Loading report...";

    try {
      const res = await fetch(`${API_BASE}/reports/daily`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        status.textContent = data.message || "Failed to load report";
        return;
      }

      reportBox.classList.remove("hidden");
      reportDate.textContent = data.date;
      totalBills.textContent = data.totalBills;
      totalSales.textContent = data.totalSales;

      status.textContent = "✅ Report loaded";

    } catch (err) {
      console.error("Report error:", err);
      status.textContent = "Server error";
    }
  }

  // ================= BUTTON EVENTS =================
  loadBtn.addEventListener("click", loadTodayReport);

  refreshBtn.addEventListener("click", () => {
    reportBox.classList.add("hidden");
    status.textContent = "Ready";
  });

  // ================= LOGOUT =================
  window.logout = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };

  // ================= VOICE REPORT =================
  let recognition;
  let isListening = false;

  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "te-IN";
    recognition.continuous = false;
  } else {
    voiceStatus.textContent = "Voice not supported";
    return;
  }

  voiceBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
      isListening = false;
      voiceBtn.textContent = "🎤 Start Voice";
      voiceStatus.textContent = "Stopped";
    } else {
      recognition.start();
      isListening = true;
      voiceBtn.textContent = "⏹ Stop Voice";
      voiceStatus.textContent = "Listening...";
    }
  });

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase();
    voiceStatus.textContent = `You said: "${text}"`;

    if (
      text.includes("report") ||
      text.includes("రిపోర్ట్") ||
      text.includes("sales") ||
      text.includes("సేల్స్")
    ) {
      loadTodayReport();
    }
  };

  recognition.onend = () => {
    isListening = false;
    voiceBtn.textContent = "🎤 Start Voice";
  };

});
