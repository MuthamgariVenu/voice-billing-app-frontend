// ================= VOICE BILLING (FINAL PRODUCTION) =================

const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const voiceText = document.getElementById("voiceText");

let recognition;
let isMicOn = false;
let silenceTimer = null;

let voiceBuffer = "";
let processTimer = null;

const SILENCE_LIMIT = 60000; // 1 min
const PROCESS_DELAY = 800;  // buffer delay

// ================= SPEECH SUPPORT =================
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "te-IN";
  recognition.continuous = true;
  recognition.interimResults = false;
} else {
  voiceStatus.textContent = "❌ Voice not supported";
}

// ================= NUMBER MAP (1–100) =================
const numberMap = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,

  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,

  thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100,

  // Telugu
  ఒకటి: 1, ఒక: 1,
  రెండు: 2,
  మూడు: 3,
  నాలుగు: 4,
  ఐదు: 5,
  ఆరు: 6,
  ఏడు: 7,
  ఎనిమిది: 8,
  తొమ్మిది: 9,
  పది: 10,

  // Fractions
  half: 0.5,
  అర: 0.5
};

// ================= PRODUCT ALIASES =================
const productAliases = {
  onion: ["onion", "ఉల్లి", "ఉల్లిపాయ", "ఆనియన్"],
  rice: ["rice", "బియ్యం", "రైస్"],
  sugar: ["sugar", "పంచదార", "షుగర్"],
  oil: ["oil", "నూనె", "ఓయిల్","ఆయిల్ "],
  eggs: ["egg", "eggs", "గుడ్డు", "గుడ్లు", "ఎగ్"]
};

// ================= BUTTON TOGGLE =================
voiceBtn.addEventListener("click", () => {
  if (isMicOn) stopMic("⏹️ Stopped");
  else startMic();
});

// ================= START MIC =================
function startMic() {
  if (isMicOn) return;
  recognition.start();
  isMicOn = true;
  voiceStatus.textContent = "🎤 Listening...";
  voiceBtn.textContent = "⏹️ Stop Voice";
  resetSilenceTimer();
}

// ================= STOP MIC =================
function stopMic(text = "⏱️ Auto stopped") {
  isMicOn = false;
  recognition.stop();
  clearTimeout(silenceTimer);
  silenceTimer = null;
  voiceStatus.textContent = text;
  voiceBtn.textContent = "🎤 Start Voice";
}

// ================= SILENCE TIMER =================
function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(() => {
    stopMic("⏱️ Auto stopped (no voice)");
  }, SILENCE_LIMIT);
}

// ================= VOICE EVENTS =================
recognition.onresult = (event) => {
  const transcript =
    event.results[event.results.length - 1][0].transcript
      .toLowerCase()
      .trim();

  voiceText.textContent = `You said: "${transcript}"`;
  resetSilenceTimer();

  voiceBuffer += " " + transcript;

  clearTimeout(processTimer);
  processTimer = setTimeout(() => {
    processVoice(voiceBuffer.trim());
    voiceBuffer = "";
  }, PROCESS_DELAY);
};

recognition.onend = () => {
  if (isMicOn) recognition.start();
};

// ================= NORMALIZE PRODUCT =================
function normalizeProduct(text) {
  for (const key in productAliases) {
    if (productAliases[key].some(a => text.includes(a))) {
      return key;
    }
  }
  return null;
}

// ================= MAIN PROCESS =================
function processVoice(text) {

  // BILL COMMAND
  if (text.includes("bill") || text.includes("బిల్") || text.includes("print")) {
    document.getElementById("createBillBtn")?.click();
    stopMic("🧾 Bill created");
    return;
  }

  applyVoiceQty(text);
}

// ================= APPLY QTY =================
function applyVoiceQty(text) {
  const product = normalizeProduct(text);
  if (!product) return;

  const qty = extractQtyWithUnit(text);
  if (qty <= 0) return;

  document.querySelectorAll(".qtyInput").forEach(input => {
    const row = input.closest("tr");
    const name = row.children[0].textContent.toLowerCase().trim();
    if (name === product) setQty(input, qty);
  });
}

// ================= EXTRACT QTY + UNIT =================
function extractQtyWithUnit(text) {
  let qty = 0;

  const words = text.split(" ");

  // number words
  words.forEach(w => {
    if (!isNaN(w)) qty = parseFloat(w);
    if (numberMap[w] !== undefined) qty = numberMap[w];
  });

  // one and half
  if (text.includes("one") && text.includes("half")) qty = 1.5;
  if (text.includes("ఒక") && text.includes("అర")) qty = 1.5;

  // grams → kg
  if (text.includes("gm") || text.includes("gram") || text.includes("గ్రాము")) {
    qty = qty / 1000;
  }

  return qty;
}

// ================= SET QTY =================
function setQty(input, qty) {
  input.value = qty;
  input.dispatchEvent(new Event("input"));
}
