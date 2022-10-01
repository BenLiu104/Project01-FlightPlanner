
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

//handle form submit event
$("#searchForm").on("submit", function (e) {
    e.preventDefault();
    origin = $("#inputFrom").val().toUpperCase().trim();
    destin = $("#inputTo").val().toUpperCase().trim();
    departDate = $("#inputDepart").val();
    returnDate = $("#inputReturn").val();
    traveller = $("#inputTravelers").val();
    cabinClass = $("#inputCabin").val();
    //construct seaching url by using use input
    surl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destin}&departureDate=${departDate}&returnDate=${returnDate}&adults=${traveller}&travelClass=${cabinClass}&nonStop=true&currencyCode=CAD&max=10`;
    
    saveToStorage(origin, destin, departDate, returnDate, traveller, cabinClass);
    renderHistory();

    getFlight();
})

//function to save user seaching data to local storage
function saveToStorage(origin, destin, departDate, returnDate, traveller, cabinClass) {
    let record = { "origin": origin, "destin": destin, "departDate": departDate, "returnDate": returnDate, "traveller": traveller, "cabinClass": cabinClass }
    if(historyList.length>=5){
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
        let aEl = $("<a>").text(historyList[i].origin+" - "+historyList[i].destin);
        aEl.data("info",{"origin": historyList[i].origin, "destin": historyList[i].destin, "departDate": historyList[i].departDate, "returnDate": historyList[i].returnDate, "traveller": historyList[i].traveller, "cabinClass": historyList[i].cabinClass});
        liEl.append(aEl);
        $("#histoyRecord").append(liEl);
    }
}

//handle click event when using click on history
$("#histoyRecord").on("click","a",function(e){
    e.preventDefault();
    console.log($(e.target).data("info"));
    origin = $(e.target).data("info").origin;
    destin = $(e.target).data("info").destin;
    departDate = $(e.target).data("info").departDate;
    returnDate = $(e.target).data("info").returnDate;
    traveller = $(e.target).data("info").traveller;
    cabinClass = $(e.target).data("info").cabinClass;
    surl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destin}&departureDate=${departDate}&returnDate=${returnDate}&adults=${traveller}&travelClass=${cabinClass}&nonStop=true&currencyCode=CAD&max=10`;
    getFlight();

})

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
    });
}

//function to call Flight API to get the Airline info
function searchFlight(surl, token) {
    console.log(`Authorization :Bearer ${token}`);
    fetch(surl, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(function (response) {
        console.log(response.status);
        if(response.status==400){
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
                        typeEl = $("<td>").text("Deaprt");
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
                    let price = Math.floor((Number(result.data[offer].price.total) + Number(result.data[offer].price.base)));
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



