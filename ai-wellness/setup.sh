#!/bin/bash
echo "🌿 Serenity — Setup Script"
echo ""

# Check Python
python3 --version || { echo "❌ Python 3 not found"; exit 1; }

# Install deps
echo "📦 Installing dependencies..."
pip install flask requests python-dotenv

# Check .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env — please edit it and add your Anthropic API key:"
  echo "    nano .env"
  echo ""
  echo "Get a free key at: https://console.anthropic.com/"
  exit 0
fi

# Check key is set
source .env
if [[ "$ANTHROPIC_API_KEY" == *"REPLACE"* ]] || [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️  Please edit .env and set a real ANTHROPIC_API_KEY"
  exit 1
fi

echo "✅ API key found"
echo "🚀 Starting server at http://localhost:5000"
echo ""
python3 app.py
