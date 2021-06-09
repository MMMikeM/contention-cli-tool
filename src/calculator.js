const fs = require("fs")
const path = require("path")


// INPUT: soNumber, city, carrier
// Output: XC-speed, sold-speed, contentionRatio(1 decimal)

const calculate = (linetagFolder, soNumber, city, carrier) => {

  let soldSpeed = 0
  let contentionRatio = () => (soldSpeed / xcSpeed).toFixed(2)
  let validFiles = []
  let validXCFiles = []

  let files = fs.readdirSync(linetagFolder)
  let filteredFiles = files.filter((file) => file[0] !== ".")

  filteredFiles.forEach((file) => {
    const results = filterSO(`${linetagFolder}/${file}`, soNumber)
    if (results) {
      validFiles.push(results)
    }
  })

  filteredFiles.forEach((file) => {
    const results = filterXC(`${linetagFolder}/${file}`, "xc")
    if (results) {
      validXCFiles.push(results)
    }
  })

  let xcData = validXCFiles.map((file) => {
    let data = extractData(`${linetagFolder}/${file}`)
    return(data)
  })

  let speedData = validFiles.map((file) => {
    let data = extractData(`${linetagFolder}/${file}`)
    return(data)
  })

  // console.log(xcData)

  let mainEntry = xcData.find(
    (entry) =>
      entry.circuitNumber.includes(soNumber) &&
      entry.carrier === carrier
  )

  // console.log(speedData.includes(mainEntry))
  // console.log(mainEntry)
  // console.log(speedData)


  let xcSpeedString
  let xcSpeed

  if (mainEntry) {
    xcSpeedString = mainEntry.speed || ""
    xcSpeed = unitHandler(xcSpeedString, mainEntry.fileName)
  }

  soldSpeed = speedData
    .reduce((accumulator, entry) => {
      let speedInt = unitHandler(entry.speed, entry.fileName)
      return accumulator + speedInt
    }, 0)


  return {
    xcSpeed: xcSpeedString,
    soldSpeed: `${soldSpeed}mbps`,
    contentionRatio: contentionRatio(),
    speeddata: speedData,
    xcData: mainEntry
  }
}

const unitHandler = (input, fileName) => {
  let speedRegex = /\s?(\d+)(\w)(bps)?/i

  if (input === "") {
    return 0
  } else {
    let [_, speed, unit] = speedRegex.exec(input)
    let speedInt = parseInt(speed)
    if (unit === "g") {
      speedInt = speedInt * 1000
    }
    if (unit === "t") {
      speedInt = speedInt * 1000 * 1000
    }
    return speedInt
  }
}

const filterSO = (filePath, soNumber) => {
  const file = fs.readFileSync(filePath, "utf8")
  const lines = file.split("\n")
  const searcher = lines.find((item) => item.match(/circt_num_l1: (.*)/)) || ""
  const searcherXC = lines.find((item) => item.match(/circt_type: (.*)/)) || ""

  if (searcher.includes(soNumber) && !searcherXC.includes("xc")) {
    return path.basename(filePath)
  } else {
    return null
  }
}

const filterXC = (filePath, XC) => {
  const file = fs.readFileSync(filePath, "utf8")
  const lines = file.split("\n")
  const searcher = lines.find((item) => item.match(/circt_type: (.*)/)) || ""

  if (searcher.includes(XC)) {
    return path.basename(filePath)
  } else {
    return null
  }
}

const extractData = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8")
  const lines = file.split("\n")

  let fileName = path.basename(filePath)

  let speed, carrier, city, circuitType, circuitNumber
  let error = null

  try {
    [speed, error] = regexer(/speed: (.*)/, lines, fileName);
    [carrier, error] = regexer(/circt_carrier: (.*)/, lines, fileName);
    [city, error] = regexer(/pswitch_host:\ssvs-za-(.*)-\w+-\w+-\d+/, lines, fileName);
    [circuitType, error] = regexer(/circt_type: (.*)/, lines, fileName);
    [circuitNumber, error] = regexer(/circt_num_l1: (.*)/, lines, fileName);

    let results = {fileName: fileName || "",
    speed: speed || "",
    // circuitType: circuitType || "",
    circuitNumber: circuitNumber || "",
    carrier: carrier || "",
    city: city || ""
  }

    if (error !== null) {
      throw new Error(`Regex failed on file: ${filePath} - ${error}`);
    }
    return results
  } catch (error) {
    console.log(error)
  }
}

const regexer = (pattern, lines, filePath) => {
  let matchDirty = lines.find((line) => line.match(pattern))
  let match
  if (matchDirty) {
    match = pattern.exec(matchDirty)
    return [match[1], null]
  } else {
    return ["", `No match found - ${pattern} in ${filePath}`]
  }
}

module.exports = {
  calculate: calculate,
  extractData: extractData,
  unitHandler: unitHandler,
  regexer: regexer,
}
