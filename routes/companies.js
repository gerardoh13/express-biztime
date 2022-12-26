const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const { validValueCheck } = require("../helpers");

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query("SELECT * FROM companies");
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    const result = await db.query("SELECT * FROM companies WHERE code=$1", [
      req.params.code,
    ]);
    const invRes = await db.query("SELECT * FROM invoices WHERE comp_code=$1", [req.params.code])
    if (result.rows.length === 0) throw new ExpressError(`There is no company with code '${req.params.code}'`, 404);
    // return res.json({ company: result.rows[0] });
    return res.json({ company: result.rows[0], invoices: invRes.rows });

  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
  let { code, name, description } = req.body;
    if (validValueCheck([code, name, description])) throw new ExpressError('A comany name and description must be provided')
    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
      [code, name, description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put("/:code", async function (req, res, next) {
  try {
    if ("code" in req.body) {
      throw new ExpressError("Not allowed", 400);
    }
    let { name, description } = req.body;
    if (validValueCheck([name, description])) throw new ExpressError('A comany name and description must be provided')
    const result = await db.query(
      `UPDATE companies 
             SET name=$1,
             description=$2
             WHERE code = $3
             RETURNING *`,
      [name, description, req.params.code]
    );
    if (result.rows.length === 0) throw new ExpressError(`There is no company with code '${req.params.code}'`, 404);
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    const result = await db.query(
      "DELETE FROM companies WHERE code=$1 RETURNING code",
      [req.params.code]
    );

    if (result.rows.length === 0) throw new ExpressError(`There is no company with code '${req.params.code}'`, 404);
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
