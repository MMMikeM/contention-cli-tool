const { calculate } = require("./src/calculator");
const args = process.argv.slice(2);
const filepath = "./linetags";

let soNumber = args[0];
let city = args[1];
let carrier = args[2];

if (soNumber === undefined || city === undefined || carrier === undefined) {
  console.log(
    `Arguments missing, please ensure the arguments exist in the shape "soNumber" "city" "carrier"`
  );
} else {
  let result = calculate(filepath, soNumber, city, carrier);

  console.log(
    `XC Speed: ${result.xcSpeed} - Sold Speed: ${
      result.soldSpeed
    } - Contention Ratio: 1:${parseFloat(result.contentionRatio).toFixed(2)}`
  );
}
