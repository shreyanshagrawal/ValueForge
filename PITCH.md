# ValueForge

**Tagline:** Navigate the whitespace. Forge authentic brand value.

## The Problem
In today's hyper-competitive market, CPG and D2C brands often launch new products based on gut feeling or lagging consumer trends, leading to the "Differentiation Blind Spot." They enter markets that are already saturated or adopt claims that their brand has no credibility to make, resulting in failed product launches and wasted marketing spend.

## The Solution
ValueForge is an AI-powered whitespace analysis engine that evaluates proposed product concepts against our proprietary **3-Dimension Whitespace Model**. Instead of just generating generic marketing copy, ValueForge quantitatively scores every potential claim across three critical pillars: Market Openness (is the price tier saturated?), Consumer Response (is the claim believable and relevant?), and Brand Permission (does *your* brand have the credibility to make this claim?). Only claims that satisfy all three dimensions are classified as True Whitespace, allowing brands to discover the authentic territory where they actually have a right-to-win.

## What Makes This Distinctive?
Unlike generic "AI content generators" that simply wrap GPT prompts to spit out infinite, unverified ideas, ValueForge acts as an analytical filter:
1. **The "Crash First" Failure Dashboard:** Before showing *any* recommendations, ValueForge forces the user to review historical market flops (via our embedded failure database) that share similar positioning, breaking the echo chamber of typical ideation.
2. **Brand Permission as a First-Class Metric:** Most AI tools ignore whether a brand *should* make a claim. We calculate an explicit Brand Permission Score (BPS) based on the brand's hero ingredients and category equity to ensure recommendations are actually authentic to the brand.

## Tech Stack
- **Frontend:** React (Vite), Lucide-React, Recharts
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** SQLite
- **AI/ML:** Google Gemini 2.5 Flash API (Free Tier) for NLP extraction, trend velocity predictions, and text generation.
