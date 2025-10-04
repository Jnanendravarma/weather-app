// Weather App Configuration
// Using local backend server for development
const API_BASE = 'http://localhost:5000/api'; // Local backend URL

// Helper function to check if server is ready
async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:5000/');
        return response.ok;
    } catch (error) {
        console.warn('⚠️ Backend server not reachable, using fallback...');
        return false;
    }
}

// Application state
let currentUnit = 'metric';
let weatherData = null;
let forecastData = null;
let temperatureChart = null;
let humidityChart = null;
let speechRecognition = null;
let speechSynthesis = null;
let isListening = false;

// Voice Settings Management
let voiceSettings = {
    enabled: true,
    announcements: true,
    autoSpeak: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Show enhanced welcome message
    showNotification('🚀 Starting WeatherSphere v3.0 - AI Weather Assistant...', 'info');
    
    // Initialize all features immediately
    initializeApp();
    createParticleBackground();
    setupEventListeners();
    registerServiceWorker();
    initializeSpeechFeatures();
    loadUserPreferences();
    
    // Auto-detect location immediately for better UX
    setTimeout(() => {
        showNotification('📍 Auto-detecting your location for personalized weather...', 'info');
        getCurrentLocation();
    }, 1000);
    
    // Fallback to default city if geolocation fails or takes too long
    setTimeout(() => {
        if (!weatherData) {
            showNotification('🌍 Loading default weather for London...', 'info');
            fetchWeatherByCity('London');
        }
    }, 5000);
    
    // Hide loading screen after setup
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 2000);

    // Try to get user's location for initial weather
    getCurrentLocationWeather();
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Register service worker for PWA support
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Initialize app components
function initializeApp() {
    setCurrentDate();
    initializeCharts();
}

// Create animated particle background
function createParticleBackground() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(particle);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const voiceBtn = document.getElementById('voice-btn');
    const locationBtn = document.getElementById('location-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (searchBtn) searchBtn.addEventListener('click', () => searchWeather());
    if (cityInput) {
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchWeather();
        });
    }

    // Voice search
    if (voiceBtn) voiceBtn.addEventListener('click', () => toggleVoiceSearch());

    // Location button
    if (locationBtn) locationBtn.addEventListener('click', () => getCurrentLocationWeather());

    // Theme toggle
    if (themeToggle) themeToggle.addEventListener('click', () => toggleTheme());

    // Settings modal
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    if (settingsToggle) {
        settingsToggle.addEventListener('click', () => {
            openSettings();
        });
    }
    
    if (closeSettings) {
        closeSettings.addEventListener('click', () => closeSettingsModal());
    }
    
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettingsModal();
        });
    }

    // Settings toggles
    setupSettingsToggles();

    // Unit toggle
    const unitC = document.getElementById('unit-c');
    const unitF = document.getElementById('unit-f');
    if (unitC) unitC.addEventListener('click', () => switchUnit('metric'));
    if (unitF) unitF.addEventListener('click', () => switchUnit('imperial'));

    // Recent searches
    document.querySelectorAll('.recent-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            if (cityInput) {
                cityInput.value = tag.textContent;
                searchWeather();
            }
        });
    });
}

function setupSettingsToggles() {
    try {
        const voiceEnabledToggle = document.getElementById('voice-enabled');
        const voiceAnnouncementsToggle = document.getElementById('voice-announcements');
        const voiceAutoSpeakToggle = document.getElementById('voice-auto-speak');
        const weatherAlertsToggle = document.getElementById('weather-alerts');
        const animationsToggle = document.getElementById('animations-enabled');
        const effectsToggle = document.getElementById('weather-effects-toggle');

        // Helper function to setup toggle with multiple event handlers
        function setupToggle(toggle, callback, name) {
            if (toggle) {
                toggle.addEventListener('change', callback);
                
                const slider = toggle.nextElementSibling;
                if (slider && slider.classList.contains('toggle-slider')) {
                    slider.addEventListener('click', (e) => {
                        e.preventDefault();
                        toggle.checked = !toggle.checked;
                        callback();
                    });
                }
                
                const label = toggle.closest('.setting-item').querySelector('label');
                if (label) {
                    label.addEventListener('click', (e) => {
                        e.preventDefault();
                        toggle.checked = !toggle.checked;
                        callback();
                    });
                    label.style.cursor = 'pointer';
                }
            }
        }

        // Setup all toggles
        setupToggle(voiceEnabledToggle, updateVoiceSettings, 'Voice Enabled');
        setupToggle(voiceAnnouncementsToggle, updateVoiceSettings, 'Voice Announcements');
        setupToggle(voiceAutoSpeakToggle, updateVoiceSettings, 'Voice Auto-speak');
        setupToggle(weatherAlertsToggle, updateNotificationSettings, 'Weather Alerts');
        setupToggle(animationsToggle, updateAnimationSettings, 'Animations');
        setupToggle(effectsToggle, updateEffectsSettings, 'Weather Effects');

    } catch (error) {
        console.error('❌ Error setting up toggle event listeners:', error);
    }
}

// Initialize speech features
function initializeSpeechFeatures() {
    // Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        speechRecognition.lang = 'en-US';

        speechRecognition.onstart = () => {
            isListening = true;
            const voiceBtn = document.getElementById('voice-btn');
            if (voiceBtn) voiceBtn.classList.add('listening');
            showNotification('Listening... Say a city name', 'success');
        };

        speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const cityInput = document.getElementById('city-input');
            if (cityInput) cityInput.value = transcript;
            const voiceBtn = document.getElementById('voice-btn');
            if (voiceBtn) voiceBtn.classList.add('processing');
            searchWeather();
            speakWeather(`Searching weather for ${transcript}`);
        };

        speechRecognition.onerror = (event) => {
            isListening = false;
            const voiceBtn = document.getElementById('voice-btn');
            if (voiceBtn) voiceBtn.classList.remove('listening', 'processing');
            showNotification('Voice search failed. Please try again.', 'error');
        };

        speechRecognition.onend = () => {
            isListening = false;
            const voiceBtn = document.getElementById('voice-btn');
            if (voiceBtn) voiceBtn.classList.remove('listening', 'processing');
        };
    }

    // Speech Synthesis
    if ('speechSynthesis' in window) {
        speechSynthesis = window.speechSynthesis;
    }
}

// Toggle voice search
function toggleVoiceSearch() {
    if (!voiceSettings.enabled) {
        showNotification('Voice search is disabled. Enable it in settings.', 'error');
        return;
    }

    if (!speechRecognition) {
        showNotification('Voice search not supported in this browser', 'error');
        return;
    }

    if (isListening) {
        speechRecognition.stop();
    } else {
        speechRecognition.start();
    }
}

// Speak weather information
function speakWeather(text) {
    if (!voiceSettings.announcements || !speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    }
}

// Load user preferences
function loadUserPreferences() {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }

    // Load unit preference
    const savedUnit = localStorage.getItem('unit');
    if (savedUnit) {
        currentUnit = savedUnit;
        const unitC = document.getElementById('unit-c');
        const unitF = document.getElementById('unit-f');
        if (unitC) unitC.classList.toggle('active', savedUnit === 'metric');
        if (unitF) unitF.classList.toggle('active', savedUnit === 'imperial');
    }

    // Load voice settings
    loadVoiceSettings();
}

// Settings Modal Functions
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('show');
        showNotification('⚙️ Settings opened', 'info');
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function loadVoiceSettings() {
    const saved = localStorage.getItem('voiceSettings');
    if (saved) {
        voiceSettings = JSON.parse(saved);
    }
    
    setTimeout(() => {
        const voiceEnabledToggle = document.getElementById('voice-enabled');
        const voiceAnnouncementsToggle = document.getElementById('voice-announcements');
        const voiceAutoSpeakToggle = document.getElementById('voice-auto-speak');
        
        if (voiceEnabledToggle) voiceEnabledToggle.checked = voiceSettings.enabled;
        if (voiceAnnouncementsToggle) voiceAnnouncementsToggle.checked = voiceSettings.announcements;
        if (voiceAutoSpeakToggle) voiceAutoSpeakToggle.checked = voiceSettings.autoSpeak;
        
        updateVoiceButtonVisibility();
    }, 100);
}

function updateVoiceButtonVisibility() {
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
        if (voiceSettings.enabled) {
            voiceBtn.classList.remove('disabled');
            voiceBtn.style.display = 'flex';
            voiceBtn.title = 'Voice Search (Enabled)';
        } else {
            voiceBtn.classList.add('disabled');
            voiceBtn.style.display = 'none';
            voiceBtn.title = 'Voice Search (Disabled in Settings)';
        }
    }
}

function updateVoiceSettings() {
    const voiceEnabledToggle = document.getElementById('voice-enabled');
    const voiceAnnouncementsToggle = document.getElementById('voice-announcements');
    const voiceAutoSpeakToggle = document.getElementById('voice-auto-speak');
    
    if (voiceEnabledToggle) voiceSettings.enabled = voiceEnabledToggle.checked;
    if (voiceAnnouncementsToggle) voiceSettings.announcements = voiceAnnouncementsToggle.checked;
    if (voiceAutoSpeakToggle) voiceSettings.autoSpeak = voiceAutoSpeakToggle.checked;
    
    localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
    updateVoiceButtonVisibility();
    
    if (voiceSettings.enabled) {
        showNotification('🎤 Voice features enabled!', 'success');
    } else {
        showNotification('🔇 Voice features disabled', 'info');
        
        if (isListening && speechRecognition) {
            speechRecognition.stop();
            isListening = false;
        }
        
        if (speechSynthesis) {
            speechSynthesis.cancel();
        }
    }
}

function updateNotificationSettings() {
    const weatherAlerts = document.getElementById('weather-alerts');
    if (weatherAlerts) {
        localStorage.setItem('weatherAlerts', weatherAlerts.checked);
        showNotification(weatherAlerts.checked ? 'Weather alerts enabled' : 'Weather alerts disabled', 'info');
    }
}

function updateAnimationSettings() {
    const animationsEnabled = document.getElementById('animations-enabled');
    if (animationsEnabled) {
        localStorage.setItem('animationsEnabled', animationsEnabled.checked);
        
        if (animationsEnabled.checked) {
            document.body.classList.remove('no-animations');
            showNotification('Animations enabled', 'success');
        } else {
            document.body.classList.add('no-animations');
            showNotification('Animations disabled', 'info');
        }
    }
}

function updateEffectsSettings() {
    const effectsEnabled = document.getElementById('weather-effects-toggle');
    const effectsContainer = document.getElementById('weather-effects');
    
    if (effectsEnabled && effectsContainer) {
        localStorage.setItem('weatherEffects', effectsEnabled.checked);
        
        if (effectsEnabled.checked) {
            effectsContainer.style.display = 'block';
            showNotification('Weather effects enabled', 'success');
        } else {
            effectsContainer.style.display = 'none';
            showNotification('Weather effects disabled', 'info');
        }
    }
}

// Get current location weather
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByCoords(lat, lon);
            },
            error => {
                console.log('Geolocation error:', error);
                fetchWeatherByCity('London');
            }
        );
    } else {
        fetchWeatherByCity('London');
    }
}

// Search weather for entered city
function searchWeather() {
    const cityInput = document.getElementById('city-input');
    const city = cityInput ? cityInput.value.trim() : '';
    if (!city) {
        showNotification('Please enter a city name', 'error');
        return;
    }
    
    showLoading();
    fetchWeatherByCity(city);
}

// Show loading state
function showLoading() {
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.innerHTML = '<div class="loading"></div>';
        searchBtn.disabled = true;
    }
}

// Hide loading state
function hideLoading() {
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
        searchBtn.disabled = false;
    }
}

// Fetch weather data by city name
async function fetchWeatherByCity(city) {
    const serverReady = await checkServerStatus();
    if (!serverReady) {
        showNotification('⚠️ Server starting up, please wait...', 'warning');
        setTimeout(() => fetchWeatherByCity(city), 2000);
        return;
    }

    if (!navigator.onLine) {
        const cachedData = getCachedWeatherData(city);
        if (cachedData) {
            updateWeatherDisplay(cachedData.weather, cachedData.forecast);
            showNotification('Showing cached data (offline)', 'warning');
            hideLoading();
            return;
        }
    }
    
    try {
        const weatherResponse = await fetch(`${API_BASE}/weather?q=${encodeURIComponent(city)}&units=${currentUnit}`);
        
        if (!weatherResponse.ok) {
            const contentType = weatherResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await weatherResponse.json();
                throw new Error(errorData.error || 'City not found');
            } else {
                throw new Error('Server error - please try again in a moment');
            }
        }

        weatherData = await weatherResponse.json();
        
        const forecastResponse = await fetch(`${API_BASE}/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}`);
        forecastData = await forecastResponse.json();
        
        cacheWeatherData(city, { weather: weatherData, forecast: forecastData });
        
        updateWeatherDisplay(weatherData, forecastData);
        updateCharts();
        generateSmartRecommendations(weatherData);
        saveRecentSearch(city);
        showNotification('Weather data updated successfully!', 'success');
        
        const summary = `Weather in ${weatherData.name}: ${Math.round(weatherData.main.temp)} degrees, ${weatherData.weather[0].description}`;
        speakWeather(summary);
        
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        
        const cachedData = getCachedWeatherData(city);
        if (cachedData) {
            updateWeatherDisplay(cachedData.weather, cachedData.forecast);
            showNotification('Using cached data due to network error', 'warning');
        } else {
            showNotification(`Failed to fetch weather data: ${error.message}`, 'error');
        }
        hideLoading();
    }
}

// Fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        const weatherResponse = await fetch(`${API_BASE}/weather/coords?lat=${lat}&lon=${lon}&units=${currentUnit}`);
        weatherData = await weatherResponse.json();
        
        const forecastResponse = await fetch(`${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}`);
        forecastData = await forecastResponse.json();
        
        updateWeatherDisplay(weatherData, forecastData);
        updateCharts();
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching weather by coords:', error);
        fetchWeatherByCity('London');
    }
}

// Update weather display
function updateWeatherDisplay(weather, forecast) {
    // Current weather
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const weatherDescription = document.getElementById('weather-description');
    const weatherImg = document.getElementById('weather-img');
    
    if (cityName) cityName.textContent = `${weather.name}, ${weather.sys.country}`;
    if (temperature) temperature.textContent = Math.round(weather.main.temp);
    if (weatherDescription) weatherDescription.textContent = weather.weather[0].description;
    if (weatherImg) weatherImg.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
    
    // Weather details
    updateDetailElement('humidity-value', weather.main.humidity + '%');
    updateDetailElement('wind-speed', Math.round(weather.wind.speed * 3.6) + ' km/h');
    updateDetailElement('pressure-value', weather.main.pressure + ' hPa');
    updateDetailElement('visibility-value', (weather.visibility / 1000).toFixed(1) + ' km');
    updateDetailElement('feels-like-value', Math.round(weather.main.feels_like) + '°');
    
    // Wind direction
    const windDirection = getWindDirection(weather.wind.deg);
    updateDetailElement('wind-direction', windDirection);
    
    // Fetch UV Index (simulated)
    fetchUVIndex(weather.coord.lat, weather.coord.lon);
    
    // Sunrise/Sunset
    const sunrise = new Date(weather.sys.sunrise * 1000);
    const sunset = new Date(weather.sys.sunset * 1000);
    updateDetailElement('sunrise-value', sunrise.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}));
    updateDetailElement('sunset-value', sunset.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}));
    
    // Update forecast
    updateForecast(forecast);
    
    // Update background based on weather
    updateWeatherBackground(weather.weather[0].main);
    
    // Add weather icon animation
    if (weatherImg) {
        weatherImg.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => {
            weatherImg.classList.remove('animate__animated', 'animate__bounceIn');
        }, 1000);
    }

    // Auto-speak weather if enabled
    if (voiceSettings.autoSpeak) {
        const tempUnit = currentUnit === 'metric' ? 'Celsius' : 'Fahrenheit';
        const speechText = `Current weather in ${weather.name}: ${weather.weather[0].description}, ${Math.round(weather.main.temp)} degrees ${tempUnit}. Humidity ${weather.main.humidity} percent, wind speed ${Math.round(weather.wind.speed * 3.6)} kilometers per hour.`;
        setTimeout(() => speakWeather(speechText), 1500);
    }
    
    setCurrentDate();
}

function updateDetailElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

// Fetch UV Index (simulated)
async function fetchUVIndex(lat, lon) {
    try {
        const uvIndex = Math.floor(Math.random() * 11) + 1;
        updateDetailElement('uv-index-value', uvIndex);
        
        const uvElement = document.getElementById('uv-index-value');
        if (uvElement) uvElement.style.color = getUVIndexColor(uvIndex);
    } catch (error) {
        console.error('Error fetching UV index:', error);
        updateDetailElement('uv-index-value', 'N/A');
    }
}

// Get wind direction from degrees
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Get UV index color
function getUVIndexColor(uvIndex) {
    if (uvIndex <= 2) return '#4cc9f0';
    if (uvIndex <= 5) return '#7fb069';
    if (uvIndex <= 7) return '#f9c74f';
    if (uvIndex <= 10) return '#f8961e';
    return '#f94144';
}

// Update 5-day forecast
function updateForecast(forecast) {
    const forecastContainer = document.getElementById('forecast-container');
    if (!forecastContainer) return;
    
    forecastContainer.innerHTML = '';
    
    const dailyForecasts = forecast.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    dailyForecasts.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.style.animationDelay = `${index * 0.1}s`;
        
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" 
                 alt="${day.weather[0].description}" class="forecast-icon">
            <div class="forecast-temps">
                <span class="forecast-high">${Math.round(day.main.temp_max)}°</span>
                <span class="forecast-low">${Math.round(day.main.temp_min)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Initialize charts
function initializeCharts() {
    if (typeof Chart === 'undefined') return;
    console.log('Charts initialized (Chart.js would go here)');
}

// Update charts with forecast data
function updateCharts() {
    console.log('Charts updated with new data');
}

// Update background based on weather
function updateWeatherBackground(weatherType) {
    const body = document.body;
    body.className = '';
    
    switch (weatherType.toLowerCase()) {
        case 'clear':
            body.classList.add('weather-bg-sunny');
            break;
        case 'clouds':
            body.classList.add('weather-bg-cloudy');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('weather-bg-rainy');
            break;
        case 'snow':
            body.classList.add('weather-bg-snowy');
            break;
    }
}

// Switch temperature unit
function switchUnit(unit) {
    currentUnit = unit;
    
    const unitC = document.getElementById('unit-c');
    const unitF = document.getElementById('unit-f');
    
    if (unitC) unitC.classList.toggle('active', unit === 'metric');
    if (unitF) unitF.classList.toggle('active', unit === 'imperial');
    
    localStorage.setItem('unit', unit);
    
    if (weatherData) {
        fetchWeatherByCity(weatherData.name);
    }
}

// Generate smart recommendations
function generateSmartRecommendations(weather) {
    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed;
    const recommendations = [];

    // Clothing recommendations
    let clothingAdvice = '';
    let clothingIcon = 'fas fa-tshirt';
    let clothingTags = [];

    if (temp < 0) {
        clothingAdvice = 'Very cold! Wear heavy winter coat, gloves, scarf, and warm boots. Layer up!';
        clothingIcon = 'fas fa-snowflake';
        clothingTags = ['Heavy Coat', 'Gloves', 'Scarf', 'Winter Boots'];
    } else if (temp < 10) {
        clothingAdvice = 'Cold weather. Wear a warm jacket, long pants, and closed shoes.';
        clothingIcon = 'fas fa-snowman';
        clothingTags = ['Warm Jacket', 'Long Pants', 'Closed Shoes'];
    } else if (temp < 20) {
        clothingAdvice = 'Cool weather. Light jacket or sweater recommended. Jeans are perfect.';
        clothingIcon = 'fas fa-tshirt';
        clothingTags = ['Light Jacket', 'Sweater', 'Jeans'];
    } else if (temp < 25) {
        clothingAdvice = 'Pleasant weather! Light clothes, t-shirt, and comfortable shoes.';
        clothingIcon = 'fas fa-tshirt';
        clothingTags = ['T-shirt', 'Light Clothes', 'Comfortable Shoes'];
    } else if (temp < 30) {
        clothingAdvice = 'Warm weather. Wear light, breathable clothes. Shorts and t-shirt ideal.';
        clothingIcon = 'fas fa-sun';
        clothingTags = ['Shorts', 'T-shirt', 'Breathable Fabric'];
    } else {
        clothingAdvice = 'Very hot! Wear minimal, light-colored clothes. Stay hydrated!';
        clothingIcon = 'fas fa-fire';
        clothingTags = ['Light Colors', 'Minimal Clothing', 'Sun Hat'];
    }

    recommendations.push({
        icon: clothingIcon,
        title: 'Clothing Advice',
        content: clothingAdvice,
        tags: clothingTags
    });

    // Activity recommendations
    let activityAdvice = '';
    let activityIcon = 'fas fa-running';
    let activityTags = [];

    if (condition.includes('rain')) {
        activityAdvice = 'Rainy day! Perfect for indoor activities like reading, movies, or visiting museums. Bring an umbrella if you must go out.';
        activityIcon = 'fas fa-umbrella';
        activityTags = ['Indoor Activities', 'Museums', 'Reading', 'Movies'];
    } else if (condition.includes('snow')) {
        activityAdvice = 'Snowy weather! Great for winter sports, building snowmen, or cozy indoor activities.';
        activityIcon = 'fas fa-skiing';
        activityTags = ['Winter Sports', 'Skiing', 'Indoor Fun', 'Hot Drinks'];
    } else if (temp > 20 && condition.includes('clear')) {
        activityAdvice = 'Beautiful clear weather! Perfect for outdoor activities like hiking, cycling, picnics, or sports.';
        activityIcon = 'fas fa-mountain';
        activityTags = ['Hiking', 'Cycling', 'Picnics', 'Outdoor Sports'];
    } else if (windSpeed > 5) {
        activityAdvice = 'Windy conditions! Good for flying kites or wind sports, but be careful with outdoor activities.';
        activityIcon = 'fas fa-wind';
        activityTags = ['Kite Flying', 'Wind Sports', 'Be Careful'];
    } else {
        activityAdvice = 'Moderate weather. Good for most outdoor activities. Walking, jogging, or casual outdoor dining.';
        activityIcon = 'fas fa-walking';
        activityTags = ['Walking', 'Jogging', 'Outdoor Dining'];
    }

    recommendations.push({
        icon: activityIcon,
        title: 'Activity Suggestions',
        content: activityAdvice,
        tags: activityTags
    });

    displayRecommendations(recommendations);
}

// Display recommendations in the UI
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-grid');
    if (!container) return;
    
    container.innerHTML = '';

    recommendations.forEach((rec, index) => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="recommendation-header">
                <i class="${rec.icon} recommendation-icon"></i>
                <div class="recommendation-title">${rec.title}</div>
            </div>
            <div class="recommendation-content">${rec.content}</div>
            <div class="recommendation-tags">
                ${rec.tags.map(tag => `<span class="recommendation-tag">${tag}</span>`).join('')}
            </div>
        `;

        container.appendChild(card);
    });
}

// Set current date
function setCurrentDate() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const dateElement = document.getElementById('date');
    if (dateElement) {
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Save recent search
function saveRecentSearch(city) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    
    recentSearches = recentSearches.filter(search => search.toLowerCase() !== city.toLowerCase());
    recentSearches.unshift(city);
    recentSearches = recentSearches.slice(0, 5);
    
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    updateRecentSearches();
}

// Cache weather data for offline use
function cacheWeatherData(city, data) {
    const cacheData = {
        timestamp: Date.now(),
        city: city,
        weather: data.weather,
        forecast: data.forecast
    };
    
    localStorage.setItem(`weather_${city.toLowerCase()}`, JSON.stringify(cacheData));
}

// Get cached weather data
function getCachedWeatherData(city) {
    const cached = localStorage.getItem(`weather_${city.toLowerCase()}`);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (now - data.timestamp < oneHour) {
        return data;
    }
    
    return null;
}

// Update recent searches display
function updateRecentSearches() {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const container = document.getElementById('recent-list');
    
    if (container) {
        container.innerHTML = '';
        
        recentSearches.forEach(city => {
            const tag = document.createElement('div');
            tag.className = 'recent-tag';
            tag.textContent = city;
            tag.addEventListener('click', () => {
                const cityInput = document.getElementById('city-input');
                if (cityInput) {
                    cityInput.value = city;
                    searchWeather();
                }
            });
            container.appendChild(tag);
        });
    }
}

// Listen for online/offline events
window.addEventListener('online', () => {
    showNotification('Back online! Refreshing weather data...', 'success');
    if (weatherData) {
        fetchWeatherByCity(weatherData.name);
    }
});

window.addEventListener('offline', () => {
    showNotification('You are now offline. App will use cached data.', 'warning');
});

// Auto-refresh weather data every 10 minutes
setInterval(() => {
    if (weatherData) {
        fetchWeatherByCity(weatherData.name);
    }
}, 600000);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('✅ Service Worker registered:', registration);
        })
        .catch(error => {
            console.log('❌ Service Worker registration failed:', error);
        });
}

// Initialize recent searches on page load
document.addEventListener('DOMContentLoaded', function() {
    updateRecentSearches();
});