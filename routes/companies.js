/** Routes for companies biztime app. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const db = require("../db");

const router = new express.Router();
//const middleware = require("./middleware");

/** GET /companies: get list of companies */
router.get("/", async function (req, res, next) {

    const result = await db.query(
        `SELECT code, name 
            FROM companies`
    );

    return res.json({companies: result.rows});
});

/** GET /companies/:code get single company */
router.get("/:code", async function (req, res, next) {
    const code = req.params.code;
    const result = await db.query(
        `SELECT code, name, description 
            FROM companies 
            WHERE code = $1`,
        [code]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError("Company code does not exist");
    return res.json({ company });
});

/** POST /companies: add company to list */
router.post("/", async function (req, res, next) {
    const { code, name, description } = req.body; 

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
    const { name, description } = req.body; 
    const code = req.params.code;
    
    const result = await db.query(
        `UPDATE companies 
            SET name = $1,
                description = $2
            WHERE code = $3
            RETURNING code, name, description`, [name, description, code] 
    );
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
