const updateLocationButton = document.getElementById("updateLocation");
const addCityButton = document.getElementById("addCity");
const addCityInput = document.getElementById("addCityInput");

const weatherTop = document.getElementById("weatherTop");
const weatherContainer = document.getElementById("weatherContainer");

const weatherCityTemplate = document.getElementById("weather-city-template");

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

addCityButton.addEventListener('click', (event) => {
    addCityFromInput();
    event.preventDefault();
})

let locationCache = null;

const defaultLocation = 'Saint Petersburg';

function getLocation() {
    let listNode = setHtmlFieldsTop(updateIcon, loadingText, loadingText);
    setWeatherListFieldsHtml(listNode, loadingText, loadingText, loadingText, loadingText, loadingText);
    let currentLocation = navigator.geolocation;
    if (locationCache != null) {
        console.log("Using cached location")
        updateLocation(locationCache);
    } else if (currentLocation) {
        currentLocation.getCurrentPosition(
            (p) => {
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

const loadingText = "Loading...";

function updateLocation(location) {
    let weatherInfo;
    if (typeof location === 'string' || location instanceof String) {
        weatherInfo = requestObject(getWeatherByCityEndpoint(location))
    } else {
        weatherInfo = requestObject(getWeatherByCoordsEndpoint(location.latitude, location.longitude))
    }
    if (weatherInfo != null) {
        weatherInfo.then(result => changeWeather(result, setHtmlFieldsTop));
    }
}

function setHtmlFieldsTop(iconName, cityName, temperature) {
    const weatherMain = weatherTop.querySelector(".weather-main");
    const weatherDegrees = weatherMain.querySelector(".weather-degrees");

    weatherDegrees.querySelector(".weather-img").src = iconName === updateIcon ? updateIcon : getIconEndpoint(iconName);
    weatherDegrees.querySelector(".weather-degrees-now").innerHTML = temperature;

    weatherMain.querySelector(".main-text").innerHTML = cityName;

    return weatherTop.querySelector(".weather-info");
}

function changeWeather(weatherInfo, setHtmlFields) {
    const iconName = getByXPath(weatherInfo, "/current/weather/@icon");
    const cityName = getByXPath(weatherInfo, "/current/city/@name");

    const temperature = `${getByXPath(weatherInfo, "/current/temperature/@value")}°C`;

    updateWeatherInfoHtml(setHtmlFields(iconName, cityName, temperature), weatherInfo);
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

    setWeatherListFieldsHtml(weatherInfoHtml, windDesc, clouds, pressure, humidity, coords);
}

function setWeatherListFieldsHtml(weatherInfoHtml, windDesc, clouds, pressure, humidity, coords) {
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
    console.log(`receiving object from ${endpoint}`);
    return fetch(endpoint)
        .then( response => {
            if (response.ok) {
                return response.text()
            } else {
                throw new Error("Can't get object");
            }
        })
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .catch(() => {
            console.error(`Can't connect to endpoint ${endpoint}`);
            return null;
        })
}

const updateIcon = "images/update.png";

function addCityByName(name, reset = false) {
    let id = name + "_id"; // for correct deletion
    if (localStorage.getItem(id) == null || reset) {
        let cityNode = addCityHtml(id);
        setHtmlFieldsBottom(updateIcon, loadingText, loadingText, cityNode);
        setWeatherListFieldsHtml(cityNode, loadingText, loadingText, loadingText, loadingText, loadingText);
        localStorage.setItem(id, name);
        requestObject(getWeatherByCityEndpoint(name))
            .then(response => {
                if (response != null) {
                    changeWeather(response, (i, c, t) => setHtmlFieldsBottom(i, c, t, cityNode))
                } else {
                    deleteCity(cityNode);
                    console.error(`Can't get data for city ${name}`);
                }
            }).catch((e) => console.error(e + "Can't add city"));
    } else {
        console.error(`City ${name} already exists`);
    }
}

function addCityFromInput() {
    console.log("adding city");
    let inputCity = addCityInput.value;
    addCityByName(inputCity);
}

function setHtmlFieldsBottom(iconName, cityName, temperature, node) {
    const weatherMain = node.querySelector(".weather-city-header");

    weatherMain.querySelector(".weather-city-img").src = updateIcon === iconName ? updateIcon : getIconEndpoint(iconName);
    weatherMain.querySelector(".weather-city-temp").innerHTML = temperature;
    weatherMain.querySelector(".weather-city-name").innerHTML = cityName;

    return node;
}

function addCityHtml(id) {
    let clone = weatherCityTemplate.cloneNode(true);
    clone.removeAttribute("hidden");
    clone.setAttribute('id', id);

    let listNode = setHtmlFieldsBottom(loadingText, loadingText, loadingText, clone);
    setWeatherListFieldsHtml(listNode, loadingText, loadingText, loadingText, loadingText, loadingText);

    weatherContainer.appendChild(clone);
    console.log("city added");
    return clone;
}

function deleteCityFromChild(element) {
    let cityNode = element.parentNode.parentNode;
    deleteCity(cityNode);
}

function deleteCity(cityNode) {
    let cityId = cityNode.id;
    console.log("deleting city with id " + cityId)
    if (localStorage.getItem(cityId) != null) {
        localStorage.removeItem(cityId);
        weatherContainer.removeChild(cityNode);
    }
}

getLocation();

let favourite = Object.keys(localStorage);
for (let i = 0, id;  id = favourite[i]; i++) {
    addCityByName(localStorage.getItem(id), true);
}