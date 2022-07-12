const geoRequest = 'http://api.openweathermap.org/geo/1.0/direct'
const weatherRequest = 'https://api.openweathermap.org/data/2.5/onecall'
const apiKey = '3f434e6779e3b94284bef2d455a52ba8';

var searchBtn = $('#searchBtn');
var cityName = $('#cityName');
var cityDisplay = $('#cityDisplay');
var previousSearches = $('#previous');
var infoDisplay = $('#infoDisplay');
var forecast = $('#forecast');

init(); //initialize the program with the values in localStorage

//event listener for the click of the search button
searchBtn.on('click', function(event) { 
    event.preventDefault(); // stops the form from resetting itself
    if (cityName.val() === "") { // makes sure that there is a value inputted
        cityName.attr('placeholder', 'No City Entered'); // displays an error message
        return; //stops any more code from being run
    }
    //formats the string to be lowercase, except for the first character
    var str = formatInput(cityName.val());
    //appends a new button that holds the new value as long as it isn't already in the list
    appendNewButton(str);
    //sends a request for the geo location
    webRequest(cityName.val());
    cityName.val(""); // clears the value from the text input
});
//event listener for the previously searched buttons
previousSearches.on('click','.btn', btnClick);

function init() {
    //grab the local storage array, otherwise, assign the variable to an empty array
    var local = JSON.parse(localStorage.getItem('pastSearches')) || []; 
    console.log(local);
    for (var i = 0; i < local.length; i++) { // add a button for every index in local
        previousSearches.append('<button class="btn bg-light-gray">'+local[i]+'</button>');
    }
}

function btnClick(event) {
    event.preventDefault();
    webRequest($(this).text()); // sends a web request based on the text on the button
}

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
        // switches the display to show the country if the state is empty
        var container = data[0].state; 
        if (container === undefined) container = data[0].country;
        cityDisplay.find('h3').text(data[0].name+", "+container+" ("+todayDate+")");
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
        //displays the weather icon beside the city name and current date
        var icon = data.current.weather[0].icon;
        cityDisplay.children().eq(1).attr('src','http://openweathermap.org/img/wn/'+icon+'.png');
        cityDisplay.children().eq(1).attr('alt',data.current.weather[0].main);
        cityDisplay.children().eq(2).text('Temp: '+data.current.temp+"°F"); // shows the current temperature
        cityDisplay.children().eq(3).text('Wind: '+data.current.wind_speed+" MPH"); // shows the current wind speed
        cityDisplay.children().eq(4).text('Humidity: '+data.current.humidity+"%"); // shows the current humidity
        checkIndex(data.current.uvi); // sets the background color of the UV index
        cityDisplay.children().eq(5).children().text(data.current.uvi); // displays the current UV index
        populateForecast(data); // renders the 5-day forecast
        infoDisplay.removeClass('hide'); // allows the user display to be seen
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
    } // :)
}

function formatInput(str) {
    var words = str.split(" "); //splits the name into individual words
    var output = "";
    console.log(words);
    // loops through the words and formats each one into Aaaaa
    for (var i = 0; i < words.length; i++) { 
        console.log(words[i]);
        words[i] = words[i].substring(0,1).toUpperCase() + words[i].substring(1,words[i].length).toLowerCase();
        output += words[i] + " "; // concatenates the indexes into a single string
        console.log(words[i]);
    }
    return output.trim(); //returns the concatenated string with no spaces before or after
}

function appendNewButton(str) {
    //loops through the list of buttons and exits the function if the current search is already in the list
    for (var i = 0; i < previousSearches.children().length; i++) {
        if (previousSearches.children().eq(i).text() === str) return;
    }
    previousSearches.append('<button class="btn bg-light-gray">'+str+'</button>'); // appends the new button to the form
    var local = JSON.parse(localStorage.getItem('pastSearches')) || []; // gets the localStorage data
    local.push(str); // adds the new list item to the list in localStorage
    localStorage.setItem('pastSearches',JSON.stringify(local)); // updates localStorage
}

function populateForecast(data) {
    //loops through the data to display a 5-day forecast
    for (var i = 0; i < 5; i++) {
        var day = forecast.children().eq(i); // moves through the different divs
        var icon = data.daily[i].weather[0].icon; // gets the icon of the indexed day
        day.children().eq(0).text(moment().add(i+1,'days').format('M/D/YYYY')); // display the date of the respective index
        day.children().eq(1).attr('src','http://openweathermap.org/img/wn/'+icon+'.png'); // gets the icon for the indexed day
        day.children().eq(1).attr('alt',data.daily[i].weather[0].main); // sets the alt text of the icon to be more descriptive
        day.children().eq(2).text('Temp: '+data.daily[i].temp.day+"°F"); // displays the temperature of the indexed day
        day.children().eq(3).text('Wind: '+data.daily[i].wind_speed+" MPH"); // displays the wind speed of the indexed day
        day.children().eq(4).text('Humidity: '+data.daily[i].humidity+"%"); // displays the humidity of the indexed day
    }
}