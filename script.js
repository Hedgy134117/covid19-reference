data = {
  "covidData": null,
  "population": null,
  "codes": null,
  "current": null,
  "mostRecentYear": false,
  "estimate": null,
  "type": "cases"
};

window.onload = async () => {
  await startup();

  document.querySelector("#data-type").addEventListener("change", function () {
    data.type = this.value;
    data.current = getCovidStatistic(`total_${this.value}`);
    estimate();
  });

  document.querySelector("#year-type").addEventListener("change", function () {
    data.mostRecentYear = this.checked;
    estimate();
  });
}

const startup = async () => {
  data.population = await getPopulationData();
  data.codes = await getCountryCodes();
  data.covidData = await getCovidData();
  data.current = getCovidStatistic("total_cases");
  estimate();
}

const estimate = () => {
  data.estimate = estimateCountry();
  updateHTML();
}

const getPopulationData = async () => {
  let popSource = "./data/pop-data.csv"
  let pop = await fetch(popSource).then(res => res.text());
  pop = pop.split("\n");
  pop = pop.map(line => line.split(","));
  return pop;
}

const getCountryCodes = async () => {
  let codesSource = "./data/country-codes.json";
  let codesObject = await fetch(codesSource).then(res => res.json());
  let codes = [];
  for (let country in codesObject) {
    codes.push(codesObject[country]["country-code"]);
  }
  return codes;
}

const getCovidData = async () => {
  let covidDataSource = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.json";
  let covidData = await fetch(covidDataSource).then(res => res.json());
  return covidData;
}

const getCovidStatistic = statistic => {
  let total = 0;
  for (let country in data.covidData) {
    // Prevent double counting / adding the cases of a continent
    if (data.covidData[country].continent == null) {
      continue;
    }
    total += data.covidData[country][statistic];
  }
  return total;
}

const estimateCountry = () => {
  let bestEstimate = {
    "difference": 9999999999,
    "country": "",
    "population": "",
    "year": ""
  };

  let currentYear = new Date().getFullYear();
  for (let country of data.population) {
    let variant = country[3];
    // prevent comparing non-important predictions
    if (variant != "Medium") {
      continue;
    }
    let year = country[4];
    // prevent comparing future predictions
    if (year > currentYear) {
      continue
    }
    // if the year matters
    if (data.mostRecentYear && parseInt(year) != currentYear) {
      continue;
    }
    let code = country[0]
    // prevent comparing continents / regions
    if (data.codes.includes(code) == false) {
      continue;
    }

    let population = country[8] * 1000; // country populations are saved in thousands
    let estimate = Math.abs(population - data.current);
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

const updateHTML = () => {
  let estimate = data.estimate
  document.querySelector("#current-data").innerHTML = `CURRENT: <b>${addCommasToNum(data.current)}</b> ${data.type.toUpperCase()}`;
  document.querySelector("#reference").innerHTML = `
  LIKE THE POPULATION OF <b>${estimate.country.toUpperCase()}</b> 
  IN ${estimate.year} : <b>${addCommasToNum(estimate.population)}</b>
  `;
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