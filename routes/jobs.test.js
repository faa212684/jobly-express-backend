"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    companyHandle: "c1",
    title: "J-new",
    salary: 10,
    equity: "0.2",
  };
  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "J-new",
        salary: 10,
        equity: "0.2",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        companyHandle: "c1",
        title: "J-new",
        salary: "not-a-number",
        equity: "0.2",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "J1",
          salary: 1,
          equity: "0.1",
          companyHandle: "c1",
          companyName: "C1",
        },
        {
          id: expect.any(Number),
          title: "J2",
          salary: 2,
          equity: "0.2",
          companyHandle: "c1",
          companyName: "C1",
        },
        {
          id: expect.any(Number),
          title: "J3",
          salary: 3,
          equity: null,
          companyHandle: "c1",
          companyName: "C1",
        },
      ],
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "J1",
        salary: 1,
        equity: "0.1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

// describe("PATCH /companies/:handle", function () {
//   test("works for users", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           name: "C1-new",
//         });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such company", async function () {
//     const resp = await request(app)
//         .patch(`/companies/nope`)
//         .send({
//           name: "new nope",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           handle: "c1-new",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//         .patch(`/companies/c1`)
//         .send({
//           logoUrl: "not-a-url",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

/************************************** DELETE /jobs/:id */

// describe("DELETE /companies/:handle", function () {
//   test("works for users", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .delete(`/companies/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such company", async function () {
//     const resp = await request(app)
//         .delete(`/companies/nope`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
