// Gestion du preloader
window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  
  // Simulation du chargement (remplacer par vos vrais appels API)
  setTimeout(() => {
    preloader.classList.add('fade-out');
    
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }, 5000); // Durée totale : 5 secondes
});

// Pensez à supprimer le setTimeout quand vous implémentez les vrais chargements
// Configuration de l'API OpenWeatherMap
const API_KEY = "2708df21e5d87306d4a45b1a516593d7"; // Remplacez par votre clé API
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Éléments du DOM
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const celsiusBtn = document.getElementById("celsius-btn");
const fahrenheitBtn = document.getElementById("fahrenheit-btn");
const darkModeBtn = document.getElementById("dark-mode-btn");
const cityName = document.getElementById("city-name");
const currentDate = document.getElementById("current-date");
const weatherIcon = document.getElementById("weather-icon");
const currentTemp = document.getElementById("current-temp");
const weatherDescription = document.getElementById("weather-description");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feels-like");
const forecastContainer = document.getElementById("forecast-container");

// Variables globales
let isCelsius = true;
let currentWeatherData = null;

// Chargement initial (exemple: Paris par défaut)
window.addEventListener("load", () => {
    fetchWeather("Paris");
});

// Recherche par ville
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

// Géolocalisation
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                alert("Erreur de géolocalisation : " + error.message);
            }
        );
    } else {
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
});

// Changement d'unité (°C/°F)
celsiusBtn.addEventListener("click", () => {
    if (!isCelsius) {
        isCelsius = true;
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
        updateWeatherDisplay(currentWeatherData);
    }
});

fahrenheitBtn.addEventListener("click", () => {
    if (isCelsius) {
        isCelsius = false;
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        updateWeatherDisplay(currentWeatherData);
    }
});

// Mode sombre
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkModeBtn.innerHTML = document.body.classList.contains("dark-mode") 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Fonction pour récupérer la météo par ville
async function fetchWeather(city) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`
        );
        const data = await response.json();
        if (data.cod === 200) {
            currentWeatherData = data;
            updateWeatherDisplay(data);
            fetchForecast(data.coord.lat, data.coord.lon);
        } else {
            alert("Ville non trouvée. Essayez un autre nom.");
        }
    } catch (error) {
        console.error("Erreur API :", error);
        alert("Erreur lors de la récupération des données météo.");
    }
}

// Fonction pour récupérer la météo par coordonnées
async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
        );
        const data = await response.json();
        currentWeatherData = data;
        updateWeatherDisplay(data);
        fetchForecast(lat, lon);
    } catch (error) {
        console.error("Erreur API :", error);
    }
}

// Fonction pour récupérer les prévisions
async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
        );
        const data = await response.json();
        updateForecastDisplay(data.list);
    } catch (error) {
        console.error("Erreur API :", error);
    }
}

// Mise à jour de l'affichage météo actuelle
function updateWeatherDisplay(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    const date = new Date(data.dt * 1000);
    currentDate.textContent = date.toLocaleDateString("fr-FR", {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const temp = isCelsius ? Math.round(data.main.temp) : Math.round((data.main.temp * 9/5) + 32);
    currentTemp.textContent = temp;
    
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherDescription.textContent = data.weather[0].description;
    
    humidity.textContent = `${data.main.humidity}%`;
    pressure.textContent = `${data.main.pressure} hPa`;
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    
    const feelsLikeTemp = isCelsius 
        ? Math.round(data.main.feels_like) 
        : Math.round((data.main.feels_like * 9/5) + 32);
    feelsLike.textContent = `${feelsLikeTemp}°${isCelsius ? 'C' : 'F'}`;
}

// Mise à jour des prévisions
function updateForecastDisplay(forecastList) {
    forecastContainer.innerHTML = "";
    
    // Filtrer pour avoir une prévision par jour (tous les 24h)
    const dailyForecasts = forecastList.filter((_, index) => index % 8 === 0).slice(0, 5);
    
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("fr-FR", { weekday: 'short' });
        
        const tempMax = isCelsius 
            ? Math.round(day.main.temp_max) 
            : Math.round((day.main.temp_max * 9/5) + 32);
        const tempMin = isCelsius 
            ? Math.round(day.main.temp_min) 
            : Math.round((day.main.temp_min * 9/5) + 32);
        
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
            <h3>${dayName}</h3>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <p>${day.weather[0].description}</p>
            <p>Max: ${tempMax}°${isCelsius ? 'C' : 'F'}</p>
            <p>Min: ${tempMin}°${isCelsius ? 'C' : 'F'}</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}