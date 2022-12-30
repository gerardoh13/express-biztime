const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const { validValueCheck, getInvoice } = require("../helpers");

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  const result = await getInvoice(req.params.id);
  if (result instanceof Error) {
    return next(result);
  }
  return res.json({ invoice: result });
});

router.post("/", async function (req, res, next) {
  try {
    let { comp_code, amt } = req.body;
    if (validValueCheck([comp_code, amt]))
      throw new ExpressError("An amount and comany code must be provided");

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
           VALUES ($1, $2) 
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    let { amt, paid } = req.body;
    if (validValueCheck([amt, paid])) throw new ExpressError("An amount and paid status must be provided");
    let currInvoice = await getInvoice(req.params.id);
    if (currInvoice instanceof Error) throw currInvoice;
    // let currInvoice = currInvoiceRes.rows[0]
    let paidDate
    if (!currInvoice.paid_date && paid) {
      paidDate = new Date()
    } else if (!paid){
        paidDate = null
      } else {
        paidDate = currInvoice.paid_date
      }

    const result = await db.query(
      `UPDATE invoices 
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id = $4
             RETURNING *`,
      [amt, paid, paidDate, req.params.id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (err){
    return next(err)
  }

});

router.delete("/:id", async function (req, res, next) {
  try {
    const result = await db.query(
      "DELETE FROM invoices WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0)
      throw new ExpressError(
        `There is no invoice with ID '${req.params.id}'`,
        404
      );
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
