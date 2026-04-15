"use strict";

// ── STATE ──────────────────────────────────────────────────────────────────
const state = {
  history:     [],
  isTyping:    false,
  currentLang: "en",
  recognition: null,
  isListening: false,
  moodChart:   null,
  moodData:    { labels: [], scores: [], colors: [] }
};

const LEVEL_SCORE = { low: 1, medium: 2, high: 3 };
const LEVEL_COLOR = { low: "#6ee7b7", medium: "#fbbf24", high: "#fb7185" };

// ── SPEECH RECOGNITION LANGUAGE MAP ───────────────────────────────────────
const SPEECH_LANG_MAP = {
  en: "en-IN", hi: "hi-IN", pa: "pa-IN",
  ta: "ta-IN", te: "te-IN", bn: "bn-IN",
  mr: "mr-IN", gu: "gu-IN", kn: "kn-IN",
  ml: "ml-IN", ur: "ur-PK",
  es: "es-ES", fr: "fr-FR", de: "de-DE",
  zh: "zh-CN", ar: "ar-SA", ja: "ja-JP", pt: "pt-BR",
};

// ── UI TRANSLATIONS ────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    nav_chat:"Chat", nav_mood:"Mood Log", nav_help:"Helplines",
    language:"Language",
    chat_heading:"How are you feeling today?",
    chat_sub:"I'm here to listen, without judgment.",
    welcome_1:"Hello, I'm Serenity — your compassionate AI wellness companion. 💙",
    welcome_2:"This is a safe, non-judgmental space. You can share whatever is on your mind.",
    welcome_3:"What's been weighing on you lately?",
    placeholder:"Share what's on your mind… or use 🎤",
    crisis_title:"You're not alone.",
    crisis_body:" If you're in immediate danger, please reach out now.",
    mood_heading:"Your Mood Journey",
    mood_sub:"Visualizing your emotional patterns over time.",
    mood_note:"Chat more to populate your mood history.",
    legend_low:"Low distress — calm & stable",
    legend_med:"Medium distress — some struggle",
    legend_high:"High distress — please seek support",
    help_heading:"Support & Helplines",
    help_sub:"Real humans who care — available when you need them most.",
    disclaimer:"Serenity provides emotional support and is not a replacement for professional therapy.",
    mic_start:"Click mic to speak",
    mic_listening:"Listening… speak now",
    mic_processing:"Processing speech…",
    mic_no_support:"Speech not supported in this browser",
  },
  hi: {
    nav_chat:"चैट", nav_mood:"मूड लॉग", nav_help:"हेल्पलाइन",
    language:"भाषा",
    chat_heading:"आज आप कैसा महसूस कर रहे हैं?",
    chat_sub:"मैं बिना किसी निर्णय के सुनने के लिए यहाँ हूँ।",
    welcome_1:"नमस्ते, मैं Serenity हूँ — आपकी AI वेलनेस साथी। 💙",
    welcome_2:"यह एक सुरक्षित जगह है। आप जो भी मन में हो, वो शेयर कर सकते हैं।",
    welcome_3:"आजकल आपको क्या परेशान कर रहा है?",
    placeholder:"अपने मन की बात लिखें… या 🎤 का उपयोग करें",
    crisis_title:"आप अकेले नहीं हैं।",
    crisis_body:" अगर आप खतरे में हैं, तो कृपया अभी संपर्क करें।",
    mood_heading:"आपकी मूड यात्रा",
    mood_sub:"समय के साथ आपके भावनात्मक पैटर्न को देखें।",
    mood_note:"अपनी मूड हिस्ट्री भरने के लिए और चैट करें।",
    legend_low:"कम तनाव — शांत",
    legend_med:"मध्यम तनाव — कुछ संघर्ष",
    legend_high:"उच्च तनाव — कृपया सहायता लें",
    help_heading:"सहायता और हेल्पलाइन",
    help_sub:"जरूरत के समय असली इंसान मदद के लिए उपलब्ध हैं।",
    disclaimer:"Serenity भावनात्मक सहायता प्रदान करती है और यह पेशेवर थेरेपी का विकल्प नहीं है।",
    mic_start:"बोलने के लिए माइक दबाएं",
    mic_listening:"सुन रहा हूँ… अभी बोलें",
    mic_processing:"आवाज़ प्रोसेस हो रही है…",
    mic_no_support:"इस ब्राउज़र में स्पीच सपोर्ट नहीं है",
  },
  pa: {
    nav_chat:"ਚੈਟ", nav_mood:"ਮੂਡ ਲੌਗ", nav_help:"ਹੈਲਪਲਾਈਨ",
    language:"ਭਾਸ਼ਾ",
    chat_heading:"ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?",
    chat_sub:"ਮੈਂ ਬਿਨਾਂ ਕਿਸੇ ਫੈਸਲੇ ਦੇ ਸੁਣਨ ਲਈ ਇੱਥੇ ਹਾਂ।",
    welcome_1:"ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ Serenity ਹਾਂ — ਤੁਹਾਡੀ AI ਵੈੱਲਨੈੱਸ ਸਾਥੀ। 💙",
    welcome_2:"ਇਹ ਇੱਕ ਸੁਰੱਖਿਅਤ ਜਗ੍ਹਾ ਹੈ। ਤੁਸੀਂ ਜੋ ਵੀ ਮਨ ਵਿੱਚ ਹੈ ਸਾਂਝਾ ਕਰ ਸਕਦੇ ਹੋ।",
    welcome_3:"ਅੱਜਕੱਲ੍ਹ ਤੁਹਾਨੂੰ ਕੀ ਪਰੇਸ਼ਾਨ ਕਰ ਰਿਹਾ ਹੈ?",
    placeholder:"ਆਪਣੇ ਮਨ ਦੀ ਗੱਲ ਲਿਖੋ… ਜਾਂ 🎤 ਵਰਤੋ",
    crisis_title:"ਤੁਸੀਂ ਇਕੱਲੇ ਨਹੀਂ ਹੋ।",
    crisis_body:" ਜੇ ਤੁਸੀਂ ਖ਼ਤਰੇ ਵਿੱਚ ਹੋ, ਕਿਰਪਾ ਕਰਕੇ ਹੁਣੇ ਸੰਪਰਕ ਕਰੋ।",
    mood_heading:"ਤੁਹਾਡੀ ਮੂਡ ਯਾਤਰਾ",
    mood_sub:"ਸਮੇਂ ਦੇ ਨਾਲ ਤੁਹਾਡੇ ਭਾਵਨਾਤਮਕ ਨਮੂਨੇ।",
    mood_note:"ਮੂਡ ਹਿਸਟਰੀ ਲਈ ਹੋਰ ਚੈਟ ਕਰੋ।",
    legend_low:"ਘੱਟ ਤਣਾਅ — ਸ਼ਾਂਤ",
    legend_med:"ਦਰਮਿਆਨਾ ਤਣਾਅ",
    legend_high:"ਉੱਚ ਤਣਾਅ — ਮਦਦ ਲਓ",
    help_heading:"ਸਹਾਇਤਾ ਅਤੇ ਹੈਲਪਲਾਈਨ",
    help_sub:"ਲੋੜ ਦੇ ਸਮੇਂ ਅਸਲ ਇਨਸਾਨ ਮਦਦ ਲਈ ਉਪਲਬਧ ਹਨ।",
    disclaimer:"Serenity ਭਾਵਨਾਤਮਕ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ ਅਤੇ ਇਹ ਪੇਸ਼ੇਵਰ ਥੈਰੇਪੀ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ।",
    mic_start:"ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ",
    mic_listening:"ਸੁਣ ਰਿਹਾ ਹਾਂ… ਹੁਣ ਬੋਲੋ",
    mic_processing:"ਆਵਾਜ਼ ਪ੍ਰੋਸੈੱਸ ਹੋ ਰਹੀ ਹੈ…",
    mic_no_support:"ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਪੀਚ ਸਮਰਥਨ ਨਹੀਂ ਹੈ",
  },
  ta: {
    nav_chat:"அரட்டை", nav_mood:"மனநிலை பதிவு", nav_help:"உதவி எண்கள்",
    language:"மொழி",
    chat_heading:"இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    chat_sub:"நான் தீர்ப்பின்றி கேட்க இங்கே இருக்கிறேன்.",
    welcome_1:"வணக்கம், நான் Serenity — உங்கள் AI நலன் துணை. 💙",
    welcome_2:"இது ஒரு பாதுகாப்பான இடம். மனதில் இருப்பதை பகிரலாம்.",
    welcome_3:"சமீபத்தில் உங்களை என்ன கவலைப்படுத்துகிறது?",
    placeholder:"மனதில் உள்ளதை எழுதுங்கள்… அல்லது 🎤 பயன்படுத்துங்கள்",
    crisis_title:"நீங்கள் தனியாக இல்லை.",
    crisis_body:" உடனடி ஆபத்தில் இருந்தால், இப்போதே தொடர்பு கொள்ளுங்கள்.",
    mood_heading:"உங்கள் மனநிலை பயணம்",
    mood_sub:"காலப்போக்கில் உங்கள் உணர்ச்சி வடிவங்கள்.",
    mood_note:"மேலும் அரட்டையடிக்க மனநிலை வரலாறு நிரம்பும்.",
    legend_low:"குறைந்த மன அழுத்தம்",
    legend_med:"நடுத்தர மன அழுத்தம்",
    legend_high:"அதிக மன அழுத்தம் — உதவி பெறுங்கள்",
    help_heading:"ஆதரவு மற்றும் உதவி எண்கள்",
    help_sub:"தேவைப்படும் போது உண்மையான மனிதர்கள் உதவ தயாராக உள்ளனர்.",
    disclaimer:"Serenity உணர்ச்சி ஆதரவை வழங்குகிறது, தொழில்முறை சிகிச்சைக்கு மாற்றாக அல்ல.",
    mic_start:"பேச மைக்கை அழுத்துங்கள்",
    mic_listening:"கேட்கிறேன்… இப்போது பேசுங்கள்",
    mic_processing:"பேச்சு செயலாக்கப்படுகிறது…",
    mic_no_support:"இந்த உலாவியில் பேச்சு ஆதரவு இல்லை",
  },
  te: {
    nav_chat:"చాట్", nav_mood:"మూడ్ లాగ్", nav_help:"హెల్ప్‌లైన్లు",
    language:"భాష",
    chat_heading:"మీరు ఈరోజు ఎలా అనుభవిస్తున్నారు?",
    chat_sub:"నేను తీర్పు లేకుండా వినడానికి ఇక్కడ ఉన్నాను.",
    welcome_1:"నమస్కారం, నేను Serenity — మీ AI వెల్నెస్ సహచరుడు. 💙",
    welcome_2:"ఇది సురక్షితమైన స్థలం. మీ మనసులో ఉన్నది పంచుకోండి.",
    welcome_3:"ఇటీవల మిమ్మల్ని ఏది ఇబ్బంది పెడుతోంది?",
    placeholder:"మీ మనసు మాటలు రాయండి… లేదా 🎤 వాడండి",
    crisis_title:"మీరు ఒంటరిగా లేరు.",
    crisis_body:" మీరు తక్షణ ప్రమాదంలో ఉంటే, దయచేసి ఇప్పుడే సంప్రదించండి.",
    mood_heading:"మీ మూడ్ ప్రయాణం",
    mood_sub:"కాలక్రమేణా మీ భావోద్వేగ నమూనాలు.",
    mood_note:"మూడ్ హిస్టరీ కోసం మరింత చాట్ చేయండి.",
    legend_low:"తక్కువ ఒత్తిడి — శాంతంగా",
    legend_med:"మధ్యస్థ ఒత్తిడి",
    legend_high:"అధిక ఒత్తిడి — సహాయం పొందండి",
    help_heading:"మద్దతు మరియు హెల్ప్‌లైన్లు",
    help_sub:"అవసరమైనప్పుడు నిజమైన మనుషులు సహాయం చేయడానికి సిద్ధంగా ఉన్నారు.",
    disclaimer:"Serenity భావోద్వేగ మద్దతు అందిస్తుంది మరియు ఇది వృత్తిపరమైన చికిత్సకు ప్రత్యామ్నాయం కాదు.",
    mic_start:"మాట్లాడటానికి మైక్ నొక్కండి",
    mic_listening:"వింటున్నాను… ఇప్పుడు మాట్లాడండి",
    mic_processing:"స్పీచ్ ప్రాసెస్ అవుతోంది…",
    mic_no_support:"ఈ బ్రౌజర్‌లో స్పీచ్ మద్దతు లేదు",
  },
  bn: {
    nav_chat:"চ্যাট", nav_mood:"মুড লগ", nav_help:"হেল্পলাইন",
    language:"ভাষা",
    chat_heading:"আজ আপনি কেমন অনুভব করছেন?",
    chat_sub:"আমি বিচার ছাড়াই শুনতে এখানে আছি।",
    welcome_1:"নমস্কার, আমি Serenity — আপনার AI সুস্থতার সঙ্গী। 💙",
    welcome_2:"এটি একটি নিরাপদ জায়গা। মনে যা আছে তা শেয়ার করতে পারেন।",
    welcome_3:"সম্প্রতি আপনাকে কী কষ্ট দিচ্ছে?",
    placeholder:"মনের কথা লিখুন… অথবা 🎤 ব্যবহার করুন",
    crisis_title:"আপনি একা নন।",
    crisis_body:" তাৎক্ষণিক বিপদে থাকলে, এখনই যোগাযোগ করুন।",
    mood_heading:"আপনার মুড যাত্রা",
    mood_sub:"সময়ের সাথে আপনার আবেগীয় নমুনা।",
    mood_note:"মুড ইতিহাস পূরণ করতে আরও চ্যাট করুন।",
    legend_low:"কম চাপ — শান্ত",
    legend_med:"মাঝারি চাপ",
    legend_high:"উচ্চ চাপ — সাহায্য নিন",
    help_heading:"সহায়তা ও হেল্পলাইন",
    help_sub:"প্রয়োজনের সময় সত্যিকারের মানুষ সাহায্য করতে প্রস্তুত।",
    disclaimer:"Serenity আবেগীয় সহায়তা প্রদান করে এবং এটি পেশাদার থেরাপির বিকল্প নয়।",
    mic_start:"বলতে মাইক চাপুন",
    mic_listening:"শুনছি… এখন বলুন",
    mic_processing:"স্পিচ প্রক্রিয়া হচ্ছে…",
    mic_no_support:"এই ব্রাউজারে স্পিচ সমর্থন নেই",
  },
  mr: {
    nav_chat:"चॅट", nav_mood:"मूड लॉग", nav_help:"हेल्पलाइन",
    language:"भाषा",
    chat_heading:"आज तुम्हाला कसे वाटत आहे?",
    chat_sub:"मी कोणताही निर्णय न घेता ऐकण्यासाठी इथे आहे.",
    welcome_1:"नमस्ते, मी Serenity आहे — तुमची AI वेलनेस साथी. 💙",
    welcome_2:"हे एक सुरक्षित ठिकाण आहे. मनात जे आहे ते सांगा.",
    welcome_3:"अलीकडे तुम्हाला काय त्रास देत आहे?",
    placeholder:"मनातले लिहा… किंवा 🎤 वापरा",
    crisis_title:"तुम्ही एकटे नाही आहात.",
    crisis_body:" तात्काळ धोक्यात असल्यास, कृपया आत्ताच संपर्क करा.",
    mood_heading:"तुमची मूड यात्रा",
    mood_sub:"कालानुरूप तुमचे भावनिक नमुने.",
    mood_note:"मूड इतिहास भरण्यासाठी आणखी चॅट करा.",
    legend_low:"कमी ताण — शांत",
    legend_med:"मध्यम ताण",
    legend_high:"उच्च ताण — मदत घ्या",
    help_heading:"आधार आणि हेल्पलाइन",
    help_sub:"गरजेच्या वेळी खरे माणसे मदतीसाठी तयार आहेत.",
    disclaimer:"Serenity भावनिक आधार देते आणि ती व्यावसायिक थेरपीचा पर्याय नाही.",
    mic_start:"बोलण्यासाठी मायक दाबा",
    mic_listening:"ऐकतोय… आता बोला",
    mic_processing:"भाषण प्रक्रिया होत आहे…",
    mic_no_support:"या ब्राउझरमध्ये भाषण समर्थन नाही",
  },
};

// Fallback to English for languages without full translations
function t(key) {
  const lang = TRANSLATIONS[state.currentLang] || TRANSLATIONS["en"];
  return lang[key] || TRANSLATIONS["en"][key] || key;
}

// ── DOM REFS ──────────────────────────────────────────────────────────────
const chatArea        = document.getElementById("chatArea");
const userInput       = document.getElementById("userInput");
const sendBtn         = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const crisisBanner    = document.getElementById("crisisBanner");
const suggestionStrip = document.getElementById("suggestionStrip");
const suggestionText  = document.getElementById("suggestionText");
const micBtn          = document.getElementById("micBtn");
const speechStatus    = document.getElementById("speechStatus");
const speechLangEl    = document.getElementById("speechLang");
const speechHint      = document.getElementById("speechHint");
const langSelect      = document.getElementById("langSelect");

// ── AUTO-RESIZE TEXTAREA ──────────────────────────────────────────────────
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ── LANGUAGE CHANGE ───────────────────────────────────────────────────────
function changeLanguage(code) {
  state.currentLang = code;
  applyTranslations();
  // Update speech hint
  const speechCode = SPEECH_LANG_MAP[code] || "en-IN";
  speechHint.textContent = t("mic_start");
  // Update placeholder
  userInput.placeholder = t("placeholder");
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (val) el.textContent = val;
  });
  userInput.placeholder = t("placeholder");
  speechHint.textContent = t("mic_start");
}

// ── SPEECH RECOGNITION ────────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function toggleSpeech() {
  if (!SpeechRecognition) {
    showToast(t("mic_no_support"), "error");
    return;
  }
  if (state.isListening) {
    stopSpeech();
  } else {
    startSpeech();
  }
}

function startSpeech() {
  const rec = new SpeechRecognition();
  rec.lang            = SPEECH_LANG_MAP[state.currentLang] || "en-IN";
  rec.interimResults  = true;
  rec.maxAlternatives = 1;
  rec.continuous      = false;

  state.recognition = rec;
  state.isListening = true;

  micBtn.classList.add("listening");
  speechStatus.style.display = "flex";
  speechLangEl.textContent   = t("mic_listening");
  speechHint.textContent     = t("mic_listening");

  let finalTranscript = "";
  let interimTranscript = "";

  rec.onresult = (e) => {
    interimTranscript = "";
    finalTranscript   = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const tr = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalTranscript += tr;
      else interimTranscript += tr;
    }
    // Show interim text in input box as preview
    userInput.value = finalTranscript || interimTranscript;
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
  };

  rec.onend = () => {
    state.isListening = false;
    micBtn.classList.remove("listening");
    speechStatus.style.display = "none";
    speechHint.textContent     = t("mic_start");
    state.recognition          = null;

    const text = userInput.value.trim();
    if (text) {
      // Auto-send after a short delay
      setTimeout(() => sendMessage(), 400);
    }
  };

  rec.onerror = (e) => {
    state.isListening = false;
    micBtn.classList.remove("listening");
    speechStatus.style.display = "none";
    state.recognition          = null;

    const msgs = {
      "not-allowed":  "Microphone access denied. Please allow microphone in browser settings.",
      "no-speech":    "No speech detected. Please try again.",
      "network":      "Network error during speech recognition.",
      "audio-capture":"Microphone not found.",
    };
    showToast(msgs[e.error] || `Speech error: ${e.error}`, "error");
    speechHint.textContent = t("mic_start");
  };

  rec.start();
}

function stopSpeech() {
  if (state.recognition) {
    state.recognition.stop();
  }
  state.isListening = false;
  micBtn.classList.remove("listening");
  speechStatus.style.display = "none";
  speechHint.textContent = t("mic_start");
}

// ── TOAST NOTIFICATION ────────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, 3500);
}

// ── SEND MESSAGE ──────────────────────────────────────────────────────────
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || state.isTyping) return;

  appendMessage("user", text);
  state.history.push({ role: "user", content: text });

  userInput.value = "";
  userInput.style.height = "auto";
  setTyping(true);

  try {
    const res = await fetch("/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        message:  text,
        language: state.currentLang,
        history:  state.history.slice(-12)
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    setTyping(false);
    appendMessage("ai", data.reply, data.level);
    state.history.push({ role: "assistant", content: data.reply });
    handleLevel(data.level, data.suggestion);
    updateMoodData(data.level);

  } catch (err) {
    setTyping(false);
    appendMessage("ai", "Connection issue. If in crisis, please call iCall: 9152987821 💙", "low");
    console.error(err);
  }
}

// ── APPEND MESSAGE ────────────────────────────────────────────────────────
function appendMessage(role, text, level = "low") {
  const row    = document.createElement("div");
  row.className = `msg-row ${role}`;

  const avatar  = document.createElement("div");
  avatar.className = `avatar ${role === "ai" ? "ai-avatar" : "user-avatar"}`;
  avatar.textContent = role === "ai" ? "🌿" : "💬";

  const right  = document.createElement("div");
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}-bubble${role === "ai" && level === "high" ? " high-alert" : ""}`;

  text.split(/\n+/).forEach(para => {
    if (para.trim()) {
      const p = document.createElement("p");
      p.textContent = para.trim();
      bubble.appendChild(p);
    }
  });

  if (role === "ai" && level) {
    const badge = document.createElement("span");
    badge.className = `level-badge badge-${level}`;
    badge.textContent = `${level} distress`;
    bubble.appendChild(badge);
  }

  const time = document.createElement("div");
  time.className = "msg-time";
  time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  right.appendChild(bubble);
  right.appendChild(time);
  row.appendChild(role === "ai" ? avatar : right);
  row.appendChild(role === "ai" ? right   : avatar);

  chatArea.appendChild(row);
  scrollToBottom();
}

// ── LEVEL SIDE-EFFECTS ────────────────────────────────────────────────────
function handleLevel(level, suggestion) {
  if (level === "high") crisisBanner.style.display = "block";
  if (suggestion) {
    suggestionText.textContent = suggestion;
    suggestionStrip.style.display = "block";
  }
}

// ── TYPING ────────────────────────────────────────────────────────────────
function setTyping(active) {
  state.isTyping = active;
  typingIndicator.style.display = active ? "flex" : "none";
  sendBtn.disabled = active;
  if (active) scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; });
}

// ── PANEL SWITCHING ───────────────────────────────────────────────────────
function switchPanel(panelId, btn) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`panel-${panelId}`).classList.add("active");
  btn.classList.add("active");
  if (panelId === "mood") { renderMoodChart(); fetchMoodHistory(); }
}

// ── MOOD CHART ─────────────────────────────────────────────────────────────
function updateMoodData(level) {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.moodData.labels.push(now);
  state.moodData.scores.push(LEVEL_SCORE[level]);
  state.moodData.colors.push(LEVEL_COLOR[level]);
  if (state.moodData.labels.length > 30) {
    state.moodData.labels.shift();
    state.moodData.scores.shift();
    state.moodData.colors.shift();
  }
  if (state.moodChart) {
    state.moodChart.data.labels = [...state.moodData.labels];
    state.moodChart.data.datasets[0].data = [...state.moodData.scores];
    state.moodChart.data.datasets[0].pointBackgroundColor = [...state.moodData.colors];
    state.moodChart.update();
  }
}

function renderMoodChart() {
  const ctx = document.getElementById("moodChart");
  if (!ctx) return;
  if (state.moodChart) state.moodChart.destroy();
  Chart.defaults.color = "#9aa3b5";
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  state.moodChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: state.moodData.labels.length ? state.moodData.labels : ["—"],
      datasets: [{
        label: "Distress",
        data: state.moodData.scores.length ? state.moodData.scores : [0],
        borderColor: "#4ecdc4", borderWidth: 2,
        pointBackgroundColor: state.moodData.colors.length ? state.moodData.colors : ["#4ecdc4"],
        pointRadius: 6, pointHoverRadius: 8,
        fill: true, backgroundColor: "rgba(78,205,196,0.06)", tension: 0.4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${{ 1:"Low", 2:"Medium", 3:"High" }[ctx.raw] || "—"}` },
          backgroundColor: "#1e2534", borderColor: "rgba(255,255,255,0.07)", borderWidth: 1,
          titleColor: "#e8eaf0", bodyColor: "#9aa3b5", padding: 12,
        }
      },
      scales: {
        y: { min: 0, max: 3.5, ticks: { stepSize: 1, callback: v => ({1:"Low",2:"Medium",3:"High"}[v]||"") },
             grid: { color: "rgba(255,255,255,0.05)" }, border: { color: "rgba(255,255,255,0.07)" } },
        x: { grid: { color: "rgba(255,255,255,0.04)" }, border: { color: "rgba(255,255,255,0.07)" },
             ticks: { maxTicksLimit: 8 } }
      }
    }
  });
}

async function fetchMoodHistory() {
  try {
    const res  = await fetch("/mood-history");
    const data = await res.json();
    if (!data.length) return;
    state.moodData.labels = data.map(d => d.timestamp.slice(11, 16));
    state.moodData.scores = data.map(d => LEVEL_SCORE[d.level] || 1);
    state.moodData.colors = data.map(d => LEVEL_COLOR[d.level]);
    if (state.moodChart) {
      state.moodChart.data.labels = [...state.moodData.labels];
      state.moodChart.data.datasets[0].data = [...state.moodData.scores];
      state.moodChart.data.datasets[0].pointBackgroundColor = [...state.moodData.colors];
      state.moodChart.update();
    }
  } catch(e) { console.warn("Mood history:", e); }
}

// ── INIT ──────────────────────────────────────────────────────────────────
applyTranslations();
userInput.focus();

// Show mic hint based on browser support
if (!SpeechRecognition) {
  micBtn.style.opacity = "0.35";
  micBtn.title = "Speech recognition not supported in this browser. Use Chrome for best results.";
  speechHint.textContent = "Speech not available — use Chrome browser";
} else {
  speechHint.textContent = t("mic_start");
}
