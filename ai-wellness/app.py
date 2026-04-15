import os
import requests
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
MODEL        = "llama-3.1-8b-instant"

# ─────────────────────────────────────────────
# MULTILINGUAL RISK KEYWORDS
# ─────────────────────────────────────────────
HIGH_RISK_KEYWORDS = [
    # English
    "suicide", "suicidal", "kill myself", "end my life", "end it all",
    "want to die", "wanna die", "better off dead", "no reason to live",
    "self harm", "self-harm", "cutting myself", "hurt myself",
    "overdose", "hang myself", "jump off", "not worth living",
    # Hindi
    "khud ko maar", "marna chahta", "marna chahti", "zindagi khatam",
    "jeena nahi chahta", "jeena nahi chahti", "maut chahiye",
    "khud ko khatam", "suicide karna", "aatmahatya",
    # Punjabi
    "aap nu maar", "jeona nahi chahunda", "maut chahidi",
    # Tamil
    "thalai", "saagathu", "en vaazkai mudinthu",
    # Telugu
    "chachipotanu", "naa life end",
    # Bengali
    "nij ke shesh", "marite chai", "bachte chai na",
    # Marathi
    "swatala sampvayche", "jgayche nahi",
]

MEDIUM_RISK_KEYWORDS = [
    # English
    "hopeless", "helpless", "worthless", "nothing matters", "can't go on",
    "falling apart", "breaking down", "depressed", "depression", "anxiety",
    "panic attack", "overwhelmed", "exhausted", "empty inside", "numb",
    "lost", "stuck", "alone", "isolated", "nobody cares", "hate myself",
    # Hindi
    "nirash", "udaas", "akela", "akeli", "dard", "takleef", "pareshaan",
    "anxiety", "ghabrahat", "darr", "rona aata hai", "kuch nahi chahiye",
    "thak gaya", "thak gayi", "toot gaya", "toot gayi",
    # Punjabi
    "udaas", "akalla", "akalli", "dukh", "pareshaan",
    # Tamil
    "varutham", "thanimai", "kavalai", "bayam",
    # Telugu
    "dukkham", "bhayam", "okkadine", "nirasha",
    # Bengali
    "kanna", "ekaki", "nirash", "bhoy", "koshto",
    # Marathi
    "udas", "ekta", "bhiti", "nirasha", "tras",
]

mood_history = []

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "pa": "Punjabi",
    "ta": "Tamil",   "te": "Telugu","bn": "Bengali",
    "mr": "Marathi", "gu": "Gujarati", "kn": "Kannada",
    "ml": "Malayalam","ur": "Urdu",  "es": "Spanish",
    "fr": "French",  "de": "German", "zh": "Chinese",
    "ar": "Arabic",  "ja": "Japanese","pt": "Portuguese",
}

# ─────────────────────────────────────────────
# DISTRESS DETECTION
# ─────────────────────────────────────────────
def detect_level(text: str) -> str:
    lower = text.lower()
    for kw in HIGH_RISK_KEYWORDS:
        if kw in lower:
            return "high"
    for kw in MEDIUM_RISK_KEYWORDS:
        if kw in lower:
            return "medium"
    return "low"


# ─────────────────────────────────────────────
# RESPONSE GENERATION
# ─────────────────────────────────────────────
def generate_response(conversation_history: list, level: str, language_code: str) -> str:
    lang_name = LANGUAGE_NAMES.get(language_code, "English")

    level_instructions = {
        "low": (
            "The user seems okay or mildly stressed. Respond warmly, validate feelings, "
            "and offer gentle self-care suggestions like mindfulness, journaling, or a short walk."
        ),
        "medium": (
            "The user shows moderate distress. Respond with deep empathy and active listening. "
            "Gently encourage them to talk to a trusted friend, family member, or counselor. "
            "Offer simple coping strategies like breathing exercises or grounding techniques."
        ),
        "high": (
            "The user may be in significant distress or expressing thoughts of self-harm. "
            "Respond with utmost compassion, without judgment. Do NOT minimise their pain. "
            "Strongly but gently encourage them to reach out to a trusted person immediately. "
            "Remind them help is available and they are not alone."
        )
    }

    system_prompt = (
        f"You are Serenity, a compassionate AI mental wellness companion.\n\n"
        f"LANGUAGE INSTRUCTION: You MUST respond ONLY in {lang_name}. "
        f"The user is communicating in {lang_name}. Match their language completely. "
        f"If the language is Hindi, use Devanagari script or Roman Hindi as the user prefers. "
        f"For regional Indian languages, use natural conversational tone in that language.\n\n"
        "STRICT RULES:\n"
        "1. NEVER diagnose any mental illness or medical condition.\n"
        "2. NEVER prescribe medication or treatments.\n"
        "3. Always respond with warmth, empathy, and without judgment.\n"
        "4. Keep responses concise (3-5 sentences), human, and conversational.\n"
        "5. Ask ONE gentle follow-up question at the end.\n"
        "6. Write naturally — no bullet points or lists.\n"
        "7. Never say 'I understand exactly how you feel'.\n\n"
        f"CURRENT DISTRESS LEVEL: {level.upper()}\n"
        f"{level_instructions[level]}\n\n"
        "CRISIS RESOURCE: If user is in immediate danger, mention iCall India: 9152987821."
    )

    messages = [{"role": "system", "content": system_prompt}] + conversation_history

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }
    payload = {
        "model":       MODEL,
        "messages":    messages,
        "max_tokens":  500,
        "temperature": 0.75,
    }

    resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
    if not resp.ok:
        app.logger.error(f"Groq API {resp.status_code}: {resp.text}")
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "No message provided"}), 400

        user_message  = data["message"].strip()
        language_code = data.get("language", "en")
        history       = data.get("history", [])

        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        level = detect_level(user_message)
        clean_history = [{"role": m["role"], "content": m["content"]} for m in history]
        clean_history.append({"role": "user", "content": user_message})

        ai_reply = generate_response(clean_history, level, language_code)

        mood_history.append({
            "timestamp":       datetime.utcnow().isoformat(),
            "level":           level,
            "language":        language_code,
            "message_preview": user_message[:60]
        })

        # Suggestions in major Indian languages + English
        suggestions = {
            "en": {"low": "💙 Tip: Try a 5-minute gratitude journal or a short walk.",
                   "medium": "🤝 Consider reaching out to a trusted friend or family member today.",
                   "high":   "🆘 Please reach out for immediate support. You matter."},
            "hi": {"low": "💙 सुझाव: 5 मिनट की कृतज्ञता डायरी लिखें या टहलने जाएं।",
                   "medium": "🤝 किसी करीबी दोस्त या परिवार से बात करें।",
                   "high":   "🆘 कृपया तुरंत मदद लें। आप अकेले नहीं हैं।"},
            "pa": {"low": "💙 ਸੁਝਾਅ: 5 ਮਿੰਟ ਦੀ ਡਾਇਰੀ ਲਿਖੋ ਜਾਂ ਸੈਰ ਕਰੋ।",
                   "medium": "🤝 ਕਿਸੇ ਕਰੀਬੀ ਦੋਸਤ ਨਾਲ ਗੱਲ ਕਰੋ।",
                   "high":   "🆘 ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਮਦਦ ਲਓ।"},
            "ta": {"low": "💙 குறிப்பு: 5 நிமிட நன்றி குறிப்பேட்டை எழுதுங்கள்.",
                   "medium": "🤝 நம்பகமான நண்பர் அல்லது குடும்பத்தினரிடம் பேசுங்கள்.",
                   "high":   "🆘 உடனடி உதவிக்கு தொடர்பு கொள்ளுங்கள்."},
            "te": {"low": "💙 చిట్కా: 5 నిమిషాల కృతజ్ఞత డైరీ రాయండి.",
                   "medium": "🤝 నమ్మకమైన స్నేహితుడు లేదా కుటుంబ సభ్యుడితో మాట్లాడండి.",
                   "high":   "🆘 దయచేసి వెంటనే సహాయం పొందండి."},
            "bn": {"low": "💙 টিপ: ৫ মিনিটের কৃতজ্ঞতা জার্নাল লিখুন।",
                   "medium": "🤝 বিশ্বস্ত বন্ধু বা পরিবারের সাথে কথা বলুন।",
                   "high":   "🆘 অনুগ্রহ করে অবিলম্বে সাহায্য নিন।"},
            "mr": {"low": "💙 टीप: ५ मिनिटांचे कृतज्ञता जर्नल लिहा.",
                   "medium": "🤝 एखाद्या विश्वासू मित्र किंवा कुटुंबाशी बोला.",
                   "high":   "🆘 कृपया तात्काळ मदत घ्या."},
        }

        lang_suggestions = suggestions.get(language_code, suggestions["en"])
        suggestion_text  = lang_suggestions.get(level, "")

        return jsonify({
            "reply":      ai_reply,
            "level":      level,
            "suggestion": suggestion_text,
            "language":   language_code,
            "timestamp":  datetime.utcnow().isoformat()
        })

    except requests.exceptions.ConnectionError as e:
        app.logger.error(f"Connection error: {e}")
        return jsonify({"reply": "Cannot reach AI service. Check internet. Crisis: iCall 9152987821 💙",
                        "level": "low", "suggestion": "", "error": True}), 200
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code if e.response else 0
        app.logger.error(f"HTTP {status}: {e.response.text if e.response else ''}")
        friendly = {
            401: "GROQ_API_KEY is invalid. Get a free key at console.groq.com",
            429: "Rate limit hit. Please wait a moment and try again.",
        }.get(status, f"API error (HTTP {status}).")
        return jsonify({"reply": friendly, "level": "low", "suggestion": "", "error": True}), 200
    except Exception as e:
        app.logger.error(f"Unexpected: {e}", exc_info=True)
        return jsonify({"reply": f"Error: {str(e)[:100]}. Crisis: iCall 9152987821 💙",
                        "level": "low", "suggestion": "", "error": True}), 200


@app.route("/mood-history")
def get_mood_history():
    return jsonify(mood_history[-30:])


@app.route("/health")
def health():
    key = GROQ_API_KEY
    return jsonify({"status": "ok", "model": MODEL,
                    "api_key_configured": bool(key),
                    "api_key_prefix": (key[:12] + "...") if len(key) > 12 else "(not set)"})


if __name__ == "__main__":
    if not GROQ_API_KEY:
        print("\n⚠️  GROQ_API_KEY not set! Add it to .env\n")
    else:
        print(f"\n✅ Groq loaded ({MODEL}) — Multilingual + Speech ready\n")
    app.run(debug=True, port=5000)
