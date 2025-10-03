const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors()); // allow frontend to call backend

// Cache control - disable for development, enable for production
if (process.env.NODE_ENV !== 'production') {
    // Development: Disable caching to ensure updated content loads
    app.use((req, res, next) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Surrogate-Control', 'no-store');
        next();
    });
} else {
    // Production: Enable caching for better performance
    app.use((req, res, next) => {
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        next();
    });
}

app.use(express.static('public')); // serve static files

const API_KEY = process.env.OWM_API_KEY;

if (!API_KEY) {
    console.error('🚨 Please set OWM_API_KEY in .env file');
    if (process.env.NODE_ENV !== 'production') {
        console.log('💡 Your API key should be: a65ee8d9584f92dd4bd6503943ddb49b');
    }
    process.exit(1);
}

// Route: get weather by city
app.get("/api/weather", async (req, res) => {
  const city = req.query.q;
  const units = req.query.units || 'metric';
  
  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`;
    const response = await axios.get(url);
    console.log(`✅ Weather fetched for: ${city}`);
    res.json(response.data);
  } catch (err) {
    console.error(`❌ Error fetching weather for ${city}:`, err.response?.data?.message || err.message);
    res.status(err.response?.status || 500).json({ 
      error: "Failed to fetch weather",
      details: err.response?.data?.message || err.message
    });
  }
});

// Route: get weather by coordinates
app.get("/api/weather/coords", async (req, res) => {
  const { lat, lon } = req.query;
  const units = req.query.units || 'metric';
  
  if (!lat || !lon) return res.status(400).json({ error: "Latitude and longitude are required" });

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    const response = await axios.get(url);
    console.log(`✅ Weather fetched for coordinates: ${lat}, ${lon}`);
    res.json(response.data);
  } catch (err) {
    console.error(`❌ Error fetching weather for coordinates:`, err.response?.data?.message || err.message);
    res.status(err.response?.status || 500).json({ 
      error: "Failed to fetch weather",
      details: err.response?.data?.message || err.message
    });
  }
});

// Route: get 5-day forecast
app.get("/api/forecast", async (req, res) => {
  const city = req.query.q;
  const { lat, lon } = req.query;
  const units = req.query.units || 'metric';
  
  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: "City name OR latitude and longitude are required" });
  }

  try {
    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${units}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    }
    
    const response = await axios.get(url);
    console.log(`✅ Forecast fetched for: ${city || `${lat}, ${lon}`}`);
    res.json(response.data);
  } catch (err) {
    console.error(`❌ Error fetching forecast:`, err.response?.data?.message || err.message);
    res.status(err.response?.status || 500).json({ 
      error: "Failed to fetch forecast",
      details: err.response?.data?.message || err.message
    });
  }
});

// Route: get air pollution data
app.get("/api/air-pollution", async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) return res.status(400).json({ error: "Latitude and longitude are required" });

  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const response = await axios.get(url);
    console.log(`✅ Air pollution data fetched for: ${lat}, ${lon}`);
    res.json(response.data);
  } catch (err) {
    console.error(`❌ Error fetching air pollution:`, err.response?.data?.message || err.message);
    res.status(err.response?.status || 500).json({ 
      error: "Failed to fetch air pollution data",
      details: err.response?.data?.message || err.message
    });
  }
});

// Debug endpoint to check file modification time
app.get("/api/debug", (req, res) => {
  const fs = require('fs');
  const filePath = path.join(__dirname, 'public', 'index.html');
  
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const hasVoiceBtn = content.includes('voice-btn');
    const hasThemeToggle = content.includes('theme-toggle');
    const hasRecommendations = content.includes('recommendations-grid');
    
    res.json({
      fileExists: true,
      lastModified: stats.mtime,
      fileSize: stats.size,
      features: {
        voiceButton: hasVoiceBtn,
        themeToggle: hasThemeToggle,
        recommendations: hasRecommendations
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main app for any unmatched routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🌦️  WeatherSphere Backend Server');
  console.log('=====================================');
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🌐 Open your browser to: http://localhost:${PORT}`);
  console.log(`� API Key configured: ${API_KEY ? '✅ Yes' : '❌ No'}`);
  console.log('=====================================\n');
});