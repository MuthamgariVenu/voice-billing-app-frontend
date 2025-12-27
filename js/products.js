// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  // ================= AUTH CHECK =================
  const token = localStorage.getItem("token");
  const shopName = localStorage.getItem("shopName");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // ================= HEADER =================
  if (shopName) {
    document.getElementById("shopName").textContent = shopName;
  }

  // ================= ELEMENTS =================
  const nameInput = document.getElementById("productName");
  const priceInput = document.getElementById("price");
  const stockInput = document.getElementById("stock");
  const unitInput = document.getElementById("unit");
  const addBtn = document.getElementById("addProductBtn");
  const tableBody = document.getElementById("productsTable");
  const logoutBtn = document.getElementById("logoutBtn");
  const voiceBtn = document.getElementById("voiceAddBtn");

  // ================= STATE =================
  let editProductId = null;

  // ================= LOGOUT =================
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ================= LOAD PRODUCTS =================
  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const products = await res.json();
      tableBody.innerHTML = "";

      if (!res.ok) {
        throw new Error(products.message || "Failed to load products");
      }

      if (!products.length) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center p-4 text-gray-500">
              No products found
            </td>
          </tr>`;
        return;
      }

      products.forEach(p => {
        tableBody.innerHTML += `
          <tr>
            <td class="border p-2">${p.name}</td>
            <td class="border p-2">₹ ${p.price}</td>
            <td class="border p-2">${p.stock}</td>
            <td class="border p-2">${p.unit}</td>
            <td class="border p-2 text-blue-600 cursor-pointer"
                onclick="editProduct('${p._id}','${p.name}',${p.price},${p.stock},'${p.unit}')">
              Edit
            </td>
          </tr>`;
      });

    } catch (err) {
      console.error("Load products error:", err);
      alert("Failed to load products");
    }
  }

  // ================= ADD / UPDATE PRODUCT =================
  addBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const price = priceInput.value;
    const stock = stockInput.value;
    const unit = unitInput.value;

    if (!name || !price || !stock || !unit) {
      alert("All fields required");
      return;
    }

    const payload = { name, price, stock, unit };

    try {
      let url = `${API_BASE}/products`;
      let method = "POST";

      if (editProductId) {
        url = `${API_BASE}/products/${editProductId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Save failed");
      }

      resetForm();
      loadProducts();

    } catch (err) {
      console.error("Save product error:", err);
      alert("Save product failed");
    }
  });

  // ================= EDIT PRODUCT =================
  window.editProduct = (id, name, price, stock, unit) => {
    editProductId = id;
    nameInput.value = name;
    priceInput.value = price;
    stockInput.value = stock;
    unitInput.value = unit;

    addBtn.textContent = "Update Product";
    addBtn.classList.remove("bg-blue-600");
    addBtn.classList.add("bg-yellow-500");
  };

  // ================= RESET FORM =================
  function resetForm() {
    editProductId = null;
    nameInput.value = "";
    priceInput.value = "";
    stockInput.value = "";
    unitInput.value = "";
    addBtn.textContent = "Save Product";
    addBtn.classList.remove("bg-yellow-500");
    addBtn.classList.add("bg-blue-600");
  }

  // ================= VOICE SUPPORT =================
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => isListening = true;
    recognition.onend = () => isListening = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      parseVoiceText(text);

      if (text.includes("save")) {
        setTimeout(() => addBtn.click(), 500);
      }
    };
  }

  voiceBtn.addEventListener("click", () => {
    if (!recognition) {
      alert("Voice not supported");
      return;
    }
    if (isListening) return;
    recognition.start();
  });

  // ================= PARSE VOICE =================
  function parseVoiceText(text) {
    const words = text.split(" ");

    nameInput.value = words[0] || "";

    const p = words.indexOf("price");
    if (p !== -1) priceInput.value = words[p + 1] || "";

    const s = words.indexOf("stock");
    if (s !== -1) stockInput.value = words[s + 1] || "";

    if (words.includes("kg")) unitInput.value = "kg";
    else if (words.includes("ltr") || words.includes("liter")) unitInput.value = "ltr";
    else if (words.includes("pcs") || words.includes("piece")) unitInput.value = "pcs";
  }

  // ================= INIT =================
  loadProducts();

});
