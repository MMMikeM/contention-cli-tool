const fs = require("fs");
const path = require("path");

const calculate = (linetagFolder) => {
  files = fs.readdirSync(linetagFolder);
  return files.map((file) => extractData(`${linetagFolder}/${file}`));
};

const extractData = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  const lines = file.split("\n");

  const speedRegex = /speed: (.*)/;
  let speedDirty = lines.filter((line) => line.match(speedRegex))[0];
  let speed = speedRegex.exec(speedDirty)[1];

  const carrierRegex = /circt_carrier: (.*)/;
  let carrierDirty = lines.filter((line) => line.match(carrierRegex))[0];
  let carrier = carrierRegex.exec(carrierDirty)[1];

  const cityRegex = /proutr_host: svs-za-(.*)-ne-mse-01/;
  let cityDirty = lines.filter((line) => line.match(cityRegex))[0];
  let city = cityRegex.exec(cityDirty)[1];

  const circuitNumberRegex = /circt_num_l1: (.*)/;
  let circuitNumberDirty = lines.filter((line) =>
    line.match(circuitNumberRegex)
  )[0];
  let circuitNumber = circuitNumberRegex.exec(circuitNumberDirty)[1];
  
  return {
    fileName: path.basename(filePath),
    speed: speed,
    circuitNumber: circuitNumber,
    carrier: carrier,
    city: city,
  };
};

module.exports = calculate;

// so_number, city and carrier

// cpt circt_num_l1: so021576
// dbn circt_num_l1: so0018777
// jhb circt_num_l1: so108337 & so108339

// {jhb: [], cpt: [], dbn: []}
