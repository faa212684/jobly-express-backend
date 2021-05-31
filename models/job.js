"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT j.id,
              j.title,
              j.salary,
              j.equity,
              j.company_handle AS "companyHandle",
              c.name AS "companyName"
      FROM jobs j
      LEFT JOIN companies AS c ON c.handle = j.company_handle
      ORDER BY title`
    );
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
      FROM companies
      WHERE handle = $1`,
      [job.companyHandle]
    );

    delete job.companyHandle;
    job.company = companiesRes.rows[0];

    return job;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  // static async update(handle, data) {
  //   const { setCols, values } = sqlForPartialUpdate(data, {
  //     numEmployees: "num_employees",
  //     logoUrl: "logo_url",
  //   });
  //   const handleVarIdx = "$" + (values.length + 1);

  //   const querySql = `UPDATE companies
  //                     SET ${setCols}
  //                     WHERE handle = ${handleVarIdx}
  //                     RETURNING handle,
  //                               name,
  //                               description,
  //                               num_employees AS "numEmployees",
  //                               logo_url AS "logoUrl"`;
  //   const result = await db.query(querySql, [...values, handle]);
  //   const company = result.rows[0];

  //   if (!company) throw new NotFoundError(`No company: ${handle}`);

  //   return company;
  // }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  // static async remove(handle) {
  //   const result = await db.query(
  //     `DELETE
  //          FROM companies
  //          WHERE handle = $1
  //          RETURNING handle`,
  //     [handle]
  //   );
  //   const company = result.rows[0];

  //   if (!company) throw new NotFoundError(`No company: ${handle}`);
  // }
}

module.exports = Job;
