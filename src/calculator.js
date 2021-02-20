const fs = require("fs");
const path = require("path");

// INPUT: soNumber, city, carrier
// Output: XC-speed, sold-speed, contentionRatio(1 decimal)

const calculate = (linetagFolder, soNumber, city, carrier) => {
  let soldSpeed = 0;
  let contentionRatio = () => (soldSpeed / xcSpeed).toFixed(2);

  let files = fs.readdirSync(linetagFolder);
  let filteredFiles = files.filter((file) => file[0] !== ".");
  let data = filteredFiles.map((file) =>
    extractData(`${linetagFolder}/${file}`)
  );

  let mainEntry = data.find(
    (entry) =>
      entry.circuitType === "xc" &&
      entry.carrier === carrier &&
      entry.city === city
  );
  let xcSpeedString = mainEntry.speed;
  let xcSpeed = unitHandler(xcSpeedString, mainEntry.fileName);

  soldSpeed = data
    .filter((entry) => entry.circuitType !== "xc")
    .filter((entry) => entry.circuitNumber.includes(soNumber))
    .reduce((accumulator, entry) => {
      let speedInt = unitHandler(entry.speed, entry.fileName);
      return accumulator + speedInt;
    }, 0);

  return {
    xcSpeed: xcSpeedString,
    soldSpeed: `${soldSpeed}mbps`,
    contentionRatio: contentionRatio(),
  };
};

const unitHandler = (input, fileName) => {
  let speedRegex = /\s?(\d+)(\w)bps/i;
  if (input === "") {
    return 0;
  } else {
    let [_, speed, unit] = speedRegex.exec(input);
    let speedInt = parseInt(speed);
    if (unit === "g") {
      speedInt = speedInt * 1024;
    }
    if (unit === "t") {
      speedInt = speedInt * 1024 * 1024;
    }
    return speedInt;
  }
};

const extractData = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  const lines = file.split("\n");

  let speed, carrier, city, circuitType, circuitNumber;
  let error = null;

  try {
    [speed, error] = regexer(/speed: (.*)/, lines);
    [carrier, error] = regexer(/circt_carrier: (.*)/, lines);
    [city, error] = regexer(/pswitch_host:\ssvs-za-(.*)-\w+-\w+-\d+/, lines);
    [circuitType, error] = regexer(/circt_type: (.*)/, lines);
    [circuitNumber, error] = regexer(/circt_num_l1: (.*)/, lines);
    if (error !== null) {
      // throw new Error(`Regex failed on file: ${filePath} - ${error}`);
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  } finally {
    return {
      fileName: path.basename(filePath),
      speed: speed,
      circuitType: circuitType,
      circuitNumber: circuitNumber,
      carrier: carrier,
      city: city,
    };
  }
};

const regexer = (pattern, lines) => {
  let matchDirty = lines.find((line) => line.match(pattern));
  let match = "";
  if (matchDirty) {
    match = pattern.exec(matchDirty);
    return [match[1], null];
  } else {
    return ["", `No match found - ${pattern}`];
  }
};

module.exports = {
  calculate: calculate,
  extractData: extractData,
  unitHandler: unitHandler,
  regexer: regexer,
};
