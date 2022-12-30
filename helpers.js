const slugify = require("slugify");
const db = require("./db");
const ExpressError = require("./expressError");

function validValueCheck(arr) {
  return arr.some((e) => e === undefined);
}

function toSlug(str) {
  let slug = slugify(str, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  });
  return slug;
}

async function getInvoice(id) {
  const response = await db.query(
    `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description
            FROM invoices i JOIN companies c 
            ON i.comp_code=c.code WHERE id = $1`,
    [id]
  );
  if (response.rows.length === 0)
    return new ExpressError(`There is no invoice with ID '${id}'`, 404);
    let data = response.rows[0]
    const result = {
        id: data.id,
        company: {
          code: data.code,
          name: data.name,
          description: data.description,
        },
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
    }
  return result;
}
module.exports = {
  validValueCheck,
  toSlug,
  getInvoice,
};
