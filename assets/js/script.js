//flight searching API Implementation
let origin;
let destin;
let departDate;
let returnDate;
let traveller;
let cabinClass;

const turl = "https://test.api.amadeus.com/v1/security/oauth2/token";
let token;
let surl;

let historyList = [];

//date picker
$("#inputDepart").datepicker();
$("#inputDepart").datepicker("option", "dateFormat", "yy-mm-dd");
$("#inputReturn").datepicker();
$("#inputReturn").datepicker("option", "dateFormat", "yy-mm-dd");

//initialize foundation library js
$(document).foundation();

//render history of seaching to the page
renderHistory();



//function to save user seaching data to local storage
function saveToStorage(origin, destin, departDate, returnDate, traveller, cabinClass) {
    let record = { "origin": origin, "destin": destin, "departDate": departDate, "returnDate": returnDate, "traveller": traveller, "cabinClass": cabinClass }
    if (historyList.length >= 5) {
        let tempList = historyList.reverse();
        tempList.pop();
        historyList = tempList.reverse();
    }
    historyList.push(record);
    localStorage.setItem("history", JSON.stringify(historyList));
}

//function to get seaching history data from local storage
function loadStorage() {
    historyList = JSON.parse(localStorage.getItem("history"));
    if (historyList == null) {
        historyList = [];
    }
}

//function to render seaching history to page
function renderHistory() {
    loadStorage();
    $("#histoyRecord").children().remove();
    for (let i = 0; i < historyList.length; i++) {
        let liEl = $("<li>");
        let aEl = $("<a>").text(historyList[i].origin + " - " + historyList[i].destin);
        aEl.data("info", { "origin": historyList[i].origin, "destin": historyList[i].destin, "departDate": historyList[i].departDate, "returnDate": historyList[i].returnDate, "traveller": historyList[i].traveller, "cabinClass": historyList[i].cabinClass });
        liEl.append(aEl);
        $("#histoyRecord").append(liEl);
    }
}


//function to start the Flight searching
function getFlight() {
    //authorize to get access token
    let returnToken;
    fetch(turl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials&client_id=8EjLWKUGcJyabyxp4WdFDYfFKiQJ7oZK&client_secret=hwJxjIEtCsCqjAyi"
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        returnToken = data.access_token;
        $("#flight").children().remove();
        $("#bookFlight").children().remove();
        //pass token to further flight seaching
        searchFlight(surl, returnToken);
        // hotelRecomm(latitude,longitude,returnToken);
    });
}

//function to call Flight API to get the Airline info
function searchFlight(surl, token) {

    fetch(surl, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(function (response) {

        if (response.status == 400) {
            alert("please enter the valid IATA code")
        }
        return response.json();
    }).then(function (result) {
        console.log(result);
        let typeEl;
        let trEl;
        //render searching result to page
        for (let offer = 0; offer < Object.keys(result.data).length; offer++) {
            for (let i = 0; i < Object.keys(result.data[offer].itineraries).length; i++) {
                for (let j = 0; j < Object.keys(result.data[offer].itineraries[i].segments).length; j++) {
                    if (i % 2 == 0) {
                        typeEl = $("<td>").text("Depart");
                        trEl = $("<tr>");
                    } else {
                        typeEl = $("<td>").text("Return");
                        trEl = $("<tr>");
                        trEl.attr("style", "border-bottom:5px solid black");
                    }
                    let departTime = result.data[offer].itineraries[i].segments[j].departure.at;
                    let departureTimeEl = $("<td>").text(departTime.split("T")[0] + " " + departTime.split("T")[1]);
                    let departureCityEl = $("<td>").text(result.data[offer].itineraries[i].segments[j].departure.iataCode);
                    let arrivalTime = result.data[offer].itineraries[i].segments[j].arrival.at;
                    let arrivalTimeEl = $("<td>").text(arrivalTime.split("T")[0] + " " + arrivalTime.split("T")[1]);
                    let arrivalCityEl = $("<td>").text(result.data[offer].itineraries[i].segments[j].arrival.iataCode);
                    let duration = result.data[offer].itineraries[i].segments[j].duration;
                    let durationEl = $("<td>").text(duration.slice(2));
                    let carrier = result.data[offer].itineraries[i].segments[j].carrierCode;
                    let number = result.data[offer].itineraries[i].segments[j].number;
                    let flightNumEl = $("<td>").text(carrier + number);
                    let currEl = result.data[offer].price.currency;
                    let price = Math.floor((Number(result.data[offer].price.total)));
                    let priceEl = $("<td>").text(price + currEl);
                    if (i % 2 == 0) {
                        trEl.append(typeEl, flightNumEl, departureCityEl, departureTimeEl, arrivalCityEl, arrivalTimeEl, durationEl, $("<td>"));
                    } else {
                        trEl.append(typeEl, flightNumEl, departureCityEl, departureTimeEl, arrivalCityEl, arrivalTimeEl, durationEl, priceEl);
                    }
                    $("#flight").append(trEl);
                }
            }

        }
        //render book flight botton
        let dDay = departDate.split("-")[0] + departDate.split("-")[1] + departDate.split("-")[2];
        let rDay = returnDate.split("-")[0] + returnDate.split("-")[1] + returnDate.split("-")[2];
        let aEl = $("<a>").addClass("button").text("Book Flight").attr({ "href": `https://www.skyscanner.ca/transport/flights/${origin}/${destin}/${dDay}/${rDay}/?adults=${traveller}&adultsv2=${traveller}&cabinclass=${cabinClass}&children=0&childrenv2=&inboundaltsenabled=false&infants=0&outboundaltsenabled=false&ref=home&rtn=1&stops=!oneStop,!twoPlusStops`, "target": "_blank" });
        $("#bookFlight").append(aEl);

    })
}
// ---------------------------------------------------  Event handling ----------
//handle form submission event
$("#searchForm").on("submit", function (e) {
    e.preventDefault();
    $("#resultTable").attr("class", "table");
    origin = $("#inputFrom").val().toUpperCase().trim();
    destin = $("#inputTo").val().toUpperCase().trim();
    departDate = $("#inputDepart").val();
    returnDate = $("#inputReturn").val();
    traveller = $("#inputTravelers").val();
    cabinClass = $("#inputCabin").val();
    //construct seaching url by using user input
    surl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destin}&departureDate=${departDate}&returnDate=${returnDate}&adults=${traveller}&travelClass=${cabinClass}&nonStop=true&currencyCode=CAD&max=10`;

    saveToStorage(origin, destin, departDate, returnDate, traveller, cabinClass);
    renderHistory();
    getHotel();
    getFlight();
})

//handle click event when user click on history
$("#histoyRecord").on("click", "a", function (e) {
    e.preventDefault();
    $("#resultTable").attr("class", "table");
    console.log($(e.target).data("info"));
    origin = $(e.target).data("info").origin;
    destin = $(e.target).data("info").destin;
    departDate = $(e.target).data("info").departDate;
    returnDate = $(e.target).data("info").returnDate;
    traveller = $(e.target).data("info").traveller;
    cabinClass = $(e.target).data("info").cabinClass;
    surl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destin}&departureDate=${departDate}&returnDate=${returnDate}&adults=${traveller}&travelClass=${cabinClass}&nonStop=true&currencyCode=CAD&max=10`;
    console.log(destin);
    getHotel();
    getFlight();
})


//------------------------------ Hotel searching API implementation  --------------

let hotelCity;

//function to initialize hotel searching
function getHotel() {
    let hurl = `https://www.air-port-codes.com/api/v1/single?iata=${destin}`;
    //call API to convert IATA code into City name
    fetch(hurl, {
        headers: {
            "Apc-Auth": "bd1e3aa6c2",
            "Apc-Auth-Secret": "f9d860d4137993a",
        },
        method: "POST"
    }).then(function (response) {
        return response.json();
    }).then(function (data) {

        hotelCity = data.airport.city;
        console.log(hotelCity);
        //call search hotel function
        searchHotel();
    });
}

//function to searching the hotel by calling hotel API
function searchHotel() {
    //define header
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '86214fd43amshd95edfa25068fadp1277c5jsnd6668ed6eebd',
            'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
        }
    };

    fetch(`https://hotels4.p.rapidapi.com/locations/v2/search?query=${hotelCity}`, options)
        .then(response => response.json())
        .then(function (result) {
            console.log(result);

            for (let i = 0; i < 4 && i < Object.keys(result.suggestions[1].entities).length; i++) {
                let desID = result.suggestions[1].entities[i].destinationId;

                $("#hotel-box").children().remove();
                fetch(`https://hotels4.p.rapidapi.com/properties/get-details?id=${desID}`, options)
                    .then(response => response.json())
                    .then(function (result) {
                        console.log(result);
                        //render hotel name and rating to page
                        let hotelName = result.data.body.propertyDescription.name;
                        console.log(hotelName);
                        let starRate = result.data.body.propertyDescription.starRating;
                        console.log(starRate);
                        let divEl = $("<div>").addClass("card cell large-4").attr("style", "max-width:300px");
                        let titleEl = $("<div>").addClass("card-divider").text(hotelName);
                        let imageEl = $("<div>").attr("id", `image${i}`);
                        let ratingEl = $("<div>").addClass("card-section").append($("<h4>").text("Hotel Star: " + starRate));
                        divEl.append(titleEl, imageEl, ratingEl);
                        $("#hotel-box").append(divEl);

                        fetch(`https://hotels4.p.rapidapi.com/properties/get-hotel-photos?id=${desID}`, options)
                            .then(response => response.json())
                            .then(function (result) {
                                console.log(result);
                                //render hotel image to page
                                let imageUrl = result.hotelImages[i].baseUrl.split("_")[0] + ".jpg";
                                let imgEl = $("<img>").attr("src", `${imageUrl}`);
                                $(`#image${i}`).append(imgEl);

                            })
                            .catch(err => console.error(err));
                    })
                    .catch(err => console.error(err));

            }
        })
        .catch(err => console.error(err));

}
