const { calculate } = require("./src/calculator");
const args = process.argv.slice(2);
const filepath = "/home/linetags";
const ObjectsToCsv = require('objects-to-csv');
var Table = require('cli-table');

let soNumber = args[0];
let city = args[1];
let carrier = args[2];

if (soNumber === undefined || city === undefined || carrier === undefined) {
  console.log(
    `Arguments missing, please ensure the arguments exist in the shape "soNumber" "city" "carrier"`
  );
} else {
  let result = calculate(filepath, soNumber, city, carrier);

  console.log("");

  console.log(
    `XC Speed: ${result.xcSpeed} - Sold Speed: ${
      result.soldSpeed
    } - Contention Ratio: 1:${parseFloat(result.contentionRatio).toFixed(2)}`
  );

  const save = async () => {
    const dummyRecord = {fileName: "XXXXXXXX",
    speed: "XXXXXXXX",
    // circuitType: circuitType || "",
    circuitNumber: "XXXXXXXX",
    carrier: "XXXXXXXX",
    city: "XXXXXXXX"
  }
    const data = [result.xcData].concat([dummyRecord]).concat(result.speeddata)
    
    if (args.includes('-v')){
      var table = new Table({
        chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
               , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
               , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
               , 'right': '' , 'right-mid': '' , 'middle': '\t\t' },
        style: { 'padding-left': 0, 'padding-right': 0 }
      });

      table.push(["FileName", "Speed", "CircuitNumber", "Carrier", "City"])

      table.push([result.xcData.fileName, result.xcData.speed, result.xcData.circuitNumber, result.xcData.carrier, result.xcData.city])
      table.push([''])
      result.speeddata.map((item) => table.push([item.fileName, item.speed, item.circuitNumber, item.carrier, item.city]))
      table.push([''])
      table.push(["Total", result.soldSpeed, "", "", ""])


      console.log("");
      console.log(table.toString());
      console.log("");




    }

    const os = require('os');

    const csv = new ObjectsToCsv(data);

    await csv.toDisk(`${os.homedir()}/${soNumber}-${city}-${carrier}.csv`);
  }

  save()

}

// enter xc SO number
// grab speed
// match all files based on cicrt_num_l1
// spit out data used as csv
// XC will always include xc in name
// bitco-jhb-teraco-xc-01 should return 0
// dfa-jhb-teraco-xc-01 should return a valid (and generate csv)
// dfa-jhb-teraco-xc-02 should return a valid (and generate csv saying "not enough thingies")
// return in CLI but also generate csv in "."
// include sourcecode