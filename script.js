// Professional Weather App - TailwindCSS Version
// WeatherSphere v3.0 - Professional Edition

// Configuration
const API_BASE = window.location.hostname === 'localhost' ? 
    'http://localhost:5001/api' : 
    'https://weather-app-backend-jnanendravarma.vercel.app/api';

// Color Themes Configuration
const THEMES = {
    cosmic: {
        name: 'Cosmic Dream',
        gradient: 'from-purple-900 via-blue-900 to-indigo-900',
        accent: 'purple-500',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20',
        text: 'text-white',
        description: 'Deep space vibes with purple and blue gradients'
    },
    sunset: {
        name: 'Golden Sunset',
        gradient: 'from-orange-400 via-red-500 to-pink-500',
        accent: 'orange-500',
        glass: 'bg-white/15 backdrop-blur-md border border-orange-200/30',
        text: 'text-white',
        description: 'Warm sunset colors with golden hues'
    },
    ocean: {
        name: 'Ocean Breeze',
        gradient: 'from-cyan-400 via-blue-500 to-blue-600',
        accent: 'cyan-500',
        glass: 'bg-white/10 backdrop-blur-md border border-cyan-200/30',
        text: 'text-white',
        description: 'Cool ocean blues and turquoise'
    },
    forest: {
        name: 'Emerald Forest',
        gradient: 'from-green-400 via-emerald-500 to-teal-600',
        accent: 'emerald-500',
        glass: 'bg-white/10 backdrop-blur-md border border-green-200/30',
        text: 'text-white',
        description: 'Fresh forest greens and emerald tones'
    },
    aurora: {
        name: 'Aurora Borealis',
        gradient: 'from-green-300 via-blue-500 to-purple-600',
        accent: 'green-400',
        glass: 'bg-white/10 backdrop-blur-md border border-green-200/20',
        text: 'text-white',
        description: 'Northern lights with magical colors'
    },
    midnight: {
        name: 'Midnight Sky',
        gradient: 'from-gray-900 via-purple-900 to-black',
        accent: 'purple-400',
        glass: 'bg-white/5 backdrop-blur-md border border-purple-200/20',
        text: 'text-white',
        description: 'Dark elegant theme with purple accents'
    },
    rose: {
        name: 'Rose Garden',
        gradient: 'from-pink-400 via-rose-500 to-red-500',
        accent: 'rose-500',
        glass: 'bg-white/10 backdrop-blur-md border border-pink-200/30',
        text: 'text-white',
        description: 'Romantic rose and pink gradients'
    },
    arctic: {
        name: 'Arctic Ice',
        gradient: 'from-blue-200 via-cyan-300 to-blue-400',
        accent: 'blue-400',
        glass: 'bg-white/20 backdrop-blur-md border border-blue-200/40',
        text: 'text-gray-800',
        description: 'Cool arctic blues and ice tones'
    }
};

// Application State
let currentUnit = 'metric';
let weatherData = null;
let forecastData = null;
let temperatureChart = null;
let isVoiceEnabled = localStorage.getItem('voiceEnabled') !== 'false';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let currentTheme = localStorage.getItem('selectedTheme') || 'cosmic';

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌟 Initializing WeatherSphere App...');
    
    try {
        // Initialize theme first
        initializeTheme();
        
        // Setup responsive layout
        setupResponsiveLayout();
        
        // Initialize responsive features
        initializeResponsiveApp();
        
        // Load user preferences
        loadUserPreferences();
        
        // Initialize charts and forecasts with demo data
        updateChart('temperature');
        updateForecast('daily');
        
        // Show weather dashboard with demo data immediately
        showDemoWeatherData();
        
        // Add touch feedback
        addTouchFeedback();
        
        // Setup event listeners
        setupEventListeners();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            hideLoadingScreen();
        }, 1500);
        
        // Auto-load weather for demo (try geolocation, fallback to London)
        setTimeout(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            await fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                        } catch (error) {
                            console.log('Using demo data for London');
                            fetchWeatherByCity('London');
                        }
                    },
                    () => {
                        console.log('Geolocation denied, using demo data for London');
                        fetchWeatherByCity('London');
                    }
                );
            } else {
                console.log('Using demo data for London');
                fetchWeatherByCity('London');
            }
        }, 2000);
        
        console.log('✅ Weather app initialized successfully with all features');
        
    } catch (error) {
        console.error('❌ Error during app initialization:', error);
        showNotification('⚠️ App initialization error. Some features may not work properly.', 'error');
    }
});

async function initializeApp() {
    // Initialize theme first
    initializeTheme();
    
    // Setup responsive layout
    setupResponsiveLayout();
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        hideLoadingScreen();
    }, 2000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Load user preferences
    loadUserPreferences();
    
    // Auto-detect location
    setTimeout(() => {
        getCurrentLocation();
    }, 1000);
    
    // Initialize chart with a small delay to avoid conflicts
    setTimeout(() => {
        initializeChart();
    }, 500);
}

function setupResponsiveLayout() {
    // Detect device type and adjust layout
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth > 640 && window.innerWidth <= 1024;
    
    // Add device classes to body
    document.body.classList.add(
        isMobile ? 'mobile-device' : 
        isTablet ? 'tablet-device' : 'desktop-device'
    );
    
    // Responsive event listener
    window.addEventListener('resize', debounce(() => {
        handleResponsiveChanges();
    }, 250));
    
    // Handle orientation changes on mobile
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResponsiveChanges, 100);
    });
}

function handleResponsiveChanges() {
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth > 640 && window.innerWidth <= 1024;
    
    // Update device classes
    document.body.className = document.body.className.replace(/mobile-device|tablet-device|desktop-device/g, '');
    document.body.classList.add(
        isMobile ? 'mobile-device' : 
        isTablet ? 'tablet-device' : 'desktop-device'
    );
    
    // Adjust chart size if exists
    if (temperatureChart) {
        temperatureChart.resize();
    }
    
    // Adjust voice search button visibility
    adjustVoiceSearchVisibility(isMobile);
}

function adjustVoiceSearchVisibility(isMobile) {
    const voiceBtn = document.getElementById('voiceSearchBtn');
    const locationBtn = document.getElementById('locationBtn');
    
    if (isMobile && voiceBtn && locationBtn) {
        // On mobile, ensure buttons are properly sized
        voiceBtn.classList.add('touch-target');
        locationBtn.classList.add('touch-target');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('opacity-0');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
    }
}

function setupEventListeners() {
    // Search functionality
    const citySearch = document.getElementById('citySearch');
    if (citySearch) {
        citySearch.addEventListener('input', handleSearchInput);
        citySearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const city = e.target.value.trim();
                if (city) {
                    fetchWeatherByCity(city);
                }
            }
        });
    }

    // Location button
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', getCurrentLocation);
    }

    // Voice search button
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', startVoiceSearch);
    }

    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    
    if (settingsBtn) settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    if (closeSettings) closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    // Unit toggle
    const unitToggle = document.getElementById('unitToggle');
    if (unitToggle) {
        unitToggle.addEventListener('click', function(e) {
            if (e.target.classList.contains('unit-btn')) {
                toggleUnit(e.target.dataset.unit);
            }
        });
    }

    // Voice toggle
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
        voiceToggle.addEventListener('click', toggleVoiceAssistant);
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Chart toggles
    const chartToggles = document.querySelectorAll('.chart-toggle');
    chartToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            chartToggles.forEach(t => t.classList.remove('active', 'bg-blue-600'));
            this.classList.add('active', 'bg-blue-600');
            updateChart(this.dataset.chart);
        });
    });

    // Forecast toggles
    const forecastToggles = document.querySelectorAll('.forecast-toggle');
    forecastToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            forecastToggles.forEach(t => t.classList.remove('active', 'bg-blue-600'));
            this.classList.add('active', 'bg-blue-600');
            updateForecast(this.dataset.forecast);
        });
    });

    // Add favorite button
    const addFavoriteBtn = document.getElementById('addFavoriteBtn');
    if (addFavoriteBtn) {
        addFavoriteBtn.addEventListener('click', addCurrentToFavorites);
    }

    // Quick theme buttons
    const quickThemeButtons = document.querySelectorAll('.quick-theme');
    quickThemeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
        });
    });

    // Voice announcements toggle
    const voiceAnnouncements = document.getElementById('voiceAnnouncements');
    if (voiceAnnouncements) {
        voiceAnnouncements.addEventListener('change', function() {
            localStorage.setItem('voiceAnnouncements', this.checked);
            if (this.checked) {
                speakText("Voice announcements enabled");
            }
        });
    }

    // Auto location toggle
    const autoLocation = document.getElementById('autoLocation');
    if (autoLocation) {
        autoLocation.addEventListener('change', function() {
            localStorage.setItem('autoLocation', this.checked);
            if (this.checked) {
                getCurrentLocation();
                speakText("Auto location enabled");
            }
        });
    }

    // Temperature unit select
    const temperatureUnit = document.getElementById('temperatureUnit');
    if (temperatureUnit) {
        temperatureUnit.addEventListener('change', function() {
            toggleUnit(this.value);
        });
    }
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
        // Show suggestions (implement city search suggestions here)
        showSearchSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
}

function showSearchSuggestions(query) {
    // Mock suggestions for now
    const suggestions = [
        'London, UK',
        'New York, USA',
        'Tokyo, Japan',
        'Paris, France',
        'Sydney, Australia'
    ].filter(city => city.toLowerCase().includes(query.toLowerCase()));

    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer && suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions.map(city => 
            `<div class="p-3 hover:bg-white/20 cursor-pointer transition-all" onclick="selectCity('${city}')">${city}</div>`
        ).join('');
        suggestionsContainer.classList.remove('hidden');
    }
}

function hideSearchSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
    }
}

function selectCity(city) {
    const cityName = city.split(',')[0];
    document.getElementById('citySearch').value = cityName;
    hideSearchSuggestions();
    fetchWeatherByCity(cityName);
}

async function getCurrentLocation() {
    if (navigator.geolocation) {
        // Check if geolocation permission was previously denied
        try {
            const permission = await navigator.permissions.query({name: 'geolocation'});
            
            if (permission.state === 'denied') {
                showNotification('📍 Location access is disabled. Please search for a city manually or enable location in browser settings.', 'error');
                speakText("Location access is disabled. You can search for any city manually.");
                fetchWeatherByCity('London'); // Fallback to London
                return;
            }
        } catch (error) {
            // Permissions API might not be supported, continue with geolocation
            console.log('Permissions API not supported:', error);
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                
                let errorMessage = '';
                let spokenMessage = '';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '📍 Location access denied. Searching for London instead. You can manually search for your city.';
                        spokenMessage = "Location access was denied. I'll show weather for London. You can search for your city using the search box.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '📍 Location information unavailable. Showing London weather instead.';
                        spokenMessage = "Your location is unavailable right now. I'll show weather for London instead.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = '📍 Location request timed out. Showing London weather instead.';
                        spokenMessage = "Location request timed out. I'll show weather for London instead.";
                        break;
                    default:
                        errorMessage = '📍 Location error occurred. Showing London weather instead.';
                        spokenMessage = "There was a location error. I'll show weather for London instead.";
                        break;
                }
                
                showNotification(errorMessage, 'error');
                if (isVoiceEnabled) {
                    speakText(spokenMessage);
                }
                fetchWeatherByCity('London'); // Fallback
            },
            {
                timeout: 10000, // 10 second timeout
                enableHighAccuracy: false, // Don't require high accuracy to avoid delays
                maximumAge: 300000 // Accept cached position up to 5 minutes old
            }
        );
    } else {
        showNotification('❌ Geolocation not supported in this browser. Please search for a city.', 'error');
        speakText("Geolocation is not supported. Please search for a city manually.");
        fetchWeatherByCity('London'); // Fallback
    }
}

async function fetchWeatherByCity(city) {
    try {
        updateLoadingText('Loading weather for ' + city + '...');
        
        const response = await fetch(`${API_BASE}/weather?q=${encodeURIComponent(city)}&units=${currentUnit}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        weatherData = data;
        
        await fetchForecastByCity(city);
        updateWeatherDisplay(data);
        
        // Voice announcement for successful weather fetch
        if (isVoiceEnabled) {
            const temp = Math.round(data.main.temp);
            const tempUnit = currentUnit === 'metric' ? 'degrees Celsius' : 'degrees Fahrenheit';
            speakText(`Weather for ${data.name}: ${temp} ${tempUnit}, ${data.weather[0].description}`);
        }
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showNotification('❌ Failed to fetch weather data. Please try again.', 'error');
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        updateLoadingText('Loading weather for your location...');
        
        const response = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}&units=${currentUnit}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        weatherData = data;
        
        await fetchForecastByCoords(lat, lon);
        updateWeatherDisplay(data);
        
        // Voice announcement for successful weather fetch
        if (isVoiceEnabled) {
            const temp = Math.round(data.main.temp);
            const tempUnit = currentUnit === 'metric' ? 'degrees Celsius' : 'degrees Fahrenheit';
            speakText(`Current location weather: ${data.name}, ${temp} ${tempUnit}, ${data.weather[0].description}`);
        }
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showNotification('❌ Failed to fetch weather data.', 'error');
        fetchWeatherByCity('London'); // Fallback
    }
}

async function fetchForecastByCity(city) {
    try {
        const response = await fetch(`${API_BASE}/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}`);
        if (response.ok) {
            forecastData = await response.json();
            updateForecast('daily');
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

async function fetchForecastByCoords(lat, lon) {
    try {
        const response = await fetch(`${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}`);
        if (response.ok) {
            forecastData = await response.json();
            updateForecast('daily');
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Show demo weather data immediately for better UX
function showDemoWeatherData() {
    console.log('🎭 Loading demo weather data...');
    
    // Show weather dashboard
    const dashboard = document.getElementById('weatherDashboard');
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }

    // Demo weather data
    const demoData = {
        name: 'Demo City',
        sys: { country: 'IN' },
        main: {
            temp: 25,
            feels_like: 28,
            temp_min: 18,
            temp_max: 32,
            humidity: 65,
            pressure: 1013
        },
        weather: [{
            main: 'Clear',
            description: 'Clear sky',
            icon: '01d'
        }],
        wind: {
            speed: 5.2,
            deg: 120
        },
        visibility: 10000
    };

    // Update all weather display elements
    updateWeatherDisplay(demoData);
    
    // Show notification
    showNotification('🎭 Demo weather data loaded. Search for a city to get real data!', 'info');
}

function updateWeatherDisplay(data) {
    // Show weather dashboard
    const dashboard = document.getElementById('weatherDashboard');
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }

    // Update location
    const locationName = document.getElementById('locationName');
    if (locationName) {
        locationName.textContent = `${data.name}, ${data.sys.country}`;
    }

    // Update time
    const locationTime = document.getElementById('locationTime');
    if (locationTime) {
        const now = new Date();
        locationTime.textContent = now.toLocaleString();
    }

    // Update weather icon and status
    const weatherIconLarge = document.getElementById('weatherIconLarge');
    const weatherStatus = document.getElementById('weatherStatus');
    const weatherDescription = document.getElementById('weatherDescription');
    
    if (weatherIconLarge && weatherStatus && weatherDescription) {
        const iconClass = getWeatherIcon(data.weather[0].icon);
        weatherIconLarge.innerHTML = `<i class="${iconClass} text-white text-4xl"></i>`;
        weatherStatus.textContent = data.weather[0].main;
        weatherDescription.textContent = data.weather[0].description;
        
        // Update icon background color based on weather
        updateWeatherIconBackground(weatherIconLarge, data.weather[0].main);
    }

    // Update temperature
    const currentTemp = document.getElementById('currentTemp');
    const feelsLike = document.getElementById('feelsLike');
    const tempMin = document.getElementById('tempMin');
    const tempMax = document.getElementById('tempMax');
    
    if (currentTemp) currentTemp.textContent = Math.round(data.main.temp);
    if (feelsLike) feelsLike.textContent = Math.round(data.main.feels_like);
    if (tempMin) tempMin.textContent = Math.round(data.main.temp_min);
    if (tempMax) tempMax.textContent = Math.round(data.main.temp_max);

    // Update weather stats
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const pressure = document.getElementById('pressure');
    const visibility = document.getElementById('visibility');
    
    if (humidity) humidity.textContent = `${data.main.humidity}%`;
    if (windSpeed) windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    if (pressure) pressure.textContent = `${data.main.pressure} hPa`;
    if (visibility) visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Update humidity progress bar
    const humidityProgress = document.getElementById('humidityProgress');
    if (humidityProgress) {
        humidityProgress.style.width = `${data.main.humidity}%`;
    }

    // Update wind direction
    const windDirection = document.getElementById('windDirection');
    const windDirectionText = document.getElementById('windDirectionText');
    if (windDirection && windDirectionText && data.wind.deg !== undefined) {
        windDirection.style.transform = `rotate(${data.wind.deg}deg)`;
        windDirectionText.textContent = getWindDirection(data.wind.deg);
    }

    // Update sunrise/sunset
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    if (sunrise && sunset) {
        sunrise.textContent = formatTime(data.sys.sunrise);
        sunset.textContent = formatTime(data.sys.sunset);
    }

    // Update background based on weather
    updateBackgroundForWeather(data.weather[0].main);
    
    // Generate smart insights
    generateSmartInsights(data);
    
    // Update chart with new data
    updateChartData(data);
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-clouds',
        '04n': 'fas fa-clouds',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    return iconMap[iconCode] || 'fas fa-cloud';
}

function updateWeatherIconBackground(element, weatherMain) {
    // Remove existing gradient classes
    element.classList.remove('bg-gradient-to-r', 'from-yellow-400', 'to-orange-500', 'from-blue-400', 'to-blue-600', 'from-gray-400', 'to-gray-600', 'from-purple-400', 'to-purple-600');
    
    switch (weatherMain.toLowerCase()) {
        case 'clear':
            element.classList.add('bg-gradient-to-r', 'from-yellow-400', 'to-orange-500');
            break;
        case 'clouds':
            element.classList.add('bg-gradient-to-r', 'from-gray-400', 'to-gray-600');
            break;
        case 'rain':
        case 'drizzle':
            element.classList.add('bg-gradient-to-r', 'from-blue-400', 'to-blue-600');
            break;
        case 'thunderstorm':
            element.classList.add('bg-gradient-to-r', 'from-purple-400', 'to-purple-600');
            break;
        case 'snow':
            element.classList.add('bg-gradient-to-r', 'from-blue-200', 'to-blue-400');
            break;
        default:
            element.classList.add('bg-gradient-to-r', 'from-blue-400', 'to-blue-600');
    }
}

function updateBackgroundForWeather(weatherMain) {
    const bg = document.getElementById('dynamicBg');
    if (!bg) return;
    
    // Clear existing particles
    clearWeatherParticles();
    
    // Smart theme switching based on weather if auto-theme is enabled
    const autoTheme = localStorage.getItem('autoWeatherTheme') !== 'false';
    
    if (autoTheme) {
        let suggestedTheme = currentTheme;
        
        switch (weatherMain.toLowerCase()) {
            case 'clear':
                suggestedTheme = 'sunset';
                createSunParticles();
                break;
            case 'clouds':
                suggestedTheme = 'midnight';
                createCloudParticles();
                break;
            case 'rain':
            case 'drizzle':
                suggestedTheme = 'ocean';
                createRainParticles();
                break;
            case 'thunderstorm':
                suggestedTheme = 'cosmic';
                createThunderParticles();
                break;
            case 'snow':
                suggestedTheme = 'arctic';
                createSnowParticles();
                break;
            case 'mist':
            case 'fog':
                suggestedTheme = 'forest';
                createMistParticles();
                break;
            default:
                suggestedTheme = 'cosmic';
                createStarParticles();
        }
        
        if (suggestedTheme !== currentTheme) {
            document.body.classList.add('auto-theme-change');
            setTimeout(() => {
                setTheme(suggestedTheme);
                document.body.classList.remove('auto-theme-change');
            }, 1000);
        }
    }
}

function clearWeatherParticles() {
    const container = document.getElementById('weatherParticles');
    if (container) {
        container.innerHTML = '';
    }
}

function createRainParticles() {
    const container = document.getElementById('weatherParticles');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.className = 'particle rain';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        drop.style.setProperty('--x-offset', '0px');
        drop.style.setProperty('--drift', Math.random() * 50 - 25 + 'px');
        drop.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(drop);
    }
}

function createSnowParticles() {
    const container = document.getElementById('weatherParticles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const flake = document.createElement('div');
        flake.className = 'particle snow';
        flake.style.left = Math.random() * 100 + '%';
        flake.style.setProperty('--duration', (Math.random() * 5 + 5) + 's');
        flake.style.setProperty('--x-offset', '0px');
        flake.style.setProperty('--drift', Math.random() * 100 - 50 + 'px');
        flake.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(flake);
    }
}

function createCloudParticles() {
    const container = document.getElementById('weatherParticles');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'particle cloud';
        cloud.style.left = Math.random() * 100 + '%';
        cloud.style.setProperty('--duration', (Math.random() * 20 + 20) + 's');
        cloud.style.setProperty('--x-offset', '0px');
        cloud.style.setProperty('--drift', Math.random() * 200 - 100 + 'px');
        cloud.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(cloud);
    }
}

function createStarParticles() {
    const container = document.getElementById('weatherParticles');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'particle';
        star.style.width = Math.random() * 4 + 2 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.background = 'rgba(255, 255, 255, 0.8)';
        star.style.borderRadius = '50%';
        star.style.animation = 'sparkle 2s infinite ease-in-out';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.position = 'absolute';
        container.appendChild(star);
    }
}

function createSunParticles() {
    const container = document.getElementById('weatherParticles');
    if (!container) return;
    
    for (let i = 0; i < 10; i++) {
        const ray = document.createElement('div');
        ray.className = 'particle';
        ray.style.width = '2px';
        ray.style.height = '100px';
        ray.style.left = Math.random() * 100 + '%';
        ray.style.background = 'rgba(255, 215, 0, 0.3)';
        ray.style.setProperty('--duration', (Math.random() * 10 + 10) + 's');
        ray.style.setProperty('--x-offset', '0px');
        ray.style.setProperty('--drift', Math.random() * 50 - 25 + 'px');
        ray.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(ray);
    }
}

function createThunderParticles() {
    const container = document.getElementById('weatherParticles');
    if (!container) return;
    
    // Create rain for thunderstorm
    createRainParticles();
    
    // Add lightning flashes
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
            createLightningFlash();
        }
    }, 3000);
}

function createMistParticles() {
    const container = document.getElementById('weatherParticles');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const mist = document.createElement('div');
        mist.className = 'particle';
        mist.style.width = Math.random() * 60 + 40 + 'px';
        mist.style.height = '20px';
        mist.style.left = Math.random() * 100 + '%';
        mist.style.background = 'rgba(255, 255, 255, 0.1)';
        mist.style.borderRadius = '20px';
        mist.style.filter = 'blur(5px)';
        mist.style.setProperty('--duration', (Math.random() * 15 + 15) + 's');
        mist.style.setProperty('--x-offset', '0px');
        mist.style.setProperty('--drift', Math.random() * 100 - 50 + 'px');
        mist.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(mist);
    }
}

function createLightningFlash() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(255, 255, 255, 0.8)';
    flash.style.zIndex = '5';
    flash.style.pointerEvents = 'none';
    flash.style.animation = 'lightning 0.2s ease-out';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        document.body.removeChild(flash);
    }, 200);
}

// Add lightning animation to CSS
const lightningCSS = `
@keyframes lightning {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}
`;

// Add the CSS to the document
const style = document.createElement('style');
style.textContent = lightningCSS;
document.head.appendChild(style);

function addAdvancedVoiceCommands() {
    // Add more intelligent voice responses
    return {
        greetings: [
            'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'
        ],
        thanks: [
            'thank you', 'thanks', 'appreciate it'
        ],
        compliments: [
            'nice', 'good job', 'awesome', 'great', 'excellent', 'beautiful'
        ]
    };
}

function handleAdvancedVoiceCommand(command) {
    const voiceCommands = addAdvancedVoiceCommands();
    
    // Greeting responses
    if (voiceCommands.greetings.some(greeting => command.includes(greeting))) {
        const responses = [
            "Hello! I'm your intelligent weather assistant. How can I help you today?",
            "Hi there! Ready to explore the weather with beautiful insights?",
            "Hey! What weather wonders would you like to discover?"
        ];
        speakText(responses[Math.floor(Math.random() * responses.length)]);
        return true;
    }
    
    // Thank you responses
    if (voiceCommands.thanks.some(thanks => command.includes(thanks))) {
        const responses = [
            "You're very welcome! I'm here whenever you need weather wisdom.",
            "My pleasure! Stay weather-ready and have a wonderful day!",
            "Glad I could help! Feel free to ask me anything about weather."
        ];
        speakText(responses[Math.floor(Math.random() * responses.length)]);
        return true;
    }
    
    // Compliment responses
    if (voiceCommands.compliments.some(compliment => command.includes(compliment))) {
        const responses = [
            "Thank you! I'm designed to make weather beautiful, intelligent, and delightful.",
            "I appreciate that! Weather should be both informative and visually stunning.",
            "Thanks! I love helping you stay connected with the weather in style."
        ];
        speakText(responses[Math.floor(Math.random() * responses.length)]);
        return true;
    }
    
    // Weather questions and tips
    if (command.includes('should i') || command.includes('recommend') || command.includes('advice')) {
        if (weatherData) {
            giveWeatherAdvice(command);
        } else {
            speakText("I'd love to give you personalized advice! First, let me know your location or search for a city.");
        }
        return true;
    }
    
    // Time-based greetings
    const hour = new Date().getHours();
    if (command.includes('good morning') && hour < 12) {
        speakText("Good morning! Ready to start your day with perfect weather insights?");
        return true;
    } else if (command.includes('good afternoon') && hour >= 12 && hour < 17) {
        speakText("Good afternoon! How's the weather treating you today?");
        return true;
    } else if (command.includes('good evening') && hour >= 17) {
        speakText("Good evening! Let's check what the weather has in store for tonight.");
        return true;
    }
    
    // Smart weather queries
    if (command.includes('what should i wear') || command.includes('clothing') || command.includes('dress')) {
        if (weatherData) {
            giveClothingAdvice();
        } else {
            speakText("I'd love to help you dress perfectly for the weather! First, tell me your location.");
        }
        return true;
    }
    
    if (command.includes('umbrella') || command.includes('rain')) {
        if (weatherData) {
            checkRainProbability();
        } else {
            speakText("Let me check the rain forecast for you! First, search for your location.");
        }
        return true;
    }
    
    if (command.includes('outdoor') || command.includes('outside') || command.includes('activity')) {
        if (weatherData) {
            giveOutdoorAdvice();
        } else {
            speakText("I can suggest perfect outdoor activities! First, let me know your location.");
        }
        return true;
    }
    
    // App navigation commands
    if (command.includes('open settings') || command.includes('show settings')) {
        document.getElementById('settingsBtn').click();
        speakText("Opening settings for you");
        return true;
    }
    
    if (command.includes('close settings') || command.includes('hide settings')) {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && !settingsModal.classList.contains('hidden')) {
            settingsModal.classList.add('hidden');
            speakText("Settings closed");
        }
        return true;
    }
    
    if (command.includes('show forecast') || command.includes('open forecast')) {
        const forecastSection = document.getElementById('forecastSection');
        if (forecastSection) {
            forecastSection.scrollIntoView({ behavior: 'smooth' });
            speakText("Here's the forecast section");
        }
        return true;
    }
    
    if (command.includes('show chart') || command.includes('open chart')) {
        const chartSection = document.getElementById('chartSection');
        if (chartSection) {
            chartSection.scrollIntoView({ behavior: 'smooth' });
            speakText("Here are the weather charts");
        }
        return true;
    }
    
    // Smart insights commands
    if (command.includes('insights') || command.includes('advice') || command.includes('tips')) {
        const insightsSection = document.getElementById('insightsSection');
        if (insightsSection) {
            insightsSection.scrollIntoView({ behavior: 'smooth' });
            speakText("Here are your personalized weather insights");
        }
        return true;
    }
    
    // Favorites commands
    if (command.includes('add favorite') || command.includes('save location')) {
        addCurrentToFavorites();
        speakText("Location added to your favorites");
        return true;
    }
    
    if (command.includes('show favorites') || command.includes('my favorites')) {
        const favoritesSection = document.getElementById('favoritesSection');
        if (favoritesSection) {
            favoritesSection.scrollIntoView({ behavior: 'smooth' });
            speakText("Here are your favorite locations");
        }
        return true;
    }
    
    // Voice control commands
    if (command.includes('turn off voice') || command.includes('disable voice') || command.includes('stop listening')) {
        toggleVoiceAssistant();
        speakText("Voice assistant disabled. You can re-enable it in settings.");
        return true;
    }
    
    if (command.includes('louder') || command.includes('speak louder')) {
        speakText("I'll speak a bit louder now. Is this better?");
        return true;
    }
    
    if (command.includes('quieter') || command.includes('speak softer')) {
        speakText("I'll speak more softly now");
        return true;
    }
    
    // Entertainment commands
    if (command.includes('joke') || command.includes('funny')) {
        const jokes = [
            "Why don't meteorologists ever get tired? Because they're always under the weather!",
            "What do you call a grumpy and short-tempered gardener? A snap dragon!",
            "What's the difference between weather and climate? You can't weather a tree, but you can climate!",
            "Why did the cloud break up with the sun? Because it was tired of being overshadowed!"
        ];
        speakText(jokes[Math.floor(Math.random() * jokes.length)]);
        return true;
    }
    
    if (command.includes('sing') || command.includes('song')) {
        speakText("🎵 Raindrops keep falling on my head, but that doesn't mean my eyes will soon be turning red! 🎵");
        return true;
    }
    
    return false;
}

function giveWeatherAdvice(command) {
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main.toLowerCase();
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    
    let advice = "";
    
    if (command.includes('go out') || command.includes('outside')) {
        if (condition.includes('rain')) {
            advice = "I'd recommend staying indoors or bringing a good umbrella. It's raining right now.";
        } else if (temp > 30) {
            advice = "It's quite hot outside! If you go out, stay hydrated, wear light colors, and seek shade.";
        } else if (temp < 5) {
            advice = "It's very cold! Bundle up warmly if you must go out, or consider indoor activities.";
        } else {
            advice = "The weather looks good for outdoor activities! Perfect time to step outside.";
        }
    } else if (command.includes('exercise') || command.includes('workout')) {
        if (temp >= 15 && temp <= 25 && !condition.includes('rain')) {
            advice = "Perfect weather for outdoor exercise! The temperature is ideal for physical activity.";
        } else if (temp > 25) {
            advice = "It's a bit warm for outdoor exercise. Try early morning or evening workouts, and stay hydrated.";
        } else {
            advice = "Consider indoor workouts today. The weather might not be ideal for outdoor exercise.";
        }
    }
    
    speakText(advice);
}

function giveClothingAdvice() {
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main.toLowerCase();
    const feelsLike = weatherData.main.feels_like;
    
    let clothing = "";
    
    if (temp < 0) {
        clothing = "It's freezing! Wear heavy winter coat, thermal layers, gloves, scarf, warm hat, and insulated boots.";
    } else if (temp < 10) {
        clothing = "Cold weather! Wear a warm jacket, long pants, closed shoes, and consider a light scarf.";
    } else if (temp < 15) {
        clothing = "Cool weather! A light jacket or sweater, jeans, and comfortable shoes would be perfect.";
    } else if (temp < 20) {
        clothing = "Pleasant temperature! Long sleeves or light sweater, comfortable pants, and sneakers.";
    } else if (temp < 25) {
        clothing = "Nice weather! T-shirt, light pants or jeans, and comfortable footwear.";
    } else if (temp < 30) {
        clothing = "Warm weather! Light t-shirt, shorts or light pants, and breathable shoes.";
    } else {
        clothing = "Very hot! Minimal, light-colored, breathable clothing. Don't forget sunscreen and a hat!";
    }
    
    if (condition.includes('rain')) {
        clothing += " Also, bring an umbrella or waterproof jacket.";
    }
    
    if (Math.abs(temp - feelsLike) > 3) {
        clothing += ` Note: it feels like ${Math.round(feelsLike)} degrees due to humidity and wind.`;
    }
    
    speakText(clothing);
}

function checkRainProbability() {
    const condition = weatherData.weather[0].main.toLowerCase();
    const description = weatherData.weather[0].description;
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
        speakText(`Yes, you'll need an umbrella! It's currently ${description}. Stay dry!`);
    } else if (condition.includes('cloud')) {
        speakText(`It's cloudy right now. While it's not raining, you might want to carry an umbrella just in case.`);
    } else {
        speakText(`No umbrella needed right now! The weather is ${description}. Enjoy the clear skies!`);
    }
}

function giveOutdoorAdvice() {
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main.toLowerCase();
    const windSpeed = Math.round(weatherData.wind.speed * 3.6);
    
    let activities = "";
    
    if (condition.includes('rain')) {
        activities = "Indoor activities would be perfect today! Try museums, shopping centers, cafes, or cozy indoor entertainment.";
    } else if (condition.includes('snow')) {
        activities = "Great weather for winter activities! Consider skiing, snowboarding, building snowmen, or winter photography.";
    } else if (temp >= 20 && temp <= 30 && windSpeed < 20) {
        activities = "Perfect outdoor weather! Great for hiking, cycling, picnics, outdoor sports, or simply enjoying nature.";
    } else if (temp > 30) {
        activities = "Hot weather! Best for swimming, water activities, or shaded outdoor spots. Avoid intense midday activities.";
    } else if (temp < 10) {
        activities = "Cool weather outdoor options: brisk walks, winter sports, or shorter outdoor activities with warm clothing.";
    } else {
        activities = "Good weather for moderate outdoor activities like walking, light cycling, or outdoor dining.";
    }
    
    speakText(activities);
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function generateSmartInsights(data) {
    const temp = data.main.temp;
    const weatherMain = data.weather[0].main.toLowerCase();
    const humidity = data.main.humidity;
    
    // Clothing advice
    const clothingAdvice = document.getElementById('clothingAdvice');
    if (clothingAdvice) {
        let advice = '';
        if (temp < 0) {
            advice = 'Very cold! Wear heavy winter coat, gloves, scarf, and warm boots. Layer up!';
        } else if (temp < 10) {
            advice = 'Cold weather. Wear a warm jacket, long pants, and closed shoes.';
        } else if (temp < 20) {
            advice = 'Cool weather. Light jacket or sweater recommended. Jeans are perfect.';
        } else if (temp < 25) {
            advice = 'Pleasant weather! Light clothes, t-shirt, and comfortable shoes.';
        } else if (temp < 30) {
            advice = 'Warm weather. Wear light, breathable clothes. Shorts and t-shirt ideal.';
        } else {
            advice = 'Very hot! Wear minimal, light-colored clothes. Stay hydrated!';
        }
        clothingAdvice.textContent = advice;
    }
    
    // Activity advice
    const activityAdvice = document.getElementById('activityAdvice');
    if (activityAdvice) {
        let advice = '';
        if (weatherMain.includes('rain')) {
            advice = 'Rainy day! Perfect for indoor activities like reading, movies, or visiting museums. Bring an umbrella if you must go out.';
        } else if (weatherMain.includes('snow')) {
            advice = 'Snowy weather! Great for winter sports, building snowmen, or cozy indoor activities.';
        } else if (weatherMain === 'clear') {
            advice = 'Beautiful clear weather! Perfect for outdoor activities like hiking, cycling, picnics, or sports.';
        } else {
            advice = 'Good weather for moderate outdoor activities. Check the forecast for any changes.';
        }
        activityAdvice.textContent = advice;
    }
    
    // Health advice
    const healthAdvice = document.getElementById('healthAdvice');
    if (healthAdvice) {
        let advice = '';
        if (humidity > 70) {
            advice = 'High humidity! Stay hydrated and avoid strenuous outdoor activities. Use air conditioning if available.';
        } else if (humidity < 30) {
            advice = 'Low humidity! Use moisturizer and stay hydrated. Consider using a humidifier indoors.';
        } else if (temp > 30) {
            advice = 'Hot weather! Drink plenty of water, avoid direct sunlight, and take frequent breaks in shade.';
        } else {
            advice = 'Pleasant conditions! Great weather for outdoor activities. Remember to stay hydrated.';
        }
        healthAdvice.textContent = advice;
    }
}

function toggleUnit(unit) {
    const unitButtons = document.querySelectorAll('.unit-btn');
    unitButtons.forEach(btn => btn.classList.remove('active', 'bg-blue-600', 'text-white'));
    
    const activeButton = document.querySelector(`[data-unit="${unit}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'bg-blue-600', 'text-white');
    }
    
    if (unit === 'fahrenheit' && currentUnit === 'metric') {
        currentUnit = 'imperial';
        updateTempUnit('°F');
    } else if (unit === 'celsius' && currentUnit === 'imperial') {
        currentUnit = 'metric';
        updateTempUnit('°C');
    }
    
    // Re-fetch weather data with new unit
    if (weatherData) {
        const city = weatherData.name;
        fetchWeatherByCity(city);
    }
}

function updateTempUnit(unit) {
    const tempUnit = document.getElementById('tempUnit');
    if (tempUnit) {
        tempUnit.textContent = unit;
    }
}

function toggleVoiceAssistant() {
    isVoiceEnabled = !isVoiceEnabled;
    localStorage.setItem('voiceEnabled', isVoiceEnabled.toString());
    
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
        if (isVoiceEnabled) {
            voiceToggle.classList.add('text-green-400');
        } else {
            voiceToggle.classList.remove('text-green-400');
        }
    }
}

function startVoiceSearch() {
    if (!isVoiceEnabled) {
        showNotification('🔇 Voice assistant is disabled. Enable it in settings.', 'warning');
        return;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            showVoiceIndicator();
            speakText("I'm listening. You can say a city name, ask for weather details, or say 'tell me the weather'");
        };
        
        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            processVoiceCommand(command);
            hideVoiceIndicator();
        };
        
        recognition.onerror = (event) => {
            hideVoiceIndicator();
            speakText("Sorry, I couldn't understand that. Please try again.");
            showNotification('❌ Voice recognition error. Please try again.', 'error');
        };
        
        recognition.onend = () => {
            hideVoiceIndicator();
        };
        
        recognition.start();
    } else {
        showNotification('❌ Voice recognition not supported in this browser.', 'error');
    }
}

function processVoiceCommand(command) {
    console.log('Voice command:', command);
    
    // Check for advanced voice commands first
    if (handleAdvancedVoiceCommand(command)) {
        return;
    }
    
    // Weather query commands
    if (command.includes('weather in') || command.includes('weather for')) {
        const cityMatch = command.match(/weather (?:in|for) (.+)/);
        if (cityMatch) {
            const city = cityMatch[1].trim();
            document.getElementById('citySearch').value = city;
            fetchWeatherByCity(city);
            return;
        }
    }
    
    // Current weather announcement
    if (command.includes('tell me the weather') || command.includes('current weather') || command.includes('what\'s the weather')) {
        if (weatherData) {
            announceCurrentWeather();
        } else {
            speakText("I don't have weather data yet. Please search for a city first.");
        }
        return;
    }
    
    // Forecast commands
    if (command.includes('forecast') || command.includes('tomorrow') || command.includes('next few days')) {
        if (forecastData) {
            announceForecast();
        } else {
            speakText("I don't have forecast data available.");
        }
        return;
    }
    
    // Temperature unit commands
    if (command.includes('celsius') || command.includes('centigrade')) {
        toggleUnit('celsius');
        speakText("Switched to Celsius");
        return;
    }
    
    if (command.includes('fahrenheit')) {
        toggleUnit('fahrenheit');
        speakText("Switched to Fahrenheit");
        return;
    }
    
    // Location commands
    if (command.includes('my location') || command.includes('current location') || command.includes('where am i')) {
        getCurrentLocation();
        return;
    }
    
    // Theme commands
    if (command.includes('change theme') || command.includes('theme')) {
        if (command.includes('cosmic') || command.includes('space')) {
            setTheme('cosmic');
        } else if (command.includes('sunset') || command.includes('orange')) {
            setTheme('sunset');
        } else if (command.includes('ocean') || command.includes('blue')) {
            setTheme('ocean');
        } else if (command.includes('forest') || command.includes('green')) {
            setTheme('forest');
        } else if (command.includes('aurora') || command.includes('northern lights')) {
            setTheme('aurora');
        } else if (command.includes('midnight') || command.includes('dark')) {
            setTheme('midnight');
        } else if (command.includes('rose') || command.includes('pink')) {
            setTheme('rose');
        } else if (command.includes('arctic') || command.includes('ice')) {
            setTheme('arctic');
        } else {
            showThemeSelector();
            speakText("Opening theme selector. Choose your favorite color theme.");
        }
        return;
    }
    
    // Help commands
    if (command.includes('help') || command.includes('what can you do') || command.includes('commands')) {
        speakText("I can help you with weather information. Try saying: Weather in London, Tell me the weather, Show forecast, Change to Celsius, or Get my location weather.");
        return;
    }
    
    // Default: treat as city name
    const city = command.replace(/weather|in|for|the/g, '').trim();
    if (city.length > 2) {
        document.getElementById('citySearch').value = city;
        fetchWeatherByCity(city);
    } else {
        speakText("I didn't understand that. Try saying a city name or ask for help.");
    }
}

function speakText(text) {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    
    try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Error handling for speech synthesis
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event.error);
        };
        
        // Try to use a nice voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') || 
            voice.lang.includes('en-US')
        );
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Error in speech synthesis:', error);
        // Don't show notification for speech errors as they're not critical
    }
}

function announceCurrentWeather() {
    if (!weatherData) return;
    
    const temp = Math.round(weatherData.main.temp);
    const tempUnit = currentUnit === 'metric' ? 'Celsius' : 'Fahrenheit';
    const condition = weatherData.weather[0].description;
    const location = weatherData.name;
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind.speed * 3.6);
    
    const announcement = `Current weather in ${location}: ${temp} degrees ${tempUnit}, ${condition}. Humidity is ${humidity} percent, wind speed is ${windSpeed} kilometers per hour.`;
    
    speakText(announcement);
    showNotification('🎤 Weather announcement played', 'success');
}

function announceForecast() {
    if (!forecastData) return;
    
    // Mock forecast announcement for now
    const announcement = "Tomorrow's forecast: Partly cloudy with a high of 25 degrees and a low of 18 degrees. Chance of rain in the evening.";
    speakText(announcement);
    showNotification('🎤 Forecast announcement played', 'success');
}

function showVoiceIndicator() {
    const indicator = document.getElementById('voiceIndicator');
    if (indicator) {
        indicator.classList.remove('hidden');
    }
}

function hideVoiceIndicator() {
    const indicator = document.getElementById('voiceIndicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
}

function toggleTheme() {
    // Open theme selector
    showThemeSelector();
}

function setTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    
    currentTheme = themeKey;
    localStorage.setItem('selectedTheme', themeKey);
    
    const theme = THEMES[themeKey];
    const body = document.body;
    const dynamicBg = document.getElementById('dynamicBg');
    
    // Update main background
    if (dynamicBg) {
        // Remove all existing gradient classes
        dynamicBg.className = dynamicBg.className.replace(/from-\w+-\d+|via-\w+-\d+|to-\w+-\d+/g, '');
        dynamicBg.classList.add('bg-gradient-to-br', ...theme.gradient.split(' '));
    }
    
    // Update all glass elements
    const glassElements = document.querySelectorAll('.glass');
    glassElements.forEach(element => {
        // Remove old glass classes
        element.className = element.className.replace(/bg-white\/\d+|backdrop-blur-\w+|border-\w+-\d+\/\d+/g, '');
        element.classList.add(...theme.glass.split(' '));
    });
    
    // Update accent colors
    updateAccentColors(theme.accent);
    
    // Only speak theme change if it was manually requested, not auto-changed
    const isManualThemeChange = !document.body.classList.contains('auto-theme-change');
    if (isManualThemeChange && isVoiceEnabled) {
        speakText(`Theme changed to ${theme.name}`);
    }
}

function updateAccentColors(accentColor) {
    // Update buttons and accent elements
    const accentElements = document.querySelectorAll('.btn-primary, .accent-color');
    accentElements.forEach(element => {
        element.className = element.className.replace(/bg-\w+-\d+|text-\w+-\d+|border-\w+-\d+/g, '');
        element.classList.add(`bg-${accentColor}`, `hover:bg-${accentColor}`, `border-${accentColor}`);
    });
}

function showThemeSelector() {
    const existingModal = document.getElementById('themeModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const isMobile = window.innerWidth <= 640;
    
    const modal = document.createElement('div');
    modal.id = 'themeModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
    
    modal.innerHTML = `
        <div class="glass rounded-xl md:rounded-2xl p-4 md:p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4 md:mb-6">
                <h2 class="text-xl md:text-2xl font-bold text-white">Choose Your Theme</h2>
                <button id="closeThemeModal" class="text-white/60 hover:text-white text-xl md:text-2xl touch-target">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mobile-grid-2 tablet-grid-3">
                ${Object.entries(THEMES).map(([key, theme]) => `
                    <div class="theme-card cursor-pointer group" data-theme="${key}">
                        <div class="bg-gradient-to-br ${theme.gradient} rounded-lg md:rounded-xl p-4 md:p-6 h-24 md:h-32 relative overflow-hidden transition-all duration-300 group-hover:scale-105 ${currentTheme === key ? 'ring-2 md:ring-4 ring-white/50' : ''}">
                            <div class="${theme.glass} rounded-md md:rounded-lg p-2 md:p-3 mb-1 md:mb-2">
                                <div class="w-6 h-6 md:w-8 md:h-8 bg-white/30 rounded-full"></div>
                            </div>
                            <div class="absolute bottom-2 md:bottom-3 left-2 md:left-3 right-2 md:right-3">
                                <div class="h-1 md:h-2 bg-white/20 rounded-full mb-1"></div>
                                <div class="h-1 md:h-2 bg-white/30 rounded-full w-3/4"></div>
                            </div>
                            ${currentTheme === key ? '<div class="absolute top-1 md:top-2 right-1 md:right-2 text-white text-sm md:text-base"><i class="fas fa-check-circle"></i></div>' : ''}
                        </div>
                        <div class="mt-2 md:mt-3 text-center">
                            <h3 class="text-white font-semibold text-sm md:text-base">${theme.name}</h3>
                            <p class="text-white/70 text-xs md:text-sm mt-1 ${isMobile ? 'hidden' : ''}">${theme.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-4 md:mt-6 flex justify-center">
                <button id="randomTheme" class="glass rounded-lg md:rounded-xl px-4 md:px-6 py-2 md:py-3 text-white hover:bg-white/20 transition-all touch-target">
                    <i class="fas fa-random mr-2"></i>
                    Random Theme
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('closeThemeModal').addEventListener('click', () => modal.remove());
    document.getElementById('randomTheme').addEventListener('click', () => {
        const themeKeys = Object.keys(THEMES);
        const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
        setTheme(randomTheme);
        modal.remove();
    });
    
    // Theme card clicks
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeKey = card.dataset.theme;
            setTheme(themeKey);
            modal.remove();
        });
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function initializeTheme() {
    // Apply saved theme on startup
    setTheme(currentTheme);
}

function addCurrentToFavorites() {
    if (weatherData) {
        const city = `${weatherData.name}, ${weatherData.sys.country}`;
        if (!favorites.includes(city)) {
            favorites.push(city);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesDisplay();
        }
    }
}

function updateFavoritesDisplay() {
    const container = document.getElementById('favoritesContainer');
    if (container && favorites.length > 0) {
        container.innerHTML = favorites.map(city => `
            <div class="glass rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-all" onclick="selectFavoriteCity('${city}')">
                <i class="fas fa-star text-yellow-400 mb-2"></i>
                <p class="text-white text-sm font-medium">${city}</p>
            </div>
        `).join('');
    }
}

function selectFavoriteCity(city) {
    const cityName = city.split(',')[0];
    document.getElementById('citySearch').value = cityName;
    fetchWeatherByCity(cityName);
}

function initializeChart() {
    const ctx = document.getElementById('weatherChart');
    if (ctx) {
        // Destroy existing chart if it exists
        if (temperatureChart) {
            temperatureChart.destroy();
            temperatureChart = null;
        }
        
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
}

function updateChart(type) {
    console.log(`🔄 Updating chart: ${type}`);
    
    // Update chart based on selected type
    const ctx = document.getElementById('weatherChart');
    if (!ctx) {
        console.error('❌ Chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (temperatureChart) {
        temperatureChart.destroy();
        temperatureChart = null;
    }
    
    // Clear canvas to prevent overlay issues
    const context = ctx.getContext('2d');
    context.clearRect(0, 0, ctx.width, ctx.height);
    
    // Responsive sizing
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth <= 1024;
    
    const fontSize = isMobile ? 10 : isTablet ? 12 : 14;
    const pointRadius = isMobile ? 2 : 3;
    const borderWidth = isMobile ? 1 : 2;
    
    // Mock data for demonstration
    const labels = isMobile ? 
        ['00', '06', '12', '18'] : 
        ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    let data, label, color;
    
    switch (type) {
        case 'temperature':
            data = isMobile ? [18, 20, 28, 20] : [18, 16, 15, 20, 25, 28, 24, 20];
            label = 'Temperature (°C)';
            color = 'rgb(59, 130, 246)';
            break;
        case 'humidity':
            data = isMobile ? [65, 60, 40, 60] : [65, 70, 75, 60, 45, 40, 50, 60];
            label = 'Humidity (%)';
            color = 'rgb(34, 197, 94)';
            break;
        case 'wind':
            data = isMobile ? [5, 8, 15, 8] : [5, 7, 6, 8, 12, 15, 10, 8];
            label = 'Wind Speed (km/h)';
            color = 'rgb(168, 85, 247)';
            break;
        default:
            data = isMobile ? [18, 20, 28, 20] : [18, 16, 15, 20, 25, 28, 24, 20];
            label = 'Temperature (°C)';
            color = 'rgb(59, 130, 246)';
    }
    
    try {
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
                    borderWidth: borderWidth,
                    pointRadius: pointRadius,
                    pointHoverRadius: pointRadius + 2,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                plugins: {
                    legend: {
                        display: !isMobile,
                        labels: {
                            color: 'white',
                            font: {
                                size: fontSize
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 1,
                        cornerRadius: isMobile ? 6 : 8,
                        titleFont: {
                            size: fontSize
                        },
                        bodyFont: {
                            size: fontSize
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white',
                            font: {
                                size: fontSize
                            },
                            maxTicksLimit: isMobile ? 4 : 8
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
                            font: {
                                size: fontSize
                            },
                            callback: function(value) {
                                return isMobile ? value + '°' : value + (type === 'temperature' ? '°C' : type === 'humidity' ? '%' : ' km/h');
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBorderWidth: 2
                    }
                }
            }
        });
        
        console.log(`✅ Chart updated successfully: ${type}`);
        
        // Add resize handler for chart responsiveness
        const resizeObserver = new ResizeObserver(entries => {
            if (temperatureChart) {
                temperatureChart.resize();
            }
        });
        
        resizeObserver.observe(ctx.parentElement);
        
    } catch (error) {
        console.error('❌ Error creating chart:', error);
        showNotification('⚠️ Chart loading failed. Please refresh the page.', 'error');
    }
}

function updateChartData(weatherData) {
    // Update chart with real weather data
    updateChart('temperature');
}

function updateForecast(type) {
    const container = document.getElementById('forecastContainer');
    if (!container) return;
    
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth <= 1024;
    
    if (type === 'daily') {
        // Mock 5-day forecast
        const forecast = [
            { day: 'Today', icon: 'fas fa-sun', high: 28, low: 18, desc: 'Sunny' },
            { day: 'Tomorrow', icon: 'fas fa-cloud-sun', high: 25, low: 16, desc: 'Partly Cloudy' },
            { day: 'Sunday', icon: 'fas fa-cloud-rain', high: 22, low: 14, desc: 'Light Rain' },
            { day: 'Monday', icon: 'fas fa-cloud', high: 20, low: 12, desc: 'Cloudy' },
            { day: 'Tuesday', icon: 'fas fa-sun', high: 26, low: 15, desc: 'Sunny' }
        ];
        
        // Limit items for mobile
        const displayForecast = isMobile ? forecast.slice(0, 3) : forecast;
        
        container.innerHTML = displayForecast.map(item => `
            <div class="glass rounded-lg md:rounded-xl p-3 md:p-4 text-center hover:scale-105 transition-all touch-target">
                <p class="text-blue-200 text-xs md:text-sm mb-1 md:mb-2 font-medium">${isMobile ? item.day.substring(0, 3) : item.day}</p>
                <i class="${item.icon} text-lg md:text-2xl text-white mb-1 md:mb-2"></i>
                <p class="text-white font-bold text-sm md:text-base">${item.high}°</p>
                <p class="text-blue-300 text-xs md:text-sm">${item.low}°</p>
                ${!isMobile ? `<p class="text-blue-200 text-xs mt-1">${item.desc}</p>` : ''}
            </div>
        `).join('');
    } else {
        // Mock hourly forecast
        const hourlyForecast = [
            { time: 'Now', icon: 'fas fa-sun', temp: 25 },
            { time: '13:00', icon: 'fas fa-sun', temp: 27 },
            { time: '14:00', icon: 'fas fa-cloud-sun', temp: 28 },
            { time: '15:00', icon: 'fas fa-cloud-sun', temp: 26 },
            { time: '16:00', icon: 'fas fa-cloud', temp: 24 },
            { time: '17:00', icon: 'fas fa-cloud', temp: 22 },
            { time: '18:00', icon: 'fas fa-cloud-rain', temp: 20 }
        ];
        
        // Limit items for mobile
        const displayForecast = isMobile ? hourlyForecast.slice(0, 4) : isTablet ? hourlyForecast.slice(0, 5) : hourlyForecast;
        
        container.innerHTML = displayForecast.map(item => `
            <div class="glass rounded-lg md:rounded-xl p-3 md:p-4 text-center hover:scale-105 transition-all touch-target">
                <p class="text-blue-200 text-xs md:text-sm mb-1 md:mb-2 font-medium">${item.time}</p>
                <i class="${item.icon} text-lg md:text-xl text-white mb-1 md:mb-2"></i>
                <p class="text-white font-bold text-sm md:text-base">${item.temp}°</p>
            </div>
        `).join('');
    }
}

function loadUserPreferences() {
    // Load voice setting
    const voiceEnabled = document.getElementById('voiceEnabled');
    if (voiceEnabled) {
        voiceEnabled.checked = isVoiceEnabled;
    }
    
    // Load and display favorites
    updateFavoritesDisplay();
    
    // Load temperature unit preference
    const savedUnit = localStorage.getItem('temperatureUnit') || 'celsius';
    toggleUnit(savedUnit);
}

function updateLoadingText(text) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const isMobile = window.innerWidth <= 640;
    
    const notification = document.createElement('div');
    notification.className = `glass rounded-lg md:rounded-xl p-3 md:p-4 mb-2 text-white animate-slide-up transition-all duration-300 ${getNotificationColor(type)} ${isMobile ? 'mobile-padding mobile-text-sm' : ''}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-sm md:text-base">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 md:ml-4 text-white/60 hover:text-white touch-target">
                <i class="fas fa-times text-xs md:text-sm"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds (longer on mobile for readability)
    const autoRemoveTime = isMobile ? 7000 : 5000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, autoRemoveTime);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'border-l-4 border-green-500';
        case 'error': return 'border-l-4 border-red-500';
        case 'warning': return 'border-l-4 border-yellow-500';
        default: return 'border-l-4 border-blue-500';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Global error handler for unhandled errors
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    // Only show notification for critical errors, not minor ones
    if (event.error && event.error.message && !event.error.message.includes('Chart')) {
        showNotification('⚠️ An unexpected error occurred. The app will continue to work normally.', 'error');
    }
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('⚠️ A network error occurred. Please check your connection.', 'error');
    event.preventDefault(); // Prevent the default browser behavior
});

// Enhanced responsive performance and touch optimizations
function initializeResponsivePerformance() {
    // Optimize for mobile performance
    const isMobile = window.innerWidth <= 640;
    
    if (isMobile) {
        // Disable heavy animations on mobile for better performance
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        
        // Add touch event optimizations
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });
        
        // Optimize chart refresh rate on mobile
        if (window.devicePixelRatio > 1) {
            Chart.defaults.devicePixelRatio = Math.min(window.devicePixelRatio, 2);
        }
    }
    
    // Add safe area support for mobile devices
    if (window.CSS && CSS.supports('padding: env(safe-area-inset-top)')) {
        document.body.style.paddingTop = 'env(safe-area-inset-top)';
        document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }
    
    // Performance monitoring
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection && connection.effectiveType && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
            // Disable heavy features on slow connections
            document.documentElement.style.setProperty('--backdrop-blur', 'none');
        }
    }
}

// Enhanced touch feedback
function addTouchFeedback() {
    const touchTargets = document.querySelectorAll('.touch-target, button, .cursor-pointer');
    
    touchTargets.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.8';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
                this.style.opacity = '';
            }, 150);
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = '';
            this.style.opacity = '';
        }, { passive: true });
    });
}

// Responsive media query handlers
function setupResponsiveMediaQueries() {
    const mediaQueries = {
        mobile: window.matchMedia('(max-width: 640px)'),
        tablet: window.matchMedia('(min-width: 641px) and (max-width: 1024px)'),
        desktop: window.matchMedia('(min-width: 1025px)')
    };
    
    function handleDeviceChange() {
        const currentDevice = mediaQueries.mobile.matches ? 'mobile' : 
                             mediaQueries.tablet.matches ? 'tablet' : 'desktop';
        
        // Update layout based on device
        updateLayoutForDevice(currentDevice);
        
        // Re-initialize touch feedback for new elements
        addTouchFeedback();
        
        // Update chart if exists
        if (temperatureChart) {
            temperatureChart.resize();
        }
    }
    
    // Add listeners for all media queries
    Object.values(mediaQueries).forEach(mq => {
        mq.addListener(handleDeviceChange);
    });
    
    // Initial setup
    handleDeviceChange();
}

function updateLayoutForDevice(device) {
    const body = document.body;
    
    // Remove existing device classes
    body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    
    // Add current device class
    body.classList.add(`device-${device}`);
    
    // Update specific layouts
    if (device === 'mobile') {
        // Mobile-specific optimizations
        const cards = document.querySelectorAll('.glass');
        cards.forEach(card => {
            card.style.backdropFilter = 'blur(8px)'; // Reduce blur on mobile
        });
    } else {
        // Desktop/tablet optimizations
        const cards = document.querySelectorAll('.glass');
        cards.forEach(card => {
            card.style.backdropFilter = 'blur(20px)';
        });
    }
}

// Initialize all responsive features
function initializeResponsiveApp() {
    initializeResponsivePerformance();
    setupResponsiveMediaQueries();
    addTouchFeedback();
    
    // Add window resize debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveChanges();
        }, 250);
    });
}

// App fully initialized - all features ready!