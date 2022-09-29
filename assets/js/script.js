
let origin = "YYZ";
let destin = "HKG";
let departDate = "2022-11-01";
let returnDate = "2022-11-15";
let traveller = "2";
let cabinClass = "ECONOMY"

let turl = "https://test.api.amadeus.com/v1/security/oauth2/token";
let surl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destin}&departureDate=${departDate}&returnDate=${returnDate}&adults=${traveller}&travelClass=${cabinClass}&nonStop=true&currencyCode=CAD&max=10`;

let token;

//getFlight();

function getFlight() {
    //authorize to get access token
    fetch(turl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials&client_id=8EjLWKUGcJyabyxp4WdFDYfFKiQJ7oZK&client_secret=hwJxjIEtCsCqjAyi"
    }).then(function (response) {

        console.log(response);
        return response.json();

    }).then(function (data) {
        console.log(data);
        token = data.access_token;
        //pass token to further flight seaching
        searchFlight(surl, token);
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

        for (let offer = 0; offer < Object.keys(result.data).length; offer++) {
            let divEl = $("<div>").attr("id", `offer${offer}`);
            $("#flight").append(divEl);
            for (let i = 0; i < Object.keys(result.data[offer].itineraries).length; i++) {
                if (i % 2 == 0) {
                    let divEl = $("<div>").attr("id", `intinary${i}`).text("Depart:");
                    $(`#offer${offer}`).append(divEl);
                } else {
                    let divEl = $("<div>").attr("id", `intinary${i}`).text("Return:");
                    $(`#offer${offer}`).append(divEl);
                }
                for (let j = 0; j < Object.keys(result.data[offer].itineraries[i].segments).length; j++) {
                    let departTime = result.data[offer].itineraries[i].segments[j].departure.at;
                    let departureTimeEl = $("<li>").text(departTime.split("T")[0] + " " + departTime.split("T")[1]);
                    let departureCityEl = $("<li>").text(result.data[offer].itineraries[i].segments[j].departure.iataCode);
                    let arrivalTime = result.data[offer].itineraries[i].segments[j].arrival.at;
                    let arrivalTimeEl = $("<li>").text(arrivalTime.split("T")[0] + " " + arrivalTime.split("T")[1]);
                    let arrivalCityEl = $("<li>").text(result.data[offer].itineraries[i].segments[j].arrival.iataCode);
                    let duration = result.data[offer].itineraries[i].segments[j].duration;
                    let durationEl = $("<li>").text(duration.slice(2));
                    let carrier = result.data[offer].itineraries[i].segments[j].carrierCode;
                    let number = result.data[offer].itineraries[i].segments[j].number;
                    let flightNumEl = $("<li>").text(carrier + number);

                    $(`#offer${offer}`).append(departureCityEl, departureTimeEl, arrivalCityEl, arrivalTimeEl, durationEl, flightNumEl);
                }

            }
            let currEl = result.data[offer].price.currency;
            let price = result.data[offer].price.total;
            let priceEl = $("<li>").text("Price: " + price + currEl);
            $(`#offer${offer}`).append(priceEl, $("<br>"));

        }


    })
}



