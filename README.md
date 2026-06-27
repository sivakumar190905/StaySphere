# StaySphere | Premium Indian Hotels, Palaces & Resorts

StaySphere is a premium hospitality platform designed for booking and managing luxurious Indian hotels, heritage palaces, and coastal resorts. The system features a comprehensive backend built with Spring Boot and MongoDB, and a modern, high-fidelity responsive frontend powered by React, TypeScript, and Tailwind CSS.

---

## 🌟 Key Features

* **User Portal**: Curated browsing, premium search filters, reviews, wishlist, booking checkouts, and PDF invoice generation.
* **Owner & Partner Portal**: Dashboard to manage hotel details, room pricing/availability, view bookings, and track revenue statistics.
* **Staff Portal**: Task board for hotel staff to manage operational workflows, customer requests, and maintenance/cleaning logs.
* **Admin Portal**: Platform dashboard to approve/reject partner requests, manage global users, inspect platform activity logs, and view operational analytics.
* **AI Travel Assistant**: A real-time, interactive assistant integrated with OpenAI/Spring AI to suggest custom itineraries and handle travel queries.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Framer Motion (animations), Lucide React (icons)
* **Real-time**: Socket.IO Client (live updates)

### Backend
* **Core**: Spring Boot 3.3.0, Java 17+
* **Database**: MongoDB Atlas (Spring Data MongoDB)
* **API Documentation**: Springdoc OpenAPI / Swagger UI
* **Build Tool**: Apache Maven 3.9.6 (bundled in workspace)
* **AI Integration**: Spring AI (OpenAI API connection)

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have the following installed:
* **Java Development Kit (JDK) 17 or higher**
* **Node.js (v18+) & npm**

### 2. Environment Configuration
The backend application has pre-configured defaults in [application.yml](file:///c:/Users/siva1/Downloads/staysphere_project%20(2)%20(1)/staysphere_project/staysphere-backend/src/main/resources/application.yml) but reads from the environment for customization:
* `MONGODB_URI`: Connection string for the database (defaults to the StaySphere Atlas Replica Set).
* `JWT_SECRET`: Secret key used for signing security tokens.
* `CLIENT_URL`: URL of the frontend client (defaults to `http://localhost:5173`).
* `SPRING_AI_OPENAI_API_KEY`: API Key for the AI Travel Agent functionality.

### 3. Running Locally

#### Option A: Using the Startup Script (Recommended)
Simply run the [start-project.bat](file:///c:/Users/siva1/Downloads/staysphere_project%20(2)%20(1)/staysphere_project/start-project.bat) file from the root directory. It will open separate command prompt windows to boot up both the backend and frontend servers.

#### Option B: Manual Execution
**Start the Spring Boot Backend:**
```bash
cd staysphere-backend
..\tools\apache-maven-3.9.6\bin\mvn spring-boot:run
```
*The backend API will run at http://localhost:8080. Swagger API documentation is available at http://localhost:8080/swagger-ui/index.html.*

**Start the React Frontend:**
```bash
cd "hotel booking"
npm run dev
```
*The frontend Vite dev server will run at http://localhost:5173.*

---

## 🌐 Deployment
For detailed notes on deploying the backend (Spring Boot/Docker) to Render, and the frontend (Vite/React) to Vercel, please read the [Deployment Guide](file:///c:/Users/siva1/Downloads/staysphere_project%20(2)%20(1)/staysphere_project/deployment_guide.md).
