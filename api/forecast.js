import fetch from "node-fetch";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { q, city, lat, lon, units = 'metric', cnt = '40' } = req.query;
  const apiKey = process.env.OWM_API_KEY;

  if (!q && !city && (!lat || !lon)) {
    return res.status(400).json({ error: "Either city parameter (q or city) or coordinates (lat, lon) are required" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    let url;
    if (q || city) {
      const cityName = q || city;
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=${units}&cnt=${cnt}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&cnt=${cnt}`;
    }

    console.log(`Fetching forecast data from: ${url.replace(apiKey, 'HIDDEN')}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      console.error("OpenWeatherMap API error:", error);
      return res.status(response.status).json({ 
        error: error.message || "Failed to fetch forecast data",
        code: error.cod 
      });
    }

    const data = await response.json();
    console.log(`✅ Forecast data fetched successfully for: ${data.city.name}`);
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}