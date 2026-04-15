# 🌿 Serenity — AI Mental Wellness Assistant
### Powered by Llama 3.1 via Groq (100% Free)

> ⚠️ **Disclaimer:** Serenity provides emotional support only. It is NOT a replacement for professional therapy.

---

## ⚡ Why Groq + Llama 3.1?

| Feature | Detail |
|---|---|
| 💰 Cost | **Completely free** (generous daily limits) |
| 🚀 Speed | Fastest LLM inference available (~500 tokens/sec) |
| 🧠 Model | Llama 3.1 8B Instant — excellent for empathetic conversation |
| 🔑 Signup | 2 minutes at console.groq.com |
| 📦 No local GPU | Runs in the cloud, nothing to install locally |

---

## 🗂️ Project Structure

```
ai-wellness/
├── app.py                  ← Flask backend (Groq/Llama 3.1)
├── requirements.txt        ← Only: flask, requests, python-dotenv
├── .env.example            ← Copy to .env, add your Groq key
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/script.js
```

---

## 🚀 Setup (5 minutes)

### Step 1 — Get your FREE Groq API key
1. Go to **https://console.groq.com/**
2. Sign up (Google/GitHub/Email)
3. Click **"API Keys"** → **"Create API Key"**
4. Copy the key (starts with `gsk_`)

### Step 2 — Configure the project
```bash
cd ai-wellness
cp .env.example .env
```
Open `.env` and replace `gsk_REPLACE_WITH_YOUR_KEY_HERE` with your real key.

### Step 3 — Install & run
```bash
pip install -r requirements.txt
python app.py
```
Open **http://localhost:5000** 🎉

---

## ✨ Features

| Feature | Details |
|---|---|
| 💬 Chat | Real-time empathetic AI conversation (Llama 3.1) |
| 🎯 Distress Detection | 3-level: Low / Medium / High |
| 🆘 Crisis Handling | Banner + India iCall helpline (9152987821) |
| 💡 Suggestions | Context-aware tips per distress level |
| 📈 Mood Chart | Chart.js visualization of session history |
| 📞 Helplines Panel | 6 verified Indian mental health numbers |
| 🎨 Calm Dark UI | Teal/lavender theme, smooth animations |
| 📱 Responsive | Works on mobile and desktop |

---

## 🏥 India Helplines

| Organisation | Number |
|---|---|
| iCall (TISS) | 9152987821 |
| Vandrevala Foundation | 1860-2662-345 |
| NIMHANS | 080-46110007 |
| Snehi India | 044-24640050 |
| Mpower | 1800-120-820050 |

---

## 📦 Tech Stack

- **Backend:** Python 3.10+ · Flask
- **AI:** Llama 3.1 8B via Groq API (free)
- **Frontend:** HTML · CSS · Vanilla JavaScript
- **Charts:** Chart.js · **Fonts:** Lora + DM Sans
