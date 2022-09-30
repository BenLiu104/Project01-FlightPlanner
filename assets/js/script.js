const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '86214fd43amshd95edfa25068fadp1277c5jsnd6668ed6eebd',
    'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
  }
};

fetch('https://hotels4.p.rapidapi.com/locations/v2/search?query=new%20york', options)
  .then(response => response.json())
  .then(function (result) {

    console.log(result);



    // let desId2 = result.suggestions[1].entities[1].destinationId;
    // let desId3 = result.suggestions[1].entities[0].destinationId;
    // let desId4 = result.suggestions[1].entities[1].destinationId;

    for (let i = 0; i < Object.keys(result.suggestions[1].entities).length; i++) {
      let desId = result.suggestions[1].entities[i].destinationId;

      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '86214fd43amshd95edfa25068fadp1277c5jsnd6668ed6eebd',
          'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
        }
      };
      let url = `https://hotels4.p.rapidapi.com/properties/get-details?id=${desId}&checkIn=2022-11-08&8&checkOut=2022-11-09&&currency=USD&locale=en_US`
      fetch(url, options)
        .then(response => response.json())
        .then(function (result2) {
          console.log(result2);
          Object.keys()




        })
        .catch(err => console.error(err));

    }

  })
  .catch(err => console.error(err));

