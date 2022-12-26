const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const { validValueCheck } = require("../helpers");

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query("SELECT * FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const result = await db.query("SELECT * FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) throw new ExpressError(`There is no invoice with ID '${req.params.code}'`, 404);
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let { comp_code, amt } = req.body;
    if (validValueCheck([comp_code, amt])) throw new ExpressError('An amount and comany code must be provided')

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
           VALUES ($1, $2) 
           RETURNING *`,
      [comp_code, amt]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    if ("id" in req.body) throw new ExpressError("Not allowed", 400)
    let { amt } = req.body;
    if (validValueCheck([amt])) throw new ExpressError('An amount must be provided')
    const result = await db.query(
      `UPDATE invoices 
             SET amt=$1
             WHERE id = $2
             RETURNING *`,
      [amt, req.params.id]
    );

    if (result.rows.length === 0) throw new ExpressError(`There is no invoice with ID '${req.params.id}'`, 404);
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    const result = await db.query(
      "DELETE FROM invoices WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0) throw new ExpressError(`There is no invoice with ID '${req.params.id}'`, 404);
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
