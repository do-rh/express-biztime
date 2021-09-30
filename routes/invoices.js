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

    return res.json({companies: result.rows});
});

// /** GET /invoices/:id get single invoice */
// router.get("/:id", async function (req, res, next) {
//     const id = req.query.id;
//     const iResult = await db.query(
//         `SELECT id, amt, paid, add_date, paid_date 
//             FROM invoices 
//             WHERE id = $1`,
//         [id]
//     );
//     const invoice = iResult.rows[0];
//     const company_code = 

//     const cResult = await db.query(
//         `SELECT code, name, description
//             FROM companies
//             WHERE `
//     )

//     if (!company) throw new NotFoundError("Company code does not exist");
//     return res.json({ company });
// });


/** POST /companies: add company to list */
router.post("/", async function (req, res, next) {
    const newCompany = req.body; //json of new item
    const code = newCompany.code;
    const name = newCompany.name;
    const description = newCompany.description;

    const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`, [code, name, description] // [...newCompany]
    )
    const company = result.rows[0];
    return res.json({ company });
});

/** PUT /companies/:code update a single company , return {company: 
 * {code, name, description}} */
router.put("/:code", async function (req, res, next) {
    const reqCompany = req.body;
    const code = reqCompany.code;
    const name = reqCompany.name;
    const description = reqCompany.description;

    const result = await db.query(
        `UPDATE companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`, [code, name, description] 
    )
    const company = result.rows[0];

    if (!company) throw new NotFoundError("Company code does not exist");
    return res.json({ company });
});

/** DELETE /:code delete a company, return {status: "deleted"} */
router.delete("/:code", async function (req, res, next) {
    const code = req.params.code;

    const result = await db.query(
        `DELETE FROM companies WHERE code = $1
        RETURNING code, name`, [code]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError("Company code does not exist");
    return res.json({ status: "deleted" });
});

module.exports = router;
