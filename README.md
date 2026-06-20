# ValueForge
**Navigate the whitespace. Forge authentic brand value.**

ValueForge is an AI-powered whitespace analysis engine that helps CPG and D2C brands identify unexploited product positioning opportunities before they launch.

## The Problem: The Differentiation Blind Spot
In today's hyper-competitive market, brands often launch new products based on gut feeling or lagging consumer trends, leading to the "Differentiation Blind Spot." They enter markets that are already saturated or adopt claims that their brand has no credibility to make. The result? Failed product launches, wasted marketing spend, and diluted brand equity.

## How ValueForge Solves It
ValueForge takes a proposed product concept and evaluates it against our proprietary **3-Dimension Whitespace Model**. We calculate a Final Opportunity Score (FOS) by analyzing three critical pillars:
1. **Market Openness (Tier-CDS):** Is the specific price tier and category already saturated with this claim, or is there room to play?
2. **Consumer Response (CRS):** Does the target persona actually care about this claim? We measure believability, relevance, fatigue, and trigger alignment.
3. **Brand Permission (BPS):** Does *your* brand have the credibility and right-to-win with this specific claim based on your hero ingredients and positioning?

Only claims that satisfy all three dimensions are classified as **True Whitespace** — the authentic territory where your brand can win.

## Screenshots

*(Take screenshots of your application and save them to `docs/screenshots/` before your final submission)*

| 1. The Input Form | 2. The "Crash First" Failure Dashboard |
| :---: | :---: |
| ![Input Form](docs/screenshots/1_input_form.png) | ![Failure Dashboard](docs/screenshots/2_failure_dashboard.png) |
| *Using the "Example 1" preset for a clean demo.* | *Showing historical failures before showing opportunities.* |

| 3. The 3D Whitespace Grid | 4. AI Value Proposition Cards |
| :---: | :---: |
| ![Whitespace Grid](docs/screenshots/3_whitespace_grid.png) | ![Value Propositions](docs/screenshots/4_value_propositions.png) |
| *Mapping market openness vs consumer intent.* | *AI-generated positioning with transparent FOS math.* |

### 5. The Final Deliverable
![Brand Brief PDF](docs/screenshots/5_brand_brief.png)
*The fully generated Brand Brief ready for PDF export.*

## Local Setup Instructions

**Prerequisites:** Python 3.10+, Node.js 18+, and a Google Gemini API Key.

### 1. Clone the Repository
```bash
git clone https://github.com/shreyanshagrawal/ValueForge.git
cd ValueForge
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Initialize the database and generate AI embeddings (takes ~30-40 seconds):
```bash
python run_seed.py
```

Start the FastAPI server:
```bash
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

> For detailed, step-by-step troubleshooting, please see [SETUP.md](SETUP.md).

## What's simplified for this prototype vs the full PRD vision?
As a hackathon prototype, we made several deliberate architectural trade-offs to optimize for speed and demonstration quality:
- **Seed Dataset vs. Live API:** We use a rigorously engineered seed database of ~500 mock products instead of live-fetching data from the Ai Palette API to ensure consistent, instant demos.
- **Heuristic BPS vs. Real Equity Data:** Brand Permission Scores are calculated using heuristic models based on ingredients and categories rather than pulling live brand equity surveys.
- **Gemini Free Tier vs. GPT-4o:** We use the Gemini 2.5 Flash API for embeddings and NLP extraction to keep costs at zero, rather than relying on more expensive enterprise LLMs.
- **SQLite vs. Postgres+Redis:** We use a local SQLite database for simplicity of setup instead of a full PostgreSQL + Redis caching layer.
- **BackgroundTasks vs. Celery:** We handle asynchronous orchestration using FastAPI's built-in `BackgroundTasks` instead of deploying dedicated Celery async workers.
- **Curated Failure Cases:** Our semantic failure matching uses a curated library of ~40 failure cases rather than scraping a comprehensive database of 500+ historical product flops.

## Deployment Guide (Hackathon)

### 1. Deploy Backend to Render
1. Create a new "Web Service" on [Render.com](https://render.com).
2. Connect this GitHub repository.
3. Set the Root Directory to `backend`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add your Environment Variable: `GEMINI_API_KEY` = your key.
7. *(Optional)* Add `FRONTEND_URL` = your deployed Vercel URL to restrict CORS.

### 2. Deploy Frontend to Vercel
1. Create a new project on [Vercel.com](https://vercel.com).
2. Connect this GitHub repository.
3. Set the Framework Preset to **Vite** and Root Directory to `frontend`.
4. Add Environment Variables:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api/v1`
   - `VITE_BACKEND_URL` = `https://your-backend-url.onrender.com`
5. Deploy!
