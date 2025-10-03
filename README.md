# WeatherSphere - Real-time Weather Application

A beautiful, feature-rich weather application with stunning animations, real-time data, and progressive web app capabilities.

## ✨ Features

### 🎨 Beautiful UI & Animations
- Stunning gradient backgrounds that change based on weather conditions
- Smooth CSS animations and transitions
- Particle background effects
- Weather-specific animations (rain, snow effects)
- Responsive design for all devices
- Glassmorphism card designs

### 🌦️ Weather Features
- **Real-time weather data** from OpenWeatherMap API
- **5-day weather forecast** with detailed information
- **Current location detection** with geolocation
- **Air quality index** with color-coded indicators
- **UV index** with safety recommendations
- **Wind direction** with compass indicators
- **Feels-like temperature** for better understanding
- **Sunrise/sunset times** for daily planning
- **Visibility and pressure** readings

### 📊 Interactive Charts
- **24-hour temperature trend** with Chart.js
- **Humidity levels** throughout the day
- Beautiful, responsive chart animations
- Real-time data updates

### 🚀 Progressive Web App (PWA)
- **Offline support** with service worker
- **Installable** on mobile and desktop
- **Cached weather data** for offline viewing
- **Background sync** when back online
- **Push notifications** for weather alerts

### 🔧 Advanced Features
- **Multiple temperature units** (Celsius/Fahrenheit)
- **Recent searches** with local storage
- **Auto-refresh** every 10 minutes
- **Error handling** with user-friendly messages
- **Loading animations** for better UX
- **Keyboard shortcuts** (Enter to search)

## 🚀 Setup Instructions

### 1. Get OpenWeatherMap API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
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