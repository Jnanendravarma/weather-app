import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://[::1]:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://[::1]:8080',
    'https://weather-app-jnanendravarma.vercel.app',
    'https://*.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.get("/api/weather", async (req, res) => {
  const city = req.query.q || req.query.city;
  const lat = req.query.lat;
  const lon = req.query.lon;
  const units = req.query.units || 'metric';
  const apiKey = process.env.OWM_API_KEY;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: "Either city parameter (q or city) or coordinates (lat, lon) are required" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    let apiUrl;
    if (city) {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Weather API Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch weather data", 
      details: error.message 
    });
  }
});

// Forecast endpoint
app.get("/api/forecast", async (req, res) => {
  const city = req.query.q || req.query.city;
  const lat = req.query.lat;
  const lon = req.query.lon;
  const units = req.query.units || 'metric';
  const apiKey = process.env.OWM_API_KEY;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: "Either city parameter (q or city) or coordinates (lat, lon) are required" });
  }

  try {
    let apiUrl;
    if (city) {
      apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Forecast API Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch forecast data", 
      details: error.message 
    });
  }
});

// Air pollution endpoint
app.get("/api/air-pollution", async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.OWM_API_KEY;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude parameters are required" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Air Pollution API Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch air pollution data", 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    apiKey: process.env.OWM_API_KEY ? "configured" : "missing"
  });
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🌦️  WeatherSphere Backend Server`);
    console.log(`=====================================`);
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API available at: http://localhost:${PORT}/api`);
    console.log(`🔑 API Key configured: ${process.env.OWM_API_KEY ? '✅ Yes' : '❌ No'}`);
    console.log(`=====================================`);
  });
}

// Export for Vercel
export default app;