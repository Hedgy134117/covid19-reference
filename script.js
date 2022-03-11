window.onload = async () => {
  let pop = await getPopulationData();
  let codes = await getCountryCodes();
  let cases = await getCasesData();
  let totalCases = getTotalCases(cases);
  let estimate = estimateCountry(pop, totalCases, codes);

  document.querySelector("#current-data").innerHTML = `CURRENT: <b>${totalCases}</b>`
  document.querySelector("#reference").innerHTML = `LIKE THE POPULATION OF <b>${estimate.country.toUpperCase()}</b> IN ${estimate.year} : <b>${estimate.population}</b>`;
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

const estimateCountry = (populations, numberToCompare, codes) => {
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
      console.log(bestEstimate);
    }
  }

  return bestEstimate;
}