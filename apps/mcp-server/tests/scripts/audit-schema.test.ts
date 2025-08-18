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

import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import fs from 'fs/promises';

// --- Mocking Dependencies ---

// Mock the entire 'pg' module
const mockQuery = vi.fn();
const mockRelease = vi.fn();
const mockPoolEnd = vi.fn();
const mockConnect = vi.fn().mockResolvedValue({
  query: mockQuery,
  release: mockRelease,
});

vi.mock('pg', () => {
  // This is the mock for the Pool constructor
  const PoolMock = vi.fn().mockImplementation(() => {
    return {
      connect: mockConnect,
      end: mockPoolEnd,
      on: vi.fn(), // Add a mock for the 'on' method
    };
  });

  return { Pool: PoolMock };
});

// Mock the 'fs/promises' module
vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn().mockResolvedValue(undefined),
  }
}));

// --- Test Suite ---

describe('Schema Audit Script', () => {

  beforeEach(() => {
    // Reset all mocks and the module cache before each test
    vi.resetModules();
    vi.clearAllMocks();
  });

  // Dynamically import the script to be tested inside the test case
  // This ensures the mocked dependencies are in place before the script runs
  const runScript = async () => {
    // The path is relative to the test file itself
    await import('scripts/audit-schema.ts');
  };

  it('should correctly identify anti-patterns and write a JSON report', async () => {
    // --- Arrange ---
    // Setup mock return values for the database queries
    mockQuery
      // 1. First query for tables
      .mockResolvedValueOnce({
        rows: [
          { table_name: 'users' },
          { table_name: 'mst_products' },
        ],
      })
      // 2. Queries for columns and constraints for 'users' table
      .mockResolvedValueOnce({
        rows: [
          { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: null },
          { column_name: 'email_cd', data_type: 'varchar', is_nullable: 'YES', column_default: null },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ constraint_name: 'users_pkey', constraint_type: 'PRIMARY KEY' }],
      })
      // 3. Queries for columns and constraints for 'mst_products' table
      .mockResolvedValueOnce({
        rows: [{ column_name: 'prod_id', data_type: 'uuid', is_nullable: 'NO', column_default: null }],
      })
      .mockResolvedValueOnce({
        rows: [], // No constraints for this table
      });

    // --- Act ---
    await runScript();

    // --- Assert ---
    // Verify that the database connection was handled correctly
    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockQuery).toHaveBeenCalledTimes(5); // 1 for tables + 2 per table
    expect(mockRelease).toHaveBeenCalledOnce();
    expect(mockPoolEnd).toHaveBeenCalledOnce();

    // Verify that the file was written
    expect(fs.writeFile).toHaveBeenCalledOnce();

    // Inspect the content written to the file
    const writeFileCall = (fs.writeFile as Mock).mock.calls[0];
    const filePath = writeFileCall[0];
    const fileContent = JSON.parse(writeFileCall[1]);

    // Check the output path
    expect(filePath).toContain('audit-results.json');

    // Check the generated JSON structure and content
    expect(fileContent).toHaveProperty('auditedAt');
    expect(fileContent.tables).toHaveLength(2);

    // Assertions for the 'users' table (should be mostly clean)
    const usersTable = fileContent.tables[0];
    expect(usersTable.tableName).toBe('users');
    expect(usersTable.antiPatterns).toEqual([]);
    expect(usersTable.columns[1].antiPatterns).toEqual([
      { type: 'cryptic_name', message: "Identifier 'email_cd' may be a cryptic name (e.g., ends in _dt, _cd, or starts with mst)." }
    ]);
    expect(usersTable.constraints).toContainEqual({ constraintName: 'users_pkey', constraintType: 'PRIMARY KEY' });

    // Assertions for the 'mst_products' table (should have anti-patterns)
    const productsTable = fileContent.tables[1];
    expect(productsTable.tableName).toBe('mst_products');
    expect(productsTable.antiPatterns).toContainEqual(
      { type: 'cryptic_name', message: "Identifier 'mst_products' may be a cryptic name (e.g., ends in _dt, _cd, or starts with mst)." }
    );
    expect(productsTable.antiPatterns).toContainEqual(
      { type: 'missing_primary_key', message: "Table 'mst_products' does not have a primary key." }
    );
  });

  it('should handle the case where no tables are found', async () => {
    // --- Arrange ---
    mockQuery.mockResolvedValueOnce({ rows: [] }); // No tables found

    // --- Act ---
    await runScript();

    // --- Assert ---
    expect(fs.writeFile).toHaveBeenCalledOnce();
    const fileContent = JSON.parse((fs.writeFile as Mock).mock.calls[0][1]);
    expect(fileContent.tables).toEqual([]);
    expect(mockPoolEnd).toHaveBeenCalledOnce();
  });

  it('should log an error and exit gracefully on database query failure', async () => {
    // --- Arrange ---
    const dbError = new Error('DB Connection Error');
    mockQuery.mockRejectedValue(dbError); // Simulate a database error

    // Mock console.error to spy on its calls
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as (code?: number) => never);


    // --- Act ---
    await runScript();

    // --- Assert ---
    // Verify that the error was logged
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ An error occurred during the schema audit:', dbError);

    // Verify that the pool connection is still ended
    expect(mockPoolEnd).toHaveBeenCalledOnce();

    // Verify that no report was written
    expect(fs.writeFile).not.toHaveBeenCalled();

    // --- Cleanup ---
    consoleErrorSpy.mockRestore();
  });
});
