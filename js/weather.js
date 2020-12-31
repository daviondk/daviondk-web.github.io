const updateLocationButton = document.getElementById("updateLocation");
const addCityButton = document.getElementById("addCity");
const addCityInput = document.getElementById("addCityInput");

const weatherTop = document.getElementById("weatherTop");
const weatherContainer = document.getElementById("weatherContainer");

const apiKey = "7fc666f8ef3f379a8fbd995000ef703d";

const getWeatherByCityEndpoint =
    (cityName) => `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&mode=xml`;

const getWeatherByCoordsEndpoint =
    (lat, lon) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&mode=xml`;

const getIconEndpoint =
    (iconName) => `http://openweathermap.org/img/wn/${iconName}@2x.png`

updateLocationButton.addEventListener('click', (event) => {
    getLocation();
    event.preventDefault(); // ?
})

addCityButton.addEventListener('submit', (event) => {
    // addCity(event);
    event.preventDefault();
})

let locationCache = null;

let locationLat = null;
let locationLong = null;

const defaultLocation = 'Saint Petersburg';

function getLocation() {
    let currentLocation = navigator.geolocation;
    if (locationCache != null) {
        console.log("Using cached location")
    } else if (currentLocation) {
        currentLocation.getCurrentPosition(
            (p) => {
                console.log(p.coords == null);
                setLocation(p.coords);
                console.log("Location is loaded");
                updateLocation(locationCache);
            },
            () => {
                setLocation(defaultLocation);
                console.log("Using default location");
                updateLocation(locationCache);
            }, {timeout:10000});
    } else {
        setLocation(defaultLocation);
        console.log("Using default location");
        updateLocation(locationCache);
    }
}

function setLocation(location) {
    locationCache = location;
}

function updateLocation(location) {
    let weatherInfo;
    if (typeof location === 'string' || location instanceof String) {
        weatherInfo = requestObject(getWeatherByCityEndpoint(location))
    } else {
        weatherInfo = requestObject(getWeatherByCoordsEndpoint(location.latitude, location.longitude))
    }
    if (weatherInfo != null) {
        weatherInfo.then(result => changeWeather(result));
    }
}

function changeWeather(weatherInfo) {
    console.log(weatherInfo);
    const iconName = getByXPath(weatherInfo, "/current/weather/@icon");
    const cityName = getByXPath(weatherInfo, "/current/city/@name");

    const temperature = `${getByXPath(weatherInfo, "/current/temperature/@value")}°C`;

    const weatherMain = weatherTop.querySelector(".weather-main");
    const weatherDegrees = weatherMain.querySelector(".weather-degrees");

    weatherDegrees.querySelector(".weather-img").src = getIconEndpoint(iconName);
    weatherDegrees.querySelector(".weather-degrees-now").innerHTML = temperature;

    weatherMain.querySelector(".main-text").innerHTML = cityName;

    const weatherInfoHtml = weatherTop.querySelector(".weather-info");
    updateWeatherInfoHtml(weatherInfoHtml, weatherInfo);
}

function updateWeatherInfoHtml(weatherInfoHtml, weatherInfo) {

    const coords = `[${getByXPath(weatherInfo, "/current/city/coord/@lon")}, ${getByXPath(weatherInfo, "/current/city/coord/@lat")}]`;
    const humidity = `${getByXPath(weatherInfo, "/current/humidity/@value")} ${getByXPath(weatherInfo, "/current/humidity/@unit")}`;
    const pressure = `${getByXPath(weatherInfo, "/current/pressure/@value")} ${getByXPath(weatherInfo, "/current/pressure/@unit")}`;
    const clouds = `${getByXPath(weatherInfo, "/current/clouds/@name")}`;


    const windDirection = `${getByXPath(weatherInfo, "/current/wind/direction/@name")}`;
    const windSpeed = `${getByXPath(weatherInfo, "/current/wind/speed/@value")} ${getByXPath(weatherInfo, "/current/wind/speed/@unit")}`;
    const windName = `${getByXPath(weatherInfo, "/current/wind/speed/@name")}`;

    const windDesc = `${windName}, ${windSpeed}, ${windDirection}`;

    const weatherList = weatherInfoHtml.querySelector("ul").children;

    for (let i = 0, child; child = weatherList[i]; i++) {
        const featureName = child.querySelector(".weather-field-feature-name");
        const featureValue = child.querySelector(".weather-field-feature-value");
        switch (featureName.innerHTML) {
            case "Ветер":
                featureValue.innerHTML = windDesc;
                break;
            case "Облачность":
                featureValue.innerHTML = clouds;
                break;
            case "Давление":
                featureValue.innerHTML = pressure;
                break;
            case "Влажность":
                featureValue.innerHTML = humidity;
                break;
            case "Координаты":
                featureValue.innerHTML = coords;
                break;
        }
    }
}

function getByXPath(document, path) {
    return document.evaluate(path, document, null, XPathResult.STRING_TYPE, null).stringValue;
}

function requestObject(endpoint) {
    return fetch(endpoint)
        .then( response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .catch(() => {
            console.error(`Can't connect to endpoint ${endpoint}`);
            return null;
        })
}
