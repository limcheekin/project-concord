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

/**
 * @fileoverview This script connects to the legacy database, performs a schema audit,
 * and outputs the results to a JSON file. It identifies common technical
 * anti-patterns such as cryptic naming conventions and missing constraints.
 */

import { pool } from '../src/services/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Type Definitions ---

interface AntiPattern {
  type: 'cryptic_name' | 'missing_primary_key';
  message: string;
}

interface ColumnDefinition {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  defaultValue: string | null;
  antiPatterns: AntiPattern[];
}

interface Constraint {
  constraintName: string;
  constraintType: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
}

interface TableDefinition {
  tableName: string;
  columns: ColumnDefinition[];
  constraints: Constraint[];
  antiPatterns: AntiPattern[];
}

interface AuditResults {
  auditedAt: string;
  tables: TableDefinition[];
}

// --- Anti-Pattern Detection ---

const CRYPTIC_NAME_REGEX = /_dt$|_cd$|^mst/i;

/**
 * Checks for cryptic names in a given identifier (table or column name).
 * @param name - The identifier to check.
 * @returns An array of anti-pattern objects if a cryptic name is detected.
 */
function detectCrypticName(name: string): AntiPattern[] {
  if (CRYPTIC_NAME_REGEX.test(name)) {
    return [{
      type: 'cryptic_name',
      message: `Identifier '${name}' may be a cryptic name (e.g., ends in _dt, _cd, or starts with mst).`
    }];
  }
  return [];
}

/**
 * The main function to perform the schema audit.
 */
async function auditSchema() {
  console.log('Starting schema audit...');
  const client = await pool.connect();
  const results: AuditResults = {
    auditedAt: new Date().toISOString(),
    tables: [],
  };

  try {
    // 1. Fetch all tables from the 'public' schema
    const tablesResult = await client.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length === 0) {
      console.warn("No tables found in the 'public' schema to audit.");
    }

    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      console.log(`Auditing table: ${tableName}`);

      const tableDefinition: TableDefinition = {
        tableName,
        columns: [],
        constraints: [],
        antiPatterns: detectCrypticName(tableName),
      };

      // 2. Fetch all columns for the current table
      const columnsResult = await client.query<{
        column_name: string;
        data_type: string;
        is_nullable: 'YES' | 'NO';
        column_default: string | null;
      }>(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      for (const col of columnsResult.rows) {
        tableDefinition.columns.push({
          columnName: col.column_name,
          dataType: col.data_type,
          isNullable: col.is_nullable === 'YES',
          defaultValue: col.column_default,
          antiPatterns: detectCrypticName(col.column_name),
        });
      }

      // 3. Fetch all constraints for the current table
      const constraintsResult = await client.query<{
        constraint_name: string;
        constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
      }>(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = $1;
      `, [tableName]);

      tableDefinition.constraints = constraintsResult.rows.map(c => ({
        constraintName: c.constraint_name,
        constraintType: c.constraint_type,
      }));

      // 4. Check for missing primary key anti-pattern
      const hasPrimaryKey = tableDefinition.constraints.some(
        (c) => c.constraintType === 'PRIMARY KEY'
      );
      if (!hasPrimaryKey) {
        tableDefinition.antiPatterns.push({
          type: 'missing_primary_key',
          message: `Table '${tableName}' does not have a primary key.`
        });
      }

      results.tables.push(tableDefinition);
    }

    // 5. Write results to file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputPath = path.resolve(__dirname, '../../../audit-results.json');

    await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`✅ Schema audit complete. Results saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ An error occurred during the schema audit:', error);
    process.exit(1);
  } finally {
    // 6. Release the client and close the pool
    client.release();
    await pool.end();
    console.log('Database connection pool closed.');
  }
}

auditSchema();
