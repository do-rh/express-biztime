/** Routes for companies app. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("./expressError");

const db = require("./db");
const router = new express.Router();
//const middleware = require("./middleware");
const app = express();

/** GET /companies: get list of companies */
router.get("/", async function (req, res, next) {
    const result = await db.query(
        `SELECT code, name FROM companies`
    );
    return res.json({companies: result.rows});
});

/** GET /companies/:code get single company */
router.get("/:code", async function (req, res, next) {
    const code = req.query.code;
    const result = await db.query(
        `SELECT code, name, description FROM companies WHERE code = $1`,
        [code]
    );
    if (result.rows.length === 0) {
        throw new NotFoundError("Company code does not exist");
    }
    return res.json({company: result.rows});
});


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

    return res.json({ company: result.rows });
});

router.use(middleware.isInCart);

/** GET /items/:name get single item from list */
router.get("/:name", function (req, res, next) {
    const itemName = req.params.name;
    const itemInList = db.items.find((item) => item.name === itemName);
    return res.json({ items: itemInList });
});

/** PATCH /items/:name update a single item from list, return {updated: Updated Item} */
router.patch("/:name", function (req, res, next) {
    const item = req.body;
    const itemName = req.body.name;
    const itemIndex = db.items.findIndex((item) => item.name === itemName);
    db.items[itemIndex] = item;
    return res.json({ updated: item });
});

/** DELETE /items/:name delete an item from the list, return {message: Deleted} */
router.delete("/:name", function (req, res, next) {
    const itemName = req.body.name;
    db.items = db.items.filter((item) => item.name !== itemName);
    return res.json({ message: "Deleted" });
});

module.exports = router;
