const geoRequest = 'http://api.openweathermap.org/geo/1.0/direct'
const weatherRequest = 'https://api.openweathermap.org/data/2.5/onecall'
const apiKey = '3f434e6779e3b94284bef2d455a52ba8';

var searchBtn = $('#searchBtn');
var cityName = $('#cityName');
var cityDisplay = $('#cityDisplay');
var previousSearches = $('#previous');

//event listener for the click of the search button
searchBtn.on('click', function(event) { 
    event.preventDefault(); // stops the form from resetting itself
    if (cityName.val() === "") { // makes sure that there is a value inputted
        cityName.attr('placeholder', 'No City Entered'); // displays an error message
        return; //stops any more code from being run
    }
    webRequest(cityName.val()); 
});

function webRequest(input) {
    //creates a usable url with the input received
    var geoRequestUrl = geoRequest+'?q='+input+"&appid="+apiKey;

    fetch(geoRequestUrl).then(function(res) { //sends a request to get the lat and lon of the inputted location
        return res.json();
    }).then(function(data) {
        console.log(data);
        console.log(data[0].lat, data[0].lon);
        //updates the UI to show the city searched and the date
        var todayDate = moment().format('M/D/YYYY'); // gets todays date
        cityDisplay.children().eq(0).text(data[0].name+", "+data[0].state+" ("+todayDate+")");
        getWeather(data);
    });
}

function getWeather(geoData) {
    //use lat and lon to create a usable url
    var weatherRequestUrl = weatherRequest+"?lat="+geoData[0].lat+"&lon="+geoData[0].lon+"&units=imperial&appid="+apiKey;
    fetch(weatherRequestUrl).then(function(res) { //sends a request for weather using the received lat and lon 
        return res.json();
    }).then(function(data) {
        console.log(data);
        cityDisplay.children().eq(1).text('Temp: '+data.current.temp+"°F");
        cityDisplay.children().eq(2).text('Wind: '+data.current.wind_speed+" MPH");
        cityDisplay.children().eq(3).text('Humidity: '+data.current.humidity+"%");
        checkIndex(data.current.uvi);
        cityDisplay.children().eq(4).children().text(data.current.uvi);
    });
}

function checkIndex(rating) {
    var indexBox = cityDisplay.children().eq(4).children();
    //removes any of the coloring that the index would have had
    indexBox.removeClass('minimal');
    indexBox.removeClass('low');
    indexBox.removeClass('moderate');
    indexBox.removeClass('high');
    //adds the coloring of the class based on the UV index
    if (rating < 3) {
        indexBox.addClass('minimal');
    } else if (rating < 6) {
        indexBox.addClass('low');
    } else if (rating < 8) {
        indexBox.addClass('moderate');
    } else {
        indexBox.addClass('high');
    }
}

