# StaySphere Luxury Hotel Booking - Deployment Guide

This guide describes how to deploy the **StaySphere** backend, frontend, and database to production.

---

## 1. Database (MongoDB)
Your database is hosted on **MongoDB Atlas** using the following cluster:
`mongodb+srv://sivakumar_123:sivakumar_1234@staysphere.btpyhmh.mongodb.net/staysphere`

No extra deployment is needed for the database. We will inject this connection string into the backend using the environment variable `SPRING_DATA_MONGODB_URI`.

---

## 2. Deploying the Backend (Spring Boot) to Render
Render is a cloud hosting provider that makes it easy to run Java/Docker web services.

### Option A: Deploy via Docker (Recommended)
Since the project contains a production-ready `Dockerfile` under `staysphere-backend/`, Render can automatically build and run it as a container.

1. Create a free account at [Render](https://render.com).
2. Push your project code to a private GitHub repository.
3. Click **New +** > **Web Service** in the Render Dashboard.
4. Connect your GitHub repository.
5. Set the following configuration details:
   - **Name**: `staysphere-backend`
   - **Region**: Select a region close to your target users (e.g., `Singapore` or `Oregon`).
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `staysphere-backend/Dockerfile`
   - **Docker Build Context**: `staysphere-backend`
6. Scroll down to **Environment Variables** and add:
   | Key | Value / Example | Description |
   |:---|:---|:---|
   | `SPRING_DATA_MONGODB_URI` | `mongodb+srv://sivakumar_123:sivakumar_1234@staysphere.btpyhmh.mongodb.net/staysphere?retryWrites=true&w=majority&appName=Staysphere` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | Secure hex-encoded secret key for JWT signatures |
   | `APP_FRONTEND_ORIGINS` | `https://your-frontend-domain.vercel.app` *(Replace with your deployed frontend URL)* | Allowed frontend URL for CORS policy |
   | `SPRING_AI_OPENAI_API_KEY` | `your-openai-api-key` | OpenAI API key for real-time AI Travel Agent |
7. Click **Deploy Web Service**.

> [!NOTE]
> Render's free tier spins down web services after 15 minutes of inactivity. When a request comes in, it will wake up automatically, which might cause a 50-60 second startup delay on the first load.

---

## 3. Deploying the Frontend (React + Vite)
We recommend deploying the frontend to **Vercel** or **Render Static Sites**.

### Option A: Deploy to Vercel (Recommended - Free, Fast, global CDN)
1. Sign up/log in at [Vercel](https://vercel.com).
2. Click **Add New** > **Project** and select your GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Vite` (Vercel detects this automatically).
   - **Root Directory**: `hotel booking`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the following **Environment Variables**:
   | Key | Value / Example | Description |
   |:---|:---|:---|
   | `VITE_API_BASE_URL` | `https://staysphere-backend.onrender.com` *(Replace with your Render backend URL)* | Deployed backend API base URL |
   | `VITE_SOCKET_BASE_URL` | `https://staysphere-backend.onrender.com` *(Normally shares the same Render URL)* | Socket.IO server address |
5. Click **Deploy**. Vercel will build and serve your static frontend in seconds!

---

### Verification Checklist
- [ ] Backend status on Render dashboard is `Live`
- [ ] Database logs show `MongoClient` connected successfully to the Atlas Replica Set
- [ ] Frontend opens in browser, and registering/logging in communicates with the backend
- [ ] Real-time updates and the AI Travel Assistant respond as expected
