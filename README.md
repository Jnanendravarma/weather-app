# 🌦️ WeatherSphere - Deployment Ready

A beautiful, feature-rich weather application with real-time data, voice features, and smart recommendations.

## 📁 Project Structure (Deployment Ready)

```
weather/
├── backend/          # Node.js Express API server
│   ├── .env         # Environment variables (not in git)
│   ├── server.js    # Main server file
│   ├── package.json # Backend dependencies
│   └── node_modules/
├── frontend/         # Static frontend files
│   ├── index.html   # Main HTML file
│   ├── style.css    # Comprehensive styling
│   ├── script.js    # Frontend JavaScript
│   ├── manifest.json # PWA manifest
│   ├── sw.js        # Service worker
│   ├── *.png        # App icons
│   └── package.json # Frontend scripts
├── .env.example     # Environment template
├── .gitignore       # Git ignore rules
├── package.json     # Root deployment scripts
└── README.md        # This file
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/Jnanendravarma/weather.git
cd weather
npm run install-all  # Installs all dependencies
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example backend/.env

# Edit with your API key (Windows)
notepad backend/.env

# Or edit manually and add:
OWM_API_KEY=your_openweathermap_api_key_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Required:** Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)

### 3. Run Locally
```bash
# Development mode (both servers)
npm run dev

# Or run separately:
cd backend && npm run dev    # Backend on port 5000
cd frontend && npm run dev   # Frontend on port 3000
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
npm run deploy:vercel
```

### Option 2: Railway
1. Connect GitHub repository to Railway
2. Set environment variables in dashboard
3. Deploy automatically on push

### Option 3: Heroku
```bash
heroku create your-weather-app
heroku config:set OWM_API_KEY=your_api_key_here
git push heroku main
```

## � Security Features

- ✅ **API keys secured** in `.env` files (not in git)
- ✅ **Comprehensive `.gitignore`** configuration
- ✅ **CORS properly configured** for cross-origin requests
- ✅ **Rate limiting** implemented
- ✅ **No sensitive data** exposed in frontend
2. Sign up for a free account
3. Generate your API key

### 2. Configure the Application
1. Open `index.html`
2. Find this line in the JavaScript section:
   ```javascript
   const API_KEY = 'your_openweathermap_api_key_here';
   ```
3. Replace `'your_openweathermap_api_key_here'` with your actual API key

### 3. Run the Application
1. Simply open `index.html` in your web browser
2. Or serve it using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

### 4. Install as PWA (Optional)
1. Open the app in a supported browser (Chrome, Firefox, Safari)
2. Look for the "Install" button in the address bar
3. Click to install as a standalone app

## 🌟 Usage

### Basic Weather Search
1. Enter any city name in the search box
2. Press Enter or click the search button
3. View comprehensive weather information

### Location-based Weather
1. Allow location access when prompted
2. The app will automatically fetch weather for your current location

### Switch Temperature Units
1. Click on °C or °F in the header to switch units
2. All temperatures will update accordingly

### View Detailed Charts
1. Scroll down to see temperature and humidity charts
2. Charts update automatically with new weather data

### Offline Usage
1. The app caches weather data automatically
2. When offline, it will show the most recently cached data
3. A notification will indicate when you're offline

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Animations**: CSS3 animations, Animate.css
- **Icons**: Font Awesome 6
- **API**: OpenWeatherMap API
- **PWA**: Service Worker, Web App Manifest

## 📊 File Structure

```
weather/
├── index.html          # Main application file
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
└── README.md          # This file
```

## 🎯 Performance Features

- **Lazy loading** of images and resources
- **Efficient caching** with service worker
- **Optimized animations** with CSS transforms
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