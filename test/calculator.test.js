const fs = require("fs");
const {
  calculate,
  extractData,
  unitHandler,
  regexer,
} = require("../src/calculator");

describe("contention ratio calculator", () => {
  test("When given a directory, soNumber, city and carrier, it returns the xc-speed, sold-speed and contention-ratio", () => {
    const directory = "./test/fixtures";
    const res = calculate(directory, "so108337", "jhb", "dfa");

    expect(res).toStrictEqual({
      xcSpeed: "1gbps",
      soldSpeed: "40mbps",
      contentionRatio: "0.04",
    });
  }),
    test("When given a file, the speed field is returned", () => {
      const filePath = "./test/fixtures/globalinvestment-jhb-sandton-fibre-01";
      const res = extractData(filePath);

      expect(res).toStrictEqual({
        fileName: "globalinvestment-jhb-sandton-fibre-01",
        circuitType: "fibrel3",
        speed: "5mbps",
        circuitNumber: "so012446 & so020446",
        carrier: "seacom",
        city: "jhb",
      });
    }),
    test("When given a file with invalid pswitchhost", () => {
      const filePath = "./test/fixtures/globalinvestment-jhb-sandton-fibre-02";
      const res = extractData(filePath);

      expect(res).toStrictEqual({
        fileName: "globalinvestment-jhb-sandton-fibre-02",
        circuitType: "fibrel3",
        speed: "0mbps",
        circuitNumber: "so012446 & so020446",
        carrier: "seacom",
        city: "",
      });
    }),
    test("When given a bandwidth speed, it returns an integer of the speed in mbps", () => {
      const input = "123tbps";
      const output = 128974848;
      const res = unitHandler(input);
      expect(res).toBe(output);
    }),
    test("When given a string that matches the regex pattern", () => {
      const regexTest = /circt_type: (.*)/;
      const filePath = "./test/fixtures/globalinvestment-jhb-sandton-fibre-02";
      const lines = fs.readFileSync(filePath, "utf8").split("\n");
      const [res, error] = regexer(regexTest, lines);

      expect(error).toBe(null);
      expect(res).toBe("fibrel3");
    }),
    test("When given a string that does not match the regex pattern", () => {
      const regexTest = /pswitch_host:\ssvs-za-(.*)-\w+-\w+-\d+/;
      const filePath = "./test/fixtures/globalinvestment-jhb-sandton-fibre-02";
      const lines = fs.readFileSync(filePath, "utf8").split("\n");
      const [res, error] = regexer(regexTest, lines);

      expect(error).toBe(
        "No match found - /pswitch_host:\\ssvs-za-(.*)-\\w+-\\w+-\\d+/"
      );
      expect(res).toBe("");
    });
});
