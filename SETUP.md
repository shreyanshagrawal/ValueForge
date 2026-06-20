# Detailed Setup Guide

Follow these granular, step-by-step instructions to get ValueForge running on your local machine in under 5 minutes.

## Prerequisites
- **Git**
- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey))

---

## Step 1: Clone the Repository

Open your terminal and run:
```bash
git clone https://github.com/shreyanshagrawal/ValueForge.git
cd ValueForge
```

---

## Step 2: Configure the Backend

The backend is built with FastAPI and requires a Python virtual environment.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   - **Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   *(You should now see `(venv)` at the start of your terminal prompt).*

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *Expected Output: Successful installation of fastapi, uvicorn, sqlalchemy, google-generativeai, etc.*

4. Setup your Environment Variables:
   Create a file named `.env` in the `backend/` directory and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. Initialize the Database and Embeddings:
   ```bash
   python run_seed.py
   ```
   *Expected Output: You will see logs indicating that 500 products are seeded, followed by 40 failure cases, and finally, 40 embeddings being generated. This takes ~30-40 seconds because of the free-tier API rate limits.*

6. Start the Backend Server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   *Expected Output: `Uvicorn running on http://127.0.0.1:8000`*

---

## Step 3: Configure the Frontend

Leave your backend server running in its terminal window, and open a **new terminal window/tab**.

1. Navigate to the frontend directory:
   ```bash
   cd ValueForge/frontend
   ```

2. Install NPM dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Expected Output: The console will show `VITE v4.x.x ready in ... ms` and provide a local URL, typically `http://localhost:5173`.*

4. **Launch the App:** Open `http://localhost:5173` in your browser.

---

## Common Troubleshooting

### 1. I'm seeing a CORS error in my browser console.
- **Cause:** The frontend is trying to talk to the backend, but the backend is running on a different port than expected, or CORS middleware isn't configured for your frontend port.
- **Fix:** Ensure the backend is running specifically on `--port 8000`. The frontend is hardcoded to talk to `http://localhost:8000`.

### 2. Scans are failing or hanging with "failed: 429 Quota Exceeded".
- **Cause:** You have hit the Gemini Free Tier rate limits (15 requests per minute). This usually happens if you run multiple scans back-to-back immediately after running `run_seed.py`.
- **Fix:** Wait 60 seconds for your quota to reset, then try running the scan again.

### 3. "ImportError: No module named X" when running the backend.
- **Cause:** You forgot to activate your virtual environment before running the server, or you didn't install the `requirements.txt`.
- **Fix:** Run `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows), then run `pip install -r requirements.txt`.

### 4. "AuthenticationError" or "API Key not found"
- **Cause:** The backend cannot find your `.env` file or the Gemini key is invalid.
- **Fix:** Ensure the file is named exactly `.env` (not `.env.txt`) and is placed directly inside the `backend/` folder. Verify your key in Google AI Studio.
