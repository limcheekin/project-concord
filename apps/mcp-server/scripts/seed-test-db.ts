/**
 * Copyright (c) 2025 Lim Chee Kin
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the LICENSE file in the root directory
 * of this source tree or from the following URL:
 *
 *     https://github.com/limcheekin/project-concord/blob/main/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Pool } from 'pg';
import { config } from "../src/config/index.js";

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is not defined in .env file.');
}
const connectionString = config.databaseUrl.replace('db', 'localhost');
const pool = new Pool({
  connectionString,
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS CUST_MST (
        c_id INTEGER PRIMARY KEY,
        c_name VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS prod (
        p_id INTEGER PRIMARY KEY,
        p_name VARCHAR(255),
        price DECIMAL(10, 2)
      );

      CREATE TABLE IF NOT EXISTS so_hdr (
        ord_id INTEGER PRIMARY KEY,
        ord_stat SMALLINT,
        c_id INTEGER REFERENCES CUST_MST(c_id)
      );

      CREATE TABLE IF NOT EXISTS trans (
        t_id INTEGER PRIMARY KEY,
        ord_id INTEGER,
        p_id INTEGER,
        quantity INTEGER
      );
    `);
    console.log('Tables created successfully.');
  } finally {
    client.release();
  }
};

const seedData = async () => {
  const client = await pool.connect();
  try {
    // Seed CUST_MST
    await client.query(`
      INSERT INTO CUST_MST (c_id, c_name) VALUES
      (1, 'Customer A'),
      (2, 'Customer B'),
      (3, 'Customer C with special chars !@#$%^&*()'),
      (4, 'customer d');
    `);

    // Seed prod
    await client.query(`
      INSERT INTO prod (p_id, p_name, price) VALUES
      (101, 'Product X', 10.00),
      (102, 'Product Y', 25.50),
      (103, 'Product Z', 5.75);
    `);

    // Seed so_hdr
    await client.query(`
      INSERT INTO so_hdr (ord_id, ord_stat, c_id) VALUES
      (1001, 1, 1),
      (1002, 2, 1),
      (1003, 5, 2),
      (1004, 1, 3);
    `);

    // Seed trans
    await client.query(`
      INSERT INTO trans (t_id, ord_id, p_id, quantity) VALUES
      (5001, 1001, 101, 2),
      (5002, 1001, 102, 1),
      (5003, 1002, 103, 5),
      (5004, 1003, 101, 1),
      (5005, 9999, 101, 1); -- Orphan transaction
    `);

    console.log('Data seeded successfully.');
  } finally {
    client.release();
  }
};

const main = async () => {
  try {
    await createTables();
    await seedData();
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
};

main();
