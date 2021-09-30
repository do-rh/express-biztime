const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testInvoiceId;
let testCompany;
let testInvoice;
beforeEach(async function () {
    testCompany = await db.query(
        `INSERT INTO companies (code, name, description)
            VALUES ('pop', 'popsicle', 'yummy pops')
            RETURNING code, name, description`);

    testInvoice = await db.query(
        `INSERT INTO invoices (comp_code, amt)
        VALUES ('pop', '200')
        RETURNING id, comp_code, amt, paid, add_date, paid_date`
    )
    testCompany = testCompany.rows[0];
    testInvoice = testInvoice.rows[0];
});

afterEach(async function () {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});



/** GET /companies: get list of companies */
describe("GET /companies", function () {
    it("Gets a list of companies", async function () {
        const resp = await request(app).get(`/companies`);

        expect(resp.body).toEqual({
            "companies": [
                {
                    "code": "pop",
                    "name": "popsicle"
                }
            ]
        });
    });
});

/** GET /companies/:code get single company */
describe("GET /companies/:code", function () {
    it("Gets a single company", async function () {
        const resp = await request(app).get(`/companies/pop`);
        console.log("testID type: ", typeof (testInvoice.id));
        expect(resp.body).toEqual({
            "company": {
                "code": "pop",
                "name": "popsicle",
                "description": "yummy pops",
                "invoices": [testInvoice.id]
            }
        });
    });

    it("Testing for 404, inputting non-existing company", async function () {
        const resp = await request(app).get(`/companies/lalala`);
        expect(resp.body).toEqual({
            "error": {
                "message": "Cannot set property 'invoices' of undefined",
                "status": 500
            }
        });
    })
});

/** POST /companies: add company to list */
describe("POST /companies", function () {
    it("Creates a new company", async function () {
        const resp = await request(app)
            .post(`/companies`)
            .send({
                code: "cakes",
                name: "Lots of Cakes",
                description: "bundt cake company"
            });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            "company": {
                "code": "cakes",
                "name": "Lots of Cakes",
                "description": "bundt cake company"
            }
        });
    });
    it("Creates a duplicate company, should return error", async function () {
        const resp = await request(app)
            .post(`/companies`)
            .send({
                code: "pop",
                name: "popsicle",
                description: "yummy pops"
            });
        expect(resp.statusCode).toEqual(500);
        expect(resp.body).toEqual({
            "error": {
                "message": "duplicate key value violates unique constraint \"companies_pkey\"",
                "status": 500
            }
        });
    });
});

//   /** POST /cats - create cat from data; return `{cat: cat}` */

//   describe("POST /cats", function() {
//     it("Creates a new cat", async function() {
//       const resp = await request(app)
//         .post(`/cats`)
//         .send({
//           name: "Ezra"
//         });
//       expect(resp.statusCode).toEqual(201);
//       expect(resp.body).toEqual({
//         cat: { name: "Ezra" }
//       });
//     });
//   });
//   // end

//   /** PATCH /cats/[name] - update cat; return `{cat: cat}` */

//   describe("PATCH /cats/:name", function() {
//     it("Updates a single cat", async function() {
//       const resp = await request(app)
//         .patch(`/cats/${pickles.name}`)
//         .send({
//           name: "Troll"
//         });
//       expect(resp.body).toEqual({
//         cat: { name: "Troll" }
//       });
//     });

//     it("Responds with 404 if name invalid", async function() {
//       const resp = await request(app).patch(`/cats/not-here`);
//       expect(resp.statusCode).toEqual(404);
//     });
//   });
//   // end

//   /** DELETE /cats/[name] - delete cat,
//    *  return `{message: "Cat deleted"}` */

//   describe("DELETE /cats/:name", function() {
//     it("Deletes a single a cat", async function() {
//       const resp = await request(app)
//         .delete(`/cats/${pickles.name}`);
//       expect(resp.body).toEqual({ message: "Deleted" });
//       expect(db.Cat.all().length).toEqual(0);
//     });
//   });
//   // end

