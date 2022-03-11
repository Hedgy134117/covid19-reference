data = {
  "population": null,
  "codes": null,
  "current": null,
  "mostRecentYear": false,
  "estimate": null,
};

window.onload = async () => {
  await startup();

  document.querySelector("#data-type").addEventListener("change", async function () {
    switch (this.value) {
      case "cases":
        let cases = await getCasesData();
        let totalCases = getTotalCases(cases);
        data.current = totalCases;
        estimate();
        break;
      case "deaths":
        let deaths = await getDeathsData();
        let totalDeaths = getTotalDeaths(deaths);
        data.current = totalDeaths;
        estimate();
        break;
      case "vaccinations":
        let vaccinations = await getVaccinationsData();
        let totalVaccinations = getTotalVaccinations(vaccinations);
        data.current = totalVaccinations;
        estimate();
        break;
    }
  });

  document.querySelector("#year-type").addEventListener("change", async function () {
    data.mostRecentYear = this.checked;
    estimate();
  });
}

const startup = async () => {
  let pop = await getPopulationData();
  data.population = pop;
  let codes = await getCountryCodes();
  data.codes = codes;
  let cases = await getCasesData();
  let totalCases = getTotalCases(cases);
  data.current = totalCases;
  let estimate = estimateCountry(pop, totalCases, codes);
  data.estimate = estimate;
  updateHTML(totalCases, estimate);
}

const estimate = () => {
  let estimate = estimateCountry(data.population, data.current, data.codes, data.mostRecentYear);
  data.estimate = estimate;
  updateHTML(data.current, estimate);
}

const getPopulationData = async () => {
  let popSource = "./pop-data.csv"
  let pop = await fetch(popSource).then(res => res.text());
  pop = pop.split("\n");
  pop = pop.map(line => line.split(","));
  return pop;
}

const getCountryCodes = async () => {
  let codesSource = "./country-codes.json";
  let codesObject = await fetch(codesSource).then(res => res.json());
  let codes = [];
  for (let country in codesObject) {
    codes.push(codesObject[country]["country-code"]);
  }
  return codes;
}

const getCasesData = async () => {
  let casesSource = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.json";
  let cases = await fetch(casesSource).then(res => res.json());
  return cases;
}
const getDeathsData = getCasesData;
const getVaccinationsData = getCasesData;

const getTotalCases = casesJSON => {
  let total = 0;
  for (let country in casesJSON) {
    // Prevent double counting / adding the cases of a continent
    if (casesJSON[country].continent == null) {
      continue;
    }
    total += casesJSON[country].total_cases;
  }
  return total;
}

const getTotalDeaths = deathsJSON => {
  let total = 0;
  for (let country in deathsJSON) {
    // Prevent double counting / adding the cases of a continent
    if (deathsJSON[country].continent == null) {
      continue;
    }
    total += deathsJSON[country].total_deaths;
  }
  return total;
}

const getTotalVaccinations = vaccinationsJSON => {
  let total = 0;
  for (let country in vaccinationsJSON) {
    // Prevent double counting / adding the cases of a continent
    if (vaccinationsJSON[country].continent == null) {
      continue;
    }
    total += vaccinationsJSON[country].total_vaccinations;
  }
  return total;
}

const estimateCountry = (populations, numberToCompare, codes, mostRecentYear) => {
  let bestEstimate = {
    "difference": 9999999999,
    "country": "",
    "population": "",
    "year": ""
  };

  for (let country of populations) {
    let variant = country[3];
    // prevent comparing non-important predictions
    if (variant != "Medium") {
      continue;
    }
    let year = country[4];
    // prevent comparing future predictions
    if (parseInt(year) > new Date().getFullYear()) {
      continue
    }
    // if the year matters
    if (mostRecentYear && parseInt(year) != new Date().getFullYear()) {
      continue;
    }
    let code = country[0]
    // prevent comparing continents / regions
    if (codes.includes(code) == false) {
      continue;
    }

    let population = country[8] * 1000;
    let estimate = Math.abs(population - numberToCompare);
    if (estimate < bestEstimate.difference) {
      let name = country[1];
      bestEstimate = {
        "difference": estimate,
        "country": name,
        "population": population,
        "year": year
      };
    }
  }

  return bestEstimate;
}

const updateHTML = (current, estimate) => {
  document.querySelector("#current-data").innerHTML = `CURRENT: <b>${addCommasToNum(current)}</b>`
  document.querySelector("#reference").innerHTML = `LIKE THE POPULATION OF <b>${estimate.country.toUpperCase()}</b> IN ${estimate.year} : <b>${addCommasToNum(estimate.population)}</b>`;
}

const addCommasToNum = num => {
  let numToString = num.toString();
  if (num < 1000) {
    return numToString;
  }

  let divisor = numToString.length % 3;
  let string = "";
  for (let i = 0; i < numToString.length; i++) {
    if (i != 0 && i % 3 == divisor) {
      string += ",";
    }
    string += numToString.charAt(i);
  }
  return string;
}