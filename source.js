const carbonResponse = await Functions.makeHttpRequest({
  url: "https://nfe-service-hackathon-e1676ada9c11.herokuapp.com/v1/api/nfes/ncm/44011000/carbon-free-calculation",
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

if (carbonResponse.error) {
  throw new Error(JSON.stringify(carbonResponse));
};

const obj = carbonResponse.data[0];
const product = obj.products[0];
const carbonFootprint = JSON.parse(JSON.stringify(product.carbon_calculation));

const result = {
  nfeId: obj.nfe_id,
  nfeNumber: obj.nfe_number,
  nfeIssuedOn: obj.nfe_issued_on,
  company: obj.company_name,
  taxIdentifier: obj.company_tax_identifier,
  product: product.name,
  ncm: product.ncm,
  carbonTonFactor: carbonFootprint.emission_factor_by_ton_of_wood,
  carbonFootprint: carbonFootprint.emission_footprint,
  carbonSaving: carbonFootprint.emission_saving,
  carbonFinalEmission: carbonFootprint.final_emission_footprint
};

return Functions.encodeString(JSON.stringify(result));