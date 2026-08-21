# UrbanSweep: Hardware-Free Urban Sanitation via Spatial Intelligence 🌍

Welcome to the **UrbanSweep** repository, built for the Automate India 2026 Hackathon (NIET Chapter) by **Team Cyvora**.

## 🚨 The Problem
Urban waste management is currently plagued by static collection schedules and a lack of real-time visibility. Traditionally, modernizing this system requires cities to purchase, install, and maintain tens of thousands of physical IoT sensors inside individual trash bins. These sensors are expensive, vulnerable to weather, prone to vandalism, and constrained by supply-chain bottlenecks.

Without a scalable way to gather real-time data, garbage trucks waste significant fuel driving to empty bins, while high-traffic areas silently overflow—creating toxic trash hotspots, severe public health hazards, and a growing backlog of ignored citizen complaints.

## 💡 Our Solution
We propose **UrbanSweep**—a purely software-centric Smart Waste Management Ecosystem that completely bypasses the need for physical bin sensors. 

By shifting from a hardware-dependent model to a visual, software-driven inference model, UrbanSweep acts as a "virtual sensor" network that a city can deploy overnight. Key pillars of our solution include:

1. **Ubiquitous Visual Ingestion:** Instead of physical sensors, the system aggregates ambient visual data from existing sources—including dashcams on public transport, municipal CCTV feeds, satellite imagery, and crowdsourced photos from citizen complaints.
2. **Spatial Intelligence via GNNs:** Utilizing a multimodal visual fusion framework built on Graph Neural Networks (GNNs), the platform processes these diverse image feeds to estimate uncollected waste volume and map out real-time urban trash hotspots.
3. **Dynamic Smart Routing:** A centralized engine factors in live traffic and hotspot severity to dynamically calculate the most efficient collection paths. By actively redirecting garbage trucks to high-priority zones, the system minimizes travel time, slashes fleet fuel usage, and drastically reduces overflow events.

## ✨ Key Features (The Municipal Dashboard)
This repository contains the code for the **Centralized Municipal Dashboard**. It serves as a spatial intelligence web portal for city officials featuring:
- A live interactive map of urban trash hotspots (Powered by Leaflet).
- Active fleet tracking and fuel monitoring.
- Automated citizen prioritization alerts.

## 🛠️ Technology Stack

**Frontend & Web Dashboard**
* **Next.js (React)** – Core framework
* **Tailwind CSS** – Styling & glassmorphic UI
* **Lucide React** – Iconography
* **Vercel Edge Middleware** – Secure authentication routing

**Spatial Intelligence & Mapping**
* **Leaflet & react-leaflet** – Interactive map rendering
* **OpenStreetMap** – Base geographic data
* **CartoDB Dark Matter** – Custom map tiles

**AI & Data Pipeline (Core IP)**
* **Computer Vision Models** – Ambient camera feed ingestion
* **Graph Neural Networks (GNNs)** – Spatial data fusion & volume estimation
* **Reinforcement Learning (RL)** – Dynamic route optimization (CVRP)

**Hosting & Infrastructure**
* **Vercel (Edge Network)** – Dashboard hosting & continuous deployment
* **Google Colab (T4 GPU)** – Cloud environment for high-speed AI model inference
* **FastAPI + ngrok** – Exposes the Colab GPU as a secure, public API endpoint for real-time dashboard communication

## 🚀 How to Run Locally

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> Note: To bypass the login screen during local testing, click the **"Sign In (Debug Skip)"** button which will set a local debug cookie.
