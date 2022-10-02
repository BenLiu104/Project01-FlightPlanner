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

    for (let i = 0; i < (result.suggestions).length; i++) {
      for (j = 0; j < result.suggestions [i].entities.length; j++) {
        let desId = result.suggestions[i].entities[j].destinationId;

        let url = `https://hotels4.p.rapidapi.com/properties/get-details?id=${desId}&checkIn=2022-11-08&8&checkOut=2022-11-09&&currency=USD&locale=en_US`
        fetch(url, options)
        .then(response => response.json())
        .then(function (result2) {
        console.log(result2);

        }
      )}
    }
  })
      // let desId = result.suggestions[1].entities[i].destinationId;

      // const options = {
      //   method: 'GET',
      //   headers: {
      //     'X-RapidAPI-Key': '86214fd43amshd95edfa25068fadp1277c5jsnd6668ed6eebd',
      //     'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
      //   }
      // };
      // let url = `https://hotels4.p.rapidapi.com/properties/get-details?id=${desId}&checkIn=2022-11-08&8&checkOut=2022-11-09&&currency=USD&locale=en_US`
      // fetch(url, options)
      //   .then(response => response.json())
      //   .then(function (result2) {
      //     console.log(result2);
      //     Object.keys()
      //   })
      //   .catch(err => console.error(err));
  .catch(err => console.error(err));

