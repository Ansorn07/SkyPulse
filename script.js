const API_KEY = "b5eebdfea501ca7702de9dc3983f5422";

// DOM Elements
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchForm]");
const searchInput = document.querySelector("[data-searchInput]");
const grantAccessBtn = document.querySelector("[data-grantAccess]");

const userInfoContainer = document.querySelector(".userInfoContainer");
const grantAccessContainer = document.querySelector(".grantLocationContainer");
const loadingContainer = document.querySelector(".loadingContainer");
const notFound = document.querySelector(".errorContainer");
const errorText = document.querySelector("[data-errorText]");
const errorBtn = document.querySelector("[data-errorButton]");
const errorImage = document.querySelector("[data-errorImg]");

let currentTab = userTab;
currentTab.classList.add("currentTab");

// Initial session check
getCoordinatesFromSession();

// Tab switcher
function switchTab(newTab) {
  if (currentTab === newTab) return;

  currentTab.classList.remove("currentTab");
  newTab.classList.add("currentTab");
  currentTab = newTab;

  resetUI();

  if (newTab === searchTab) {
    searchForm.classList.add("active");
  } else {
    searchForm.classList.remove("active");
    getCoordinatesFromSession();
  }
}

function resetUI() {
  notFound.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  userInfoContainer.classList.remove("active");
  loadingContainer.classList.remove("active");
}

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// Fetch from session storage
function getCoordinatesFromSession() {
  const storedCoords = sessionStorage.getItem("userCoordinates");
  if (!storedCoords) {
    grantAccessContainer.classList.add("active");
  } else {
    const coords = JSON.parse(storedCoords);
    fetchWeatherByCoordinates(coords);
  }
}

// Grant location button
grantAccessBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(storeCoordsAndFetch);
  } else {
    grantAccessBtn.style.display = "none";
  }
});

function storeCoordsAndFetch(position) {
  const coords = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("userCoordinates", JSON.stringify(coords));
  fetchWeatherByCoordinates(coords);
}

// Search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (city !== "") {
    fetchWeatherByCity(city);
    searchInput.value = "";
  }
});

// Fetch by coordinates
async function fetchWeatherByCoordinates({ lat, lon }) {
  resetUI();
  loadingContainer.classList.add("active");

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();

    if (!data.sys) throw data;

    renderWeatherInfo(data);
  } catch (err) {
    showError(err?.message || "Something went wrong");
  } finally {
    loadingContainer.classList.remove("active");
  }
}

// Fetch by city name
async function fetchWeatherByCity(city) {
  resetUI();
  loadingContainer.classList.add("active");

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();

    if (!data.sys) throw data;

    renderWeatherInfo(data);
  } catch (err) {
    showError(err?.message || "City not found");
  } finally {
    loadingContainer.classList.remove("active");
  }
}

// Render UI
function renderWeatherInfo(data) {
  const cityName = document.querySelector("[data-cityName]");
  const countryFlag = document.querySelector("[data-countryFlag]");
  const weatherDesc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const wind = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const clouds = document.querySelector("[data-clouds]");

  cityName.textContent = data.name;
  countryFlag.src = `https://flagcdn.com/144x108/${data.sys.country.toLowerCase()}.png`;
  weatherDesc.textContent = data.weather[0].description;
  weatherIcon.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  temp.textContent = `${data.main.temp.toFixed(1)} °C`;
  wind.textContent = `${data.wind.speed.toFixed(1)} m/s`;
  humidity.textContent = `${data.main.humidity}%`;
  clouds.textContent = `${data.clouds.all}%`;

  userInfoContainer.classList.add("active");
}

// Show error state
function showError(message) {
  notFound.classList.add("active");
  errorText.textContent = `Error: ${message}`;
  errorBtn.style.display = "none";
  errorImage.style.display = "none";
}
