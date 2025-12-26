function handleVoiceCommand(text) {

  // 👉 BILL COMMAND
  if (text.includes("bill") || text.includes("print")) {
    document.getElementById("createBillBtn").click();
    return;
  }

  // 👉 PRODUCT + QTY
  // examples:
  // "2 kg rice"
  // "3 rice"
  // "1 onion"

  const words = text.split(" ");

  let qty = parseFloat(words.find(w => !isNaN(w)));
  if (!qty) return;

  const productName = words.find(w =>
    document.querySelector(`[data-name="${w}"]`)
  );

  if (!productName) return;

  const input = document.querySelector(
    `[data-name="${productName}"]`
  );

  input.value = qty;
  input.dispatchEvent(new Event("input"));
}
