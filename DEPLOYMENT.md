# Helios Deployment Guide

This guide walks you through deploying the complete Helios platform: the Frontend (Next.js), Backend (FastAPI), and Database (Supabase PostgreSQL).

## 1. Prerequisites

You need accounts on the following platforms:
1. **GitHub** (to host your code)
2. **Supabase** (for the database and authentication)
3. **Render** (for hosting the Python backend)
4. **Netlify** (for hosting the Next.js frontend)

---

## 2. Database & Auth Setup (Supabase)

Since Helios relies on Supabase for both identity management and PostgreSQL storage:
1. Create a new project at [Supabase](https://supabase.com/).
2. Once provisioned, find your **Project URL** and **Anon Key** in `Project Settings -> API`.
3. Find your **Database Connection String** in `Project Settings -> Database`.
4. Enable **Email Auth**: Go to `Authentication -> Providers` and make sure Email is enabled.
5. Set your **Site URL**: Go to `Authentication -> URL Configuration`. Change the default `http://localhost:3000` to your deployed Netlify URL (e.g., `https://your-netlify-site.netlify.app`). This is crucial so email confirmation links redirect to your live app instead of localhost!
---

## 3. Backend Deployment (Render)

We use Render's "Web Service" to deploy the FastAPI application.

1. Create a new **Web Service** on Render and connect your GitHub repository (`kaalstrom18/Helios`).
2. Set the **Root Directory** to `backend`.
3. Set the **Environment** to `Python 3`.
4. Set the **Build Command** to:
   ```bash
   pip install -r requirements.txt
   ```
5. Set the **Start Command** to:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. **Environment Variables**: Add the following securely in the Render dashboard:
   - `DATABASE_URL`: Your Supabase Connection Pooler string (e.g., `postgresql://postgres.[YOUR-PROJECT]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`). *Note: You MUST use the Transaction Pooler URL because Render does not support outbound IPv6 which is now required for Supabase direct connections.*
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_KEY`: Your Supabase Anon Key
   - `GEMINI_API_KEY`: Your Google Gemini API Key

7. Click **Deploy**. Render will build and host your backend. Note your Render app URL (e.g., `https://helios-2-0.onrender.com`).

---

## 4. Frontend Deployment (Netlify)

We use Netlify to host the Next.js UI dashboard.

1. Go to [Netlify](https://www.netlify.com/) and click **Add New Site** -> **Import an existing project**.
2. Connect your GitHub and select the `Helios` repository.
3. **Build Settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next` (Netlify auto-detects Next.js)
4. **Environment Variables**: Add the following in the Netlify dashboard:
   - `NEXT_PUBLIC_API_URL`: `https://[YOUR-RENDER-APP].onrender.com`
   - `NEXT_PUBLIC_WS_URL`: `wss://[YOUR-RENDER-APP].onrender.com/ws/telemetry`
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Deploy Site**.

---

## 5. The Connector Executable

Because the Connector (`connector/main.py`) talks to the backend, it has the Render URL compiled directly into it.
If your Render URL changes in the future, you must:
1. Open `connector/main.py`.
2. Update the `BASE_URL = "https://[YOUR-NEW-RENDER-URL]"` variable.
3. Open a terminal in the `connector` folder and run:
   ```bash
   pyinstaller --onefile --noconfirm --name HeliosConnector main.py
   ```
4. Copy the newly built `dist/HeliosConnector.exe` into `frontend/public/` so users can download it from your live Netlify site.
5. Push the new executable to GitHub and Netlify will redeploy automatically.
