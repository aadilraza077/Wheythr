// Constants
const API_KEY = '6d3fc6e3b1864d17a1f102147241312'; // Replace with your WeatherAPI key
const weatherContent = document.getElementById('weatherContent');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const countrySelect = document.getElementById('countrySelect');
const citySelect = document.getElementById('citySelect');
const getLocationBtn = document.getElementById('getLocation');
const currentLocationEl = document.getElementById('currentLocation');

// Weather elements
const tempElement = document.getElementById('temp');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('windSpeed');
const feelsLikeElement = document.getElementById('feelsLike');
const pressureElement = document.getElementById('pressure');

// Countries and Cities Data
const countriesAndCities = {
    "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
    "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Surat", "Jaipur"],
    "United Kingdom": ["London", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Manchester", "Liverpool", "Bristol", "Edinburgh", "Leicester"],
    "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Quebec City", "Winnipeg", "Hamilton", "Halifax"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City"],
    "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"],
    "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
    "Japan": ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki", "Kyoto", "Saitama"],
    "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
    "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Nelspruit", "Kimberley", "Polokwane", "Pietermaritzburg"]
};

// Show/hide functions
const showLoader = () => {
    loader.style.display = 'flex';
    weatherContent.style.display = 'none';
    errorMessage.style.display = 'none';
};

const showWeather = () => {
    loader.style.display = 'none';
    weatherContent.style.display = 'block';
    errorMessage.style.display = 'none';
};

const showError = (message) => {
    loader.style.display = 'none';
    weatherContent.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
};

// Populate country dropdown
const populateCountries = () => {
    Object.keys(countriesAndCities).sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
};

// Populate cities dropdown based on selected country
const populateCities = (country) => {
    citySelect.innerHTML = '<option value="">Select City</option>';
    if (country && countriesAndCities[country]) {
        countriesAndCities[country].sort().forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
};

// Map weather conditions to our icon names
const mapWeatherCondition = (code) => {
    if (code === 1000) return 'clear';
    if (code >= 1003 && code <= 1030) return 'clouds';
    if (code >= 1063 && code <= 1201) return 'rain';
    if (code >= 1204 && code <= 1237) return 'snow';
    if (code >= 1273 && code <= 1282) return 'thunderstorm';
    return 'clouds';
};

// Set weather icon based on condition
const setWeatherIcon = (conditionCode) => {
    const condition = mapWeatherCondition(conditionCode);
    weatherIcon.src = `assets/icons/${condition}.png`;
    return condition;
};

// Update background based on weather
const updateBackground = (condition) => {
    document.body.className = condition;
};

// Fetch weather data
const fetchWeather = async (location) => {
    try {
        showLoader();
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`
        );
        const data = await response.json();

        if (response.ok && data.current) {
            // Update UI with weather data
            currentLocationEl.textContent = `${data.location.name}, ${data.location.country}`;
            tempElement.textContent = Math.round(data.current.temp_c);
            weatherDescription.textContent = data.current.condition.text;
            humidityElement.textContent = data.current.humidity;
            windSpeedElement.textContent = data.current.wind_kph;
            feelsLikeElement.textContent = Math.round(data.current.feelslike_c);
            pressureElement.textContent = data.current.pressure_mb;

            // Update weather icon and background
            const condition = setWeatherIcon(data.current.condition.code);
            updateBackground(condition);

            showWeather();

            // Update dropdowns to match current location
            updateDropdownsForLocation(data.location.country, data.location.name);
        } else {
            showError(data.error?.message || 'Failed to fetch weather data');
        }
    } catch (err) {
        showError('Failed to fetch weather data');
    }
};

// Update dropdowns to match current location
const updateDropdownsForLocation = (country, city) => {
    // Find the closest matching country in our list
    const matchingCountry = Object.keys(countriesAndCities).find(c => 
        country.includes(c) || c.includes(country)
    );

    if (matchingCountry) {
        countrySelect.value = matchingCountry;
        populateCities(matchingCountry);

        // Find the closest matching city in our list
        const matchingCity = countriesAndCities[matchingCountry].find(c => 
            city.includes(c) || c.includes(city)
        );

        if (matchingCity) {
            citySelect.value = matchingCity;
        }
    }
};

// Get user's location using browser geolocation
const getBrowserLocation = () => {
    if (navigator.geolocation) {
        showLoader();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(`${latitude},${longitude}`);
            },
            (error) => {
                showError('Unable to get location: ' + error.message);
                fallbackToIPLocation();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        showError('Geolocation is not supported by this browser');
        fallbackToIPLocation();
    }
};

// Fallback to IP-based location
const fallbackToIPLocation = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        fetchWeather(`${data.city}`);
    } catch (err) {
        fetchWeather('London'); // Final fallback
    }
};

// Event Listeners
countrySelect.addEventListener('change', (e) => {
    populateCities(e.target.value);
});

citySelect.addEventListener('change', (e) => {
    if (e.target.value) {
        fetchWeather(e.target.value);
    }
});

getLocationBtn.addEventListener('click', getBrowserLocation);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    populateCountries();
    getBrowserLocation();
});