const API_KEY = "906850c1c5784b076022a17196884c8a";

const weatherInfo = document.getElementById("weatherInfo");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const cityInput = document.getElementById("cityInput");

// ── Weather emoji map ──
const weatherIcons = {
  "01d": "☀️",
  "01n": "🌙",
  "02d": "⛅",
  "02n": "☁️",
  "03d": "☁️",
  "03n": "☁️",
  "04d": "☁️",
  "04n": "☁️",
  "09d": "🌧️",
  "09n": "🌧️",
  "10d": "🌦️",
  "10n": "🌧️",
  "11d": "⛈️",
  "11n": "⛈️",
  "13d": "❄️",
  "13n": "❄️",
  "50d": "🌫️",
  "50n": "🌫️",
};

// ── Advice logic ──
function getAdvice(weatherId, temp, humidity, windSpeed) {
  if (weatherId >= 200 && weatherId < 300)
    return {
      icon: "⛈️",
      text: "Thunderstorm alert! Stay indoors, avoid open areas and tall trees. Unplug electronics and postpone any outdoor plans.",
    };

  if (weatherId >= 300 && weatherId < 400)
    return {
      icon: "🌂",
      text: "Light drizzle outside. Carry an umbrella just in case. Good weather to stay cozy indoors with a warm drink.",
    };

  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId === 500 || weatherId === 501)
      return {
        icon: "☔",
        text: "It's raining — not a great day for drying clothes outside. Bring in any laundry and keep an umbrella handy when going out.",
      };
    return {
      icon: "🌊",
      text: "Heavy rain expected. Avoid flooded roads, postpone outdoor activities, and keep emergency contacts ready.",
    };
  }

  if (weatherId >= 600 && weatherId < 700)
    return {
      icon: "🧣",
      text: "Snowy conditions! Bundle up with layers, wear waterproof boots, and drive carefully. Roads may be slippery.",
    };

  if (weatherId >= 700 && weatherId < 800)
    return {
      icon: "🌫️",
      text: "Low visibility due to fog or haze. Drive slowly with headlights on and allow extra travel time. Avoid strenuous outdoor exercise.",
    };

  if (weatherId === 800) {
    if (temp > 35)
      return {
        icon: "🥵",
        text: "Clear but scorching hot! Great for drying clothes — they'll dry fast. Stay hydrated, use sunscreen, and avoid peak sun hours (10am–3pm).",
      };
    if (temp > 28)
      return {
        icon: "☀️",
        text: "Sunny and warm! Perfect for drying clothes outdoors. Don't forget sunscreen if you're going out.",
      };
    return {
      icon: "🌤️",
      text: "Clear and pleasant! Ideal for outdoor activities or a walk. Great day to air out rooms and dry clothes naturally.",
    };
  }

  if (weatherId > 800) {
    if (weatherId === 801 || weatherId === 802)
      return {
        icon: "⛅",
        text: "Partly cloudy with decent sunlight. You can still dry clothes outside, though it may take a bit longer.",
      };
    return {
      icon: "☁️",
      text: "Overcast skies — drying clothes outside isn't ideal today. Consider hanging them indoors with good ventilation.",
    };
  }

  return {
    icon: "🌡️",
    text: "Check conditions before heading out. Stay prepared for changing weather throughout the day.",
  };
}

// ── Helpers ──
function updateDateTime() {
  document.getElementById("dateTime").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
}

function showLoading() {
  loading.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  errorDiv.classList.add("hidden");
}

function showError(msg) {
  loading.classList.add("hidden");
  weatherInfo.classList.add("hidden");
  errorDiv.classList.remove("hidden");
  errorDiv.textContent = msg;
}

function displayWeather(data) {
  loading.classList.add("hidden");
  errorDiv.classList.add("hidden");
  weatherInfo.classList.remove("hidden");

  const tempC = Math.round(data.main.temp);
  const feelsC = Math.round(data.main.feels_like);
  const wind = data.wind.speed;
  const hum = data.main.humidity;
  const vis = data.visibility
    ? (data.visibility / 1000).toFixed(1) + " km"
    : "N/A";
  const iconCode = data.weather[0].icon;
  const weatherId = data.weather[0].id;

  document.getElementById("cityName").textContent =
    `${data.name}, ${data.sys.country}`;
  document.getElementById("weatherIcon").textContent =
    weatherIcons[iconCode] || "🌡️";
  document.getElementById("temperature").textContent = `${tempC}°C`;
  document.getElementById("description").textContent =
    data.weather[0].description;
  document.getElementById("windSpeed").textContent = `${wind} m/s`;
  document.getElementById("humidity").textContent = `${hum}%`;
  document.getElementById("feelsLike").textContent = `${feelsC}°C`;
  document.getElementById("visibility").textContent = vis;

  const advice = getAdvice(weatherId, tempC, hum, wind);
  document.getElementById("adviceIcon").textContent = advice.icon;
  document.getElementById("adviceText").textContent = advice.text;

  updateDateTime();
}

// ── Fetch ──
async function fetchWeather(url) {
  showLoading();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    showError("❌ " + err.message + ". Please try again.");
  }
}

function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;
  fetchWeather(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`,
  );
}

function getLocationWeather() {
  if (!navigator.geolocation) return showError("Geolocation not supported.");
  showLoading();
  navigator.geolocation.getCurrentPosition(
    ({ coords }) =>
      fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=metric`,
      ),
    () => showError("❌ Location access denied."),
  );
}

// ── Enter key ──
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWeather();
});
