const fs = require("fs");

const calculate = require("../src/calculator");

describe("contention ratio calculator", () => {
  test("When given a file, the speed field is returned", () => {
    const filePath = "./test/fixtures";
    const res = calculate(filePath);

    expect(res[0]).toStrictEqual({
      fileName: "globalinvestment-jhb-sandton-fibre-01",
      speed: "5mbps",
      circuitNumber: "so012446 & so020446",
      carrier: "seacom",
      city: "jhb",
    });
  });
});
