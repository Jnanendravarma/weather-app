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

  const { lat, lon } = req.query;
  const apiKey = process.env.OWM_API_KEY;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Both latitude (lat) and longitude (lon) parameters are required" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    console.log(`Fetching air pollution data from: ${url.replace(apiKey, 'HIDDEN')}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      console.error("OpenWeatherMap API error:", error);
      return res.status(response.status).json({ 
        error: error.message || "Failed to fetch air pollution data",
        code: error.cod 
      });
    }

    const data = await response.json();
    console.log(`✅ Air pollution data fetched successfully for coordinates: ${lat}, ${lon}`);
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}