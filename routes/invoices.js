/** Routes for invoices biztime app. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const db = require("../db");

const router = new express.Router();
//const middleware = require("./middleware");
const app = express();

/** GET /invoices: get list of invoices */
router.get("/", async function (req, res, next) {

    const result = await db.query(
        `SELECT id, comp_code FROM invoices`
    );

    return res.json({invoices: result.rows});
});

/** GET /invoices/:id get single invoice */
router.get("/:id", async function (req, res, next) {
    const id = req.params.id;
    const iResult = await db.query(
        `SELECT id, amt, paid, add_date, paid_date 
            FROM invoices 
            WHERE id = $1`,
        [id]
    );
    const invoice = iResult.rows[0];
    const company_code = invoice.comp_code;

    const cResult = await db.query(
        `SELECT code, name, description
            FROM companies c
            JOIN invoices i ON c.code = i.comp_code
            WHERE id = $1`, [id]
    );
    invoice.company = cResult.rows[0];

    if (!invoice) throw new NotFoundError("Invoice does not exist");
    return res.json({ invoice });
});

/** POST /invoices: add invoice to list */
router.post("/", async function (req, res, next) {
    const {comp_code, amt} = req.body;
    const result = await db.query(
        `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]
    );
    const invoice = result.rows[0];
    return res.json({ invoice });
});

/** PUT /invoice/:id update a single invoice , return {invoice: 
 * {id, comp_code, amt, paid, add_date, paid_date}} */
router.put("/:id", async function (req, res, next) {
    const id = req.params.id;
    const amt = req.body.amt;
    const result = await db.query(
        `UPDATE invoices 
            SET amt = $1
            WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id] 
    );
    const invoice = result.rows[0];

    if (!invoice) throw new NotFoundError("Invoice does not exist");
    return res.json({ invoice });
});

/** DELETE /:id delete an invoice, return {status: "deleted"} */
router.delete("/:id", async function (req, res, next) {
    const id = req.params.id;

    const result = await db.query(
        `DELETE FROM invoices WHERE id = $1
        RETURNING comp_code`, [id]
    );
    const invoice = result.rows[0];

    if (!invoice) throw new NotFoundError("Invoice ID does not exist");
    return res.json({ status: "deleted" });
});

module.exports = router;
