// Weather App - Professional Interface
// Configuration
const CONFIG = {
    // Always use relative /api — the backend (port 5000) serves
    // both the frontend (express.static) AND the API endpoints.
    // This means ONE server handles everything — no CORS, no second server.
    API_BASE_URL: '/api',
    STORAGE_KEY: 'weatherapp_settings',
    VOICE_ENABLED: true,
    DEFAULT_THEME: 'night'
};

// Test API connection on startup
async function testAPIConnection() {
    try {
        // Test with a simple weather query
        const response = await fetch(`${CONFIG.API_BASE_URL}/weather?q=London`);
        if (response.ok || response.status === 401) { // 401 means API key issue, but server is responding
            console.log('✅ Backend API connection successful');
            utils.showNotification('Backend connected successfully!', 'success');
            return true;
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        console.error('❌ Backend API connection failed:', error);
        utils.showNotification('Backend connection failed. Using production API.', 'warning');
        return false; // Continue anyway for production
    }
}

// State Management
class WeatherAppState {
    constructor() {
        this.currentLocation = null;
        this.currentWeather = null;
        this.forecast = null;
        this.settings = this.loadSettings();
        this.charts = {};
        this.isListening = false;
        this.currentUnit = 'celsius';
    }

    loadSettings() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {
            theme: CONFIG.DEFAULT_THEME,
            voiceEnabled: true,
            voiceSpeed: 1,
            voicePitch: 1,
            announcementsEnabled: true,
            suggestionsEnabled: true,
            unit: 'celsius'
        };
    }

    saveSettings() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.settings));
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
}

// Initialize App State
const appState = new WeatherAppState();

// Utility Functions
const utils = {
    // Temperature conversion
    celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
    fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,
    
    // Format temperature based on current unit
    formatTemperature: (temp, unit = appState.currentUnit) => {
        const value = unit === 'fahrenheit' ? utils.celsiusToFahrenheit(temp) : temp;
        return `${Math.round(value)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
    },
    
    // Format date
    formatDate: (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format time (local to user's browser)
    formatTime: (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Get weather icon
    getWeatherIcon: (condition, isDay = true) => {
        const icons = {
            'clear sky': isDay ? '☀️' : '🌙',
            'few clouds': isDay ? '🌤️' : '🌙',
            'scattered clouds': '⛅',
            'broken clouds': '☁️',
            'shower rain': '🌦️',
            'rain': '🌧️',
            'thunderstorm': '⛈️',
            'snow': '❄️',
            'mist': '🌫️',
            'smoke': '💨',
            'haze': '🌫️',
            'dust': '💨',
            'fog': '🌫️',
            'sand': '💨',
            'ash': '💨',
            'squall': '💨',
            'tornado': '🌪️'
        };
        return icons[condition.toLowerCase()] || '🌤️';
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Show notification
    showNotification: (message, type = 'info', duration = 3000) => {
        const notification = document.getElementById('notification');
        const icon = document.getElementById('notificationIcon');
        const text = document.getElementById('notificationText');
        
        const icons = {
            info: 'fa-info-circle text-blue-300',
            success: 'fa-check-circle text-green-300',
            warning: 'fa-exclamation-triangle text-yellow-300',
            error: 'fa-times-circle text-red-300'
        };
        
        icon.className = `fas ${icons[type]}`;
        text.textContent = message;
        
        notification.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, duration);
    },
    
    // Show loading
    showLoading: (show = true) => {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.toggle('hidden', !show);
    }
};

// API Service
class APIService {
    static async request(endpoint, options = {}) {
        try {
            console.log(`📡 API Request: ${CONFIG.API_BASE_URL}${endpoint}`);
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                },
                ...options
            });

            console.log(`📡 API Response Status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} - ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log(`📡 API Response Data:`, data);
            return data;
        } catch (error) {
            console.error('❌ API request failed:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to backend server. Please ensure the backend is running on http://localhost:5000');
            }
            throw error;
        }
    }

    static async getCurrentWeather(city) {
        return await this.request(`/weather?city=${encodeURIComponent(city)}`);
    }

    static async getWeatherByCoords(lat, lon) {
        return await this.request(`/weather?lat=${lat}&lon=${lon}`);
    }

    static async getForecast(city) {
        return await this.request(`/forecast?city=${encodeURIComponent(city)}`);
    }

    static async getForecastByCoords(lat, lon) {
        return await this.request(`/forecast?lat=${lat}&lon=${lon}`);
    }

    static async getAirPollution(lat, lon) {
        return await this.request(`/air-pollution?lat=${lat}&lon=${lon}`);
    }

    static async getHealthAdvice(condition, aqi) {
        return await this.request(`/health?condition=${condition}&aqi=${aqi}`);
    }
}

// Voice Assistant
class VoiceAssistant {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.recognition = null;
        this.isSupported = 'speechSynthesis' in window;
        this.setupRecognition();
    }

    setupRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 5; // Get multiple alternatives

            this.recognition.onstart = () => {
                appState.isListening = true;
                this.showVoiceStatus(true);
                console.log('Voice recognition started');
                utils.showNotification('Listening... Speak now!', 'info', 2000);
            };

            this.recognition.onend = () => {
                appState.isListening = false;
                this.showVoiceStatus(false);
                // Reset status text
                const statusText = document.getElementById('voiceStatusText');
                if (statusText) statusText.textContent = 'Listening...';
                console.log('Voice recognition ended');
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Show interim text live in status bar
                const statusText = document.getElementById('voiceStatusText');
                if (statusText) {
                    statusText.textContent = interimTranscript || finalTranscript || 'Listening...';
                }

                // Only process when we have a final result
                if (finalTranscript.trim().length > 0) {
                    const command = finalTranscript.toLowerCase().trim();
                    console.log(`Final transcript: "${command}"`);
                    this.processVoiceCommand(command);
                }
            };


            this.recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                let errorMessage = 'Voice recognition error. ';
                
                switch(event.error) {
                    case 'no-speech':
                        errorMessage += 'No speech detected. Please try again.';
                        break;
                    case 'audio-capture':
                        errorMessage += 'Microphone not accessible.';
                        break;
                    case 'not-allowed':
                        errorMessage += 'Microphone permission denied.';
                        break;
                    case 'network':
                        errorMessage += 'Network error occurred.';
                        break;
                    default:
                        errorMessage += 'Please try again.';
                }
                
                utils.showNotification(errorMessage, 'error');
                this.showVoiceStatus(false);
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }

    speak(text) {
        if (!this.isSupported || !appState.settings.voiceEnabled) return;

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = appState.settings.voiceSpeed;
        utterance.pitch = appState.settings.voicePitch;
        utterance.volume = 0.8;

        this.synthesis.speak(utterance);
    }

    startListening() {
        if (!this.recognition) {
            utils.showNotification('Voice recognition not supported in this browser', 'error');
            return;
        }

        if (appState.isListening) {
            this.recognition.stop();
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            utils.showNotification('Failed to start voice recognition', 'error');
        }
    }

    processVoiceCommand(command) {
        console.log('Processing voice command:', command);
        
        const commands = {
            'weather': () => {
                const city = this.extractCityFromCommand(command);
                if (city) {
                    weatherApp.searchWeather(city);
                    this.speak(`Searching weather for ${city}`);
                } else {
                    this.speak('Please specify a city name');
                }
            },
            'location': () => {
                weatherApp.getCurrentLocation();
                this.speak('Getting your current location weather');
            },
            'current location': () => {
                weatherApp.getCurrentLocation();
                this.speak('Getting your current location weather');
            },
            'my location': () => {
                weatherApp.getCurrentLocation();
                this.speak('Getting your current location weather');
            },
            'forecast': () => {
                this.speak('Showing 5-day forecast');
                // Forecast is already shown, just announce it
            },
            'theme': () => {
                const theme = this.extractThemeFromCommand(command);
                if (theme) {
                    themeManager.setTheme(theme);
                    // Disable auto theme when user manually selects via voice
                    const autoToggle = document.getElementById('autoThemeToggle');
                    if (autoToggle) autoToggle.checked = false;
                    this.speak(`Switched to ${theme} theme`);
                } else {
                    // Cycle through themes if no specific theme mentioned
                    const nextTheme = themeManager.getNextTheme();
                    themeManager.setTheme(nextTheme);
                    this.speak(`Switched to ${nextTheme} theme`);
                }
            },
            'change theme': () => {
                const nextTheme = themeManager.getNextTheme();
                themeManager.setTheme(nextTheme);
                this.speak(`Switched to ${nextTheme} theme`);
            },
            'dark theme': () => {
                themeManager.setTheme('night');
                this.speak('Switched to dark night theme');
            },
            'cosmic': () => {
                themeManager.setTheme('cosmic');
                this.speak('Switched to cosmic theme');
            },
            'ocean': () => {
                themeManager.setTheme('ocean');
                this.speak('Switched to ocean theme');
            },
            'sunset': () => {
                themeManager.setTheme('sunset');
                this.speak('Switched to sunset theme');
            },
            'forest': () => {
                themeManager.setTheme('forest');
                this.speak('Switched to forest theme');
            },
            'night': () => {
                themeManager.setTheme('night');
                this.speak('Switched to night theme');
            },
            'aurora': () => {
                themeManager.setTheme('aurora');
                this.speak('Switched to aurora theme');
            },
            'volcano': () => {
                themeManager.setTheme('volcano');
                this.speak('Switched to volcano theme');
            },
            'cyber': () => {
                themeManager.setTheme('cyber');
                this.speak('Switched to cyber theme');
            },
            'help': () => {
                this.speak('You can say: weather for city name, get my location, show forecast, change theme, or help for commands. You can also say specific theme names like cosmic, ocean, sunset, forest, night, aurora, volcano, or cyber.');
            }
        };

        // Find matching command
        for (const [key, action] of Object.entries(commands)) {
            if (command.includes(key)) {
                action();
                return;
            }
        }

        // Try to extract city name from various patterns
        const cityPatterns = [
            /weather (?:for |in )?(.+)/,
            /(.+) weather/,
            /search (?:for )?(.+)/,
            /show weather (?:for |in )?(.+)/,
            /get weather (?:for |in )?(.+)/,
            /what's the weather (?:for |in )?(.+)/,
            /how's the weather (?:for |in )?(.+)/
        ];

        for (const pattern of cityPatterns) {
            const match = command.match(pattern);
            if (match) {
                const city = match[1].trim().replace(/^(for|in)\s+/, '');
                weatherApp.searchWeather(city);
                this.speak(`Searching weather for ${city}`);
                return;
            }
        }

        // Smart fallback: treat the whole phrase as a city name
        const cityGuess = command.trim().replace(/^(search|show|get|find|check)\s+/i, '');
        if (cityGuess.length > 0 && cityGuess.split(' ').length <= 4) {
            console.log(`Voice fallback — treating as city: "${cityGuess}"`);
            weatherApp.searchWeather(cityGuess);
            this.speak(`Searching weather for ${cityGuess}`);
        } else {
            this.speak('I understand commands like: weather for London, get my location, or help for more options.');
        }
    }

    extractCityFromCommand(command) {
        const patterns = [
            /weather (?:for |in )?(.+)/,
            /(.+) weather/,
            /search (?:for )?(.+)/
        ];

        for (const pattern of patterns) {
            const match = command.match(pattern);
            if (match) {
                return match[1].trim().replace(/^(for|in)\s+/, '');
            }
        }
        return null;
    }

    extractThemeFromCommand(command) {
        const themes = ['cosmic', 'ocean', 'sunset', 'forest', 'night', 'aurora', 'volcano', 'cyber'];
        for (const theme of themes) {
            if (command.includes(theme)) {
                return theme;
            }
        }
        return null;
    }

    showVoiceStatus(show) {
        const status = document.getElementById('voiceStatus');
        if (show) {
            status.classList.add('active');
        } else {
            status.classList.remove('active');
        }
        // Also update the mic button visual state
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            if (show) {
                voiceBtn.style.background = 'rgba(248,113,113,0.2)';
                voiceBtn.style.borderColor = '#f87171';
                voiceBtn.style.color = '#f87171';
                voiceBtn.title = 'Stop listening';
            } else {
                voiceBtn.style.background = '';
                voiceBtn.style.borderColor = '';
                voiceBtn.style.color = '';
                voiceBtn.title = 'Voice search';
            }
        }
    }

    announceWeather(weather) {
        if (!appState.settings.announcementsEnabled) return;

        const temp = utils.formatTemperature(weather.main.temp);
        const condition = weather.weather[0].description;
        const city = weather.name;

        const announcement = `Current weather in ${city}: ${temp}, ${condition}. 
                            Humidity is ${weather.main.humidity}% and wind speed is ${Math.round(weather.wind.speed * 3.6)} kilometers per hour.`;
        
        this.speak(announcement);
    }
}

// Initialize Voice Assistant
const voiceAssistant = new VoiceAssistant();

// Theme Manager
class ThemeManager {
    constructor() {
        this.themes = ['cosmic', 'ocean', 'sunset', 'forest', 'night', 'aurora', 'volcano', 'cyber'];
        this.currentTheme = appState.settings.theme;
        this.setTheme(this.currentTheme);
    }

    setTheme(themeName) {
        if (!this.themes.includes(themeName)) {
            console.warn(`Theme "${themeName}" not found. Available themes:`, this.themes);
            return;
        }

        console.log(`Changing theme to: ${themeName}`);

        // Remove all theme classes
        document.body.classList.remove(...this.themes.map(t => `theme-${t}`));
        
        // Add new theme class
        document.body.classList.add(`theme-${themeName}`);
        
        this.currentTheme = themeName;
        appState.updateSetting('theme', themeName);
        
        // Update theme button indicators
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-white');
            if (btn.dataset.theme === themeName) {
                btn.classList.add('ring-2', 'ring-white');
            }
        });
        
        utils.showNotification(`Theme changed to ${themeName}`, 'success');
        console.log(`Theme successfully set to: ${themeName}. Body classes:`, document.body.classList.toString());
    }

    getNextTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        return this.themes[nextIndex];
    }
}

// Initialize Theme Manager
const themeManager = new ThemeManager();

// Chart Manager
class ChartManager {
    constructor() {
        this.charts = {};
    }

    createTemperatureChart(forecastData) {
        const ctx = document.getElementById('temperatureChart');
        if (!ctx) return;

        if (this.charts.temperature) {
            this.charts.temperature.destroy();
        }

        const labels = forecastData.slice(0, 8).map(item => 
            new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        );

        const temperatures = forecastData.slice(0, 8).map(item => 
            appState.currentUnit === 'fahrenheit' 
                ? utils.celsiusToFahrenheit(item.main.temp)
                : item.main.temp
        );

        this.charts.temperature = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `Temperature (°${appState.currentUnit === 'fahrenheit' ? 'F' : 'C'})`,
                    data: temperatures,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    createHumidityChart(forecastData) {
        const ctx = document.getElementById('humidityChart');
        if (!ctx) return;

        if (this.charts.humidity) {
            this.charts.humidity.destroy();
        }

        const labels = forecastData.slice(0, 8).map(item => 
            new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        );

        const humidity = forecastData.slice(0, 8).map(item => item.main.humidity);

        this.charts.humidity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Humidity (%)',
                    data: humidity,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateCharts(forecastData) {
        this.createTemperatureChart(forecastData);
        this.createHumidityChart(forecastData);
    }
}

// Initialize Chart Manager
const chartManager = new ChartManager();

// Main Weather App Class
class WeatherApp {
    constructor() {
        this.initializeEventListeners();
        this.setupSearch();
        this.loadLastLocation();
        this.initializeThemeSettings();
    }

    initializeThemeSettings() {
        // Set auto theme to false by default (user choice theme)
        const autoThemeToggle = document.getElementById('autoThemeToggle');
        if (autoThemeToggle) {
            autoThemeToggle.checked = false;
        }
        
        // Apply default theme
        themeManager.setTheme(CONFIG.DEFAULT_THEME);
    }

    initializeEventListeners() {
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => {
            const city = document.getElementById('cityInput').value.trim();
            if (city) {
                this.searchWeather(city);
            }
        });

        // Enter key for search
        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = e.target.value.trim();
                if (city) {
                    this.searchWeather(city);
                }
            }
        });

        // Location button
        document.getElementById('locationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Voice search button
        document.getElementById('voiceSearchBtn').addEventListener('click', () => {
            voiceAssistant.startListening();
        });

        // Voice assistant button
        document.getElementById('voiceBtn').addEventListener('click', () => {
            voiceAssistant.startListening();
        });

        // Theme button and dropdown
        const themeBtn = document.getElementById('themeBtn');
        const themeDropdown = document.getElementById('themeDropdown');
        
        if (!themeBtn) {
            console.error('Theme button not found!');
            return;
        }
        if (!themeDropdown) {
            console.error('Theme dropdown not found!');
            return;
        }
        
        console.log('Theme button and dropdown found successfully');
        
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Theme button clicked!');
            console.log('Dropdown current classes:', themeDropdown.classList.toString());
            
            themeDropdown.classList.toggle('hidden');
            
            console.log('Dropdown classes after toggle:', themeDropdown.classList.toString());
            
            // Add visual feedback
            if (!themeDropdown.classList.contains('hidden')) {
                console.log('Theme dropdown is now visible');
                utils.showNotification('Select a theme', 'info', 1000);
            } else {
                console.log('Theme dropdown is now hidden');
            }
        });

        // Theme selection
        const themeOptions = document.querySelectorAll('.theme-option');
        console.log(`Found ${themeOptions.length} theme option buttons`);
        
        themeOptions.forEach((button, index) => {
            const theme = button.dataset.theme;
            console.log(`Theme button ${index}: ${theme}`);
            
            button.addEventListener('click', () => {
                console.log(`Theme option clicked: ${theme}`);
                themeManager.setTheme(theme);
                
                const dropdown = document.getElementById('themeDropdown');
                if (dropdown) {
                    dropdown.classList.add('hidden');
                }
                
                // Disable auto theme when user manually selects
                const autoToggle = document.getElementById('autoThemeToggle');
                if (autoToggle) {
                    autoToggle.checked = false;
                }
            });
        });

        // Auto theme toggle
        document.getElementById('autoThemeToggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                // Re-apply weather-based background if auto theme is enabled
                const weather = appState.currentWeather;
                if (weather) {
                    const isDay = this.isDayTime(weather.dt, weather.timezone);
                    this.updateWeatherBackground(weather.weather[0].main.toLowerCase(), isDay);
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('themeDropdown');
            const themeBtn = document.getElementById('themeBtn');
            if (!themeBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        // Temperature unit toggle
        document.getElementById('celsiusBtn').addEventListener('click', () => {
            this.setTemperatureUnit('celsius');
        });

        document.getElementById('fahrenheitBtn').addEventListener('click', () => {
            this.setTemperatureUnit('fahrenheit');
        });

        // Modal close buttons
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        // Note: Theme selection handled in earlier theme button listener

        // Settings toggles
        this.setupSettingsEventListeners();

        // Click outside modals to close
        document.addEventListener('click', (e) => {
            const settingsModal = document.getElementById('settingsModal');
            
            if (e.target === settingsModal) {
                this.hideSettingsModal();
            }
        });
    }

    setupSettingsEventListeners() {
        // Voice settings
        document.getElementById('voiceToggle').addEventListener('change', (e) => {
            appState.updateSetting('voiceEnabled', e.target.checked);
        });

        document.getElementById('voiceSpeed').addEventListener('input', (e) => {
            appState.updateSetting('voiceSpeed', parseFloat(e.target.value));
        });

        document.getElementById('voicePitch').addEventListener('input', (e) => {
            appState.updateSetting('voicePitch', parseFloat(e.target.value));
        });

        document.getElementById('announcementToggle').addEventListener('change', (e) => {
            appState.updateSetting('announcementsEnabled', e.target.checked);
        });

        document.getElementById('suggestionsToggle').addEventListener('change', (e) => {
            appState.updateSetting('suggestionsEnabled', e.target.checked);
        });

        // Initialize setting values
        document.getElementById('voiceToggle').checked = appState.settings.voiceEnabled;
        document.getElementById('voiceSpeed').value = appState.settings.voiceSpeed;
        document.getElementById('voicePitch').value = appState.settings.voicePitch;
        document.getElementById('announcementToggle').checked = appState.settings.announcementsEnabled;
        document.getElementById('suggestionsToggle').checked = appState.settings.suggestionsEnabled;
    }

    setupSearch() {
        const cityInput = document.getElementById('cityInput');
        const suggestionsContainer = document.getElementById('suggestions');

        // City suggestions (mock data - in real app, you'd use a proper API)
        const popularCities = [
            'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai', 'Dubai', 'Singapore',
            'Los Angeles', 'Chicago', 'Toronto', 'Vancouver', 'Amsterdam', 'Berlin', 'Rome',
            'Barcelona', 'Seoul', 'Bangkok', 'Hong Kong', 'Delhi', 'Bangalore', 'Hyderabad',
            'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
        ];

        const debouncedSearch = utils.debounce((query) => {
            if (!appState.settings.suggestionsEnabled || query.length < 2) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            const matches = popularCities.filter(city => 
                city.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);

            if (matches.length > 0) {
                suggestionsContainer.innerHTML = matches.map(city => 
                    `<div class="suggestion-item p-3 text-white hover:bg-white/10 cursor-pointer rounded-lg transition-colors duration-200" data-city="${city}">
                        <i class="fas fa-map-marker-alt mr-2 text-blue-300"></i>
                        ${city}
                    </div>`
                ).join('');

                suggestionsContainer.classList.remove('hidden');

                // Add click listeners to suggestions
                suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const city = item.dataset.city;
                        cityInput.value = city;
                        suggestionsContainer.classList.add('hidden');
                        this.searchWeather(city);
                    });
                });
            } else {
                suggestionsContainer.classList.add('hidden');
            }
        }, 300);

        cityInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!cityInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }

    async searchWeather(city) {
        try {
            utils.showLoading(true);
            utils.showNotification(`Searching weather for ${city}...`, 'info');

            const weatherData = await APIService.getCurrentWeather(city);
            const forecastData = await APIService.getForecast(city);

            appState.currentWeather = weatherData;
            appState.forecast = forecastData;
            appState.currentLocation = city;

            // Add smooth transition for background change
            this.addWeatherTransition();

            this.displayCurrentWeather(weatherData);
            this.displayHourlyForecast(forecastData);
            this.displayForecast(forecastData);
            
            // Get air quality data
            const { lat, lon } = weatherData.coord;
            try {
                const airQualityData = await APIService.getAirPollution(lat, lon);
                this.displayAirQuality(airQualityData);
            } catch (error) {
                console.error('Failed to load air quality data:', error);
            }

            // Update charts
            chartManager.updateCharts(forecastData.list);

            // Voice announcement — only if user explicitly enabled it
            if (appState.settings.voiceEnabled && appState.settings.announcementsEnabled) {
                voiceAssistant.announceWeather(weatherData);
            }

            // Save last searched location
            localStorage.setItem('lastLocation', city);

            // Clear search input
            document.getElementById('cityInput').value = '';
            document.getElementById('suggestions').classList.add('hidden');

            utils.showNotification(`Weather loaded for ${city}`, 'success');

        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            utils.showNotification('Failed to fetch weather data. Please try again.', 'error');
            voiceAssistant.speak('Sorry, I couldn\'t get the weather data for that location.');
        } finally {
            utils.showLoading(false);
        }
    }

    addWeatherTransition() {
        const weatherBg = document.getElementById('weatherBackground');
        weatherBg.style.transition = 'all 2s ease-in-out';
        
        // Remove transition after animation completes
        setTimeout(() => {
            weatherBg.style.transition = '';
        }, 2000);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            utils.showNotification('Geolocation is not supported by this browser', 'error');
            return;
        }

        utils.showLoading(true);
        utils.showNotification('📍 Getting your precise location...', 'info', 4000);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude, accuracy } = position.coords;
                    console.log(`📍 GPS coords: ${latitude}, ${longitude} (accuracy: ${Math.round(accuracy)}m)`);

                    // Fetch weather directly by coordinates — backend returns real city name
                    const weatherData = await APIService.getWeatherByCoords(latitude, longitude);
                    const forecastData = await APIService.getForecastByCoords(latitude, longitude);

                    appState.currentWeather = weatherData;
                    appState.forecast = forecastData;
                    appState.currentLocation = weatherData.name;

                    this.addWeatherTransition();
                    this.displayCurrentWeather(weatherData);
                    this.displayHourlyForecast(forecastData);
                    this.displayForecast(forecastData);

                    // Air quality
                    try {
                        const airQualityData = await APIService.getAirPollution(latitude, longitude);
                        this.displayAirQuality(airQualityData);
                    } catch (e) {
                        console.error('Air quality fetch failed:', e);
                    }

                    chartManager.updateCharts(forecastData.list);

                    if (appState.settings.voiceEnabled && appState.settings.announcementsEnabled) {
                        voiceAssistant.announceWeather(weatherData);
                    }

                    localStorage.setItem('lastLocation', weatherData.name);
                    document.getElementById('cityInput').value = '';

                    utils.showNotification(
                        `📍 Weather loaded for ${weatherData.name}, ${weatherData.sys.country} (±${Math.round(accuracy)}m accuracy)`,
                        'success',
                        4000
                    );

                } catch (error) {
                    console.error('Location weather fetch error:', error);
                    utils.showNotification('Failed to get weather for your location. Please try again.', 'error');
                } finally {
                    utils.showLoading(false);
                }
            },
            (error) => {
                console.error('Geolocation permission error:', error);
                let msg = 'Unable to access your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg += 'Please allow location access in your browser.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        msg += 'Location request timed out.';
                        break;
                }
                utils.showNotification(msg, 'error', 5000);
                utils.showLoading(false);
            },
            {
                enableHighAccuracy: true,   // Use GPS for precise location
                timeout: 15000,             // Wait up to 15s for GPS lock
                maximumAge: 0              // Always get fresh position
            }
        );
    }

    displayCurrentWeather(weather) {
        // Hide empty state, show weather sections
        const empty = document.getElementById('emptyState');
        if(empty) empty.style.display = 'none';
        // Support both old ID (currentWeather) and new ID (heroSection)
        const heroEl = document.getElementById('heroSection') || document.getElementById('currentWeather');
        if(heroEl) heroEl.classList.remove('hidden');
        // Also handle original ID for compatibility
        const cw = document.getElementById('currentWeather');
        if(cw && cw !== heroEl) cw.classList.remove('hidden');

        // Update elements
        document.getElementById('cityName').textContent = weather.name;
        document.getElementById('countryName').textContent = weather.sys.country;
        document.getElementById('temperature').textContent = utils.formatTemperature(weather.main.temp);
        document.getElementById('description').textContent = weather.weather[0].description;
        document.getElementById('feelsLike').textContent = `Feels like ${utils.formatTemperature(weather.main.feels_like)}`;
        
        // Weather icon
        const isDay = this.isDayTime(weather.sys.sunrise, weather.sys.sunset);
        document.getElementById('weatherIcon').textContent = utils.getWeatherIcon(weather.weather[0].description, isDay);

        // Weather details
        document.getElementById('visibility').textContent = `${(weather.visibility / 1000).toFixed(1)} km`;
        document.getElementById('humidity').textContent = `${weather.main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${Math.round(weather.wind.speed * 3.6)} km/h`;
        document.getElementById('pressure').textContent = `${weather.main.pressure} hPa`;

        // Sunrise / Sunset strip
        this.displaySunCycle(weather);

        // Update active unit button
        this.updateUnitButtons();

        // Update animated background based on weather (only if auto theme is enabled)
        if (this.isAutoThemeEnabled()) {
            this.updateWeatherBackground(weather.weather[0].main.toLowerCase(), isDay);
        }
    }

    displaySunCycle(weather) {
        const sunrise = weather.sys.sunrise;
        const sunset = weather.sys.sunset;
        const now = Math.floor(Date.now() / 1000);

        document.getElementById('sunriseTime').textContent = `Sunrise ${utils.formatTime(sunrise)}`;
        document.getElementById('sunsetTime').textContent = `Sunset ${utils.formatTime(sunset)}`;

        const daySeconds = Math.max(0, sunset - sunrise);
        const dayHours = Math.floor(daySeconds / 3600);
        const dayMinutes = Math.floor((daySeconds % 3600) / 60);
        document.getElementById('dayLength').textContent = `Daylight ${dayHours}h ${dayMinutes}m`;

        let progress = 0;
        if (now > sunrise && now < sunset && daySeconds > 0) {
            progress = ((now - sunrise) / daySeconds) * 100;
        } else if (now >= sunset) {
            progress = 100;
        }

        document.getElementById('sunProgress').style.width = `${Math.min(100, Math.max(0, progress)).toFixed(1)}%`;
    }

    displayHourlyForecast(forecast) {
        const section = document.getElementById('hourlySection');
        const container = document.getElementById('hourlyContainer');

        const upcoming = forecast.list.slice(0, 8);
        container.innerHTML = upcoming.map((item, index) => {
            const label = index === 0
                ? 'Now'
                : new Date(item.dt * 1000).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true
                });

            return `
                <div class="hourly-item">
                    <div class="text-xs text-slate-200 mb-2">${label}</div>
                    <div class="text-3xl mb-2">${utils.getWeatherIcon(item.weather[0].description)}</div>
                    <div class="text-white font-semibold">${utils.formatTemperature(item.main.temp)}</div>
                    <div class="text-xs text-slate-300 mt-1 capitalize">${item.weather[0].main}</div>
                    <div class="text-xs text-cyan-200 mt-2"><i class="fas fa-tint mr-1"></i>${item.main.humidity}%</div>
                </div>
            `;
        }).join('');

        section.classList.remove('hidden');
    }

    isAutoThemeEnabled() {
        const autoThemeToggle = document.getElementById('autoThemeToggle');
        return autoThemeToggle && autoThemeToggle.checked;
    }

    updateWeatherBackground(weatherCondition, isDay) {
        const weatherBg = document.getElementById('weatherBackground');
        const sunElement = document.getElementById('sunElement');
        const rainContainer = document.getElementById('rainContainer');
        const snowContainer = document.getElementById('snowContainer');
        const starsContainer = document.getElementById('starsContainer');
        const lightningEffect = document.getElementById('lightningEffect');

        // Clear all weather-specific classes and elements
        weatherBg.className = 'weather-bg';
        sunElement.style.display = 'none';
        rainContainer.style.display = 'none';
        rainContainer.innerHTML = '';
        snowContainer.style.display = 'none';
        snowContainer.innerHTML = '';
        starsContainer.style.display = 'none';
        starsContainer.innerHTML = '';
        lightningEffect.style.display = 'none';

        // Apply weather-specific backgrounds and animations
        switch (weatherCondition) {
            case 'clear':
                if (isDay) {
                    weatherBg.classList.add('sunny-bg');
                    sunElement.style.display = 'block';
                    this.createFloatingElements('☀️', 3);
                } else {
                    weatherBg.classList.add('night-bg');
                    this.createStars();
                    this.createFloatingElements('🌙', 2);
                }
                break;
                
            case 'clouds':
                weatherBg.classList.add('cloudy-bg');
                this.createFloatingElements('☁️', 5);
                break;
                
            case 'rain':
            case 'drizzle':
                weatherBg.classList.add('rainy-bg');
                this.createRainDrops();
                this.createFloatingElements('🌧️', 3);
                break;
                
            case 'thunderstorm':
                weatherBg.classList.add('rainy-bg');
                this.createRainDrops();
                this.createLightning();
                this.createFloatingElements('⛈️', 2);
                break;
                
            case 'snow':
                weatherBg.classList.add('snowy-bg');
                this.createSnowFlakes();
                this.createFloatingElements('❄️', 4);
                break;
                
            case 'mist':
            case 'fog':
            case 'haze':
                weatherBg.classList.add('cloudy-bg');
                this.createFloatingElements('🌫️', 4);
                break;
                
            default:
                if (isDay) {
                    weatherBg.classList.add('sunny-bg');
                    sunElement.style.display = 'block';
                } else {
                    weatherBg.classList.add('night-bg');
                    this.createStars();
                }
        }
    }

    createRainDrops() {
        const rainContainer = document.getElementById('rainContainer');
        rainContainer.style.display = 'block';
        
        // Reduced from 50 to 20 raindrops for subtlety
        for (let i = 0; i < 20; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 2 + 's';
            drop.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
            rainContainer.appendChild(drop);
        }
    }

    createSnowFlakes() {
        const snowContainer = document.getElementById('snowContainer');
        snowContainer.style.display = 'block';
        
        const snowSymbols = ['❄', '❅', '🌨'];
        
        // Reduced from 30 to 15 snowflakes for subtlety
        for (let i = 0; i < 15; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.textContent = snowSymbols[Math.floor(Math.random() * snowSymbols.length)];
            flake.style.left = Math.random() * 100 + '%';
            flake.style.fontSize = (Math.random() * 8 + 8) + 'px'; // Smaller size
            flake.style.animationDelay = Math.random() * 15 + 's';
            flake.style.animationDuration = (Math.random() * 10 + 10) + 's';
            snowContainer.appendChild(flake);
        }
    }

    createStars() {
        const starsContainer = document.getElementById('starsContainer');
        starsContainer.style.display = 'block';
        
        // Reduced from 100 to 40 stars for subtlety
        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 60 + '%';
            star.style.animationDelay = Math.random() * 4 + 's';
            starsContainer.appendChild(star);
        }
    }

    createLightning() {
        const lightningEffect = document.getElementById('lightningEffect');
        lightningEffect.style.display = 'block';
    }

    createFloatingElements(emoji, count) {
        // Remove existing floating elements
        document.querySelectorAll('.dynamic-floating').forEach(el => el.remove());
        
        // Reduced count for subtlety
        const subtleCount = Math.min(count, 3);
        
        for (let i = 0; i < subtleCount; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element dynamic-floating';
            element.style.fontSize = (Math.random() * 20 + 15) + 'px'; // Smaller size
            element.style.top = Math.random() * 80 + '%';
            element.style.left = Math.random() * 100 + '%';
            element.style.setProperty('--duration', (Math.random() * 20 + 30) + 's'); // Slower
            element.style.opacity = '0.4'; // More transparent
            element.textContent = emoji;
            element.style.animationDelay = Math.random() * 10 + 's';
            document.body.appendChild(element);
        }
    }

    displayForecast(forecast) {
        const container = document.getElementById('forecastContainer');
        const section = document.getElementById('forecastSection');
        
        // Group forecast by day
        const dailyForecast = this.groupForecastByDay(forecast.list);
        
        container.innerHTML = dailyForecast.map(day => `
            <div class="glass-subtle rounded-xl p-4 text-center hover:glow-blue transition-all duration-300">
                <div class="text-white font-medium mb-2">${day.date}</div>
                <div class="text-4xl mb-2">${day.icon}</div>
                <div class="text-white text-lg font-semibold mb-1">
                    ${utils.formatTemperature(day.maxTemp)}
                </div>
                <div class="text-blue-200 text-sm mb-2">
                    ${utils.formatTemperature(day.minTemp)}
                </div>
                <div class="text-blue-300 text-sm capitalize mb-2">
                    ${day.description}
                </div>
                <div class="flex justify-center items-center gap-2 text-xs text-blue-200">
                    <span><i class="fas fa-tint"></i> ${day.humidity}%</span>
                    <span><i class="fas fa-wind"></i> ${Math.round(day.windSpeed * 3.6)}km/h</span>
                </div>
            </div>
        `).join('');

        section.classList.remove('hidden');
    }

    displayAirQuality(airQuality) {
        const section = document.getElementById('airQualitySection');
        const data = airQuality.list[0];
        const aqi = data.main.aqi;
        
        // AQI status mapping
        const aqiStatus = {
            1: { text: 'Good', class: 'bg-green-500' },
            2: { text: 'Fair', class: 'bg-yellow-500' },
            3: { text: 'Moderate', class: 'bg-orange-500' },
            4: { text: 'Poor', class: 'bg-red-500' },
            5: { text: 'Very Poor', class: 'bg-purple-500' }
        };

        const status = aqiStatus[aqi] || { text: 'Unknown', class: 'bg-gray-500' };

        // Update AQI display
        document.getElementById('aqiValue').textContent = aqi;
        const statusElement = document.getElementById('aqiStatus');
        statusElement.textContent = status.text;
        statusElement.className = `px-3 py-1 rounded-full text-xs font-medium text-white ${status.class}`;

        // Update pollutant values
        document.getElementById('coValue').textContent = `${data.components.co.toFixed(1)} μg/m³`;
        document.getElementById('no2Value').textContent = `${data.components.no2.toFixed(1)} μg/m³`;
        document.getElementById('pm25Value').textContent = `${data.components.pm2_5.toFixed(1)} μg/m³`;

        section.classList.remove('hidden');
    }

    groupForecastByDay(forecastList) {
        const grouped = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!grouped[dayKey]) {
                grouped[dayKey] = {
                    date: utils.formatDate(item.dt),
                    items: [],
                    maxTemp: -Infinity,
                    minTemp: Infinity,
                    descriptions: [],
                    humidity: 0,
                    windSpeed: 0
                };
            }
            
            grouped[dayKey].items.push(item);
            grouped[dayKey].maxTemp = Math.max(grouped[dayKey].maxTemp, item.main.temp_max);
            grouped[dayKey].minTemp = Math.min(grouped[dayKey].minTemp, item.main.temp_min);
            grouped[dayKey].descriptions.push(item.weather[0].description);
        });

        // Process grouped data
        return Object.values(grouped).slice(0, 5).map(day => {
            const avgHumidity = day.items.reduce((sum, item) => sum + item.main.humidity, 0) / day.items.length;
            const avgWindSpeed = day.items.reduce((sum, item) => sum + item.wind.speed, 0) / day.items.length;
            const mostCommonDescription = this.getMostCommon(day.descriptions);
            
            return {
                date: day.date,
                maxTemp: day.maxTemp,
                minTemp: day.minTemp,
                description: mostCommonDescription,
                icon: utils.getWeatherIcon(mostCommonDescription),
                humidity: Math.round(avgHumidity),
                windSpeed: avgWindSpeed
            };
        });
    }

    getMostCommon(arr) {
        const frequency = {};
        let maxCount = 0;
        let mostCommon = arr[0];
        
        arr.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
            if (frequency[item] > maxCount) {
                maxCount = frequency[item];
                mostCommon = item;
            }
        });
        
        return mostCommon;
    }

    isDayTime(sunrise, sunset) {
        const now = Date.now() / 1000;
        return now >= sunrise && now <= sunset;
    }

    setTemperatureUnit(unit) {
        appState.currentUnit = unit;
        appState.updateSetting('unit', unit);
        
        this.updateUnitButtons();
        
        // Refresh current weather display
        if (appState.currentWeather) {
            this.displayCurrentWeather(appState.currentWeather);
        }
        
        // Update charts
        if (appState.forecast) {
            chartManager.updateCharts(appState.forecast.list);
        }
        
        // Update forecast
        if (appState.forecast) {
            this.displayForecast(appState.forecast);
        }
    }

    updateUnitButtons() {
        const celsiusBtn = document.getElementById('celsiusBtn');
        const fahrenheitBtn = document.getElementById('fahrenheitBtn');

        if (appState.currentUnit === 'celsius') {
            celsiusBtn.classList.add('active');
            fahrenheitBtn.classList.remove('active');
        } else {
            fahrenheitBtn.classList.add('active');
            celsiusBtn.classList.remove('active');
        }
    }

    // Theme modal functions removed - theme is now in header dropdown

    showSettingsModal() {
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    loadLastLocation() {
        const lastLocation = localStorage.getItem('lastLocation');
        if (lastLocation) {
            // Auto-load last searched location after a short delay
            setTimeout(() => {
                this.searchWeather(lastLocation);
            }, 1000);
        } else {
            // Show demo background animation if no previous location
            this.showDemoWeatherAnimation();
        }
    }

    showDemoWeatherAnimation() {
        const demoWeathers = [
            { condition: 'clear', isDay: true },
            { condition: 'clouds', isDay: true },
            { condition: 'rain', isDay: true },
            { condition: 'thunderstorm', isDay: false },
            { condition: 'snow', isDay: true },
            { condition: 'clear', isDay: false }
        ];

        let currentIndex = 0;

        const cycleWeather = () => {
            const weather = demoWeathers[currentIndex];
            this.updateWeatherBackground(weather.condition, weather.isDay);
            
            currentIndex = (currentIndex + 1) % demoWeathers.length;
            
            if (currentIndex === 0) {
                // Stop demo after one complete cycle
                return;
            }
            
            setTimeout(cycleWeather, 3000);
        };

        // Start demo
        setTimeout(cycleWeather, 2000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Test API connection first
    const apiConnected = await testAPIConnection();
    
    if (apiConnected) {
        utils.showNotification('WeatherSphere initialized! Try searching for a city or use voice commands.', 'success', 5000);
    } else {
        utils.showNotification('Backend connection failed! Please start the backend server on port 5000.', 'error', 10000);
    }
    
    // Initialize the main app
    const weatherApp = new WeatherApp();
    
    // Make weatherApp globally accessible for voice commands
    window.weatherApp = weatherApp;
    
    // Add theme testing function for debugging
    window.testTheme = (themeName) => {
        console.log(`Testing theme: ${themeName}`);
        themeManager.setTheme(themeName);
    };
    
    // Add voice testing function
    window.testVoice = (command) => {
        console.log(`Testing voice command: ${command}`);
        voiceAssistant.processVoiceCommand(command);
    };
    
    // Add theme dropdown testing function
    window.showThemeDropdown = () => {
        const dropdown = document.getElementById('themeDropdown');
        if (dropdown) {
            dropdown.classList.remove('hidden');
            console.log('Theme dropdown manually shown');
        } else {
            console.error('Theme dropdown not found');
        }
    };
    
    window.hideThemeDropdown = () => {
        const dropdown = document.getElementById('themeDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
            console.log('Theme dropdown manually hidden');
        }
    };
    
    // Log available themes for debugging
    console.log('Available themes:', themeManager.themes);
    console.log('Current theme:', themeManager.currentTheme);
    console.log('Body classes:', document.body.classList.toString());
    
    // Add some interactive elements
    const charts = document.getElementById('chartsSection');
    charts.classList.remove('hidden');
    
    console.log('WeatherSphere Professional - Ready to use! 🌤️');
    
    // Load a default city to show demo data
    if (apiConnected) {
        setTimeout(() => {
            weatherApp.searchWeather('London');
        }, 2000);
    }
    
    // Easter egg: Konami code for special theme
    let konamiCode = [];
    const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.toString() === konami.toString()) {
            document.body.style.background = 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
            document.body.style.backgroundSize = '400% 400%';
            document.body.style.animation = 'rainbow 2s linear infinite';
            utils.showNotification('🎉 Special Rainbow Theme Activated!', 'success');
            voiceAssistant.speak('Congratulations! You found the secret rainbow theme!');
        }
    });
});

// Service Worker Registration for PWA features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export for use in other modules
window.WeatherApp = WeatherApp;
window.voiceAssistant = voiceAssistant;
window.themeManager = themeManager;
window.utils = utils;