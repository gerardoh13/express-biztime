const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const { validValueCheck } = require("../helpers");

router.get("/", async function (req, res, next) {
  try {
    const resultRes = await db.query(`SELECT * FROM industries`);
    let result = resultRes.rows;
    for (let i = 0; i < result.length; i++) {
      let compCodesRes = await db.query(
        "SELECT comp_code FROM comp_ind WHERE industry_code=$1",
        [result[i].code]
      );
      result[i].company_codes = compCodesRes.rows.map((c) => c.comp_code);
    }
    return res.json({ industries: result });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let { code, industry } = req.body;
    if (validValueCheck([code, industry]))
      throw new ExpressError("An industry code and name must be provided");
    const result = await db.query(
      `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING *`,
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    if (err.code === "23505"){
        err = new ExpressError('This industry already exists')
      }
    return next(err);
  }
});

router.post("/:code", async function (req, res, next) {
    try {
        let { code } = req.body;
        if (validValueCheck[code]) throw new ExpressError('A company code must be provided')
        const result = await db.query(
            `INSERT INTO comp_ind (comp_code, industry_code)
            VALUES ($1, $2)
            RETURNING *`,
            [code, req.params.code]
        )
        return res.status(201).json({ industry: result.rows[0] });
    } catch (err) {
        if (err.code === "23505"){
            let e = new ExpressError('This company is already in this industry')
            return next(e);
          }
        return next(err);
    }
})

module.exports = router;
