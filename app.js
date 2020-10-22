const fetch = require("node-fetch");
const fs = require('fs');
const pRetry = require('p-retry');
const pLimit = require('p-limit');

const limit = pLimit(2);

const baseUrl = "http://info.ceajalisco.gob.mx";

const getConfig = async () => {
  const response = await fetch(`${baseUrl}/json/scaData1.json`);
  return response.json();
}

const getWaterBody = (data, name) =>
  data.waterBodies
    .filter(el => el.wb === name)[0];

const getStudiesByWaterBody = async (id) => {
  const response = await fetch(`${baseUrl}/amfphp/services/getWaterBodyStudies.php?id=${id}`);
  if (response.status !== 200) {
    throw new pRetry.AbortError(response.statusText);
  }
  return response.json();
}

const downloadParameter = async (waterBody, study, parameter) => {
  const response = await fetch(`${baseUrl}/amfphp/services/getStudyResultsByParameter.php?iw=${waterBody.id}&is=${study.id}&ip=${parameter.id}`);
  console.debug('Download data for:', waterBody.wb, study.d, parameter.param);
  const parameterData = await response.json();
  return parameterData.resultsData.map(point => ({
    waterBodyId: waterBody.id,
    waterBodyName: waterBody.wb,
    studyId: study.id,
    studyName: study.d,
    studyDates: study.study,
    parameterId: parameter.id,
    parameterType: parameter.type,
    parameterName: parameter.param,
    parameterUnit: parameter.unit,
    parameterLimit: parameter.lmc,
    parameterLimitText: parameter.lmcText,
    ...point
  }));
}
const downloadAllData = (waterBody, studies, parameters) => {
  const promises = [];
  for (let i = 0; i < studies.length; i++) {
    for (let j = 0; j < parameters.length; j++) {
      promises.push(limit(() =>
        pRetry(() =>
          downloadParameter(waterBody, studies[i], parameters[j]), { retries: 3 })
      ));
    }
  }
  return Promise.all(promises);
}


const start = async (waterBodyName, studiesLength, filename) => {
  const data = await pRetry(getConfig, { retries: 3 })
  const waterBody = getWaterBody(data, waterBodyName);
  const parameters = data.parameters;
  const studies = await pRetry(() => getStudiesByWaterBody(waterBody.id), { retries: 3 });
  const studiesToDownload = studies.slice(0, studiesLength);
  const dataToStore = await downloadAllData(waterBody, studiesToDownload, parameters);
  fs.writeFile(filename, JSON.stringify(dataToStore.flat(1)), 'utf8', () => console.log("Done"));
};

start("Río Santiago", 12, "dataTest.json");