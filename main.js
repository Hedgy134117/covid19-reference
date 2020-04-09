var casesUrl = "https://covid.ourworldindata.org/data/ecdc/total_cases.csv";

var casesRequest = new XMLHttpRequest();
casesRequest.open("GET", casesUrl, false);
casesRequest.send(null);
var casesData = casesRequest.responseText.split('\n');

var casesTotal = casesData[casesData.length - 2].split(',')[1];
console.log(casesTotal);

var populationUrl = "https://pkgstore.datahub.io/core/population/population_csv/data/ead5be05591360d33ad1a37382f8f8b1/population_csv.csv"; 
var populationRequest = new XMLHttpRequest();
populationRequest.open("GET", populationUrl, false);
populationRequest.send(null);
var populationData = populationRequest.responseText.split('\n');
console.log(populationData);

var bestEstimateDifference = 9999999999;
var bestEstimateCountry = "";
var bestEstimatePopulation = 0;
var bestEstimateYear = 0;

for (var i = 1; i < populationData.length; i++) {
    var currentData = populationData[i].split(',');
    if (currentData.length > 4) { 
        continue; 
    }

    var currentEstimate = Math.abs(casesTotal - currentData[3]);
    if (currentEstimate < bestEstimateDifference) {
        bestEstimateDifference = currentEstimate;
        bestEstimateCountry = currentData[0];
        bestEstimatePopulation = currentData[3];
        bestEstimateYear = currentData[2];
    }
}

console.log(bestEstimateCountry);
console.log(bestEstimatePopulation);
console.log(bestEstimateYear);

document.getElementById('current-cases').innerHTML = "CURRENT CASES: " + casesTotal;
document.getElementById('reference').innerHTML = "LIKE " + bestEstimateCountry.toUpperCase() + " IN " + bestEstimateYear + " WITH A POPULATION OF " + bestEstimatePopulation;
