const request = require("supertest");

const app = require("../app");
const { createData } = require("../testData");
const db = require("../db");

beforeEach(createData);

afterAll(async () => {
  await db.end();
});

describe("GET /", function () {
  test("It should respond with array of industries", async function () {
    const response = await request(app).get("/industries");
    expect(response.body).toEqual({
      industries: [
        { code: "acct", industry: "Accounting", company_codes: ["apple"] },
        { code: "mkt", industry: "Marketing", company_codes: [] },
        { code: "hlth", industry: "Healthcare", company_codes: [] },
        {
          code: "it",
          industry: "Information Technology",
          company_codes: ["apple", "ibm"],
        },
      ],
    });
  });
});

describe("POST /", function () {
  test("It should add an industry", async function () {
    const response = await request(app)
      .post("/industries")
      .send({ code: "Ag", industry: "Agriculture" });

    expect(response.body).toEqual({
      industry: {
        code: "Ag",
        industry: "Agriculture",
      },
    });
  });
  test("It should return 500 missing data", async function () {
    const response = await request(app).post("/industries").send({});

    expect(response.status).toEqual(500);
  });

  test("It should return 500 for conflict", async function () {
    const response = await request(app)
      .post("/industries")
      .send({ code: "acct", industry: "Accounting" });

    expect(response.status).toEqual(500);
  });
});

describe("POST /", function () {
  test("It should add a company to an industry", async function () {
    const response = await request(app)
      .post("/industries/hlth")
      .send({ code: "apple" });

    expect(response.body).toEqual({
      industry: {
        comp_code: "apple",
        industry_code: "hlth",
      },
    });
  });

  test("It should return 500 missing data", async function () {
    const response = await request(app).post("/industries/hlth").send({});
    expect(response.status).toEqual(500);
  });
  test("It should return 500 for conflict", async function () {
    const response = await request(app)
      .post("/industries/it")
      .send({ code: "apple"});

    expect(response.status).toEqual(500);
  });
});
