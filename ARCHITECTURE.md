# WeatherSphere - Separated Frontend/Backend Architecture

## 🏗️ Project Structure

```
weather-app/
│
├── backend/                 # Express.js API Server
│   ├── server.js           # Main backend server (ES modules)
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (API keys)
│
└── frontend/               # Static Frontend Files
    ├── index.html         # Main HTML page
    ├── style.css          # Stylesheet
    ├── script.js          # Frontend JavaScript
    ├── package.json       # Frontend server setup
    ├── manifest.json      # PWA manifest
    └── icon-*.png         # PWA icons
```

## 🚀 Setup and Running

### Backend Setup (Port 5000)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your OpenWeatherMap API key:
   ```env
   OWM_API_KEY=your_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   Backend will run at: `http://localhost:5000`

### Frontend Setup (Port 3000)

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Start the frontend server:
   ```bash
   npm start
   ```
   
   Frontend will run at: `http://localhost:3000`

## 🔧 API Endpoints

The backend provides these REST API endpoints:

- `GET /api/health` - Health check and API key status
- `GET /api/weather?q=cityname` - Current weather data
- `GET /api/forecast?q=cityname` - 5-day weather forecast
- `GET /api/air-pollution?lat=x&lon=y` - Air pollution data

## 🌍 Architecture Benefits

### ✅ **Separation of Concerns**
- **Backend**: Pure API server with secure environment variables
- **Frontend**: Static files served independently
- Clean separation between data and presentation layers

### ✅ **Security**
- API keys stored securely in backend `.env` file
- Frontend never exposes sensitive credentials
- CORS configuration for cross-origin requests

### ✅ **Scalability**
- Backend can serve multiple frontend applications
- Frontend can be deployed to any static hosting service
- Independent deployment and scaling

### ✅ **Development Workflow**
- Backend and frontend can be developed independently
- Easy testing of API endpoints
- Clean development environment separation

## 🔄 API Communication Flow

```
Frontend (Port 3000) → Backend API (Port 5000) → OpenWeatherMap API
     ↑                        ↑                         ↑
Static HTML/CSS/JS     Express.js Server        External API
```

### Example API Call from Frontend:

```javascript
// Frontend calls backend API instead of OpenWeatherMap directly
const response = await fetch('http://localhost:5000/api/weather?q=London');
const data = await response.json();
```

### Backend API Handler:

```javascript
// Backend securely calls OpenWeatherMap API
app.get("/api/weather", async (req, res) => {
  const city = req.query.q;
  const apiKey = process.env.OWM_API_KEY; // Secure API key
  
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  );
  const data = await response.json();
  res.json(data);
});
```

## 🚀 Deployment Ready

### Backend Deployment (Vercel/Heroku)
- Environment variables configured on platform
- Express.js server with ES module support
- Production-ready error handling

### Frontend Deployment (Netlify/Vercel)
- Static files ready for CDN deployment
- Update `API_BASE_URL` in `script.js` to production backend URL
- PWA-ready with manifest and service worker

## 🎯 Key Features Maintained

- ✅ Voice search and speech synthesis
- ✅ Responsive design with mobile optimization
- ✅ Real-time weather data and forecasts
- ✅ Air pollution monitoring
- ✅ PWA capabilities
- ✅ Settings and preferences
- ✅ Beautiful animations and UI

## 🔧 Configuration

### Frontend Configuration (`script.js`)
```javascript
// Update this URL for production deployment
const API_BASE_URL = 'http://localhost:5000/api';
```

### Backend Configuration (`.env`)
```env
OWM_API_KEY=your_openweathermap_api_key
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

This architecture provides a solid foundation for both development and production deployment while maintaining all the advanced features of WeatherSphere! 🌦️