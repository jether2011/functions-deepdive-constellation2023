
// API endpoint URL
const apiUrl = 'https://nfe-service-hackathon-e1676ada9c11.herokuapp.com/v1/api/nfes/ncm/44011000/carbon-free-calculation';

const KG = 1_000;

// Function to fetch data from the API
function fetchData() {
    fetch(apiUrl)
        .then(response => {
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            const obj = data[0];
            console.log(obj);
            const product = obj.products[0];
            const carbonFootprint = JSON.parse(JSON.stringify(product.carbon_calculation));
            // console.log(carbonFootprint);

            const result = {
              nfeId: obj.nfe_id,
              nfeNumber: obj.nfe_number,
              nfeIssuedOn: obj.nfe_issued_on,
              company: obj.company_name,
              taxIdentifier: obj.company_tax_identifier,
              product: product.name,
              ncm: product.ncm,
              carbonTonFactor: (carbonFootprint.emission_factor_by_ton_of_wood * KG),
              carbonFootprint: Math.trunc(carbonFootprint.emission_footprint * KG),
              carbonSaving: Math.trunc(carbonFootprint.emission_saving * KG),
              carbonFinalEmission: Math.trunc(carbonFootprint.final_emission_footprint * KG)
            };

            // console.log(`${result.nfeId},${result.company},${result.taxIdentifier},${result.carbonTonFactor},${result.carbonFootprint},${result.carbonSaving},${result.carbonFinalEmission}`); // Handle the data from the API
            console.log(JSON.stringify(result));
        })
        .catch(error => {
            console.error('Error fetching data:', error); // Handle any errors
        });
}

// Call the function to fetch data
fetchData();
