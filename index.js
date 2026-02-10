function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  document.getElementById("dateTime").textContent = now.toLocaleDateString(
    "en-US",
    options,
  );
}

function updateBackgroundTheme(weatherCode, isDay) {
  const body = document.body;
  body.className = "";

  if (!isDay) {
    body.classList.add("night");
  } else if (weatherCode >= 200 && weatherCode < 600) {
    body.classList.add("rainy");
  } else if (weatherCode >= 801 && weatherCode < 900) {
    body.classList.add("cloudy");
  }
}

async function fetchWeather(city) {
  try {
    loading.classList.remove("hidden");
    weatherInfo.classList.add("hidden");
    error.classList.add("hidden");

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    displayWeather(data);
  } catch (err) {
    showError(err.message);
  } finally {
    loading.classList.add("hidden");
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    loading.classList.remove("hidden");
    weatherInfo.classList.add("hidden");
    error.classList.add("hidden");

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    );

    if (!response.ok) {
      throw new Error("Unable to fetch weather data");
    }

    const data = await response.json();
    displayWeather(data);
  } catch (err) {
    showError(err.message);
  } finally {
    loading.classList.add("hidden");
  }
}

function displayWeather(data) {
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temperature").textContent =
    `${Math.round(data.main.temp)}°C`;
  document.getElementById("description").textContent =
    data.weather[0].description;
  document.getElementById("windSpeed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("feelsLike").textContent =
    `${Math.round(data.main.feels_like)}°C`;

  const iconCode = data.weather[0].icon;
  document.getElementById("weatherIcon").textContent =
    weatherIcons[iconCode] || "🌤️";

  updateDateTime();
  updateBackgroundTheme(data.weather[0].id, iconCode.includes("d"));

  weatherInfo.classList.remove("hidden");
}

function showError(message) {
  error.textContent = `❌ ${message}`;
  error.classList.remove("hidden");
  setTimeout(() => {
    error.classList.add("hidden");
  }, 3000);
}

function searchWeather() {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  } else {
    showError("Please enter a city name");
  }
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      () => {
        showError("Unable to get your location");
      },
    );
  } else {
    showError("Geolocation is not supported by your browser");
  }
}

// Load default city on page load
window.addEventListener("load", () => {
  fetchWeather("London");
});
