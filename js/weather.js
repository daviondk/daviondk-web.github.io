const updateLocationButton = document.getElementById("updateLocation");
const addCityButton = document.getElementById("addCity");
const addCityInput = document.getElementById("addCityInput");

const weatherTop = document.getElementById("weatherTop");
const weatherContainer = document.getElementById("weatherContainer");

const apiKey = "7fc666f8ef3f379a8fbd995000ef703d";

const getWeatherByCityEndpoint =
    (cityName) => `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

const getWeatherByCoordsEndpoint =
    (lat, lon) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

const getIconEndpoint =
    (iconName) => `http://openweathermap.org/img/wn/${iconName}.png`

updateLocationButton.addEventListener('click', (event) => {
    getLocation();
    event.preventDefault(); // ?
})

addCityButton.addEventListener('submit', (event) => {
    // addCity(event);
    event.preventDefault();
})

let locationCache = null;

const defaultLocation = 'Saint Petersburg';

function getLocation() {
    if (locationCache != null) {
        console.log("Using cached location")
        updateLocation(locationCache);
    } else if (navigator.geolocation) {
        locationCache = navigator.geolocation.getCurrentPosition(showPosition);
        console.log("Location is loaded");
        updateLocation(locationCache);
    } else {
        console.log("Geolocation is not supported by this browser. Using default location");
        updateLocation(defaultLocation)
    }
}

function updateLocation(location) {
    let weatherInfo;
    if (typeof location === 'string' || location instanceof String) {
        weatherInfo = requestObject(getWeatherByCityEndpoint(location))
    } else {
        weatherInfo = requestObject(getWeatherByCoordsEndpoint(location))
    }
    if (weatherInfo != null) {
        changeWeather(weatherInfo);
    }
}

function changeWeather(weatherInfo) {
    //...
}


function requestObject(endpoint) {
    return fetch(endpoint).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.error(`Can't request object from ${endpoint}`)
            return null;
        }
    }).catch(() => {
        console.error(`Can't connect to endpoint ${endpoint}`);
        return null;
    })
}
