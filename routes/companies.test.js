const request = require("supertest");

const app = require("../app");
const { createData } = require("../testData");
const db = require("../db");

// before each test, clean out data
beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe("404", function () {
    test("It should respond with 404 error", async function () {
        const response = await request(app).get("/badroute");
        expect(response.status).toEqual(404)
    })
})

describe("GET /", function () {

  test("It should respond with array of companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        {code: "apple", name: "Apple Computer", description: "Maker of OSX."},
        {code: "ibm", name: "IBM", description: "Big blue."},
      ]
    });
  })

});


describe("GET /apple", function () {

  test("It should return company info", async function () {
    const response = await request(app).get("/companies/apple");
    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "Apple Computer",
            description: "Maker of OSX.",
            industries: ["Accounting", "Information Technology"],
            invoices: [1, 2]
          }
        }
    );
  });

  test("It should return 404 for no-such-company", async function () {
    const response = await request(app).get("/companies/blargh");
    expect(response.status).toEqual(404);
  })
});


describe("POST /", function () {

  test("It should add a company", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "TacoTime", description: "Yum!"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "tacotime",
            name: "TacoTime",
            description: "Yum!",
          }
        }
    );
  });

  test("It should return 500 for conflict", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Apple", description: "Huh?"});

    expect(response.status).toEqual(500);
  })
});


describe("PUT /", function () {

  test("It should update company", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({name: "AppleEdit", description: "NewDescrip"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "AppleEdit",
            description: "NewDescrip",
          }
        }
    );
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .put("/companies/blargh")
        .send({name: "Blargh", description: "Nyah"});

    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({});

    expect(response.status).toEqual(500);
  })
});


describe("DELETE /", function () {

  test("It should delete company", async function () {
    const response = await request(app)
        .delete("/companies/apple");

    expect(response.body).toEqual({"status": "deleted"});
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .delete("/companies/blargh");

    expect(response.status).toEqual(404);
  });
});

