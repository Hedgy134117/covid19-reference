window.onload = function() {
    this.estimate(getData());
}

document.getElementById('data-type').addEventListener('change', function() {
    estimate(getData());
});

var currentYear;
document.getElementById("year-type").addEventListener('change', function() {
    currentYear = document.getElementById("year-type").checked;
    estimate(getData());
});

function getData() {
    switch(document.getElementById('data-type').value) {
        case 'cases':
            var casesUrl = "https://covid.ourworldindata.org/data/ecdc/total_cases.csv";
            var casesRequest = new XMLHttpRequest();
            casesRequest.open("GET", casesUrl, false);
            casesRequest.send(null);
            var casesData = casesRequest.responseText.split('\n');
            var casesTotal = casesData[casesData.length - 2].split(',')[1];
            document.getElementById('current-data').innerHTML = "CURRENT CASES: <b>" + casesTotal + "</b>";
            return casesTotal;
            break;
        
        case 'deaths':
            var deathsUrl = "https://covid.ourworldindata.org/data/ecdc/total_deaths.csv";
            var deathsRequest = new XMLHttpRequest();
            deathsRequest.open("GET", deathsUrl, false);
            deathsRequest.send(null);
            var deathsData = deathsRequest.responseText.split('\n');
            var deathsTotal = deathsData[deathsData.length - 2].split(',')[1];
            document.getElementById('current-data').innerHTML = "CURRENT DEATHS: <b>" + deathsTotal + "</b>";
            return deathsTotal;
            break;
    }
}

function estimate(total) {
    console.log(total);
    var populationUrl = "https://pkgstore.datahub.io/core/population/population_csv/data/ead5be05591360d33ad1a37382f8f8b1/population_csv.csv"; 
    var populationRequest = new XMLHttpRequest();
    populationRequest.open("GET", populationUrl, false);
    populationRequest.send(null);
    var populationData = populationRequest.responseText.split('\n');

    var bestEstimateDifference = 9999999999;
    var bestEstimateCountry = "";
    var bestEstimatePopulation = 0;
    var bestEstimateYear = 0;

    for (var i = 1; i < populationData.length; i++) {
        var currentData = populationData[i].split(',');
        if (currentData.length > 4) { 
            continue; 
        }
        if (currentData[2] != "2016" && currentYear) {
            continue;
        }

        var currentEstimate = Math.abs(total - currentData[3]);
        if (currentEstimate < bestEstimateDifference) {
            bestEstimateDifference = currentEstimate;
            bestEstimateCountry = currentData[0];
            bestEstimatePopulation = currentData[3];
            bestEstimateYear = currentData[2];
        }
    }

    document.getElementById('reference').innerHTML = "LIKE <b>" + bestEstimateCountry.toUpperCase() + "</b> IN " + bestEstimateYear + " WITH A POPULATION OF <b>" + bestEstimatePopulation + "</b>";
}