# 🌦️ WeatherSphere Backend API# 🌦️ WeatherSphere - Deployment Ready



A professional Node.js + Express backend API for weather data with OpenWeatherMap integration.A beautiful, feature-rich weather application with real-time data, voice features, and smart recommendations.



## 🚀 **Quick Start**## 📁 Project Structure (Deployment Ready)



### 1. **Install Dependencies**```

```bashweather/

cd backend├── backend/          # Node.js Express API server

npm install│   ├── .env         # Environment variables (not in git)

```│   ├── server.js    # Main server file

│   ├── package.json # Backend dependencies

### 2. **Configure API Key**│   └── node_modules/

```bash├── frontend/         # Static frontend files

# Edit backend/.env file│   ├── index.html   # Main HTML file

OWM_API_KEY=your_openweathermap_api_key_here│   ├── style.css    # Comprehensive styling

```│   ├── script.js    # Frontend JavaScript

│   ├── manifest.json # PWA manifest

### 3. **Start Backend Server**│   ├── sw.js        # Service worker

```bash│   ├── *.png        # App icons

cd backend│   └── package.json # Frontend scripts

npm start├── .env.example     # Environment template

```├── .gitignore       # Git ignore rules

├── package.json     # Root deployment scripts

**✅ Backend running on:** `http://localhost:5001`└── README.md        # This file

```

## 📡 **API Endpoints**

## 🚀 Quick Start

### **Weather Data**

- `GET /api/weather?q=cityname` - Current weather by city### 1. Clone and Setup

- `GET /api/weather?lat=40.7&lon=-74.0` - Current weather by coordinates```bash

git clone https://github.com/Jnanendravarma/weather.git

### **Forecast Data**cd weather

- `GET /api/forecast?q=cityname` - 5-day forecast by city  npm run install-all  # Installs all dependencies

- `GET /api/forecast?lat=40.7&lon=-74.0` - 5-day forecast by coordinates```



### **Air Quality**### 2. Environment Configuration

- `GET /api/air-pollution?lat=40.7&lon=-74.0` - Air quality data```bash

# Copy environment template

### **Health Check**cp .env.example backend/.env

- `GET /api/health` - Server status and API key validation

# Edit with your API key (Windows)

## 🔧 **Backend Features**notepad backend/.env



### ✅ **API Security**# Or edit manually and add:

- **🔒 API Key Protection**: OpenWeatherMap key stored securely in `.env`OWM_API_KEY=your_openweathermap_api_key_here

- **🌐 CORS Enabled**: Cross-origin resource sharing configuredPORT=5000

- **⚡ Error Handling**: Graceful error responses with status codesNODE_ENV=development

- **📊 Health Monitoring**: Built-in health check endpointCORS_ORIGIN=http://localhost:3000

```

### ✅ **Data Support**

- **🌡️ Multiple Units**: Metric, Imperial, Kelvin support**Required:** Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)

- **🗺️ Dual Input**: City names or GPS coordinates

- **📅 Forecasting**: 5-day weather predictions### 3. Run Locally

- **🌬️ Air Quality**: Pollution index monitoring```bash

# Development mode (both servers)

### ✅ **Performance**npm run dev

- **⚡ Fast Response**: Optimized API calls

- **📝 Structured Logging**: Request tracking and error logging# Or run separately:

- **🔄 Real-time Data**: Live OpenWeatherMap integrationcd backend && npm run dev    # Backend on port 5000

cd frontend && npm run dev   # Frontend on port 3000

## 📋 **Environment Setup**```



### **Required Environment Variables**## 🌐 Deployment Options

```bash

# backend/.env### Option 1: Vercel (Recommended)

OWM_API_KEY=your_openweathermap_api_key_here```bash

PORT=5001npm install -g vercel

NODE_ENV=developmentnpm run deploy:vercel

``````



### **Get OpenWeatherMap API Key**### Option 2: Railway

1. Visit: https://openweathermap.org/api1. Connect GitHub repository to Railway

2. Sign up for free account2. Set environment variables in dashboard

3. Generate API key3. Deploy automatically on push

4. Add to `.env` file

### Option 3: Heroku

## 🌐 **Example API Calls**```bash

heroku create your-weather-app

### **Current Weather**heroku config:set OWM_API_KEY=your_api_key_here

```bashgit push heroku main

# By city name```

curl "http://localhost:5001/api/weather?q=London&units=metric"

## � Security Features

# By coordinates  

curl "http://localhost:5001/api/weather?lat=51.5074&lon=-0.1278&units=metric"- ✅ **API keys secured** in `.env` files (not in git)

```- ✅ **Comprehensive `.gitignore`** configuration

- ✅ **CORS properly configured** for cross-origin requests

### **5-Day Forecast**- ✅ **Rate limiting** implemented

```bash- ✅ **No sensitive data** exposed in frontend

# By city name2. Sign up for a free account

curl "http://localhost:5001/api/forecast?q=Tokyo&units=metric"3. Generate your API key



# By coordinates### 2. Configure the Application

curl "http://localhost:5001/api/forecast?lat=35.6762&lon=139.6503&units=metric"1. Open `index.html`

```2. Find this line in the JavaScript section:

   ```javascript

### **Air Quality**   const API_KEY = 'your_openweathermap_api_key_here';

```bash   ```

curl "http://localhost:5001/api/air-pollution?lat=51.5074&lon=-0.1278"3. Replace `'your_openweathermap_api_key_here'` with your actual API key

```

### 3. Run the Application

### **Health Check**1. Simply open `index.html` in your web browser

```bash2. Or serve it using a local web server:

curl "http://localhost:5001/api/health"   ```bash

```   # Using Python 3

   python -m http.server 8000

## 📊 **Response Format**   

   # Using Node.js (with http-server)

### **Weather Response**   npx http-server

```json   

{   # Using PHP

  "coord": { "lon": -0.1278, "lat": 51.5074 },   php -S localhost:8000

  "weather": [   ```

    {

      "id": 800,### 4. Install as PWA (Optional)

      "main": "Clear",1. Open the app in a supported browser (Chrome, Firefox, Safari)

      "description": "clear sky",2. Look for the "Install" button in the address bar

      "icon": "01d"3. Click to install as a standalone app

    }

  ],## 🌟 Usage

  "main": {

    "temp": 15.5,### Basic Weather Search

    "feels_like": 14.8,1. Enter any city name in the search box

    "temp_min": 13.2,2. Press Enter or click the search button

    "temp_max": 17.1,3. View comprehensive weather information

    "pressure": 1013,

    "humidity": 65### Location-based Weather

  },1. Allow location access when prompted

  "wind": { "speed": 3.6, "deg": 180 },2. The app will automatically fetch weather for your current location

  "name": "London",

  "country": "GB"### Switch Temperature Units

}1. Click on °C or °F in the header to switch units

```2. All temperatures will update accordingly



## 🔒 **Security Features**### View Detailed Charts

1. Scroll down to see temperature and humidity charts

- ✅ **API Key Hidden**: Never exposed to frontend2. Charts update automatically with new weather data

- ✅ **Environment Variables**: Secure configuration management  

- ✅ **CORS Protection**: Controlled cross-origin access### Offline Usage

- ✅ **Error Sanitization**: No sensitive data in error responses1. The app caches weather data automatically

- ✅ **Git Security**: `.env` files properly ignored2. When offline, it will show the most recently cached data

3. A notification will indicate when you're offline

## 🛠️ **Tech Stack**

## 📱 Browser Support

- **⚡ Node.js**: JavaScript runtime

- **🚀 Express.js**: Web framework- ✅ Chrome 60+

- **🌍 OpenWeatherMap API**: Weather data source- ✅ Firefox 55+

- **📝 dotenv**: Environment variable management- ✅ Safari 11+

- **🔗 cors**: Cross-origin resource sharing- ✅ Edge 79+

- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📁 **Project Structure**

## 🛠️ Technology Stack

```

weather/- **Frontend**: HTML5, CSS3, JavaScript (ES6+)

├── 📁 backend/           # Backend API Server- **Charts**: Chart.js

│   ├── server.js        # Main server file- **Animations**: CSS3 animations, Animate.css

│   ├── .env            # Environment variables (secure)- **Icons**: Font Awesome 6

│   ├── package.json    # Dependencies and scripts- **API**: OpenWeatherMap API

│   └── node_modules/   # Installed packages- **PWA**: Service Worker, Web App Manifest

├── 📄 README.md        # This documentation

├── 📄 ARCHITECTURE.md  # Technical architecture## 📊 File Structure

├── 📄 SECURITY_ALERT.md # Security information

├── 📄 .gitignore       # Git ignore rules```

└── 📄 .env.example     # Environment templateweather/

```├── index.html          # Main application file

├── manifest.json       # PWA manifest

## 🚀 **Ready for Integration**├── sw.js              # Service worker

└── README.md          # This file

This backend API is ready to be integrated with any frontend:```

- **📱 React/Vue/Angular** applications

- **🌐 Static HTML/JavaScript** websites  ## 🎯 Performance Features

- **📱 Mobile apps** (React Native, Flutter, etc.)

- **🖥️ Desktop applications** (Electron, etc.)- **Lazy loading** of images and resources

- **Efficient caching** with service worker

**The backend handles all the heavy lifting - just connect and start building!** ⚡- **Optimized animations** with CSS transforms
- **Debounced API calls** to prevent excessive requests
- **Compressed assets** for faster loading

## 🔐 Privacy & Security

- Location data is only used for weather fetching
- No personal data is stored on external servers
- All data is cached locally for offline use
- HTTPS recommended for production deployment

## 🤝 Contributing

Feel free to contribute to this project by:
1. Reporting bugs
2. Suggesting new features
3. Submitting pull requests
4. Improving documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Font Awesome](https://fontawesome.com/) for icons
- [Animate.css](https://animate.style/) for animations

---

Enjoy your beautiful weather experience with WeatherSphere! 🌈