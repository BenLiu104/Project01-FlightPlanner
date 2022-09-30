
let origin;
let destin;
let departDate;
let returnDate;
let traveller;
let cabinClass;
//PREMIUM_ECONOMY, FIRST, BUSINESS


const turl = "https://test.api.amadeus.com/v1/security/oauth2/token";
let token;
let surl;

$("#searchForm").on("submit", function (e) {
    e.preventDefault();
    origin = $("#inputFrom").val();
    destin = $("#inputTo").val();
    departDate = $("#inputDepart").val();
    returnDate = $("#inputReturn").val();
    traveller = $("#inputTravelers").val();
    cabinClass = $("#inputCabin").val();
    
    surl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destin}&departureDate=${departDate}&returnDate=${returnDate}&adults=${traveller}&travelClass=${cabinClass}&nonStop=true&currencyCode=CAD&max=10`;
    
    getFlight();
})


function getFlight() {
    //authorize to get access token
    let returnToken;
    fetch(turl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials&client_id=8EjLWKUGcJyabyxp4WdFDYfFKiQJ7oZK&client_secret=hwJxjIEtCsCqjAyi"
    }).then(function (response) {

        console.log(response);
        return response.json();

    }).then(function (data) {
        console.log(data);
        returnToken = data.access_token;
        //pass token to further flight seaching
        searchFlight(surl, returnToken);
    });
    
}

function searchFlight(surl, token) {
    console.log(token);
    console.log(`Authorization :Bearer ${token}`);
    fetch(surl, {
        headers: { Authorization: `Bearer ${token}` },
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function (result) {
        console.log(result);
        let typeEl;
        let trEl;
        $("#flight").children().remove();
        $("#bookFlight").children().remove();
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
        let dDay=departDate.split("-")[0]+departDate.split("-")[1]+departDate.split("-")[2];
        let rDay=returnDate.split("-")[0]+returnDate.split("-")[1]+returnDate.split("-")[2];
        let aEl = $("<a>").addClass("button").text("Book Flight").attr({"href":`https://www.skyscanner.ca/transport/flights/${origin}/${destin}/${dDay}/${rDay}/?adults=${traveller}&adultsv2=${traveller}&cabinclass=${cabinClass}&children=0&childrenv2=&inboundaltsenabled=false&infants=0&outboundaltsenabled=false&ref=home&rtn=1&stops=!oneStop,!twoPlusStops`,"target":"_blank"});
        $("#bookFlight").append(aEl);

    })
}



