/* Global Variables */
let apiKey = "aa8002389f89059260c4f516b23541a3";

// Read in localstorage and create buttons
let previousCities = [];
previousCities = JSON.parse(localStorage.getItem("previousCities"));

// Prints previous city buttons
function printPreviousCities() {
  try {
    $("#history").html("");
    previousCities.forEach((element) => {
      let previousCityButton = $("<button>")
        .attr("class", "btn btn-outline-secondary historyButton")
        .text(element);
      $("#history").append(previousCityButton);
      $("#history").append($("<br>"));
    });
  } catch {}
}
printPreviousCities();

/* Handles search button event */
$("#search-button").on("click", async function (event) {
  event.preventDefault();
  let cityName = $("#search-input").val().trim();

  //Save city name to local storage
  try {
    previousCities.push(cityName);
  } catch {
    previousCities = [cityName];
  }
  localStorage.setItem("previousCities", JSON.stringify(previousCities));

  weatherCall(cityName);

  // Prints previous city buttons
  printPreviousCities();
});

$(".historyButton").on("click", function () {
  let cityName = $(this).text();
  weatherCall(cityName);
});

async function weatherCall(cityName) {
  let geoData = await getLocation(cityName);
  let weatherArray = await getWeather(geoData[0], geoData[1]);
  let currentDate = moment().format("DD MMMM YYYY");

  $("#location").text(`${cityName} (${currentDate})`);

  let imageIcon = $("<img>")
    .attr("id", "currentWeatherIcon")
    .attr("class", "pull-right img-fluid");
  console.log(imageIcon);

  // Clears out icon
  $("#currentWeatherIcon").remove();

  $(".currentDayCard").prepend(imageIcon);

  $("#currentWeatherIcon").attr(
    "src",
    `https://openweathermap.org/img/w/${weatherArray[0].weatherIcon}.png`
  );

  // Use most recent weather info for today's display
  $("#currentTemp").text(`Temp: ${weatherArray[0].temp.toFixed(2)} °C`);
  $("#currentWind").text(`Wind: ${weatherArray[0].wind.toFixed(2)} KPH`);
  $("#currentHumidity").text(
    `Humidity: ${weatherArray[0].humidity.toFixed(2)}%`
  );

  // 5 day Forecast
  $("#forecastItems").html(`
  <div class="col">
  <div class="card-body bg-secondary rounded">
    <h5>${weatherArray[1].date}</h5>
    <img src="https://openweathermap.org/img/w/${
      weatherArray[1].weatherIcon
    }.png">
    <p class="card-text">Temp: ${weatherArray[1].temp.toFixed(2)} °C</p>
    <p class="card-text">Wind: ${weatherArray[1].wind.toFixed(2)} °KPH</p>
    <p class="card-text">Humidity: ${weatherArray[1].humidity} %</p>
  </div>
  </div>

  <div class="col">
  <div class="card-body bg-secondary rounded">
  <h5>${weatherArray[2].date}</h5>
  <img src="https://openweathermap.org/img/w/${
    weatherArray[2].weatherIcon
  }.png">
  <p class="card-text">Temp: ${weatherArray[2].temp.toFixed(2)} °C</p>
  <p class="card-text">Wind: ${weatherArray[2].wind.toFixed(2)} °KPH</p>
  <p class="card-text">Humidity: ${weatherArray[2].humidity} %</p>
</div>
</div>

<div class="col">
<div class="card-body bg-secondary rounded">
<h5>${weatherArray[3].date}</h5>
<img src="https://openweathermap.org/img/w/${weatherArray[3].weatherIcon}.png">
<p class="card-text">Temp: ${weatherArray[3].temp.toFixed(2)} °C</p>
<p class="card-text">Wind: ${weatherArray[3].wind.toFixed(2)} °KPH</p>
<p class="card-text">Humidity: ${weatherArray[3].humidity} %</p>
</div>
</div>

<div class="col">
<div class="card-body bg-secondary rounded">
<h5>${weatherArray[4].date}</h5>
<img src="https://openweathermap.org/img/w/${weatherArray[4].weatherIcon}.png">
<p class="card-text">Temp: ${weatherArray[4].temp.toFixed(2)} °C</p>
<p class="card-text">Wind: ${weatherArray[4].wind.toFixed(2)} °KPH</p>
<p class="card-text">Humidity: ${weatherArray[4].humidity} %</p>
</div>
</div>

<div class="col">
<div class="card-body bg-secondary rounded">
<h5>${weatherArray[5].date}</h5>
<img src="https://openweathermap.org/img/w/${weatherArray[5].weatherIcon}.png">
<p class="card-text">Temp: ${weatherArray[5].temp.toFixed(2)} °C</p>
<p class="card-text">Wind: ${weatherArray[5].wind.toFixed(2)} °KPH</p>
<p class="card-text">Humidity: ${weatherArray[5].humidity} %</p>
</div>
</div>
`);
}

async function getLocation(location) {
  let queryURL = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`;

  let response = await fetch(queryURL);
  const responseJson = await response.json();

  console.log(responseJson);

  let cityLat = responseJson[0].lat;
  let cityLon = responseJson[0].lon;

  console.log(`Lattitude: ${cityLat}
    Longitude: ${cityLon}`);

  return [cityLat, cityLon];
}

async function getWeather(cityLon, cityLat) {
  // Clear weatherarray
  weatherArray = [];
  let queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLon}&lon=${cityLat}&appid=${apiKey}`;
  console.log(queryURL);

  let response = await fetch(queryURL);
  const responseJson = await response.json();
  console.log(responseJson);

  for (let i = 0; i < responseJson.list.length; i++) {
    // console.log(i)
    let currentData = responseJson.list[i];
    console.log(currentData["dt_txt"]);

    //If first date in the weatherArray shows today, do not display item, start from the next day and only forecast 4 days!

    // Writes most soonest weather forecast to weatherobject
    if (i === 0) {
      let weatherObject = {
        date: currentData.dt_txt.substring(0, 10),
        temp: currentData.main.temp - 273.15,
        wind: currentData.wind.speed,
        humidity: currentData.main.humidity,
        weatherIcon: currentData.weather[0].icon,
      };
      weatherArray.push(weatherObject);
    }
    // Writes weather forecasts for each day at noon.
    else if (currentData.dt_txt.includes("12:00:00")) {
      console.log(i);
      let weatherObject = {
        date: currentData.dt_txt.substring(0, 10),
        temp: currentData.main.temp - 273.15,
        wind: currentData.wind.speed,
        humidity: currentData.main.humidity,
        weatherIcon: currentData.weather[0].icon,
      };

      weatherArray.push(weatherObject);
    }
  }
  console.log(weatherArray);
  return weatherArray;
}
